/**
 * @fileoverview Navigation - Landing page navigation bar
 *
 * Modern navbar with unique styling. Transforms on scroll.
 * Uses unique warm/cool color palette.
 */

"use client";

import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "@/app/landing.css";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Spacer for absolute positioning */}
      <div className="h-16" />

      <motion.nav
        initial={prefersReducedMotion ? {} : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "top-4 w-auto bg-[var(--landing-bg-dark)]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/20 rounded-full"
            : "top-4 w-full max-w-7xl bg-transparent border border-transparent"
        )}
      >
        <div className={cn(
          "flex items-center justify-between transition-all duration-500",
          scrolled ? "h-14 px-4 pl-5 gap-4" : "h-16 px-4 sm:px-6"
        )}>
          {/* Left: Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300",
                scrolled
                  ? "bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-secondary)]"
                  : "bg-[var(--landing-accent-primary)]"
              )}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className={cn(
                "font-bold text-xl tracking-tight transition-colors duration-300",
                scrolled ? "text-white" : "text-[var(--landing-text-primary)]"
              )}>
                Assign<span className="text-[var(--landing-accent-tertiary)]">X</span>
              </span>
            </motion.div>
          </Link>

          {/* Center: Navigation Links (Desktop) - Only visible when scrolled */}
          <AnimatePresence>
            {scrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hidden md:flex items-center gap-1"
              >
                {["Services", "How it works", "Pricing"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    {item}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: CTA Buttons */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/login"
                className={cn(
                  "hidden sm:inline-flex px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  scrolled
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "inline-flex items-center justify-center rounded-full font-medium text-sm transition-all duration-300",
                  "h-10 px-5 bg-[var(--landing-accent-tertiary)] text-white hover:bg-[var(--landing-accent-tertiary-hover)]",
                  !scrolled && "hover:shadow-md hover:shadow-[var(--landing-accent-tertiary)]/25"
                )}
              >
                Get Started
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "p-2 md:hidden rounded-full transition-colors",
                scrolled ? "hover:bg-white/10" : "hover:bg-black/5"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={cn("h-5 w-5", scrolled ? "text-white" : "text-[var(--landing-text-primary)]")} />
              ) : (
                <Menu className={cn("h-5 w-5", scrolled ? "text-white" : "text-[var(--landing-text-primary)]")} />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl rounded-2xl border border-[var(--landing-border)] shadow-lg p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {["Services", "How it works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-3 text-sm text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors rounded-lg hover:bg-black/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="border-t border-[var(--landing-border)] mt-2 pt-2">
                <Link
                  href="/login"
                  className="block px-4 py-3 text-sm text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors rounded-lg hover:bg-black/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block mt-2 px-4 py-3 text-sm font-medium text-white bg-[var(--landing-accent-tertiary)] rounded-xl text-center hover:bg-[var(--landing-accent-tertiary-hover)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
