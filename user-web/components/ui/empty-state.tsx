"use client";

/**
 * EmptyState - Beautiful empty state component with illustration and CTA
 * Supports custom OpenPeeps illustrations and Lottie animations
 */

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInScale, springs } from "@/lib/animations/variants";
import { AnimatedButton } from "./animated-button";

export interface EmptyStateProps {
  /** Illustration source - can be OpenPeeps SVG path or any image */
  illustration?: string;
  /** Lottie animation component (rendered if provided) */
  lottieAnimation?: React.ReactNode;
  /** Main headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Secondary action button/link */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Icon to show above title if no illustration */
  icon?: React.ReactNode;
}

const sizeConfig = {
  sm: {
    container: "py-8 px-4",
    illustration: 120,
    title: "text-base",
    description: "text-sm",
    iconSize: "size-10",
  },
  default: {
    container: "py-12 px-6",
    illustration: 180,
    title: "text-lg",
    description: "text-sm",
    iconSize: "size-14",
  },
  lg: {
    container: "py-16 px-8",
    illustration: 240,
    title: "text-xl",
    description: "text-base",
    iconSize: "size-20",
  },
};

export function EmptyState({
  illustration,
  lottieAnimation,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  size = "default",
  icon,
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        config.container,
        className
      )}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Illustration or Lottie or Icon */}
      <motion.div
        variants={fadeInScale}
        className="mb-6"
      >
        {lottieAnimation ? (
          <div
            style={{
              width: config.illustration,
              height: config.illustration,
            }}
          >
            {lottieAnimation}
          </div>
        ) : illustration ? (
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={springs.gentle}
          >
            <Image
              src={illustration}
              alt=""
              width={config.illustration}
              height={config.illustration}
              className="object-contain"
              priority
            />
          </motion.div>
        ) : icon ? (
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-2xl bg-muted",
              config.iconSize,
              "text-muted-foreground"
            )}
            whileHover={{ scale: 1.1 }}
            transition={springs.bouncy}
          >
            {icon}
          </motion.div>
        ) : null}
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={staggerItem}
        className={cn(
          "font-semibold text-foreground mb-2",
          config.title
        )}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          variants={staggerItem}
          className={cn(
            "text-muted-foreground max-w-sm",
            config.description
          )}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <motion.div
          variants={staggerItem}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          {primaryAction && (
            <AnimatedButton
              onClick={primaryAction.onClick}
              leftIcon={primaryAction.icon}
              size={size === "sm" ? "sm" : "default"}
            >
              {primaryAction.label}
            </AnimatedButton>
          )}
          {secondaryAction && (
            <AnimatedButton
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </AnimatedButton>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Preset empty states for common scenarios
 */

export function NoProjectsEmpty({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <EmptyState
      illustration="/illustrations/openpeeps/reading.svg"
      title="No projects yet"
      description="Start your academic journey by creating your first project. We'll match you with expert tutors."
      primaryAction={{
        label: "Create Project",
        onClick: onCreateNew,
      }}
    />
  );
}

export function NoMessagesEmpty() {
  return (
    <EmptyState
      illustration="/illustrations/openpeeps/coffee.svg"
      title="No messages yet"
      description="Once you start a project, you'll be able to chat with your assigned expert here."
      size="sm"
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      illustration="/illustrations/openpeeps/sitting.svg"
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something needs your attention."
      size="sm"
    />
  );
}

export function SearchNoResultsEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      illustration="/illustrations/openpeeps/looking.svg"
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or filters to find what you're looking for."
      primaryAction={{
        label: "Clear Search",
        onClick: onClear,
      }}
    />
  );
}

export function ErrorEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      illustration="/illustrations/openpeeps/thinking.svg"
      title="Something went wrong"
      description="We couldn't load the content. Please try again."
      primaryAction={{
        label: "Try Again",
        onClick: onRetry,
      }}
    />
  );
}
