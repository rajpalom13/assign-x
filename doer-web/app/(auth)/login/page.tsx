'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#F3F6FF] flex items-center justify-center text-[#F59E0B] text-xl">
          ✹
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Get Started</h1>
          <p className="text-xs text-slate-500">Welcome to AssignX — let&apos;s get started</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="text-sm text-slate-600">Sign in to continue to your dashboard</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-[#F7F9FF] p-4">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full h-12 text-base font-medium relative overflow-hidden group bg-white border-[#CBD5FF] text-slate-900 hover:border-[#5C7CFF]"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#5C7CFF]/12 to-[#9AA9FF]/12 opacity-0 group-hover:opacity-100 transition-opacity" />
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
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(26,46,94,0.2)]">
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-3">Why join as a Doer?</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#5C7CFF]">
              <span className="text-base">⚡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Flexible Work</p>
              <p className="text-xs text-slate-600">Choose projects that fit your schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-[#EEF3FF] flex items-center justify-center text-[#7C8BFF]">
              <span className="text-base">◎</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Fair Compensation</p>
              <p className="text-xs text-slate-600">Competitive rates for quality work</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-[#FFEDE3] flex items-center justify-center text-[#F59E7A]">
              <span className="text-base">✓</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Secure Platform</p>
              <p className="text-xs text-slate-600">Protected payments and data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          New to AssignX?{' '}
          <Link href="/register" className="font-medium text-[#5C7CFF] hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          By signing in, you agree to our{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-slate-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-slate-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
