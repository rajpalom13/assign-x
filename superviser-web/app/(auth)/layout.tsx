/**
 * @fileoverview Professional authentication layout with split design and branding panel.
 * @module app/(auth)/layout
 */

import { APP_NAME } from "@/lib/constants"
import { Shield, CheckCircle2, Timer, Sparkles } from "lucide-react"

const assuranceSignals = [
  {
    icon: Shield,
    label: "Verified QA",
    detail: "Multi-step checks",
  },
  {
    icon: CheckCircle2,
    label: "Clear decisions",
    detail: "Actionable feedback",
  },
  {
    icon: Timer,
    label: "On time",
    detail: "Priority routing",
  },
]

const trustStats = [
  { value: "98%", label: "On-time QC" },
  { value: "4.9/5", label: "Supervisor score" },
  { value: "24h", label: "Avg. turnaround" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-[#F2E9DA]">
      {/* Left Panel - Visual Story (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-[56%] overflow-hidden bg-[#0F2A2E] text-white">
        {/* Ambient gradients */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#1C4B4F]/60 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#72B7AD]/30 blur-3xl" />
          <div className="absolute right-16 top-1/3 h-64 w-64 rounded-full bg-[#C77B4E]/20 blur-3xl" />
        </div>

        {/* Diagonal sheen */}
        <div className="absolute -right-20 top-12 h-[420px] w-[420px] rotate-12 rounded-[64px] bg-white/5" />

        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 45%), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 64px 64px",
          }}
        />

        {/* Asymmetric card cluster */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-16 top-14 w-56 rounded-[28px] border border-white/10 bg-[#122022]/80 p-5 shadow-2xl animate-fade-in-up">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">Control Rate</div>
            <div className="mt-3 text-3xl font-semibold text-[#72B7AD]">92%</div>
            <div className="mt-2 text-xs text-white/60">Escalations resolved</div>
          </div>
          <div className="absolute left-14 top-[42%] w-[260px] -translate-y-1/2 rounded-2xl border border-[#72B7AD]/40 bg-white/10 p-4 backdrop-blur-md animate-fade-in-up">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#72B7AD]/20 text-[#72B7AD]">
                <Sparkles className="h-4 w-4" />
              </span>
              Prioritized QA signals
            </div>
            <div className="mt-3 text-sm text-white/60">
              Automated routing surfaces high-risk files for immediate review.
            </div>
          </div>
          <div className="absolute bottom-16 right-24 h-44 w-44 rounded-[32px] border border-white/15 bg-gradient-to-br from-white/15 to-white/5 p-4 shadow-lg animate-bounce-subtle">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">Avg. Review</div>
            <div className="mt-5 text-2xl font-semibold text-white">2h 18m</div>
            <div className="mt-2 text-xs text-white/50">From intake to sign-off</div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#1C4B4F] via-[#2F6D6E] to-[#72B7AD] shadow-lg shadow-[#0F2A2E]/40 flex items-center justify-center">
              <span className="text-xl font-bold text-white">AX</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{APP_NAME}</span>
              <div className="flex items-center gap-1.5 text-sm text-white/60">
                <Shield className="h-3.5 w-3.5" />
                Supervisor Control
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-[#C77B4E]" />
              Built for high-stakes review cycles
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Quality control,
              <span className="block bg-gradient-to-r from-[#72B7AD] to-[#C77B4E] bg-clip-text text-transparent">
                clearly measured
              </span>
            </h1>
            <p className="text-lg text-white/60">
              Keep standards crisp with a focused workspace that highlights risk, prioritizes action, and documents every decision.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {assuranceSignals.map((signal) => (
                <div key={signal.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <signal.icon className="h-4 w-4 text-[#72B7AD]" />
                  <div className="mt-2 text-sm font-semibold text-white">{signal.label}</div>
                  <div className="mt-1 text-xs text-white/50">{signal.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex max-w-md gap-6 border-t border-white/10 pt-5 text-sm text-white/60">
            {trustStats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-semibold text-white">{stat.value}</span>
                <span className="mt-1 text-[11px] text-white/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="relative flex-1 bg-[#F2E9DA]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(230,240,238,0.9) 0%, transparent 55%), radial-gradient(circle at 80% 15%, rgba(199,123,78,0.18) 0%, transparent 45%)",
          }}
        />
        <div className="absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-[#72B7AD]/20 blur-3xl" />
        <div className="absolute right-8 top-20 h-40 w-40 rounded-full bg-[#C77B4E]/15 blur-2xl" />

        <div className="relative flex min-h-screen items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
