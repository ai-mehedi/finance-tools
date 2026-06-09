import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET;
export const AUTH_COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AuthPayload = { sub: string; email: string };

export function signToken(payload: AuthPayload): string {
  if (!SECRET) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  if (!SECRET) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  try {
    return jwt.verify(token, SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/** Read & verify the admin from the request cookie. Returns null if not authenticated. */
export async function getAuth(): Promise<AuthPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
