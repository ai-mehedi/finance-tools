import { AUTH_COOKIE, cookieOptions } from "@/lib/auth";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = ok({ success: true });
  res.cookies.set(AUTH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
