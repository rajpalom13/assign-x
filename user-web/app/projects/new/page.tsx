"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  NewProjectForm,
  ProofreadingForm,
  ReportForm,
  ConsultationForm,
  SubmissionSuccess,
} from "@/components/add-project";
import type { ServiceType } from "@/types/add-project";

/**
 * Inner component that uses searchParams
 */
function NewProjectContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as ServiceType | null;

  // Determine service type from URL param
  const serviceType: ServiceType =
    typeParam === "proofreading" ? "proofreading" :
    typeParam === "report" ? "report" :
    typeParam === "consultation" ? "consultation" :
    "project";

  const [success, setSuccess] = useState<{
    projectId: string;
    projectNumber: string;
  } | null>(null);

  const handleSuccess = (projectId: string, projectNumber: string) => {
    setSuccess({ projectId, projectNumber });
  };

  // Show success screen if submission was successful
  if (success) {
    return (
      <SubmissionSuccess
        projectId={success.projectId}
        projectNumber={success.projectNumber}
        serviceType={serviceType}
      />
    );
  }

  // Render appropriate form based on service type
  return (
    <>
      {serviceType === "project" && (
        <NewProjectForm onSuccess={handleSuccess} />
      )}
      {serviceType === "proofreading" && (
        <ProofreadingForm onSuccess={handleSuccess} />
      )}
      {serviceType === "report" && (
        <ReportForm onSuccess={handleSuccess} />
      )}
      {serviceType === "consultation" && (
        <ConsultationForm onSuccess={handleSuccess} />
      )}
    </>
  );
}

/**
 * New Project Page
 * Handles different service types based on URL query param:
 * - /projects/new - New project form
 * - /projects/new?type=proofreading - Proofreading form
 * - /projects/new?type=report - AI/Plagiarism report form
 * - /projects/new?type=consultation - Expert opinion form
 */
export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }>
          <NewProjectContent />
        </Suspense>
      </div>
    </div>
  );
}
