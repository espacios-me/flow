import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { ENV } from "./_core/env";
import { 
  createChatSession, 
  getChatSessionsByUserId, 
  getChatMessages, 
  addChatMessage,
  saveGoogleOAuthToken,
  getGoogleOAuthToken,
  cacheGitHubData,
  getGitHubData,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { getGoogleAuthUrl, exchangeCodeForToken, refreshAccessToken } from "./google-oauth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Cloudflare Workers endpoints
  workers: router({
    status: protectedProcedure.query(async () => {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ENV.cfAccountId}/workers/deployments/list`,
          {
            headers: {
              Authorization: `Bearer ${ENV.cfApiToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          return { success: false, error: "Failed to fetch Workers", workers: [] };
        }

        const data = await response.json() as any;
        const workers = data.result?.deployments || [];

        return {
          success: true,
          workers: workers.map((w: any) => ({
            id: w.id,
            name: w.metadata?.name || "Unknown",
            status: w.status || "unknown",
            created: w.created_on,
            modified: w.modified_on,
          })),
        };
      } catch (error) {
        console.error("Workers status error:", error);
        return { success: false, error: String(error), workers: [] };
      }
    }),

    logs: protectedProcedure
      .input(z.object({ workerId: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ENV.cfAccountId}/workers/deployments/${input.workerId}`,
            {
              headers: {
                Authorization: `Bearer ${ENV.cfApiToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            return { success: false, error: "Failed to fetch logs", logs: [] };
          }

          const data = await response.json() as any;
          return {
            success: true,
            logs: data.result?.logs || [],
          };
        } catch (error) {
          console.error("Workers logs error:", error);
          return { success: false, error: String(error), logs: [] };
        }
      }),
  }),

  // GitHub endpoints
  github: router({
    repos: protectedProcedure.query(async () => {
      try {
        const response = await fetch(
          `https://api.github.com/orgs/${ENV.githubOrg}/repos`,
          {
            headers: {
              Authorization: `Bearer ${ENV.githubToken}`,
              "Accept": "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          return { success: false, error: "Failed to fetch repos", repos: [] };
        }

        const repos = await response.json() as any[];
        return {
          success: true,
          repos: repos.map((r) => ({
            id: r.id,
            name: r.name,
            url: r.html_url,
            description: r.description,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
          })),
        };
      } catch (error) {
        console.error("GitHub repos error:", error);
        return { success: false, error: String(error), repos: [] };
      }
    }),

    issues: protectedProcedure.query(async () => {
      try {
        const response = await fetch(
          `https://api.github.com/orgs/${ENV.githubOrg}/issues?state=open`,
          {
            headers: {
              Authorization: `Bearer ${ENV.githubToken}`,
              "Accept": "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          return { success: false, error: "Failed to fetch issues", issues: [] };
        }

        const issues = await response.json() as any[];
        return {
          success: true,
          issues: issues.map((i) => ({
            id: i.id,
            title: i.title,
            url: i.html_url,
            repo: i.repository_url.split("/").pop(),
            state: i.state,
            created: i.created_at,
            updated: i.updated_at,
          })),
        };
      } catch (error) {
        console.error("GitHub issues error:", error);
        return { success: false, error: String(error), issues: [] };
      }
    }),

    pullRequests: protectedProcedure.query(async () => {
      try {
        const response = await fetch(
          `https://api.github.com/orgs/${ENV.githubOrg}/issues?state=open&type=pr`,
          {
            headers: {
              Authorization: `Bearer ${ENV.githubToken}`,
              "Accept": "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          return { success: false, error: "Failed to fetch PRs", prs: [] };
        }

        const prs = await response.json() as any[];
        return {
          success: true,
          prs: prs.map((p) => ({
            id: p.id,
            title: p.title,
            url: p.html_url,
            repo: p.repository_url.split("/").pop(),
            state: p.state,
            created: p.created_at,
            updated: p.updated_at,
          })),
        };
      } catch (error) {
        console.error("GitHub PRs error:", error);
        return { success: false, error: String(error), prs: [] };
      }
    }),
  }),

  // Google Drive endpoints
  google: router({
    getAuthUrl: protectedProcedure.query(({ ctx }) => {
      const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/google/callback`;
      const scope = "https://www.googleapis.com/auth/drive.readonly";
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      
      authUrl.searchParams.append("client_id", ENV.googleOAuthClientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", scope);
      authUrl.searchParams.append("state", ctx.user?.id.toString() || "");

      return { authUrl: authUrl.toString() };
    }),

    files: protectedProcedure.query(async ({ ctx }) => {
      try {
        const token = await getGoogleOAuthToken(ctx.user!.id);
        
        if (!token) {
          return { success: false, error: "Not authenticated with Google", files: [] };
        }

        const response = await fetch(
          "https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,createdTime,modifiedTime)",
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          return { success: false, error: "Failed to fetch files", files: [] };
        }

        const data = await response.json() as any;
        return {
          success: true,
          files: (data.files || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            created: f.createdTime,
            modified: f.modifiedTime,
          })),
        };
      } catch (error) {
        console.error("Google Drive files error:", error);
        return { success: false, error: String(error), files: [] };
      }
    }),

    saveToken: protectedProcedure
      .input(z.object({ accessToken: z.string(), refreshToken: z.string().optional(), expiresAt: z.date().optional() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await saveGoogleOAuthToken(
            ctx.user!.id,
            input.accessToken,
            input.refreshToken,
            input.expiresAt
          );
          return { success: true };
        } catch (error) {
          console.error("Save Google token error:", error);
          return { success: false, error: String(error) };
        }
      }),
  }),

  // Gemini AI Chat endpoints
  chat: router({
    createSession: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await createChatSession(ctx.user!.id, input.title);
          return { success: true, sessionId: (result as any).insertId || 1 };
        } catch (error) {
          console.error("Create chat session error:", error);
          return { success: false, error: String(error) };
        }
      }),

    getSessions: protectedProcedure.query(async ({ ctx }) => {
      try {
        const sessions = await getChatSessionsByUserId(ctx.user!.id);
        return { success: true, sessions };
      } catch (error) {
        console.error("Get chat sessions error:", error);
        return { success: false, error: String(error), sessions: [] };
      }
    }),

    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        try {
          const messages = await getChatMessages(input.sessionId);
          return { success: true, messages };
        } catch (error) {
          console.error("Get chat messages error:", error);
          return { success: false, error: String(error), messages: [] };
        }
      }),

    sendMessage: protectedProcedure
      .input(z.object({ sessionId: z.number(), message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Store user message
          await addChatMessage(input.sessionId, "user", input.message);

          // Get conversation history for context
          const messages = await getChatMessages(input.sessionId);
          
          // Prepare context for Gemini
          const conversationHistory = messages.map((m) => ({
            role: m.role,
            content: m.content,
          }));

          // Call Gemini API with context
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a helpful assistant for a Command Center dashboard. You have access to information about Cloudflare Workers, GitHub repositories, and Google Drive. Provide concise and helpful responses." },
              ...conversationHistory,
              { role: "user", content: input.message },
            ],
          });

          const assistantContent = response.choices?.[0]?.message?.content;
          const assistantMessage = typeof assistantContent === "string" ? assistantContent : "I couldn't generate a response.";

          // Store assistant response
          await addChatMessage(input.sessionId, "assistant", assistantMessage);

          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("Send chat message error:", error);
          return { success: false, error: String(error) };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
