/**
 * @fileoverview Professional login page for supervisor authentication.
 * @module app/(auth)/login/page
 */

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoginForm } from "@/components/auth/login-form"
import { APP_NAME } from "@/lib/constants"
import { Shield, ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mobile Logo (shown only on mobile) */}
      <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-2xl font-bold text-white">AX</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Supervisor Portal
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access your supervisor dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <LoginForm />
        </CardContent>

        <Separator />

        <CardFooter className="pt-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 group"
            >
              Apply as Supervisor
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Help
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Secure Login</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>256-bit Encryption</span>
        </div>
      </div>
    </div>
  )
}
