"use client";

import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2, Send, FileText, Paperclip } from "lucide-react";
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

/** Step 4: Additional details and file uploads - Premium Glassmorphic Design */
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
      className="space-y-5"
    >
      {/* Glassmorphic Card Container */}
      <div className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl">
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-indigo-50/20 dark:from-blue-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 space-y-5">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Final Details</h3>
              <p className="text-xs text-muted-foreground">Instructions and attachments</p>
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <label htmlFor="instructions" className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <FileText className="h-4 w-4 text-blue-500" />
              Additional Instructions <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Textarea
              id="instructions"
              placeholder="Any specific requirements, guidelines, or notes..."
              rows={4}
              {...form.register("instructions")}
              className="bg-white/60 dark:bg-white/5 border-white/50 dark:border-white/10 backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              Max 2000 characters
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Paperclip className="h-4 w-4 text-indigo-500" />
              Attach Files <span className="text-xs text-muted-foreground font-normal">(Optional, max 5)</span>
            </label>
            <FileUploadZone files={files} onFilesChange={onFilesChange} maxFiles={5} />
          </div>
        </div>
      </div>

      {/* Price Estimate */}
      <PriceEstimate wordCount={wordCount} urgencyMultiplier={urgencyMultiplier} />

      {/* Submit Button - Enhanced */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 flex items-center justify-center gap-2 px-6 rounded-[16px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2.5} />
            Submit Project
          </>
        )}
      </button>
    </motion.form>
  );
}
