/**
 * @fileoverview Auth layout for login and registration pages
 * Professional split-design with branding panel and form area
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden gradient-hero">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-float animation-delay-200" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float animation-delay-400" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <span className="text-xl font-bold text-white">AX</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AssignX</h2>
                <p className="text-sm text-white/60">Doer Portal</p>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Turn Your Skills Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300">
                Income
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Join thousands of skilled professionals completing projects on AssignX.
              Work on your schedule, get paid fairly, and grow your career.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-white/60">Active Doers</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/60">Projects Done</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">4.8</div>
              <div className="text-sm text-white/60">Avg Rating</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md">
            <p className="text-white/80 italic mb-4">
              &ldquo;AssignX has been a game-changer for me. I can work from home,
              choose projects that match my skills, and earn consistently.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                PK
              </div>
              <div>
                <div className="text-sm font-medium text-white">Priya Kumar</div>
                <div className="text-xs text-white/60">Top Rated Doer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  )
}
