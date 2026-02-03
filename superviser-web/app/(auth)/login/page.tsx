/**
 * @fileoverview Professional login page for supervisor authentication.
 * @module app/(auth)/login/page
 */

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { APP_NAME } from "@/lib/constants"
import { Shield, ArrowRight, CheckCircle2, Clock } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mobile Logo (shown only on mobile) */}
      <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#FB923C] flex items-center justify-center shadow-lg shadow-orange-500/30">
          <span className="text-2xl font-bold text-white">AX</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Supervisor Control
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="space-y-3 pb-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Supervisor Access
            </div>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#1C1C1C]">
              Sign in to your control suite
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 leading-relaxed">
              Review, approve, and track quality outcomes in one place.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <LoginForm />
          </CardContent>

          <CardFooter className="border-t border-gray-100 pt-6 flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center">
              Need a supervisor account?{" "}
              <Link
                href="/register"
                className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1 group"
              >
                Apply for access
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-[#1C1C1C] transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#1C1C1C] transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#1C1C1C] transition-colors">
                Help
              </a>
            </div>
          </CardFooter>
        </Card>

        <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-orange-50/80 to-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1C1C1C]">Approval-first workspace</div>
              <p className="mt-1 text-sm text-gray-500">
                Supervisor access is verified before onboarding. Expect a quick response from our review team.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 text-sm shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 font-semibold text-[#1C1C1C]">
                <Shield className="h-4 w-4 text-orange-600" />
                Secure review trails
              </div>
              <div className="mt-1 text-xs text-gray-500">Audit-ready decision logs</div>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
              <div className="flex items-center gap-2 font-semibold text-[#1C1C1C]">
                <Clock className="h-4 w-4 text-orange-600" />
                Priority routing
              </div>
              <div className="mt-1 text-xs text-gray-500">High-risk items surface first</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 text-gray-500">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Secure login</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-orange-600" />
          <span>Risk-scored reviews</span>
        </div>
      </div>
    </div>
  )
}
