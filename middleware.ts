import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Note: We'll handle onboardingCompleted verification directly in the dashboard UI/API
    // because auth() session might have a stale onboardingCompleted flag if we rely on JWT.
  }

  // Protect /onboarding
  if (pathname.startsWith("/onboarding")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Auto redirect from home if needed, or leave it alone
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
