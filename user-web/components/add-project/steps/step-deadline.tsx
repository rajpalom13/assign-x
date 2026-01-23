"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Zap, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DeadlinePicker } from "../deadline-picker";
import { PriceEstimate } from "../price-estimate";
import { urgencyLevels, type ProjectStep3Schema } from "@/lib/validations/project";
import { cn } from "@/lib/utils";

/** Props for StepDeadline component */
interface StepDeadlineProps {
  form: UseFormReturn<ProjectStep3Schema>;
  wordCount: number;
  onSubmit: () => void;
}

/** Step 3: Deadline and urgency selection - Premium Glassmorphic Design */
export function StepDeadline({ form, wordCount, onSubmit }: StepDeadlineProps) {
  const selectedUrgency = urgencyLevels.find((u) => u.value === form.watch("urgency"));
  const urgencyMultiplier = selectedUrgency?.multiplier || 1;

  return (
    <motion.form
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl">
        {/* Emerald gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-green-50/20 dark:from-emerald-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 space-y-5">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Clock className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Timeline & Priority</h3>
              <p className="text-xs text-muted-foreground">Set deadline and urgency</p>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Deadline
            </label>
            <DeadlinePicker
              value={form.watch("deadline")}
              onChange={(date) => form.setValue("deadline", date!)}
              error={form.formState.errors.deadline?.message}
            />
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Zap className="h-4 w-4 text-green-500" />
              Urgency Level
            </label>
            <RadioGroup
              value={form.watch("urgency")}
              onValueChange={(v) => form.setValue("urgency", v as "standard")}
              className="space-y-2"
            >
              {urgencyLevels.map((level) => (
                <div
                  key={level.value}
                  className={cn(
                    "relative flex items-center gap-3 p-4 rounded-[14px] border cursor-pointer transition-all",
                    form.watch("urgency") === level.value
                      ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                      : "bg-white/40 dark:bg-white/5 border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                  )}
                >
                  <RadioGroupItem value={level.value} id={level.value} className="text-emerald-600" />
                  <label htmlFor={level.value} className="flex-1 cursor-pointer">
                    <span className="font-semibold text-sm text-foreground">{level.label}</span>
                    {level.multiplier > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground font-medium">
                        +{Math.round((level.multiplier - 1) * 100)}% fee
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Price Estimate */}
      <PriceEstimate wordCount={wordCount} urgencyMultiplier={urgencyMultiplier} />

      {/* Continue Button - Enhanced */}
      <button
        type="submit"
        className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-[16px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </motion.form>
  );
}
