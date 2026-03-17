// Request flow:
//
//   Incoming request
//       │
//       ▼
//   Is path excluded by matcher? (static assets, auth routes)
//       │ no
//       ▼
//   auth() — check DB session
//       │
//       ├── session exists → pass through ──▶ route handler
//       │
//       └── no session
//               │
//               ├── on /login → pass through (avoid redirect loop)
//               │
//               └── elsewhere → redirect /login?callbackUrl=<path>

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (!isLoggedIn && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /login
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    // Match everything except:
    //   - All API routes (/api/*) — these use route-level auth() and return 401,
    //     not a redirect (redirecting fetch() calls causes misleading errors)
    //   - Next.js internals (/_next/*)
    //   - Static files (favicon, images, etc.)
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.webp$).*)",
  ],
};
