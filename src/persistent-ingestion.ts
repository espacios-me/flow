import type { AtomEvent, AtomSource, NormalizedIngestionResult } from "./atom-types";

export interface AtomBindings {
  DB?: D1Database;
  WEBHOOK_API_KEY?: string;
}

interface AtomEventRow {
  id: string;
  user_id: string;
  source: AtomSource;
  source_event_id: string;
  occurred_at: string;
  ingested_at: string;
  title: string;
  body: string;
  participants_json: string;
  metadata_json: string;
  dedupe_key: string;
}

const memoryDedupeCache = new Set<string>();
const memoryEventStore: AtomEvent[] = [];
const schemaInitCache = new WeakMap<D1Database, Promise<void>>();

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function toIsoDate(value: unknown): string {
  const asText = text(value);
  if (!asText) return new Date().toISOString();

  const parsed = new Date(asText);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitize(value: unknown): unknown {
  const sensitiveKeys = new Set([
    "password",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "api_key",
    "authorization",
    "client_secret",
  ]);

  if (Array.isArray(value)) {
    return value.map((entry) => sanitize(entry));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    redacted[key] = sensitiveKeys.has(key.toLowerCase()) ? "[REDACTED]" : sanitize(entry);
  }

  return redacted;
}

function normalizePayload(
  source: AtomSource,
  payload: Record<string, unknown>
): Omit<AtomEvent, "id" | "ingestedAt" | "dedupeKey"> {
  const clean = sanitize(payload) as Record<string, unknown>;

  if (source === "gmail") {
    const sourceEventId = text(clean.messageId) || text(clean.threadId) || crypto.randomUUID();
    return {
      userId: text(clean.userId) || "unknown",
      source,
      sourceEventId,
      occurredAt: toIsoDate(clean.internalDate),
      title: text(clean.subject) || "Email",
      body: text(clean.snippet) || text(clean.body),
      participants: arrayOfStrings(clean.participants),
      metadata: clean,
    };
  }

  if (source === "google_drive") {
    const sourceEventId = text(clean.fileId) || crypto.randomUUID();
    return {
      userId: text(clean.userId) || "unknown",
      source,
      sourceEventId,
      occurredAt: toIsoDate(clean.modifiedTime),
      title: text(clean.name) || "Drive file",
      body: text(clean.description),
      participants: arrayOfStrings(clean.sharedWith),
      metadata: clean,
    };
  }

  if (source === "workflow" || source === "botspace") {
    return {
      userId: text(clean.userId) || "unknown",
      source,
      sourceEventId: text(clean.sourceEventId) || crypto.randomUUID(),
      occurredAt: toIsoDate(clean.occurredAt),
      title: text(clean.title) || (source === "workflow" ? "Workflow Response" : "BotSpace Update"),
      body: text(clean.body),
      participants: arrayOfStrings(clean.participants),
      metadata: clean.metadata && typeof clean.metadata === "object" ? (clean.metadata as Record<string, unknown>) : clean,
    };
  }

  const sourceEventId = text(clean.issueId) || text(clean.id) || crypto.randomUUID();
  return {
    userId: text(clean.userId) || "unknown",
    source,
    sourceEventId,
    occurredAt: toIsoDate(clean.updatedAt),
    title: text(clean.title) || "Linear issue",
    body: text(clean.description),
    participants: arrayOfStrings(clean.assignees),
    metadata: clean,
  };
}

function makeDedupeKey(source: AtomSource, userId: string, sourceEventId: string): string {
  return `${source}:${userId}:${sourceEventId}`;
}

function hydrateEvent(row: AtomEventRow): AtomEvent {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    sourceEventId: row.source_event_id,
    occurredAt: row.occurred_at,
    ingestedAt: row.ingested_at,
    title: row.title,
    body: row.body,
    participants: JSON.parse(row.participants_json) as string[],
    metadata: JSON.parse(row.metadata_json) as Record<string, unknown>,
    dedupeKey: row.dedupe_key,
  };
}

