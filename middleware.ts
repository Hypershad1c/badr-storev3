import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/shop", "/product", "/categories", "/search", "/contact"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const ADMIN_ROUTES = ["/dashboard/"];
const CUSTOMER_ROUTES = ["/profile", "/orders", "/wishlist"];

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: typeof req.auth };
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const isManager = session?.user?.role === "BUSINESS_MANAGER";

  const path = nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && AUTH_ROUTES.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Protect dashboard routes
  if (path.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${path}`, nextUrl));
    }
    if (!isAdmin && !isManager) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect customer-only routes
  if (CUSTOMER_ROUTES.some((r) => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${path}`, nextUrl));
    }
  }

  // Protect checkout
  if (path.startsWith("/checkout")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/checkout", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
