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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1C4B4F] via-[#2F6D6E] to-[#72B7AD] flex items-center justify-center shadow-lg shadow-[#0F2A2E]/30">
          <span className="text-2xl font-bold text-white">AX</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#122022]">{APP_NAME}</h1>
          <p className="text-sm text-[#1C4B4F]/70 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Supervisor Control
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border border-[#E3D9C8] bg-white/90 shadow-[0_20px_60px_-40px_rgba(15,42,46,0.7)] backdrop-blur">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#1C4B4F]/15 bg-[#E6F0EE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1C4B4F]">
              Supervisor Access
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-[#122022]">
              Sign in to your control suite
            </CardTitle>
            <CardDescription className="text-base text-[#536563]">
              Review, approve, and track quality outcomes in one place.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <LoginForm />
          </CardContent>

          <CardFooter className="border-t border-[#E7DED0] pt-6 flex flex-col gap-4">
            <p className="text-sm text-[#536563] text-center">
              Need a supervisor account?{" "}
              <Link
                href="/register"
                className="text-[#1C4B4F] font-semibold hover:underline inline-flex items-center gap-1 group"
              >
                Apply for access
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-[#6B7B78]">
              <a href="#" className="hover:text-[#122022] transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#122022] transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-[#122022] transition-colors">
                Help
              </a>
            </div>
          </CardFooter>
        </Card>

        <div className="rounded-[22px] border border-dashed border-[#C77B4E]/40 bg-gradient-to-br from-[#FFF5E8] via-[#FDF1E2] to-[#F2E9DA] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#C77B4E] shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#122022]">Approval-first workspace</div>
              <p className="mt-1 text-sm text-[#5A6B68]">
                Supervisor access is verified before onboarding. Expect a quick response from our review team.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-3 text-sm text-[#1C4B4F] shadow-sm">
              <div className="flex items-center gap-2 font-semibold">
                <Shield className="h-4 w-4 text-[#1C4B4F]" />
                Secure review trails
              </div>
              <div className="mt-1 text-xs text-[#6B7B78]">Audit-ready decision logs</div>
            </div>
            <div className="rounded-xl border border-[#C77B4E]/25 bg-[#FFF2E5] p-3 text-sm text-[#7A4A2D]">
              <div className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4" />
                Priority routing
              </div>
              <div className="mt-1 text-xs text-[#8A6B56]">High-risk items surface first</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 text-[#5A6B68]">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-[#72B7AD]" />
          <span>Secure login</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-[#C77B4E]" />
          <span>Risk-scored reviews</span>
        </div>
      </div>
    </div>
  )
}
