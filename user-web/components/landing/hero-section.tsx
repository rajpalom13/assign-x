/**
 * @fileoverview Hero - Notion/Linear inspired landing hero
 *
 * Modern minimal hero with smooth micro-animations.
 * Features clean typography, subtle animations, and glassmorphism.
 */

"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSIGNX_EASE, DURATIONS } from "@/lib/animations/constants";
import "@/app/landing.css";

// Stat badge component with micro-animation
function StatBadge({
  icon: Icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="landing-card landing-hover-lift inline-flex items-center gap-3 px-4 py-3"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-secondary)]">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xl font-bold text-[var(--landing-text-primary)] tabular-nums">
          {value}
        </div>
        <div className="text-xs text-[var(--landing-text-muted)]">{label}</div>
      </div>
    </motion.div>
  );
}

// Dashboard preview with micro-animations
function DashboardPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const projects = [
    { name: "Market Analysis", progress: 85, status: "In Progress" },
    { name: "Literature Review", progress: 100, status: "Completed" },
    { name: "Statistical Study", progress: 60, status: "Active" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("landing-browser-frame bg-white relative group", className)}
    >
      {/* Browser chrome */}
      <div className="landing-browser-chrome">
        <div className="flex gap-2">
          <div className="landing-browser-dot" />
          <div className="landing-browser-dot" />
          <div className="landing-browser-dot" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 bg-[var(--landing-bg-elevated)]/50 backdrop-blur-sm rounded-lg text-xs text-[var(--landing-text-muted)]">
            assignx.com/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-6 bg-gradient-to-br from-[var(--landing-bg-primary)] via-white to-[var(--landing-bg-secondary)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--landing-border)]">
          <div>
            <h4 className="font-semibold text-[var(--landing-text-primary)]">
              Active Projects
            </h4>
            <p className="text-xs text-[var(--landing-text-muted)] mt-0.5">
              Track your assignments in real-time
            </p>
          </div>
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--landing-accent-primary)]/10 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--landing-accent-primary)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--landing-accent-primary)]">
              {projects.length} Active
            </span>
          </motion.div>
        </div>

        {/* Project cards */}
        <div className="space-y-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.2 + i * 0.1,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--landing-border)] hover:border-[var(--landing-accent-light)] hover:shadow-md transition-all duration-300 landing-spotlight"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-[var(--landing-text-primary)]">
                    {project.name}
                  </p>
                  <p className="text-xs text-[var(--landing-text-muted)] mt-0.5">
                    {project.status}
                  </p>
                </div>
                {project.progress === 100 && (
                  <CheckCircle className="w-5 h-5 text-[var(--landing-accent-primary)]" />
                )}
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-[var(--landing-bg-secondary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${project.progress}%` } : {}}
                  transition={{
                    delay: 0.4 + i * 0.1,
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full bg-gradient-to-r from-[var(--landing-accent-primary)] to-[var(--landing-accent-secondary)] rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-[var(--landing-text-muted)]">
                  {project.progress === 100 ? "Completed" : "In Progress"}
                </span>
                <span className="font-medium text-[var(--landing-text-primary)] tabular-nums">
                  {project.progress}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating notification card */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.9 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{
          delay: 0.8,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute -bottom-4 -right-4 landing-card px-4 py-3 shadow-lg landing-hover-scale"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-secondary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--landing-text-primary)]">
              Expert matched!
            </p>
            <p className="text-xs text-[var(--landing-text-muted)]">
              Work starts in 2 hours
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const y = useTransform(springScroll, [0, 1], [0, -50]);
  const opacity = useTransform(springScroll, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className={cn(
        "relative min-h-screen flex items-center overflow-hidden",
        "pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-28 md:pb-24",
        "bg-[var(--landing-bg-primary)]"
      )}
    >
      {/* Animated mesh gradient background */}
      <div className="landing-mesh-gradient-animated" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 landing-grid-pattern opacity-50" />

      {/* Decorative blobs */}
      <div className="landing-shape-blob absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-[var(--landing-accent-primary)]" />
      <div className="landing-shape-blob absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-[var(--landing-accent-secondary)]" />

      <motion.div
        style={prefersReducedMotion ? {} : { y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 sm:space-y-10">
            {/* Badge */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="landing-badge landing-badge-primary inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Academic Excellence Made Simple
              </span>
            </motion.div>

            {/* Headline - Big and bold */}
            <div className="space-y-4">
              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="landing-heading landing-heading-xl text-[var(--landing-text-primary)]"
              >
                Assignment help
                <br />
                that just{" "}
                <span className="landing-text-gradient-animated">works</span>
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-lg sm:text-xl text-[var(--landing-text-secondary)] max-w-xl leading-relaxed"
              >
                Connect with expert tutors for reports, research papers, and
                academic projects. Quality work delivered on time, every time.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/signup"
                className="landing-btn-primary inline-flex items-center gap-2 group"
              >
                Start Your Project
                <motion.div
                  animate={prefersReducedMotion ? {} : { x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link
                href="#how-it-works"
                className="landing-btn-secondary inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                See How It Works
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.4,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <StatBadge
                icon={CheckCircle}
                value="98%"
                label="Success Rate"
                delay={0.5}
              />
              <StatBadge
                icon={Zap}
                value="24h"
                label="Avg. Delivery"
                delay={0.6}
              />
              <StatBadge
                icon={Shield}
                value="500+"
                label="Experts"
                delay={0.7}
              />
            </motion.div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative lg:pl-8">
            <DashboardPreview className="w-full max-w-2xl mx-auto lg:max-w-none" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