async function ensureSchema(db: D1Database): Promise<void> {
  const existing = schemaInitCache.get(db);
  if (existing) {
    await existing;
    return;
  }

  const initPromise = (async () => {
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS atom_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        source TEXT NOT NULL,
        source_event_id TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        ingested_at TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        participants_json TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        dedupe_key TEXT NOT NULL UNIQUE
      )`
    ).run();

    await db.prepare(
      "CREATE INDEX IF NOT EXISTS idx_atom_events_ingested_at ON atom_events (ingested_at DESC)"
    ).run();
  })();

  schemaInitCache.set(db, initPromise);
  await initPromise;
}

async function storeInMemory(
  source: AtomSource,
  payload: Record<string, unknown>
): Promise<NormalizedIngestionResult> {
  const normalized = normalizePayload(source, payload);
  const dedupeKey = makeDedupeKey(source, normalized.userId, normalized.sourceEventId);

  const existing = memoryEventStore.find((event) => event.dedupeKey === dedupeKey);
  if (existing || memoryDedupeCache.has(dedupeKey)) {
    return {
      event:
        existing ?? {
          ...normalized,
          id: crypto.randomUUID(),
          ingestedAt: new Date().toISOString(),
          dedupeKey,
        },
      wasDuplicate: true,
    };
  }

  memoryDedupeCache.add(dedupeKey);

  const event: AtomEvent = {
    ...normalized,
    id: crypto.randomUUID(),
    ingestedAt: new Date().toISOString(),
    dedupeKey,
  };

  memoryEventStore.unshift(event);
  if (memoryEventStore.length > 2500) {
    memoryEventStore.pop();
  }

  return { event, wasDuplicate: false };
}

async function storeInD1(
  db: D1Database,
  source: AtomSource,
  payload: Record<string, unknown>
): Promise<NormalizedIngestionResult> {
  await ensureSchema(db);

  const normalized = normalizePayload(source, payload);
  const event: AtomEvent = {
    ...normalized,
    id: crypto.randomUUID(),
    ingestedAt: new Date().toISOString(),
    dedupeKey: makeDedupeKey(source, normalized.userId, normalized.sourceEventId),
  };

  const insertResult = await db
    .prepare(
      `INSERT OR IGNORE INTO atom_events (
        id,
        user_id,
        source,
        source_event_id,
        occurred_at,
        ingested_at,
        title,
        body,
        participants_json,
        metadata_json,
        dedupe_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.id,
      event.userId,
      event.source,
      event.sourceEventId,
      event.occurredAt,
      event.ingestedAt,
      event.title,
      event.body,
      JSON.stringify(event.participants),
      JSON.stringify(event.metadata),
      event.dedupeKey
    )
    .run();

  const changes = Number(insertResult.meta?.changes ?? 0);
  if (changes > 0) {
    return { event, wasDuplicate: false };
  }

  const existing = await db
    .prepare(
      `SELECT
        id,
        user_id,
        source,
        source_event_id,
        occurred_at,
        ingested_at,
        title,
        body,
        participants_json,
        metadata_json,
        dedupe_key
      FROM atom_events
      WHERE dedupe_key = ?
      LIMIT 1`
    )
    .bind(event.dedupeKey)
    .first<AtomEventRow>();

  return {
    event: existing ? hydrateEvent(existing) : event,
    wasDuplicate: true,
  };
}

export async function normalizeAndStore(
  env: AtomBindings,
  source: AtomSource,
  payload: Record<string, unknown>
): Promise<NormalizedIngestionResult> {
  return env.DB ? storeInD1(env.DB, source, payload) : storeInMemory(source, payload);
}

export async function listRecentEvents(env: AtomBindings, limit = 25): Promise<AtomEvent[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));

  if (!env.DB) {
    return memoryEventStore.slice(0, safeLimit);
  }

  await ensureSchema(env.DB);
  const result = await env.DB
    .prepare(
      `SELECT
        id,
        user_id,
        source,
        source_event_id,
        occurred_at,
        ingested_at,
        title,
        body,
        participants_json,
        metadata_json,
        dedupe_key
      FROM atom_events
      ORDER BY ingested_at DESC
      LIMIT ?`
    )
    .bind(safeLimit)
    .all<AtomEventRow>();

  return (result.results ?? []).map((row) => hydrateEvent(row));
}

export function resetPersistentIngestionForTests(): void {
  memoryDedupeCache.clear();
  memoryEventStore.splice(0, memoryEventStore.length);
}
