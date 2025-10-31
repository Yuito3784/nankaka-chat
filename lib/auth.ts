// lib/auth.ts
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "auth_token";

/** Authorization: Bearer / Cookie(auth_token) の順で抽出 */
export function extractToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return cookie ?? null;
}

/** API Route (reqを持つ) 用：同期のままでOK */
export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: string; sub?: string };
    return payload.userId || (payload.sub as string) || null;
  } catch {
    return null;
  }
}

/** App Router (引数なし) 用：Next15系などで cookies() が Promise を返す型に対応 */
export async function getUserIdFromCookie(): Promise<string | null> {
  // cookies() が sync か async かを吸収する（型ずれ対策）
  const c = cookies() as any; // 型：ReadonlyRequestCookies | Promise<ReadonlyRequestCookies>
  const store = typeof c.then === "function" ? await c : c;

  const token = store.get(COOKIE_NAME)?.value as string | undefined;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: string; sub?: string };
    return payload.userId || (payload.sub as string) || null;
  } catch {
    return null;
  }
}
