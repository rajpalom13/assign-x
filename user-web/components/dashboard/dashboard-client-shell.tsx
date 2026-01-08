"use client";

import { useState } from "react";
import { MobileNav } from "./mobile-nav";
import { UploadSheet } from "./upload-sheet";

/**
 * Client-side wrapper for dashboard interactive elements
 * Handles upload sheet state and mobile navigation
 * Used within SidebarInset to add floating elements
 */
export function DashboardClientShell({ children }: { children: React.ReactNode }) {
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav onFabClick={() => setUploadSheetOpen(true)} />

      {/* Upload Sheet */}
      <UploadSheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen} />
    </>
  );
}
