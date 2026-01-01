/**
 * @fileoverview Hero - Premium landing page hero section
 *
 * Features animated typography, floating cards, and dashboard mockup.
 * Uses Framer Motion and GSAP for animations.
 */

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle,
  Star,
  Clock,
  Shield,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSIGNX_EASE, DURATIONS, HERO_DELAYS } from "@/lib/animations/constants";
import "@/app/landing.css";

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
      transition={{ delay, duration: 0.6, ease: ASSIGNX_EASE }}
      className={cn(
        "absolute bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-5 shadow-xl",
        "animate-landing-float",
        className
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", iconBg)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-xs font-semibold text-white/80 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white landing-font-display">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </motion.div>
  );
}

// Dashboard mockup component
function DashboardMockup() {
  return (
    <div className="landing-browser-frame bg-white max-w-lg">
      <div className="landing-browser-chrome">
        <div className="flex gap-1.5">
          <div className="landing-browser-dot landing-browser-dot-red" />
          <div className="landing-browser-dot landing-browser-dot-yellow" />
          <div className="landing-browser-dot landing-browser-dot-green" />
        </div>
      </div>
      <div className="p-6 bg-[var(--landing-bg-primary)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[var(--landing-text-primary)]">Project Overview</h4>
            <p className="text-xs text-[var(--landing-text-muted)]">3 active projects</p>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)]"
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-[var(--landing-border)]">
            <p className="text-xl font-bold text-[var(--landing-accent-primary)]">98%</p>
            <p className="text-xs text-[var(--landing-text-muted)]">Success</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--landing-border)]">
            <p className="text-xl font-bold text-green-500">24h</p>
            <p className="text-xs text-[var(--landing-text-muted)]">Avg. Time</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--landing-border)]">
            <p className="text-xl font-bold text-orange-500">4.9</p>
            <p className="text-xs text-[var(--landing-text-muted)]">Rating</p>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          {["Research Paper", "Data Analysis", "Thesis Review"].map((project, i) => (
            <div key={project} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[var(--landing-border)]">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                i === 0 ? "bg-[var(--landing-accent-primary)]/10" :
                i === 1 ? "bg-green-500/10" : "bg-orange-500/10"
              )}>
                {i === 0 && <FileText className="w-5 h-5 text-[var(--landing-accent-primary)]" />}
                {i === 1 && <TrendingUp className="w-5 h-5 text-green-500" />}
                {i === 2 && <Shield className="w-5 h-5 text-orange-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--landing-text-primary)]">{project}</p>
                <p className="text-xs text-[var(--landing-text-muted)]">Due in {3 - i} days</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                i === 0 ? "bg-[var(--landing-accent-primary)]/10 text-[var(--landing-accent-primary)]" :
                i === 1 ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
              )}>
                {i === 0 ? "In Progress" : i === 1 ? "Complete" : "Review"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [email, setEmail] = useState("");

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-[var(--landing-bg-dark)] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--landing-accent-primary)]/[0.12] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--landing-accent-purple)]/[0.08] blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: HERO_DELAYS.badge, duration: DURATIONS.entrance, ease: ASSIGNX_EASE }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/90 text-sm font-medium">
                <Zap className="w-4 h-4 text-[var(--landing-accent-primary)]" />
                Trusted by 10,000+ Students
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: HERO_DELAYS.headline1, duration: DURATIONS.entrance, ease: ASSIGNX_EASE }}
              className="landing-heading landing-heading-xl text-white mb-6"
            >
              Get expert help with{" "}
              <span className="landing-text-gradient">your projects</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: HERO_DELAYS.subheadline, duration: DURATIONS.entrance, ease: ASSIGNX_EASE }}
              className="text-lg text-white/60 mb-10 max-w-md"
            >
              AssignX connects students with verified professionals. Submit your assignment and receive quality work on time, every time.
            </motion.p>

            {/* Email Form */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: HERO_DELAYS.emailForm, duration: DURATIONS.entrance, ease: ASSIGNX_EASE }}
              className="mb-10"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 px-5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--landing-accent-primary)] transition-colors"
                />
                <Link
                  href="/signup"
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
              </div>
              <p className="text-xs text-white/40 mt-3">
                No credit card required • Start your first project today
              </p>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: DURATIONS.entrance }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>100% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>On-Time Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Mockup with floating cards */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: HERO_DELAYS.dashboard, duration: DURATIONS.dashboard, ease: ASSIGNX_EASE }}
            className="relative hidden lg:block"
          >
            {/* Floating cards */}
            <FloatingCard
              icon={TrendingUp}
              iconBg="bg-green-500/30"
              title="Success Rate"
              value="98%"
              label="This month"
              className="top-[5%] -left-[5%] z-20"
              delay={HERO_DELAYS.floatingCard1}
            />
            <FloatingCard
              icon={Star}
              iconBg="bg-[var(--landing-accent-terracotta)]/30"
              title="Student Rating"
              value="4.9"
              label="500+ reviews"
              className="bottom-[15%] -right-[5%] z-20"
              delay={HERO_DELAYS.floatingCard2}
            />

            {/* Dashboard mockup */}
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: DURATIONS.entrance }}
        className="absolute bottom-0 left-0 right-0 border-t border-white/[0.05] bg-white/[0.02] backdrop-blur-sm"
      >
        <div className="container px-4 sm:px-6 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white landing-font-display">50K+</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Projects Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white landing-font-display">10K+</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Happy Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white landing-font-display">500+</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Expert Tutors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white landing-font-display">24/7</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Support</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
