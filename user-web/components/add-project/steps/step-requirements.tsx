"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { referenceStyles, type ProjectStep2Schema } from "@/lib/validations/project";

/** Props for StepRequirements component */
interface StepRequirementsProps {
  form: UseFormReturn<ProjectStep2Schema>;
  onSubmit: () => void;
}

/** Step 2: Word count and reference requirements */
export function StepRequirements({ form, onSubmit }: StepRequirementsProps) {
  const selectedStyle = form.watch("referenceStyle");

  return (
    <motion.form
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="wordCount">Word Count</Label>
        <Input
          id="wordCount"
          type="number"
          min={250}
          max={50000}
          {...form.register("wordCount", { valueAsNumber: true })}
          className={form.formState.errors.wordCount ? "border-destructive" : ""}
        />
        {form.formState.errors.wordCount && (
          <p className="text-sm text-destructive">{form.formState.errors.wordCount.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Reference Style</Label>
        <Select value={selectedStyle} onValueChange={(v) => form.setValue("referenceStyle", v as "apa7")}>
          <SelectTrigger className={form.formState.errors.referenceStyle ? "border-destructive" : ""}>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {referenceStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedStyle !== "none" && (
        <div className="space-y-2">
          <Label htmlFor="referenceCount">Number of References</Label>
          <Input id="referenceCount" type="number" min={0} max={100} {...form.register("referenceCount", { valueAsNumber: true })} />
        </div>
      )}
      <Button type="submit" className="w-full">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.form>
  );
}
