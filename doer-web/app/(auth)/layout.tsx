/**
 * @fileoverview Auth layout for login and registration pages
 * Social Proof Focus design with 55/45 split and refined visual design
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Social Proof (55% width, Fixed, Non-scrollable) */}
      <div className="hidden lg:flex lg:fixed lg:w-[55%] h-screen overflow-hidden gradient-hero flex-col">
        {/* Corner Gradient - Top Right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent" />
        </div>

        {/* Corner Gradient - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/30 via-cyan-500/10 to-transparent" />
        </div>

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Content Container - Using flexbox */}
        <div className="flex flex-col h-full px-10 xl:px-16 py-10">
          {/* Logo - Compact */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30 border border-white/20">
                <span className="text-lg font-bold text-white">AX</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">AssignX</h2>
                <p className="text-xs text-teal-300">Doer Portal</p>
              </div>
            </div>
          </div>

          {/* Headline - Community Focus with better contrast */}
          <div className="flex-shrink-0 mb-6">
            <h1 className="text-3xl xl:text-[44px] font-bold text-white leading-[1.1]">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300">
                10,000+
              </span>{' '}
              skilled professionals
            </h1>
            <p className="text-sm text-white/80 mt-3 max-w-lg leading-relaxed">
              Turn your skills into income. Work on your schedule, get paid fairly, and grow your career.
            </p>
          </div>

          {/* Main Content Area - Testimonial Focus */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Featured Testimonial Card */}
            <div className="p-6 xl:p-7 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-md shadow-2xl shadow-black/20 max-w-xl">
              {/* Quote Icon */}
              <div className="mb-4">
                <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              {/* Quote Text - Better contrast */}
              <p className="text-lg text-white font-medium leading-relaxed mb-5">
                &ldquo;AssignX has been a game-changer for me. I can work from home, choose projects that match my skills, and earn consistently.&rdquo;
              </p>
              
              {/* Avatar and Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
                  PK
                </div>
                <div>
                  <div className="text-base font-bold text-white">Priya Kumar</div>
                  <div className="text-xs text-teal-300">Top Rated Doer • $12K+ earned</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Testimonial - Single refined card */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-xl">
              <p className="text-xs text-white/70 italic leading-relaxed">
                &ldquo;Fair pay, great clients, and support that actually helps. Best freelance platform I&apos;ve used.&rdquo;
              </p>
              <div className="mt-2 text-[10px] text-white/40">— Rahul M., Senior Developer</div>
            </div>
          </div>

          {/* Stats Row - Bottom - Refined */}
          <div className="flex-shrink-0 mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between max-w-xl">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-xs text-teal-300 mt-0.5">Active Doers</div>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-teal-300 mt-0.5">Projects Done</div>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-xs text-teal-300 mt-0.5">Avg Rating</div>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
                <span className="text-xs text-white/70">Trusted worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (45% width, Scrollable) */}
      <div className="flex-1 lg:ml-[55%] min-h-screen overflow-y-auto bg-background flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[380px] animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  )
}
