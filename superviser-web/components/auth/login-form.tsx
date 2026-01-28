/**
 * @fileoverview Professional login form component with Google OAuth authentication.
 * @module components/auth/login-form
 */

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

/**
 * Login form component that uses Google OAuth for authentication
 */
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle Google sign in
   */
  async function handleGoogleSignIn() {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
          "w-full h-12 flex items-center justify-center gap-3 text-base font-medium",
          "border-2 hover:border-primary/20 hover:bg-muted/50 transition-all duration-200",
          "shadow-sm hover:shadow-md"
        )}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Secure authentication
          </span>
        </div>
      </div>

      {/* Security Features */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>SSL Protected</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>Work Email Recommended</span>
        </div>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        By signing in, you agree to our{" "}
        <a href="#" className="text-primary hover:underline font-medium">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline font-medium">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
