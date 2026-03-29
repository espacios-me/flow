import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("API Credentials Validation", () => {
  it("should have all required secrets configured", () => {
    expect(ENV.githubToken).toBeDefined();
    expect(ENV.geminiApiKey).toBeDefined();
    expect(ENV.cfApiToken).toBeDefined();
    expect(ENV.cfAccountId).toBeDefined();
    expect(ENV.googleOAuthClientId).toBeDefined();
    expect(ENV.googleOAuthClientSecret).toBeDefined();
    expect(ENV.githubOrg).toBeDefined();
  });

  it("should validate GitHub token format", () => {
    const token = ENV.githubToken;
    expect(token).toMatch(/^ghp_/);
    expect(token.length).toBeGreaterThan(30);
  });

  it("should validate Gemini API key format", () => {
    const key = ENV.geminiApiKey;
    expect(key).toBeDefined();
    expect(key.length).toBeGreaterThan(10);
  });

  it("should validate Cloudflare credentials", () => {
    expect(ENV.cfApiToken).toBeDefined();
    expect(ENV.cfApiToken.length).toBeGreaterThan(10);
    expect(ENV.cfAccountId).toBeDefined();
    expect(ENV.cfAccountId.length).toBeGreaterThan(10);
  });

  it("should validate Google OAuth credentials", () => {
    expect(ENV.googleOAuthClientId).toBeDefined();
    expect(ENV.googleOAuthClientSecret).toBeDefined();
    expect(ENV.googleOAuthClientId.length).toBeGreaterThan(10);
    expect(ENV.googleOAuthClientSecret.length).toBeGreaterThan(10);
  });

  it("should validate GitHub organization name", () => {
    expect(ENV.githubOrg).toBeDefined();
    expect(ENV.githubOrg.length).toBeGreaterThan(0);
  });
});
