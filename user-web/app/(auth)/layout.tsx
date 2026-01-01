import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Auth layout - shared layout for authentication pages
 * Minimal header with theme toggle
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
