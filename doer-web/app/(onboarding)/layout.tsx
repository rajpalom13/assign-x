/**
 * Onboarding layout for welcome and profile setup pages
 * Provides a full-screen layout with subtle background effects
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>
      {children}
    </div>
  )
}
