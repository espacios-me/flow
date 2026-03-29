import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("API Routers", () => {
  describe("workers.status", () => {
    it("should return workers status structure", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.workers.status();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("workers");
      expect(Array.isArray(result.workers)).toBe(true);
    });
  });

  describe("github.repos", () => {
    it("should return repos structure", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.github.repos();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("repos");
      expect(Array.isArray(result.repos)).toBe(true);
    });
  });

  describe("github.issues", () => {
    it("should return issues structure", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.github.issues();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("issues");
      expect(Array.isArray(result.issues)).toBe(true);
    });
  });

  describe("github.pullRequests", () => {
    it("should return PRs structure", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.github.pullRequests();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("prs");
      expect(Array.isArray(result.prs)).toBe(true);
    });
  });

  describe("google.getAuthUrl", () => {
    it("should return a valid OAuth URL", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.google.getAuthUrl();

      expect(result).toHaveProperty("authUrl");
      expect(result.authUrl).toContain("accounts.google.com");
      expect(result.authUrl).toContain("client_id");
      expect(result.authUrl).toContain("redirect_uri");
    });
  });

  describe("google.files", () => {
    it("should return files structure", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.google.files();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("files");
      expect(Array.isArray(result.files)).toBe(true);
    });
  });

  describe("chat.createSession", () => {
    it("should create a chat session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createSession({ title: "Test Session" });

      expect(result).toHaveProperty("success");
      if (result.success) {
        expect(result).toHaveProperty("sessionId");
        expect(typeof result.sessionId).toBe("number");
      }
    });
  });

  describe("chat.getSessions", () => {
    it("should return chat sessions", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getSessions();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("sessions");
      expect(Array.isArray(result.sessions)).toBe(true);
    });
  });
});
