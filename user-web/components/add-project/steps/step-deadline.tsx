"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DeadlinePicker } from "../deadline-picker";
import { PriceEstimate } from "../price-estimate";
import { urgencyLevels, type ProjectStep3Schema } from "@/lib/validations/project";

/** Props for StepDeadline component */
interface StepDeadlineProps {
  form: UseFormReturn<ProjectStep3Schema>;
  wordCount: number;
  onSubmit: () => void;
}

/** Step 3: Deadline and urgency selection */
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
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label>Deadline</Label>
        <DeadlinePicker
          value={form.watch("deadline")}
          onChange={(date) => form.setValue("deadline", date!)}
          error={form.formState.errors.deadline?.message}
        />
      </div>
      <div className="space-y-3">
        <Label>Urgency Level</Label>
        <RadioGroup
          value={form.watch("urgency")}
          onValueChange={(v) => form.setValue("urgency", v as "standard")}
          className="space-y-3"
        >
          {urgencyLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-3 rounded-lg border p-4">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className="flex-1 cursor-pointer font-normal">
                <span className="font-medium">{level.label}</span>
                {level.multiplier > 1 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (+{Math.round((level.multiplier - 1) * 100)}% fee)
                  </span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <PriceEstimate wordCount={wordCount} urgencyMultiplier={urgencyMultiplier} />
      <Button type="submit" className="w-full">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.form>
  );
}
