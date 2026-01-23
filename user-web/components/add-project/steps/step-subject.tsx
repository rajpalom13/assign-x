"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubjectSelector } from "../subject-selector";
import type { ProjectStep1Schema } from "@/lib/validations/project";

/** Props for StepSubject component */
interface StepSubjectProps {
  form: UseFormReturn<ProjectStep1Schema>;
  onSubmit: () => void;
}

/** Step 1: Subject and topic selection - Premium Glassmorphic Design */
export function StepSubject({ form, onSubmit }: StepSubjectProps) {
  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl">
        {/* Violet gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/40 to-purple-50/20 dark:from-violet-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 space-y-5">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BookOpen className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Choose Your Subject</h3>
              <p className="text-xs text-muted-foreground">Select academic area and topic</p>
            </div>
          </div>

          {/* Subject Area */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Subject Area
            </label>
            <SubjectSelector
              value={form.watch("subject")}
              onChange={(value) => form.setValue("subject", value)}
              error={form.formState.errors.subject?.message}
            />
          </div>

          {/* Topic/Title */}
          <div className="space-y-2">
            <label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Topic / Title
            </label>
            <Input
              id="topic"
              placeholder="e.g., Impact of Social Media on Mental Health"
              {...form.register("topic")}
              className={`h-11 bg-white/60 dark:bg-white/5 border-white/50 dark:border-white/10 backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 transition-all ${
                form.formState.errors.topic ? "border-red-500" : ""
              }`}
            />
            {form.formState.errors.topic && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-red-500" />
                {form.formState.errors.topic.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button - Enhanced */}
      <button
        type="submit"
        className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-[16px] bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </motion.form>
  );
}
