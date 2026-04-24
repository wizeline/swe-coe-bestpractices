import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user?.email);
  if (isAuthenticated) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/assessment/:path*",
    "/dashboard/:path*",
    "/api/sessions/:path*",
    "/api/submissions/:path*",
  ],
};
