/**
 * @fileoverview Hero - Landing page hero section
 *
 * Full-viewport hero with centered layout, email capture form,
 * and floating stat cards. Uses unique warm/cool color palette.
 */

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Star, Award, FileText, BookOpen, GraduationCap, Clock, CheckCircle, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSIGNX_EASE, DURATIONS, HERO_DELAYS, SPRING_CONFIG } from "@/lib/animations/constants";
import "@/app/landing.css";

// Stat card component - different from efficly's floating cards
function StatCard({
  icon: Icon,
  iconBg,
  value,
  label,
  className,
  delay,
}: {
  icon: React.ElementType;
  iconBg: string;
  value: string;
  label: string;
  className: string;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: ASSIGNX_EASE }}
      className={cn(
        "bg-white/90 backdrop-blur-sm border border-[var(--landing-border)] rounded-2xl p-4 shadow-lg",
        "hover:shadow-xl hover:scale-105 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[var(--landing-text-primary)] landing-heading">{value}</div>
          <div className="text-xs text-[var(--landing-text-muted)]">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Project preview component - totally different from efficly
function ProjectPreview({ className }: { className?: string }) {
  const projects = [
    { name: "Market Analysis Report", subject: "Business", progress: 85, color: "primary" },
    { name: "Literature Review", subject: "English", progress: 100, color: "secondary" },
    { name: "Statistical Study", subject: "Mathematics", progress: 60, color: "tertiary" },
  ];

  return (
    <div className={cn("landing-browser-frame bg-white", className)}>
      <div className="landing-browser-chrome">
        <div className="flex gap-2">
          <div className="landing-browser-dot landing-browser-dot-red" />
          <div className="landing-browser-dot landing-browser-dot-yellow" />
          <div className="landing-browser-dot landing-browser-dot-green" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1.5 bg-white/50 rounded-lg text-xs text-[var(--landing-text-muted)]">
            assignx.com/dashboard
          </div>
        </div>
      </div>
      <div className="p-5 bg-gradient-to-br from-[var(--landing-bg-primary)] to-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--landing-border)]">
          <div>
            <h4 className="font-semibold text-[var(--landing-text-primary)]">Active Projects</h4>
            <p className="text-xs text-[var(--landing-text-muted)]">Track your progress</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--landing-accent-primary)]/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--landing-accent-primary)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--landing-accent-primary)]">3 Active</span>
          </div>
        </div>

        {/* Project cards */}
        <div className="space-y-3">
          {projects.map((project, i) => (
            <div
              key={project.name}
              className="p-4 rounded-xl bg-white border border-[var(--landing-border)] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-[var(--landing-text-primary)]">{project.name}</p>
                  <p className="text-xs text-[var(--landing-text-muted)]">{project.subject}</p>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  project.color === "primary" && "bg-[var(--landing-accent-primary)]",
                  project.color === "secondary" && "bg-[var(--landing-accent-secondary)]",
                  project.color === "tertiary" && "bg-[var(--landing-accent-tertiary)]"
                )}>
                  {i === 0 && <FileText className="w-4 h-4 text-white" />}
                  {i === 1 && <BookOpen className="w-4 h-4 text-white" />}
                  {i === 2 && <Award className="w-4 h-4 text-white" />}
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-[var(--landing-bg-secondary)]/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    project.color === "primary" && "bg-[var(--landing-accent-primary)]",
                    project.color === "secondary" && "bg-[var(--landing-accent-secondary)]",
                    project.color === "tertiary" && "bg-[var(--landing-accent-tertiary)]"
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--landing-text-muted)]">
                <span>{project.progress === 100 ? "Completed" : "In Progress"}</span>
                <span>{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [email, setEmail] = useState("");

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springScroll = useSpring(scrollYProgress, SPRING_CONFIG);

  // Parallax values for floating cards
  const y1 = useTransform(springScroll, [0, 1], [0, -50]);
  const y2 = useTransform(springScroll, [0, 1], [0, -80]);

  // Animation variants
  const createVariant = (delay: number, yOffset: number = 20) => ({
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DURATIONS.entrance,
        ease: ASSIGNX_EASE,
        delay,
      },
    },
  });

  return (
    <section
      ref={ref}
      id="hero"
      className={cn(
        "min-h-screen flex items-center",
        "pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20",
        "bg-[var(--landing-bg-primary)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6 sm:space-y-8"
          >
            {/* Badge */}
            <motion.div
              variants={
                prefersReducedMotion
                  ? {}
                  : createVariant(HERO_DELAYS.badge, -10)
              }
            >
              <span className="landing-badge landing-badge-primary">
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                Academic Excellence Starts Here
              </span>
            </motion.div>

            {/* Headline - Unique multi-line layout */}
            <div className="space-y-2">
              <motion.h1
                variants={
                  prefersReducedMotion
                    ? {}
                    : createVariant(HERO_DELAYS.headline1)
                }
                className="landing-heading landing-heading-xl text-[var(--landing-text-primary)]"
              >
                Ace your
              </motion.h1>
              <motion.h1
                variants={
                  prefersReducedMotion
                    ? {}
                    : createVariant(HERO_DELAYS.headline2)
                }
                className="landing-heading landing-heading-xl"
              >
                <span className="landing-text-gradient">assignments</span>
              </motion.h1>
              <motion.h1
                variants={
                  prefersReducedMotion
                    ? {}
                    : createVariant(HERO_DELAYS.headline3)
                }
                className="landing-heading landing-heading-xl text-[var(--landing-text-primary)]"
              >
                with experts.
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p
              variants={
                prefersReducedMotion
                  ? {}
                  : createVariant(HERO_DELAYS.subheadline)
              }
              className="text-lg sm:text-xl text-[var(--landing-text-secondary)] max-w-lg leading-relaxed"
            >
              Get matched with subject experts for reports, research papers,
              tutoring sessions, and academic guidance. Excellence guaranteed.
            </motion.p>

            {/* CTA Buttons - Different from efficly */}
            <motion.div
              variants={
                prefersReducedMotion ? {} : createVariant(HERO_DELAYS.emailForm)
              }
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/signup"
                className="landing-btn-primary inline-flex items-center gap-2"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="landing-btn-secondary"
              >
                See How It Works
              </Link>
            </motion.div>

            {/* Trust indicators - Horizontal stat cards */}
            <motion.div
              variants={
                prefersReducedMotion ? {} : createVariant(0.6)
              }
              className="flex flex-wrap items-center gap-4 pt-6"
            >
              <StatCard
                icon={CheckCircle}
                iconBg="bg-[var(--landing-accent-primary)]"
                value="98%"
                label="Success Rate"
                className="w-auto"
                delay={0.7}
              />
              <StatCard
                icon={Clock}
                iconBg="bg-[var(--landing-accent-secondary)]"
                value="24h"
                label="Avg. Delivery"
                className="w-auto"
                delay={0.8}
              />
              <StatCard
                icon={Star}
                iconBg="bg-[var(--landing-accent-tertiary)]"
                value="4.9"
                label="Student Rating"
                className="w-auto"
                delay={0.9}
              />
            </motion.div>
          </motion.div>

          {/* Right Column - Visuals */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DURATIONS.dashboard,
              ease: ASSIGNX_EASE,
              delay: HERO_DELAYS.dashboard,
            }}
            className="relative"
          >
            {/* Decorative blobs - unique to AssignX */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--landing-accent-primary)]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[var(--landing-accent-tertiary)]/10 rounded-full blur-3xl" />

            {/* Project Preview */}
            <div className="relative z-10">
              <ProjectPreview className="w-full max-w-xl mx-auto lg:max-w-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
