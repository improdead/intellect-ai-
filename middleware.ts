import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0/edge";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/profile"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const { pathname } = req.nextUrl;

  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !session?.user) {
    // Redirect to login if trying to access protected route without authentication
    const url = new URL("/api/auth/login", req.url);
    url.searchParams.set("returnTo", pathname);
    url.searchParams.set("connection", "google-oauth2");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and auth routes
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
