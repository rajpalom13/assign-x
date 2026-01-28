'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, Clock, Wallet, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authService } from '@/services/auth.service'

/**
 * Registration page component
 * Professional design for new doer sign up
 */
export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Handle Google sign up */
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signInWithGoogle()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up with Google. Please try again.'
      setError(errorMessage)
      console.error('Google sign-up error:', err)
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
          Become a Doer
        </h1>
        <p className="text-muted-foreground">
          Join our network of skilled professionals
        </p>
      </div>

      {/* Registration Card */}
      <Card className="border-0 shadow-lg shadow-black/5">
        <CardContent className="pt-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {/* Google Sign Up Button */}
          <Button
            type="button"
            size="lg"
            className="w-full h-12 text-base font-medium gradient-primary hover:opacity-90 transition-opacity"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                Creating account...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </Button>

          {/* Process Steps */}
          <div className="space-y-4 pt-4">
            <p className="text-sm font-medium text-center text-muted-foreground">How it works</p>
            <div className="space-y-3">
              {[
                { step: 1, title: 'Create Account', desc: 'Sign up with Google', icon: CheckCircle2, color: 'teal' },
                { step: 2, title: 'Complete Profile', desc: 'Add skills & experience', icon: Star, color: 'emerald' },
                { step: 3, title: 'Pass Assessment', desc: 'Quick training & quiz', icon: Clock, color: 'cyan' },
                { step: 4, title: 'Start Earning', desc: 'Accept projects & get paid', icon: Wallet, color: 'amber' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    item.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30' :
                    item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    item.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <item.icon className={`h-5 w-5 ${
                      item.color === 'teal' ? 'text-teal-600 dark:text-teal-400' :
                      item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                      item.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Step {item.step}</span>
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
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
