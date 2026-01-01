"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DataSection, AppInfoSection, FeedbackSection } from "@/components/settings";

/**
 * Settings page
 * App-wide settings including data management, app info, and feedback
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage app settings and preferences</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <DataSection />
            <FeedbackSection />
          </div>
          <div>
            <AppInfoSection />
          </div>
        </div>
      </div>
    </div>
  );
}
