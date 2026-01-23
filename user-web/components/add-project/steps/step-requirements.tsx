"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Hash, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { referenceStyles, type ProjectStep2Schema } from "@/lib/validations/project";

/** Props for StepRequirements component */
interface StepRequirementsProps {
  form: UseFormReturn<ProjectStep2Schema>;
  onSubmit: () => void;
}

/** Step 2: Word count and reference requirements - Premium Glassmorphic Design */
export function StepRequirements({ form, onSubmit }: StepRequirementsProps) {
  const selectedStyle = form.watch("referenceStyle");

  return (
    <motion.form
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl">
        {/* Amber gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-50/20 dark:from-amber-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 space-y-5">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileText className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Project Requirements</h3>
              <p className="text-xs text-muted-foreground">Word count and references</p>
            </div>
          </div>

          {/* Word Count */}
          <div className="space-y-2">
            <label htmlFor="wordCount" className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Hash className="h-4 w-4 text-amber-500" />
              Word Count
            </label>
            <Input
              id="wordCount"
              type="number"
              min={250}
              max={50000}
              placeholder="e.g., 1500"
              {...form.register("wordCount", { valueAsNumber: true })}
              className={`h-11 bg-white/60 dark:bg-white/5 border-white/50 dark:border-white/10 backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 transition-all ${
                form.formState.errors.wordCount ? "border-red-500" : ""
              }`}
            />
            {form.formState.errors.wordCount && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-red-500" />
                {form.formState.errors.wordCount.message}
              </p>
            )}
          </div>

          {/* Reference Style */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <BookMarked className="h-4 w-4 text-orange-500" />
              Reference Style
            </label>
            <Select value={selectedStyle} onValueChange={(v) => form.setValue("referenceStyle", v as "apa7")}>
              <SelectTrigger className={`h-11 bg-white/60 dark:bg-white/5 border-white/50 dark:border-white/10 backdrop-blur-sm ${
                form.formState.errors.referenceStyle ? "border-red-500" : ""
              }`}>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {referenceStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of References (conditional) */}
          {selectedStyle !== "none" && (
            <div className="space-y-2">
              <label htmlFor="referenceCount" className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                <Hash className="h-4 w-4 text-amber-600" />
                Number of References
              </label>
              <Input
                id="referenceCount"
                type="number"
                min={0}
                max={100}
                placeholder="e.g., 10"
                {...form.register("referenceCount", { valueAsNumber: true })}
                className="h-11 bg-white/60 dark:bg-white/5 border-white/50 dark:border-white/10 backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Continue Button - Enhanced */}
      <button
        type="submit"
        className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-[16px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </motion.form>
  );
}
