/**
 * @fileoverview Professional authentication layout with split design and branding panel.
 * Enhanced left panel with corner gradients and improved contrast.
 * @module app/(auth)/layout
 */

import { APP_NAME } from "@/lib/constants"
import { Shield, Sparkles, BarChart3, Zap, Clock, TrendingUp, Award, Users } from "lucide-react"

const trustStats = [
  { value: "98%", label: "On-time QC" },
  { value: "4.9/5", label: "Supervisor score" },
  { value: "24h", label: "Avg. turnaround" },
]

const featureCards = [
  {
    icon: BarChart3,
    label: "Control Rate",
    value: "92%",
    detail: "Escalations resolved",
    color: "#72B7AD",
  },
  {
    icon: Zap,
    label: "Prioritized QA",
    detail: "Automated routing surfaces high-risk files for immediate review.",
    color: "#C77B4E",
  },
  {
    icon: Clock,
    label: "Avg. Review",
    value: "2h 18m",
    detail: "From intake to sign-off",
    color: "#72B7AD",
  },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F2E9DA]">
      <div className="flex">
        {/* Left Panel - Enhanced Visual Design (55% width, Fixed, Non-scrollable) */}
        <div className="hidden lg:flex lg:w-[55%] fixed h-screen overflow-hidden bg-[#0F2A2E] text-white">
          {/* Subtle radial gradient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(28,75,79,0.4)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(114,183,173,0.15)_0%,_transparent_50%)]" />
          </div>

          {/* Corner Accent - Bottom Right Orange Gradient */}
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tl from-[#C77B4E]/30 via-[#C77B4E]/10 to-transparent" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C77B4E]/20 blur-3xl rounded-full" />
          </div>

          {/* Top Left Corner Accent - Teal Glow */}
          <div className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C4B4F]/50 via-[#1C4B4F]/20 to-transparent" />
          </div>

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Content Container - Flexbox Layout */}
          <div className="relative z-10 flex flex-col h-full w-full p-10 xl:p-14">
            {/* Logo - Compact */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#1C4B4F] via-[#2F6D6E] to-[#72B7AD] shadow-lg shadow-[#0F2A2E]/40 flex items-center justify-center border border-white/10">
                <span className="text-lg font-bold text-white">AX</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
                <div className="flex items-center gap-1.5 text-xs text-[#72B7AD]">
                  <Shield className="h-3 w-3" />
                  Supervisor Control
                </div>
              </div>
            </div>

            {/* Main Content - Flex grow */}
            <div className="flex-1 flex flex-col justify-center py-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#72B7AD]/30 bg-[#72B7AD]/10 px-3 py-1.5 text-xs font-medium text-[#72B7AD] w-fit mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Built for high-stakes review cycles
              </div>

              {/* Headline with stronger contrast */}
              <h1 className="text-4xl xl:text-[52px] font-bold leading-[1.1] tracking-tight text-white">
                Quality control,
                <span className="block text-[#72B7AD]">
                  clearly measured
                </span>
              </h1>

              {/* Description with better contrast */}
              <p className="mt-5 text-base text-white/80 max-w-md leading-relaxed">
                Keep standards crisp with a focused workspace that highlights risk, prioritizes action, and documents every decision with precision.
              </p>

              {/* Feature Cards Grid - Horizontal Row with enhanced styling */}
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                {featureCards.map((card) => (
                  <div
                    key={card.label}
                    className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-3.5 flex flex-col hover:border-[#72B7AD]/30 transition-all duration-300"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: `${card.color}25` }}
                    >
                      <card.icon className="h-4 w-4" style={{ color: card.color }} />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-medium">
                      {card.label}
                    </div>
                    {card.value && (
                      <div className="text-xl font-bold mt-1 text-white">
                        {card.value}
                      </div>
                    )}
                    <div className="text-[10px] text-white/50 mt-1.5 leading-relaxed">
                      {card.detail}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust indicators - Refined */}
              <div className="mt-6 flex items-center gap-5">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#72B7AD]/30 border-2 border-[#0F2A2E] flex items-center justify-center text-xs font-medium text-white">S</div>
                    <div className="w-7 h-7 rounded-full bg-[#C77B4E]/30 border-2 border-[#0F2A2E] flex items-center justify-center text-xs font-medium text-white">M</div>
                    <div className="w-7 h-7 rounded-full bg-[#1C4B4F]/50 border-2 border-[#0F2A2E] flex items-center justify-center text-xs font-medium text-white">+</div>
                  </div>
                  <span className="text-xs">500+ Active</span>
                </div>
                <div className="h-3.5 w-px bg-white/20" />
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <TrendingUp className="h-3.5 w-3.5 text-[#72B7AD]" />
                  <span>Performance tracked</span>
                </div>
              </div>
            </div>

            {/* Stats at bottom - Refined */}
            <div className="shrink-0 flex items-center justify-between border-t border-white/10 pt-5">
              <div className="flex items-center gap-6">
                {trustStats.map((stat, index) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                    <span className="text-[11px] text-white/50 mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Award className="h-3.5 w-3.5 text-[#C77B4E]" />
                <span className="text-[11px] text-white/70">Certified Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form (45% width, Scrollable) */}
        <div className="lg:ml-[55%] flex-1 min-h-screen overflow-y-auto bg-[#F2E9DA]">
          {/* Subtle background accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(230,240,238,0.9) 0%, transparent 55%), radial-gradient(circle at 80% 15%, rgba(199,123,78,0.18) 0%, transparent 45%)",
              }}
            />
            <div className="absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-[#72B7AD]/20 blur-3xl" />
            <div className="absolute right-8 top-20 h-40 w-40 rounded-full bg-[#C77B4E]/15 blur-2xl" />
          </div>

          <div className="relative flex min-h-screen items-center justify-center p-6 lg:p-10">
            <div className="w-full max-w-[380px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
