/**
 * Auth layout for login and registration pages
 * Provides a clean, centered layout without navigation
 */
export default function AuthLayout({
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
