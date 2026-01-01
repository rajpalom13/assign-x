/**
 * @fileoverview Supabase middleware utilities for session refresh and route protection.
 * @module lib/supabase/middleware
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
                      request.nextUrl.pathname.startsWith("/register") ||
                      request.nextUrl.pathname.startsWith("/onboarding")

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                           request.nextUrl.pathname.startsWith("/projects") ||
                           request.nextUrl.pathname.startsWith("/doers") ||
                           request.nextUrl.pathname.startsWith("/users") ||
                           request.nextUrl.pathname.startsWith("/chat") ||
                           request.nextUrl.pathname.startsWith("/earnings") ||
                           request.nextUrl.pathname.startsWith("/resources") ||
                           request.nextUrl.pathname.startsWith("/profile") ||
                           request.nextUrl.pathname.startsWith("/settings") ||
                           request.nextUrl.pathname.startsWith("/support") ||
                           request.nextUrl.pathname.startsWith("/notifications")

  const isActivationRoute = request.nextUrl.pathname.startsWith("/activation") ||
                            request.nextUrl.pathname.startsWith("/training") ||
                            request.nextUrl.pathname.startsWith("/quiz")

  // Redirect unauthenticated users to login
  if (!user && (isDashboardRoute || isActivationRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
