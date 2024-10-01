/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const PUBLIC_ROUTES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage = PUBLIC_ROUTES.includes(req.nextUrl.pathname);

  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      const userRole = decodedToken?.role;

      // If the user is authenticated and tries to visit login or signup pages, redirect to home
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (req.nextUrl.pathname.startsWith("/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (req.nextUrl.pathname.startsWith("/profile") && userRole !== "user") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.log("Error decoding token:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    // If there's no token and the user is trying to access protected routes, redirect to login
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/admin");

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url)); //
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/login", "/signup"],
};
