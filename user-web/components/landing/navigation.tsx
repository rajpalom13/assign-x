"use client";

/**
 * Navigation - Premium glassmorphic sticky header
 * Features scroll-triggered background change and mobile menu
 * Adapts colors based on scroll position (dark hero -> light sections)
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSIGNX_EASE } from "@/lib/animations/constants";
import "@/app/landing.css";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Academic Reports", href: "/services/reports" },
      { label: "Proofreading", href: "/services/proofreading" },
      { label: "1-on-1 Tutoring", href: "/services/tutoring" },
      { label: "Consultation", href: "/services/consultation" },
    ],
  },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "/pricing" },
];

export function Navigation() {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: ASSIGNX_EASE as unknown as string,
          delay: 0.1,
        }
      );
    }, headerRef);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "landing-glass shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container px-6 md:px-8 lg:px-12">
        <nav className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)] flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span
              className={cn(
                "text-xl font-bold landing-font-display transition-colors duration-300",
                isScrolled ? "text-[var(--landing-text-primary)]" : "text-white"
              )}
            >
              AssignX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium",
                        "transition-colors duration-300",
                        isScrolled
                          ? "text-[var(--landing-text-secondary)] hover:bg-[var(--landing-accent-primary)]/5"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.label}
                      <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={cn(
                        "absolute top-full left-0 pt-2 opacity-0 invisible",
                        "group-hover:opacity-100 group-hover:visible",
                        "transition-all duration-200"
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="landing-glass rounded-2xl shadow-xl p-2 min-w-[220px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={cn(
                              "block px-4 py-3 rounded-xl text-sm font-medium",
                              "transition-colors duration-200",
                              "text-[var(--landing-text-secondary)]",
                              "hover:bg-[var(--landing-accent-primary)]/5"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium",
                      "transition-colors duration-300",
                      isScrolled
                        ? "text-[var(--landing-text-secondary)] hover:bg-[var(--landing-accent-primary)]/5"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium",
                "transition-colors duration-300",
                isScrolled
                  ? "text-[var(--landing-text-secondary)] hover:bg-[var(--landing-accent-primary)]/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold",
                "bg-gradient-to-r from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)]",
                "text-white shadow-lg shadow-[var(--landing-accent-primary)]/25",
                "hover:shadow-xl hover:shadow-[var(--landing-accent-primary)]/30",
                "transition-all duration-300 hover:-translate-y-0.5"
              )}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "lg:hidden relative z-10 p-2 rounded-xl transition-colors",
              isScrolled ? "hover:bg-[var(--landing-accent-primary)]/5" : "hover:bg-white/10"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={cn("size-6", isScrolled ? "text-[var(--landing-text-primary)]" : "text-white")} />
            ) : (
              <Menu className={cn("size-6", isScrolled ? "text-[var(--landing-text-primary)]" : "text-white")} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-20 landing-glass",
            "transition-all duration-300",
            isMobileMenuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          )}
        >
          <div className="container py-8">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <div>
                      <button
                        className={cn(
                          "flex items-center justify-between w-full py-4 px-4 rounded-xl",
                          "text-lg font-medium transition-colors",
                          "text-[var(--landing-text-primary)]",
                          "hover:bg-[var(--landing-accent-primary)]/5"
                        )}
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === link.label ? null : link.label
                          )
                        }
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "size-5 transition-transform",
                            openDropdown === link.label && "rotate-180"
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          openDropdown === link.label
                            ? "max-h-60 opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="pl-4 space-y-1 py-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block py-3 px-4 rounded-xl text-[var(--landing-text-secondary)] hover:bg-[var(--landing-accent-primary)]/5 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "block py-4 px-4 rounded-xl text-lg font-medium",
                        "text-[var(--landing-text-primary)]",
                        "transition-colors hover:bg-[var(--landing-accent-primary)]/5"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 pt-8 border-t border-[var(--landing-border)] space-y-3">
              <Link
                href="/login"
                className="block w-full py-4 text-center text-lg font-medium rounded-xl text-[var(--landing-text-primary)] hover:bg-[var(--landing-accent-primary)]/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "block w-full py-4 text-center rounded-full text-lg font-semibold",
                  "bg-gradient-to-r from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)]",
                  "text-white shadow-lg"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
