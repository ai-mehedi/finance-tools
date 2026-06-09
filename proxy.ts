import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "admin_token";

// Gate the admin panel: redirect to login when the session cookie is absent.
// (The API routes still verify the JWT signature on every admin request.)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (pathname === "/admin/login") {
    if (token) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
