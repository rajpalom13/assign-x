"use client";

/**
 * SpecializationFilter - Premium pill filter buttons
 * Matches the tab style from projects-pro.tsx
 * Features glassmorphic container and subtle active states
 */

import { motion } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Brain,
  Baby,
  Bone,
  Eye,
  HeartPulse,
  Pill,
  Smile,
  Activity,
  Syringe,
  Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpertSpecialization } from "@/types/expert";

interface SpecializationFilterProps {
  selected: ExpertSpecialization | "all";
  onSelect: (specialization: ExpertSpecialization | "all") => void;
  className?: string;
}

/**
 * Specialization configuration with icons
 */
const SPECIALIZATIONS: Array<{
  id: ExpertSpecialization | "all";
  label: string;
  icon: React.ElementType;
}> = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "medicine", label: "Medicine", icon: Stethoscope },
  { id: "science", label: "Science", icon: Microscope },
  { id: "programming", label: "Programming", icon: Activity },
  { id: "data_analysis", label: "Data Analysis", icon: Brain },
  { id: "mathematics", label: "Mathematics", icon: HeartPulse },
  { id: "research_methodology", label: "Research", icon: Syringe },
  { id: "academic_writing", label: "Writing", icon: Pill },
  { id: "business", label: "Business", icon: Bone },
  { id: "engineering", label: "Engineering", icon: Eye },
  { id: "law", label: "Law", icon: Smile },
  { id: "arts", label: "Arts", icon: Baby },
];

/**
 * SpecializationFilter component - matching projects-pro tabs
 */
export function SpecializationFilter({
  selected,
  onSelect,
  className,
}: SpecializationFilterProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Glassmorphic container matching projects-pro tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10">
        {SPECIALIZATIONS.map((spec) => {
          const Icon = spec.icon;
          const isActive = selected === spec.id;

          return (
            <button
              key={spec.id}
              onClick={() => onSelect(spec.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{spec.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Medical specialization filter specifically for doctors
 */
interface MedicalFilterProps {
  selected: string | "all";
  onSelect: (specialization: string | "all") => void;
  className?: string;
}

/**
 * Medical specializations with proper icons
 */
const MEDICAL_SPECIALIZATIONS: Array<{
  id: string;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "all", label: "All Doctors", icon: Sparkles },
  { id: "cardiology", label: "Cardiology", icon: HeartPulse },
  { id: "neurology", label: "Neurology", icon: Brain },
  { id: "pediatrics", label: "Pediatrics", icon: Baby },
  { id: "orthopedics", label: "Orthopedics", icon: Bone },
  { id: "ophthalmology", label: "Ophthalmology", icon: Eye },
  { id: "general", label: "General", icon: Stethoscope },
  { id: "dermatology", label: "Dermatology", icon: Smile },
  { id: "psychiatry", label: "Psychiatry", icon: Activity },
];

/**
 * MedicalFilter component - matching projects-pro tabs
 */
export function MedicalFilter({
  selected,
  onSelect,
  className,
}: MedicalFilterProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Glassmorphic container matching projects-pro tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10">
        {MEDICAL_SPECIALIZATIONS.map((spec) => {
          const Icon = spec.icon;
          const isActive = selected === spec.id;

          return (
            <button
              key={spec.id}
              onClick={() => onSelect(spec.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{spec.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SpecializationFilter;
