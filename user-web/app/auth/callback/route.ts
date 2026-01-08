import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateStudentEmail } from "@/lib/validations/student-email";

/**
 * Helper to parse cookies from cookie header
 */
function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? match[2] : null;
}

/**
 * Helper to create redirect response with cleared signup cookies
 */
function createRedirectResponse(url: string, clearSignupCookies: boolean = false): NextResponse {
  const response = NextResponse.redirect(url);
  if (clearSignupCookies) {
    // Clear the signup cookies by setting them to expire immediately
    response.cookies.set("signup_intent", "", { maxAge: 0, path: "/" });
    response.cookies.set("signup_role", "", { maxAge: 0, path: "/" });
  }
  return response;
}

/**
 * OAuth callback handler
 * Handles both login and signup flows:
 *
 * Login flow (no signup cookie):
 * - Existing users with profile -> dashboard
 * - New users -> onboarding
 *
 * Signup flow (signup_intent cookie):
 * - Validates email for students
 * - Creates profile with selected role
 * - Redirects to appropriate registration form
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Read signup intent from cookies (set by role-selection component)
  const cookieHeader = request.headers.get("cookie");
  const isSignup = getCookieValue(cookieHeader, "signup_intent") === "true";
  const role = getCookieValue(cookieHeader, "signup_role");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userEmail = user.email || "";

        // SIGNUP FLOW
        if (isSignup && role) {
          // For students, validate that they're using an educational email
          if (role === "student") {
            const emailValidation = validateStudentEmail(userEmail);
            if (!emailValidation.isValid) {
              // Sign out the user since they don't have a valid student email
              await supabase.auth.signOut();
              // Redirect back to signup with error (clear cookies)
              return createRedirectResponse(
                `${origin}/signup?error=invalid_student_email&message=${encodeURIComponent(
                  emailValidation.error || "Please use a valid college/university email address"
                )}`,
                true
              );
            }
          }

          // Check for existing profile
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, user_type, onboarding_completed")
            .eq("id", user.id)
            .single();

          // If user already has a completed profile, redirect to home (clear cookies)
          if (existingProfile?.onboarding_completed) {
            return createRedirectResponse(`${origin}/home`, true);
          }

          // Create or update profile with selected role
          const profileData = {
            id: user.id,
            email: userEmail,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null,
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null,
            user_type: role === "business" ? "professional" : role,
            updated_at: new Date().toISOString(),
          };

          if (existingProfile) {
            // Update existing profile
            await supabase
              .from("profiles")
              .update(profileData)
              .eq("id", user.id);
          } else {
            // Create new profile
            await supabase.from("profiles").insert({
              ...profileData,
              created_at: new Date().toISOString(),
            });
          }

          // Redirect to appropriate registration form (clear cookies)
          if (role === "student") {
            return createRedirectResponse(`${origin}/signup/student`, true);
          } else {
            const typeParam = role === "business" ? "?type=business" : "";
            return createRedirectResponse(
              `${origin}/signup/professional${typeParam}`,
              true
            );
          }
        }

        // LOGIN FLOW (existing behavior)
        // Check for existing profile with user_type set
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, onboarding_completed")
          .eq("id", user.id)
          .single();

        // If no profile exists or no user_type, redirect to onboarding
        if (!profile || !profile.user_type) {
          // Create a basic profile if it doesn't exist (for new OAuth users)
          if (!profile) {
            await supabase.from("profiles").insert({
              id: user.id,
              email: userEmail,
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                null,
              avatar_url:
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                null,
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
