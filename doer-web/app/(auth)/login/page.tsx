'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Shield, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth.service'

/**
 * Login page component
 * Professional design with Google OAuth
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Handle Google sign in */
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signInWithGoogle()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.'
      setError(errorMessage)
      console.error('Google sign-in error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-xl font-bold text-white">AX</span>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold">AssignX</h2>
            <p className="text-xs text-muted-foreground">Doer Portal</p>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="text-center lg:text-left space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Sign in to continue to your dashboard
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-0 shadow-lg shadow-black/5">
        <CardContent className="pt-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full h-12 text-base font-medium relative overflow-hidden group"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Why join as a Doer?</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Flexible Work</p>
                <p className="text-xs text-muted-foreground">Choose projects that fit your schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Fair Compensation</p>
                <p className="text-xs text-muted-foreground">Competitive rates for quality work</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Secure Platform</p>
                <p className="text-xs text-muted-foreground">Protected payments and data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        New to AssignX?{' '}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our{' '}
        <Link href="#" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
