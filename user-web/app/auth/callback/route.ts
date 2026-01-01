import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth callback handler
 * Exchanges auth code for session and redirects based on profile status:
 * - New users (no profile or no user_type) -> onboarding flow
 * - Existing users (has user_type) -> dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed profile setup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check for existing profile with user_type set
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        // If no profile exists or no user_type, redirect to onboarding
        if (!profile || !profile.user_type) {
          // Create a basic profile if it doesn't exist (for new OAuth users)
          if (!profile) {
            await supabase.from("profiles").insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          // Redirect to onboarding to select user type
          return NextResponse.redirect(`${origin}/onboarding?step=role`);
        }

        // User has completed profile, go to dashboard
        return NextResponse.redirect(`${origin}/home`);
      }
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
