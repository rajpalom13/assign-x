"use client";

/**
 * @fileoverview Split-screen Form Layout - Minimalist Design
 *
 * Clean Notion/Linear inspired layout with:
 * - Simple left visual panel with typography focus
 * - Subtle step indicators
 * - Right form panel (unchanged as per user request)
 */

import { ArrowLeft, Sparkles } from "lucide-react";
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
 * Service type descriptions
 */
const serviceDescriptions: Record<string, { tagline: string; features: string[] }> = {
  project: {
    tagline: "Get expert help with your academic work",
    features: ["Expert matching", "Quality assured", "On-time delivery"],
  },
  proofreading: {
    tagline: "Professional editing for polished documents",
    features: ["Grammar & spelling", "Style improvements", "Clarity focus"],
  },
  report: {
    tagline: "Verify originality and authenticity",
    features: ["AI detection", "Plagiarism check", "Detailed reports"],
  },
  consultation: {
    tagline: "Get personalized guidance from experts",
    features: ["1-on-1 sessions", "Subject experts", "Quick responses"],
  },
};

/**
 * Split-screen Form Layout Component - Enhanced Glassmorphic Design
 */
export function FormLayout({
  title,
  subtitle,
  accentWord,
  currentStep,
  totalSteps,
  stepLabels,
  children,
  onBack,
  showBack = true,
  serviceType = "project",
}: FormLayoutProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const serviceInfo = serviceDescriptions[serviceType];

  // Parse title to highlight accent word
  const renderTitle = () => {
    if (!accentWord) return title;
    const parts = title.split(accentWord);
    return (
      <>
        {parts[0]}
        <span className="text-primary">{accentWord}</span>
        {parts[1] || ""}
      </>
    );
  };

  return (
    <div className="form-layout h-screen flex overflow-hidden mesh-background mesh-gradient-bottom-right-animated">
      {/* Left Visual Panel (hidden on mobile) - Fixed height, no scroll */}
      <div className="form-visual hidden lg:flex flex-col justify-between flex-1 max-w-[55%] border-r border-white/10 p-12 h-screen overflow-hidden relative">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-amber-500/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content - with z-index above decorations */}
        <div className="relative z-10">
          {/* Top: Logo Card */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[14px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 text-sm font-medium shadow-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            AssignX
          </div>
        </div>

        {/* Center: Content */}
        <div className="max-w-md relative z-10">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight mb-4">
            {renderTitle()}
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8 text-base">
            {subtitle}
          </p>

          {/* Features list - Enhanced cards */}
          <div className="space-y-2">
            {serviceInfo.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10"
              >
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30" />
                <span className="text-sm font-medium text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Step indicators - Enhanced */}
        <div className="flex items-center gap-2 relative z-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i <= currentStep
                  ? "bg-gradient-to-r from-primary to-primary/80 w-12 shadow-lg shadow-primary/30"
                  : "bg-white/20 dark:bg-white/10 w-2"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2 font-medium">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Right Form Panel - Scrollable with glassmorphic background */}
      <div className="flex-1 flex flex-col justify-start items-center p-6 md:p-12 h-screen overflow-y-auto relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[14px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 text-sm font-medium shadow-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              AssignX
            </div>
          </div>

          {/* Back button - Enhanced */}
          {showBack && onBack && (
            <button
              className="flex items-center gap-2 px-3 py-2 mb-6 rounded-xl text-sm text-muted-foreground hover:text-foreground bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {/* Progress bar - Enhanced glassmorphic */}
          <div className="mb-8 p-4 rounded-[16px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg">
            <div className="h-2 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 shadow-lg shadow-primary/20"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-muted-foreground font-medium">Step {currentStep + 1} of {totalSteps}</span>
              {stepLabels && stepLabels[currentStep] && (
                <span className="font-semibold text-foreground">{stepLabels[currentStep]}</span>
              )}
            </div>
          </div>

          {/* Form content */}
          <div className="min-h-[300px]">
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
