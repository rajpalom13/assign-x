import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase session in middleware
 * Handles route protection for authenticated/unauthenticated users
 */
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Get user - this validates the session
  const { data: { user }, error } = await supabase.auth.getUser()

  // Route classification
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isPublicRoute = pathname === '/' || pathname.startsWith('/auth/')
  const isOnboardingRoute = pathname === '/welcome' ||
                            pathname === '/profile-setup' ||
                            pathname === '/training' ||
                            pathname === '/quiz' ||
                            pathname === '/bank-details'

  // All other routes are protected
  const isProtectedRoute = !isAuthRoute && !isPublicRoute && !isOnboardingRoute

  // No valid user - redirect to login from protected routes
  if ((!user || error) && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Valid user on auth routes - redirect to dashboard
  if (user && !error && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
