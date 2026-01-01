import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler for Google authentication
 * Exchanges the auth code for a session, creates profile if needed,
 * and redirects user based on their onboarding status
 *
 * Flow:
 * 1. Exchange code for session
 * 2. Create profile if it doesn't exist
 * 3. Check if doer record exists
 *    - No doer → /profile-setup (where doer gets created)
 *    - Has doer but not activated → check activation step
 *    - Fully activated → /dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore - middleware handles session refresh
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist (first-time user)
        if (!profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              phone: user.phone || null,
              phone_verified: false,
              avatar_url: user.user_metadata?.avatar_url || null,
              user_type: 'doer',
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
          }

          // New user - send to profile setup (doer record created there)
          return NextResponse.redirect(`${origin}/profile-setup`)
        }

        // Profile exists - check if doer record exists
        const { data: doer } = await supabase
          .from('doers')
          .select('id, is_activated')
          .eq('profile_id', user.id)
          .single()

        // No doer record - send to profile setup
        if (!doer) {
          return NextResponse.redirect(`${origin}/profile-setup`)
        }

        // Doer exists but not activated - check which activation step
        if (!doer.is_activated) {
          const { data: activation } = await supabase
            .from('doer_activation')
            .select('training_completed, quiz_passed, bank_details_added')
            .eq('doer_id', doer.id)
            .single()

          if (!activation?.training_completed) {
            return NextResponse.redirect(`${origin}/training`)
          }
          if (!activation?.quiz_passed) {
            return NextResponse.redirect(`${origin}/quiz`)
          }
          if (!activation?.bank_details_added) {
            return NextResponse.redirect(`${origin}/bank-details`)
          }
        }

        // Fully activated - go to dashboard
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Error case - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
