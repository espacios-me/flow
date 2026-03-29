import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { chatSessions, chatMessages, googleOAuthTokens, githubData, workerLogs, InsertChatSession, InsertChatMessage, InsertGoogleOAuthToken, InsertGitHubData } from "../drizzle/schema";

// Chat session queries
export async function createChatSession(userId: number, title?: string, context?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatSessions).values({
    userId,
    title,
    context,
  });
  return result;
}

export async function getChatSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatSessions).where(eq(chatSessions.userId, userId));
}

export async function getChatSession(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Chat message queries
export async function addChatMessage(sessionId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(chatMessages).values({
    sessionId,
    role,
    content,
  });
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId));
}

// Google OAuth token queries
export async function saveGoogleOAuthToken(userId: number, accessToken: string, refreshToken?: string, expiresAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(googleOAuthTokens).values({
    userId,
    accessToken,
    refreshToken,
    expiresAt,
  }).onDuplicateKeyUpdate({
    set: {
      accessToken,
      refreshToken,
      expiresAt,
      updatedAt: new Date(),
    },
  });
}

export async function getGoogleOAuthToken(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(googleOAuthTokens).where(eq(googleOAuthTokens.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// GitHub data cache queries
export async function cacheGitHubData(dataType: "repo" | "issue" | "pr" | "activity", externalId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(githubData).values({
    dataType,
    externalId,
    data: JSON.stringify(data),
  }).onDuplicateKeyUpdate({
    set: {
      data: JSON.stringify(data),
      updatedAt: new Date(),
    },
  });
}

export async function getGitHubData(dataType: "repo" | "issue" | "pr" | "activity", externalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(githubData).where(
    eq(githubData.dataType, dataType) && eq(githubData.externalId, externalId)
  ).limit(1);
  
  if (result.length > 0) {
    return { ...result[0], data: JSON.parse(result[0].data) };
  }
  return undefined;
}
