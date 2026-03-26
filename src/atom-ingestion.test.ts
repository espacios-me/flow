import { describe, expect, it } from "vitest";
import { normalizeAndStore } from "./atom-ingestion";

describe("atom ingestion normalization", () => {
  it("redacts sensitive keys", () => {
    const result = normalizeAndStore("gmail", {
      userId: "user-1",
      messageId: "abc",
      subject: "Hello",
      snippet: "Body",
      token: "secret-token",
      api_key: "hidden",
    });

    expect(result.wasDuplicate).toBe(false);
    expect(result.event.metadata.token).toBe("[REDACTED]");
    expect(result.event.metadata.api_key).toBe("[REDACTED]");
  });

  it("marks duplicate events by source/user/sourceEventId", () => {
    const payload = {
      userId: "user-2",
      issueId: "lin-1",
      title: "Fix auth",
      description: "Details",
    };

    const first = normalizeAndStore("linear", payload);
    const second = normalizeAndStore("linear", payload);

    expect(first.wasDuplicate).toBe(false);
    expect(second.wasDuplicate).toBe(true);
    expect(first.event.dedupeKey).toBe(second.event.dedupeKey);
  });
});
