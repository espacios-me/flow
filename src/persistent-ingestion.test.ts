import { beforeEach, describe, expect, it } from "vitest";
import { listRecentEvents, normalizeAndStore, resetPersistentIngestionForTests } from "./persistent-ingestion";

describe("persistent ingestion fallback store", () => {
  beforeEach(() => {
    resetPersistentIngestionForTests();
  });

  it("redacts nested sensitive keys", async () => {
    const result = await normalizeAndStore({}, "gmail", {
      userId: "user-1",
      messageId: "abc",
      subject: "Hello",
      snippet: "Body",
      oauth: {
        access_token: "secret-token",
      },
      credentials: [
        {
          client_secret: "hidden",
        },
      ],
    });

    expect(result.wasDuplicate).toBe(false);
    expect(result.event.metadata.oauth).toEqual({ access_token: "[REDACTED]" });
    expect(result.event.metadata.credentials).toEqual([{ client_secret: "[REDACTED]" }]);
  });

  it("marks duplicate events by source, user, and sourceEventId", async () => {
    const payload = {
      userId: "user-2",
      issueId: "lin-1",
      title: "Fix auth",
      description: "Details",
    };

    const first = await normalizeAndStore({}, "linear", payload);
    const second = await normalizeAndStore({}, "linear", payload);

    expect(first.wasDuplicate).toBe(false);
    expect(second.wasDuplicate).toBe(true);
    expect(first.event.dedupeKey).toBe(second.event.dedupeKey);
    expect(second.event.id).toBe(first.event.id);
  });

  it("returns most recent stored events with sane limit bounds", async () => {
    await normalizeAndStore({}, "gmail", {
      userId: "user-1",
      messageId: "a",
      subject: "A",
    });
    await normalizeAndStore({}, "gmail", {
      userId: "user-1",
      messageId: "b",
      subject: "B",
    });

    const events = await listRecentEvents({}, 500);

    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("B");
    expect(events[1]?.title).toBe("A");
  });
});
