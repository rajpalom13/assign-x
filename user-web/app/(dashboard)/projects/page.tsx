"use client";

import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  ProjectTabs,
  ProjectList,
  PaymentPromptModal,
} from "@/components/projects";
import type { Project } from "@/stores";

/**
 * My Projects page
 * Displays user's projects with tab filtering
 * Fetches data from Supabase
 */
export default function ProjectsPage() {
  const handlePayNow = (project: Project) => {
    // Get quote amount with fallback support
    const quoteAmount = project.quoteAmount || project.final_quote || project.user_quote;
    const projectNumber = project.projectNumber || project.project_number;

    // TODO: In production, this would open a payment gateway
    toast.info(`Opening payment for ${projectNumber} - ₹${quoteAmount}`);
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Projects</h1>
              <p className="text-sm text-muted-foreground">
                Track and manage all your submissions
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <ProjectTabs className="mb-6" />

        {/* Project List */}
        <ProjectList onPayNow={handlePayNow} />
      </div>

      {/* Payment Prompt Modal (Auto-popup) */}
      <PaymentPromptModal onPay={handlePayNow} />
    </div>
  );
}
