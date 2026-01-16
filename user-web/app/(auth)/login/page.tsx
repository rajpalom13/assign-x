/**
 * @fileoverview Premium Login Page
 *
 * Split-screen login with animated visual panel,
 * floating cards, and smooth animations. Uses unique warm/cool color palette.
 *
 * @route /login
 * @access public
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, useReducedMotion } from "framer-motion";
import {
  Star,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";

import "./login.css";

// Google logo SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Floating card component
function FloatingCard({
  icon: Icon,
  iconBg,
  title,
  value,
  label,
  className,
  delay,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  value: string;
  label: string;
  className: string;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`login-float-card ${className}`}
    >
      <div className={`login-float-card-icon ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="login-float-card-title">{title}</div>
      <div className="login-float-card-value">{value}</div>
      <div className="login-float-card-label">{label}</div>
    </motion.div>
  );
}

/**
 * Check if login is required based on environment variable
 * In dev mode (REQUIRE_LOGIN=false), we bypass authentication
 */
function isLoginRequired(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_LOGIN !== "false";
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Redirect if login is not required (dev mode) or already logged in
  useEffect(() => {
    const checkUser = async () => {
      // In dev mode, redirect directly to home without auth check
      if (!isLoginRequired()) {
        router.replace("/home");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/home");
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleGoogle = async () => {
    setLoading(true);
    const callbackUrl = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Panel - Visual Side */}
      <div className="login-visual">
        {/* Floating cards */}
        <div className="login-floating-cards">
          <FloatingCard
            icon={TrendingUp}
            iconBg="login-float-card-icon-primary"
            title="Success Rate"
            value="98%"
            label="This month"
            className="login-float-card-1"
            delay={0.8}
          />
          <FloatingCard
            icon={Star}
            iconBg="login-float-card-icon-tertiary"
            title="Student Rating"
            value="4.9"
            label="500+ reviews"
            className="login-float-card-2"
            delay={1.0}
          />
        </div>

        {/* Content */}
        <div className="login-visual-content">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="login-visual-logo"
          >
            <span>
              <Sparkles className="w-4 h-4" />
              AssignX
            </span>
          </motion.div>

          <motion.h1
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="login-visual-heading"
          >
            Your academic <span>success</span> starts here
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="login-visual-subheading"
          >
            Expert guidance for reports, research, and academic excellence.
            Join thousands of students achieving their goals.
          </motion.p>
        </div>

        {/* Footer stats */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="login-visual-footer"
        >
          <div className="login-visual-stat">
            <span className="login-visual-stat-value">50K+</span>
            <span className="login-visual-stat-label">Projects done</span>
          </div>
          <div className="login-visual-stat">
            <span className="login-visual-stat-value">10K+</span>
            <span className="login-visual-stat-label">Students</span>
          </div>
          <div className="login-visual-stat">
            <span className="login-visual-stat-value">24/7</span>
            <span className="login-visual-stat-label">Support</span>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Mobile logo */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="login-mobile-logo"
          >
            <span>
              <Sparkles className="w-4 h-4" />
              AssignX
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="login-heading"
          >
            Welcome back
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="login-subheading"
          >
            Sign in to continue to your dashboard
          </motion.p>

          {/* Google Button */}
          <motion.button
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={handleGoogle}
            disabled={loading}
            className="login-google-btn"
          >
            <GoogleIcon />
            {loading ? "Connecting..." : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="login-divider"
          >
            <div className="login-divider-line" />
            <span className="login-divider-text">Secure & Fast</span>
            <div className="login-divider-line" />
          </motion.div>

          {/* Info */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="login-info"
          >
            No password needed. We use Google for secure, one-click
            authentication.
          </motion.p>

          {/* Sign up link */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="login-signup-link"
          >
            <span>Don&apos;t have an account?</span>
            <Link href="/signup">Sign up</Link>
          </motion.div>

          {/* Terms */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="login-terms"
          >
            By continuing, you agree to our{" "}
            <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="login-trust"
          >
            <div className="login-trust-item">
              <Shield />
              <span>Secure</span>
            </div>
            <div className="login-trust-item">
              <Lock />
              <span>Encrypted</span>
            </div>
            <div className="login-trust-item">
              <Zap />
              <span>Fast</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-form-panel">
            <div className="login-form-container">
              <div className="animate-pulse">
                <div className="h-10 w-32 bg-gray-200 rounded-full mx-auto mb-8" />
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
                <div className="h-4 w-64 bg-gray-200 rounded mx-auto mb-8" />
                <div className="h-14 w-full bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
