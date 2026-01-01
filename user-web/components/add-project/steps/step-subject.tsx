"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubjectSelector } from "../subject-selector";
import type { ProjectStep1Schema } from "@/lib/validations/project";

/** Props for StepSubject component */
interface StepSubjectProps {
  form: UseFormReturn<ProjectStep1Schema>;
  onSubmit: () => void;
}

/** Step 1: Subject and topic selection */
export function StepSubject({ form, onSubmit }: StepSubjectProps) {
  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label>Subject Area</Label>
        <SubjectSelector
          value={form.watch("subject")}
          onChange={(value) => form.setValue("subject", value)}
          error={form.formState.errors.subject?.message}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic / Title</Label>
        <Input
          id="topic"
          placeholder="e.g., Impact of Social Media on Mental Health"
          {...form.register("topic")}
          className={form.formState.errors.topic ? "border-destructive" : ""}
        />
        {form.formState.errors.topic && (
          <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.form>
  );
}
