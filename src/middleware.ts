import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, search } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};