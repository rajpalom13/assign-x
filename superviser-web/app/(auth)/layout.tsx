/**
 * @fileoverview Authentication layout wrapper providing centered card container for login and registration pages.
 * @module app/(auth)/layout
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
