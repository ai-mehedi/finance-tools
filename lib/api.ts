import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Guard an admin-only handler. Returns null if authorized, or a 401 response
 * to return early if not. Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const auth = await getAuth();
  if (!auth) return fail("Unauthorized", 401);
  return null;
}

/** Parse standard list query params: page, limit, q (search). */
export function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  const q = (searchParams.get("q") || "").trim();
  return { searchParams, page, limit, q };
}

/** Build a paginated response envelope. */
export function paginated<T>(data: T[], total: number, page: number, limit: number) {
  return ok({ data, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
}

/** Turn unknown thrown values into a JSON error response (handles Mongoose validation). */
export function handleError(err: unknown) {
  console.error(err);
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    return fail("A record with that unique value already exists.", 409);
  }
  if (err && typeof err === "object" && "name" in err) {
    const name = (err as { name: string }).name;
    if (name === "ValidationError") return fail((err as Error).message, 422);
    if (name === "CastError") return fail("Invalid id.", 400);
  }
  const message = err instanceof Error ? err.message : "Server error";
  return fail(message, 500);
}
