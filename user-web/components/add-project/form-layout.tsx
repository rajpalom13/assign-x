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
 * Split-screen Form Layout Component
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
    <div className="form-layout h-screen flex bg-background overflow-hidden">
      {/* Left Visual Panel (hidden on mobile) - Fixed height, no scroll */}
      <div className="form-visual hidden lg:flex flex-col justify-between flex-1 max-w-[55%] bg-muted/30 border-r border-border p-12 h-screen overflow-hidden">
        {/* Top: Logo */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            AssignX
          </div>
        </div>

        {/* Center: Content */}
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
            {renderTitle()}
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {subtitle}
          </p>

          {/* Features list */}
          <div className="space-y-3">
            {serviceInfo.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Step indicators */}
        <div className="flex items-center gap-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i <= currentStep ? "bg-primary w-6" : "bg-border w-1.5"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Right Form Panel - Scrollable */}
      <div className="flex-1 flex flex-col justify-start items-center p-6 md:p-12 h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              AssignX
            </div>
          </div>

          {/* Back button */}
          {showBack && onBack && (
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              {stepLabels && stepLabels[currentStep] && (
                <span className="font-medium text-foreground">{stepLabels[currentStep]}</span>
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
