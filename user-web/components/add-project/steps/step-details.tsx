"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadZone } from "../file-upload-zone";
import { PriceEstimate } from "../price-estimate";
import type { ProjectStep4Schema } from "@/lib/validations/project";
import type { UploadedFile } from "@/types/add-project";

/** Props for StepDetails component */
interface StepDetailsProps {
  form: UseFormReturn<ProjectStep4Schema>;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  wordCount: number;
  urgencyMultiplier: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

/** Step 4: Additional details and file uploads */
export function StepDetails({
  form,
  files,
  onFilesChange,
  wordCount,
  urgencyMultiplier,
  isSubmitting,
  onSubmit,
}: StepDetailsProps) {
  return (
    <motion.form
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="Any specific requirements, guidelines, or notes..."
          rows={4}
          {...form.register("instructions")}
        />
        <p className="text-xs text-muted-foreground">Max 2000 characters</p>
      </div>
      <div className="space-y-2">
        <Label>Attach Files (Optional)</Label>
        <FileUploadZone files={files} onFilesChange={onFilesChange} maxFiles={5} />
      </div>
      <PriceEstimate wordCount={wordCount} urgencyMultiplier={urgencyMultiplier} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
        ) : (
          <><Send className="mr-2 h-4 w-4" />Submit Project</>
        )}
      </Button>
    </motion.form>
  );
}
