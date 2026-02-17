import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  authRoutes,
  protectedRoutePrefix,
  adminRoutePrefix,
  employeeRoutePrefix,
  apiAuthPrefix,
  DEFAULT_SIGNIN_REDIRECT_USER,
  DEFAULT_SIGNIN_REDIRECT_ADMIN,
  DEFAULT_SIGNIN_REDIRECT_EMPLOYEE,
} from "@/routeslist";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  _id: string;
  email: string;
  role: string;
  uuid: string;
  iat: number;
  exp: number;
}

export default async function middleware(request: NextRequest) {
  const { nextUrl, headers, cookies } = request;

  // Get auth token from cookies
  const token = cookies.get("auth-token")?.value;
  let isLoggedIn = false;
  let userRole: string | undefined;

  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      // Check if token is not expired
      if (decoded.exp * 1000 > Date.now()) {
        isLoggedIn = true;
        userRole = decoded.role?.toUpperCase();
      }
    } catch (error) {
      // Invalid token, treat as not logged in
      isLoggedIn = false;
    }
  }

  const referer = headers.get("referer");
  const fetchDest = headers.get("sec-fetch-dest");

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAdminOnlyRoute = nextUrl.pathname.startsWith(adminRoutePrefix);
  const isEmployeeOnlyRoute = nextUrl.pathname.startsWith(employeeRoutePrefix);
  const isProtectedRoute = nextUrl.pathname.startsWith(protectedRoutePrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // not all api routes but allow only these, that are prefixed with apiAuthPrefix
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // when the route is not an auth or api route
  if (!isAuthRoute) {
    if (isAdminOnlyRoute) {
      // redirect if admin route and the user is not even authenticated
      if (!isLoggedIn) {
        // Clear cookies and redirect to login
        const response = NextResponse.redirect(new URL("/login", nextUrl));
        response.cookies.delete("last_pg");
        return response;
      }

      // Allow both ADMIN and EMPLOYEE roles to access /control routes
      // Employees will only see menu items they have permissions for
      if (!userRole || (userRole !== "ADMIN" && userRole !== "EMPLOYEE")) {
        const response = NextResponse.redirect(
          new URL(DEFAULT_SIGNIN_REDIRECT_USER, nextUrl)
        );
        return response;
      }

      const response = NextResponse.next();
      response.cookies.set("last_pg", nextUrl.pathname, { path: "/" });
      return response;
    }

    if (isEmployeeOnlyRoute) {
      // Employee-only routes (like /employee/dashboard landing page)
      if (!isLoggedIn) {
        const response = NextResponse.redirect(new URL("/login", nextUrl));
        response.cookies.delete("last_pg");
        return response;
      }

      // Only EMPLOYEE role can access employee routes
      if (!userRole || userRole !== "EMPLOYEE") {
        // Redirect to appropriate dashboard based on role
        if (userRole === "ADMIN") {
          return NextResponse.redirect(
            new URL(DEFAULT_SIGNIN_REDIRECT_ADMIN, nextUrl)
          );
        }
        return NextResponse.redirect(
          new URL(DEFAULT_SIGNIN_REDIRECT_USER, nextUrl)
        );
      }

      const response = NextResponse.next();
      response.cookies.set("last_pg", nextUrl.pathname, { path: "/" });
      return response;
    }

    if (isProtectedRoute) {
      if (!isLoggedIn) {
        const response = NextResponse.redirect(new URL("/login", nextUrl));
        response.cookies.delete("last_pg");
        return response;
      }

      if (userRole === "ADMIN") {
        return NextResponse.redirect(
          new URL(DEFAULT_SIGNIN_REDIRECT_ADMIN, nextUrl)
        );
      }

      if (userRole === "EMPLOYEE") {
        return NextResponse.redirect(
          new URL(DEFAULT_SIGNIN_REDIRECT_EMPLOYEE, nextUrl)
        );
      }

      const response = NextResponse.next();
      response.cookies.set("last_pg", nextUrl.pathname, { path: "/" });
      return response;
    }

    if (isLoggedIn) {
      const response = NextResponse.next();
      response.cookies.set("last_pg", nextUrl.pathname, { path: "/" });
      return response;
    }

    return NextResponse.next();
  }

  // intended for authenticating users, which the signed-in users shouldn't view
  if (isAuthRoute) {
    if (isLoggedIn) {
      let default_redir = DEFAULT_SIGNIN_REDIRECT_USER;
      if (userRole === "ADMIN") {
        default_redir = DEFAULT_SIGNIN_REDIRECT_ADMIN;
      } else if (userRole === "EMPLOYEE") {
        default_redir = DEFAULT_SIGNIN_REDIRECT_EMPLOYEE;
      }

      const lastPage = cookies.get("last_pg")?.value || default_redir;

      if (referer && new URL(referer).origin === nextUrl.origin) {
        return NextResponse.redirect(new URL(lastPage, nextUrl));
      } else if (!referer && fetchDest === "document") {
        // Direct navigation (search bar entry)
        return NextResponse.redirect(new URL(lastPage, nextUrl));
      } else {
        // External origin access
        return NextResponse.redirect(new URL(default_redir, nextUrl));
      }
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // Also explicitly skip service worker files
    "/((?!_next|firebase-messaging-sw|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
