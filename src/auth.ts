import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "github";
}

export interface Session {
  user: User;
  expiresAt: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(user: User): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const token = await sign(
    {
      user,
      expiresAt,
      iat: Date.now(),
    },
    JWT_SECRET
  );
  return token;
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const payload = await verify(token, JWT_SECRET);
    if (payload.expiresAt < Date.now()) {
      return null; // Token expired
    }
    return payload as Session;
  } catch (error) {
    return null;
  }
}

export function getSessionCookie(c: Context): string | undefined {
  return getCookie(c, "atom_session");
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, "atom_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export function clearSessionCookie(c: Context): void {
  setCookie(c, "atom_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getCurrentUser(c: Context): Promise<User | null> {
  const token = getSessionCookie(c);
  if (!token) return null;

  const session = await verifySession(token);
  return session?.user || null;
}

export function requireAuth(c: Context, user: User | null): boolean {
  return user !== null;
}

// OAuth URLs
export function getGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    redirect_uri: `${process.env.OAUTH_REDIRECT_URI || "https://espacios.me"}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGitHubOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID || "",
    redirect_uri: `${process.env.OAUTH_REDIRECT_URI || "https://espacios.me"}/auth/github/callback`,
    scope: "user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<User | null> {
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: `${process.env.OAUTH_REDIRECT_URI || "https://espacios.me"}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    return {
      id: userData.sub,
      email: userData.email,
      name: userData.name,
      avatar: userData.picture,
      provider: "google",
    };
  } catch (error) {
    console.error("Google OAuth exchange failed:", error);
    return null;
  }
}

export async function exchangeGitHubCode(code: string): Promise<User | null> {
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    return {
      id: userData.id.toString(),
      email: userData.email,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      provider: "github",
    };
  } catch (error) {
    console.error("GitHub OAuth exchange failed:", error);
    return null;
  }
}
