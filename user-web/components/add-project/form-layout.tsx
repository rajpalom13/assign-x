"use client";

/**
 * @fileoverview Dynamic Step Context Form Layout
 *
 * Two-column layout with:
 * - Dynamic left panel that changes with each step
 * - Clean white right panel for form content
 * - Professional, context-aware design
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, FileText, Clock, CheckCircle, Star, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "./form-layout.css";

interface FormLayoutProps {
  /** Page title shown in visual panel */
  title: string;
  /** Subtitle shown in visual panel */
  subtitle: string;
  /** Accent word in title (will be highlighted) */
  accentWord?: string;
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Step labels */
  stepLabels?: string[];
  /** Floating cards data (kept for API compatibility but not rendered) */
  floatingCards?: unknown[];
  /** Form content */
  children: React.ReactNode;
  /** Back button handler */
  onBack?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** Service type for different visual themes */
  serviceType?: "project" | "report" | "proofreading" | "consultation";
}

/**
 * Step context data - changes per step
 */
const stepContextData = [
  {
    icon: Lightbulb,
    heading: "Choose Your Focus",
    message: "Select the subject area that matches your project. Our experts cover 50+ academic fields.",
    tip: "💡 Pro tip: Not sure? Start broad - you can refine details later.",
    nextLabel: "Set requirements",
  },
  {
    icon: FileText,
    heading: "Set Your Scope",
    message: "Define the length and citation style. We handle everything from 250 to 50,000 words.",
    tip: "📊 Pro tip: Average project is 2,500 words with APA7 citations",
    nextLabel: "Choose timeline",
  },
  {
    icon: Clock,
    heading: "When Do You Need It?",
    message: "Choose your deadline and urgency. We've delivered 10,000+ projects on time.",
    tip: "⚡ Pro tip: Standard delivery gives you the best value",
    nextLabel: "Add details",
  },
  {
    icon: CheckCircle,
    heading: "Final Touches",
    message: "Add any specific instructions or reference materials. The more details, the better we can help.",
    tip: "📎 Pro tip: Attach style guides, rubrics, or sample papers for best results",
    nextLabel: "Review & submit",
  },
];

/**
 * Circular Progress Ring Component
 */
function ProgressRing({ progress }: { progress: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white/80">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

/**
 * Dynamic Step Context - Left Panel
 */
function DynamicStepContext({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const stepData = stepContextData[currentStep];
  const Icon = stepData.icon;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="relative hidden flex-1 max-w-[55%] flex-col justify-between overflow-hidden bg-[#14110F] p-12 lg:flex xl:p-14">
      {/* Animated gradient background */}
      <div className="absolute inset-[-50%] z-0 animate-gradient-rotate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(118,83,65,0.12)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,49,45,0.10)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(160,122,101,0.08)_0%,transparent_40%)]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo Badge */}
      <div className="relative z-10">
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[13px] font-medium text-white/90">
            <Sparkles className="h-4 w-4" />
            AssignX
          </span>
        </div>
      </div>

      {/* Main Content - Giant Step Number + Context */}
      <div className="relative z-10 flex flex-1 flex-col justify-center max-w-[480px]">
        {/* Giant Step Number with Progress Ring */}
        <div className="relative mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative inline-block"
            >
              <h2
                className="text-[180px] xl:text-[220px] font-light leading-none tracking-tighter"
                style={{
                  WebkitTextStroke: "2px rgba(255,255,255,0.2)",
                  color: "transparent",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {currentStep + 1}
              </h2>
              {/* Progress Ring - positioned at top-right of number */}
              <div className="absolute -top-4 -right-4">
                <ProgressRing progress={progress} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step-Specific Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-6"
          >
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"
            >
              <Icon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
            </motion.div>

            {/* Heading */}
            <h3 className="text-[28px] font-semibold leading-tight text-white">
              {stepData.heading}
            </h3>

            {/* Message */}
            <p className="text-[15px] leading-relaxed text-white/70 max-w-[400px]">
              {stepData.message}
            </p>

            {/* Tip */}
            <div className="inline-flex items-start gap-2 rounded-lg bg-white/[0.05] px-4 py-3 border border-white/10">
              <span className="text-[13px] leading-relaxed text-white/50">
                {stepData.tip}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section - Trust Signals + What's Next */}
      <div className="relative z-10 space-y-4">
        {/* Trust Signals */}
        <div className="flex items-center gap-6 text-[13px] text-white/50 border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-white/40" />
            <span>15,234 projects</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-white/40" />
            <span>4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-white/40" />
            <span>98% on-time</span>
          </div>
        </div>

        {/* What's Next */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-[14px] font-medium text-white/60">
            Next: {stepData.nextLabel}
          </span>
          <ArrowRight className="h-4 w-4 text-white/40" />
        </div>
      </div>
    </div>
  );
}

/**
 * Split-screen Form Layout - Dynamic Step Context
 */
export function FormLayout({
  currentStep,
  totalSteps,
  stepLabels,
  children,
}: FormLayoutProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Panel - Dynamic Step Context */}
      <DynamicStepContext currentStep={currentStep} totalSteps={totalSteps} />

      {/* Right Panel - Clean Form Side */}
      <div className="flex min-h-screen flex-1 flex-col items-center justify-start bg-background p-6 md:p-8 lg:min-w-[45%] lg:p-12 xl:p-16">
        <div className="w-full max-w-[480px] pt-8">
          {/* Mobile logo */}
          <div className="mb-10 flex justify-center lg:hidden">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#14110F] px-4 py-2 text-[13px] font-medium text-white">
              <Sparkles className="h-4 w-4" />
              AssignX
            </span>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              {stepLabels && stepLabels[currentStep] && (
                <span className="text-sm font-semibold text-foreground">{stepLabels[currentStep]}</span>
              )}
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Form content */}
          <div className="min-h-[400px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Form Card - wrapper for form sections
 */
export function FormCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      {(title || description) && (
        <div className="text-center pb-6 mb-6 border-b border-border">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
}

/**
 * Form Input Group
 */
export function FormInputGroup({
  label,
  icon,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      <label className="flex items-center gap-2 text-sm font-medium mb-2">
        {icon && (
          <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted border border-border text-muted-foreground">
            {icon}
          </span>
        )}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1.5 pl-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1.5 pl-1">{error}</p>}
    </div>
  );
}

/**
 * Form Submit Button
 */
export function FormSubmitButton({
  children,
  isLoading,
  disabled,
  onClick,
  type = "submit",
  className,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "w-full h-11 flex items-center justify-center gap-2 px-6 mt-6",
        "bg-primary text-primary-foreground font-medium text-sm rounded-lg",
        "hover:bg-primary/90 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Form Secondary Button
 */
export function FormSecondaryButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "w-full h-10 flex items-center justify-center gap-2 px-6 mt-3",
        "bg-transparent border border-border text-muted-foreground text-sm rounded-lg",
        "hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
    >
      {children}
    </button>
  );
}
