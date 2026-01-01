"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Send, Bot, FileSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadZone } from "./file-upload-zone";
import {
  reportFormSchema,
  type ReportFormSchema,
} from "@/lib/validations/project";
import { createProject } from "@/lib/actions/data";
import type { UploadedFile } from "@/types/add-project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportFormProps {
  onSuccess: (projectId: string, projectNumber: string) => void;
}

const reportTypes = [
  {
    value: "ai",
    label: "AI Detection",
    description: "Check if content was AI-generated",
    icon: Bot,
    price: 49,
  },
  {
    value: "plagiarism",
    label: "Plagiarism Check",
    description: "Check for copied content",
    icon: FileSearch,
    price: 99,
  },
  {
    value: "both",
    label: "Complete Report",
    description: "AI detection + Plagiarism check",
    icon: Sparkles,
    price: 129,
    popular: true,
  },
];

/**
 * AI/Plagiarism report form
 */
export function ReportForm({ onSuccess }: ReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const form = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "both",
      documentCount: 1,
      wordCountApprox: 5000,
    },
  });

  const watchReportType = form.watch("reportType");
  const watchDocCount = form.watch("documentCount");

  // Calculate price
  const selectedReport = reportTypes.find((r) => r.value === watchReportType);
  const basePrice = (selectedReport?.price || 0) * (watchDocCount || 1);
  const gst = basePrice * 0.18;
  const totalPrice = basePrice + gst;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (files.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine service type based on report type
      const serviceType = data.reportType === "ai"
        ? "ai_detection"
        : data.reportType === "plagiarism"
          ? "plagiarism_check"
          : "ai_detection"; // for 'both', use ai_detection as primary

      const result = await createProject({
        serviceType,
        title: `${selectedReport?.label || "Report"} - ${data.documentCount} document(s)`,
        wordCount: data.wordCountApprox,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      onSuccess(result.projectId!, result.projectNumber!);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">AI/Plagiarism Report</h1>
        <p className="text-muted-foreground">
          Verify the originality of your content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div className="space-y-3">
          <Label>Report Type</Label>
          <RadioGroup
            value={form.watch("reportType")}
            onValueChange={(value) =>
              form.setValue("reportType", value as "ai" | "plagiarism" | "both")
            }
            className="grid gap-3 md:grid-cols-3"
          >
            {reportTypes.map((type) => (
              <div
                key={type.value}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-lg border p-4 transition-colors",
                  form.watch("reportType") === type.value &&
                    "border-primary bg-primary/5"
                )}
              >
                {type.popular && (
                  <span className="absolute -top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Popular
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label
                    htmlFor={type.value}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {type.description}
                    </p>
                    <p className="mt-2 font-semibold text-primary">
                      ₹{type.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        /document
                      </span>
                    </p>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Document Count */}
        <div className="space-y-2">
          <Label htmlFor="documentCount">Number of Documents</Label>
          <Input
            id="documentCount"
            type="number"
            min={1}
            max={10}
            {...form.register("documentCount", { valueAsNumber: true })}
            className={
              form.formState.errors.documentCount ? "border-destructive" : ""
            }
          />
          {form.formState.errors.documentCount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.documentCount.message}
            </p>
          )}
        </div>

        {/* Word Count */}
        <div className="space-y-2">
          <Label htmlFor="wordCountApprox">Approximate Word Count (per doc)</Label>
          <Input
            id="wordCountApprox"
            type="number"
            min={100}
            max={100000}
            {...form.register("wordCountApprox", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Helps us prepare for processing time
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload Document(s) *</Label>
          <FileUploadZone
            files={files}
            onFilesChange={setFiles}
            maxFiles={10}
          />
        </div>

        {/* Price Summary */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {selectedReport?.label} × {watchDocCount || 1} doc(s)
                </span>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{Math.round(gst)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">
                  ₹{Math.round(totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Get Report
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
