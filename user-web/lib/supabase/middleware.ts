import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the Supabase session and handles auth redirects
 * Implements proper flow:
 * - New users (no profile/user_type) -> onboarding
 * - Existing users (has profile/user_type) -> dashboard
 * - Unauthenticated users on protected routes -> login
 * @param request - The incoming request
 * @returns NextResponse with updated session cookies
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getUser()
  // A simple mistake could make it very hard to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = [
    "/home",
    "/projects",
    "/project", // Covers /project/[id]
    "/profile",
    "/connect",
    "/settings",
    "/support",
    "/wallet",
    "/payment-methods",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Onboarding routes - need auth but allow incomplete profiles
  const onboardingRoutes = ["/onboarding", "/signup/student", "/signup/professional"];
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Login page - redirect authenticated users based on profile status
  const isLoginPage = pathname === "/login";

  if (user && (isLoginPage || isOnboardingRoute)) {
    // Check if user has completed their profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    const hasCompletedProfile = profile?.user_type !== null && profile?.user_type !== undefined;

    if (hasCompletedProfile) {
      // User has completed onboarding, redirect to dashboard
      if (isLoginPage || isOnboardingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
    } else {
      // User needs onboarding
      if (isLoginPage) {
        // Redirect from login to onboarding
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
      // Allow access to onboarding routes for users without complete profile
    }
  }

  // Unauthenticated users trying to access onboarding
  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Root page - redirect authenticated users to dashboard or onboarding
  if (pathname === "/" && user) {
    // Check if user has completed their profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    const hasCompletedProfile = profile?.user_type !== null && profile?.user_type !== undefined;
    const url = request.nextUrl.clone();
    url.pathname = hasCompletedProfile ? "/home" : "/onboarding";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
