import { Context, Hono } from "hono";
import { getCurrentUser } from "./auth";
import legacyApp from "./index";
import { listRecentEvents, normalizeAndStore, type AtomBindings } from "./persistent-ingestion";
import type { AtomSource } from "./atom-types";

const SUPPORTED_INGEST_SOURCES: AtomSource[] = ["gmail", "google_drive", "linear"];

type WorkerEnv = {
  Bindings: AtomBindings;
};

const app = new Hono<WorkerEnv>();

function hasValidWebhookKey(c: Context<WorkerEnv>): boolean {
  const configured = c.env.WEBHOOK_API_KEY || process.env.WEBHOOK_API_KEY;
  if (!configured) return true;
  const incoming = c.req.header("x-api-key") || c.req.header("authorization")?.replace("Bearer ", "");
  return incoming === configured;
}

app.post("/api/ingest/:source", async (c) => {
  if (!hasValidWebhookKey(c)) {
    return c.json({ error: "Unauthorized webhook request" }, 401);
  }

  const source = c.req.param("source") as AtomSource;
  if (!SUPPORTED_INGEST_SOURCES.includes(source)) {
    return c.json(
      {
        error: "Unsupported source",
        supportedSources: SUPPORTED_INGEST_SOURCES,
      },
      400
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await c.req.json<Record<string, unknown>>();
  } catch {
    return c.json({ error: "Request body must be valid JSON" }, 400);
  }

  const result = await normalizeAndStore(c.env, source, payload);
  return c.json({
    status: result.wasDuplicate ? "duplicate" : "stored",
    source,
    eventId: result.event.id,
    dedupeKey: result.event.dedupeKey,
    ingestedAt: result.event.ingestedAt,
    storage: c.env.DB ? "d1" : "memory",
  });
});

app.get("/api/events", async (c) => {
  const user = await getCurrentUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const limit = Number(c.req.query("limit") || "25");
  const events = await listRecentEvents(c.env, limit);
  return c.json({ events });
});

app.route("/", legacyApp);

export default app;
