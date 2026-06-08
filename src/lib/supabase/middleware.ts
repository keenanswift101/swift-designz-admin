import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const INVESTOR_ALLOWED_PATHS = ["/", "/investors", "/projects", "/accounting/reports", "/equipment", "/documents"];
const EMPLOYEE_ALLOWED_PATHS = ["/documents", "/settings"];
const EMPLOYEE_BLOCKED_PATHS = ["/documents/retainers", "/documents/employee-contracts"];
const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/set-password", "/auth/magic", "/accept", "/api/accept", "/api/docs/quotations", "/api/leads"];
const INVESTOR_ONBOARDING_PATH = "/investors/onboarding";
const STATIC_FILE_RE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|html|pdf)$/i;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function isStaticOrSystemPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/docs/") ||
    pathname.startsWith("/api/") ||
    STATIC_FILE_RE.test(pathname)
  );
}

function hasCompletedInvestorOnboarding(user: { user_metadata?: Record<string, unknown> }): boolean {
  const metadata = user.user_metadata ?? {};
  return Boolean(metadata.investor_terms_accepted_at) && Boolean(metadata.investor_nda_accepted_at);
}

function isInvestorAllowed(pathname: string): boolean {
  return INVESTOR_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow auth callback and login pages to be reached without a session.
  if (!user && !isPublicPath(request.nextUrl.pathname) && !isStaticOrSystemPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is on login page and already authenticated, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Role-based route guards
  if (user && !isStaticOrSystemPath(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Employee: only /documents (excluding retainers/contracts) and /settings
    if (profile?.role === "employee") {
      const blocked = EMPLOYEE_BLOCKED_PATHS.some(
        (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + "/"),
      );
      const allowed = !blocked && EMPLOYEE_ALLOWED_PATHS.some(
        (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + "/"),
      );
      if (!allowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/documents";
        return NextResponse.redirect(url);
      }
    }

    if (profile?.role === "investor") {
      const completedOnboarding = hasCompletedInvestorOnboarding(user);

      if (!completedOnboarding && request.nextUrl.pathname !== INVESTOR_ONBOARDING_PATH) {
        const url = request.nextUrl.clone();
        url.pathname = INVESTOR_ONBOARDING_PATH;
        return NextResponse.redirect(url);
      }

      if (completedOnboarding && request.nextUrl.pathname === INVESTOR_ONBOARDING_PATH) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      if (completedOnboarding && !isInvestorAllowed(request.nextUrl.pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
