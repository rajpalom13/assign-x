/**
 * @fileoverview API route handler for Supabase OAuth callback to exchange auth code for session.
 * @module app/api/auth/callback/route
 */

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Validates that the redirect path is safe (internal path only)
 * Prevents open redirect attacks
 */
function validateRedirectPath(path: string): string {
  // Default safe path
  const defaultPath = "/dashboard"

  // Must start with /
  if (!path.startsWith("/")) {
    return defaultPath
  }

  // Prevent protocol-relative URLs (//evil.com)
  if (path.startsWith("//")) {
    return defaultPath
  }

  // Prevent URLs with protocols
  if (path.includes(":")) {
    return defaultPath
  }

  // Allowed internal paths
  const allowedPaths = [
    "/dashboard",
    "/onboarding",
    "/profile",
    "/projects",
    "/doers",
    "/chat",
    "/earnings",
    "/settings",
    "/resources",
    "/support",
    "/notifications",
    "/users",
    "/activation",
  ]

  // Check if path starts with any allowed path
  const isAllowed = allowedPaths.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`)
  )

  return isAllowed ? path : defaultPath
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/dashboard"

  // Validate and sanitize the redirect path
  const next = validateRedirectPath(rawNext)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
