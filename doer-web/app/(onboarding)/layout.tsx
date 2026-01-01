/**
 * Onboarding layout for welcome and profile setup pages
 * Provides a full-screen layout for the onboarding flow
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
