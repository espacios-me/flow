import { AtomEvent, AtomSource, NormalizedIngestionResult } from "./atom-types";

const dedupeCache = new Set<string>();
const eventStore: AtomEvent[] = [];

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

function sanitize(raw: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...raw };
  const sensitiveKeys = ["password", "token", "access_token", "refresh_token", "secret", "api_key", "authorization"];

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      redacted[key] = "[REDACTED]";
    }
  }

  return redacted;
}

function normalizePayload(source: AtomSource, payload: Record<string, unknown>): Omit<AtomEvent, "id" | "ingestedAt" | "dedupeKey"> {
  const clean = sanitize(payload);

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

export function normalizeAndStore(source: AtomSource, payload: Record<string, unknown>): NormalizedIngestionResult {
  const normalized = normalizePayload(source, payload);
  const dedupeKey = makeDedupeKey(source, normalized.userId, normalized.sourceEventId);

  if (dedupeCache.has(dedupeKey)) {
    return {
      event: {
        ...normalized,
        id: crypto.randomUUID(),
        ingestedAt: new Date().toISOString(),
        dedupeKey,
      },
      wasDuplicate: true,
    };
  }

  dedupeCache.add(dedupeKey);

  const event: AtomEvent = {
    ...normalized,
    id: crypto.randomUUID(),
    ingestedAt: new Date().toISOString(),
    dedupeKey,
  };

  eventStore.unshift(event);
  if (eventStore.length > 2500) {
    eventStore.pop();
  }

  return { event, wasDuplicate: false };
}

export function listRecentEvents(limit = 25): AtomEvent[] {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  return eventStore.slice(0, safeLimit);
}
