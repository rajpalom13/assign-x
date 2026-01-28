/**
 * @fileoverview Professional authentication layout with split design and branding panel.
 * @module app/(auth)/layout
 */

import { APP_NAME } from "@/lib/constants"
import { Shield, Users, Wallet, CheckCircle2, Sparkles } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Expert Network",
    description: "Access to verified academic experts across all disciplines",
  },
  {
    icon: Wallet,
    title: "Earn Commission",
    description: "Competitive commission structure on every completed project",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Tools for plagiarism checking, AI detection, and QC review",
  },
  {
    icon: CheckCircle2,
    title: "Project Management",
    description: "Streamlined workflow from quote to delivery",
  },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl font-bold text-white">AX</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-white">{APP_NAME}</span>
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Shield className="h-3.5 w-3.5" />
                Supervisor Portal
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Trusted by 500+ supervisors
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Quality Control Hub for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Academic Excellence
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-lg">
                Join our network of expert supervisors and help maintain the highest standards in academic assistance.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-colors">
                      <feature.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-white/50 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
            <span>•</span>
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
