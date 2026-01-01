"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ProjectDetailHeader,
  StatusBanner,
  DeadlineCountdown,
  LiveDraftTracker,
  ProjectBriefAccordion,
  DeliverablesSection,
  QualityReportBadge,
  FloatingChatButton,
  ChatWindow,
} from "@/components/project-detail";
import { ProjectTimeline } from "@/components/projects";
import type { ProjectDetail } from "@/types/project";

interface ProjectDetailClientProps {
  project: ProjectDetail;
  userId: string;
}

/**
 * Project Detail Client Component
 * Handles interactive features like chat
 */
export function ProjectDetailClient({ project, userId }: ProjectDetailClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCancelProject = () => {
    // TODO: Implement cancel project functionality
    toast.info("Cancel project functionality coming soon");
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    toast.info("Contact support functionality coming soon");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky Header */}
      <ProjectDetailHeader
        title={project.title}
        projectNumber={project.projectNumber}
        projectId={project.id}
        status={project.status}
        onCancelProject={handleCancelProject}
        onContactSupport={handleContactSupport}
      />

      {/* Status Banner */}
      <StatusBanner status={project.status} />

      {/* Main Content */}
      <main className="flex-1 space-y-4 p-4 pb-24 lg:p-6">
        {/* Deadline Countdown */}
        <DeadlineCountdown deadline={project.deadline} />

        {/* Live Draft Tracker */}
        <LiveDraftTracker
          status={project.status}
          liveDocUrl={project.liveDocUrl}
        />

        {/* Project Brief Accordion */}
        <ProjectBriefAccordion project={project} />

        {/* Deliverables Section */}
        <DeliverablesSection
          status={project.status}
          deliverables={project.deliverables}
        />

        {/* Quality Reports */}
        <QualityReportBadge reports={project.qualityReports} />

        {/* Project Timeline */}
        <ProjectTimeline status={project.status} className="mt-6" />
      </main>

      {/* Floating Chat Button */}
      <FloatingChatButton
        unreadCount={project.unreadMessages}
        onClick={() => setIsChatOpen(true)}
      />

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        projectId={project.id}
        userId={userId}
        supervisorName={project.supervisorName}
        projectNumber={project.projectNumber}
      />
    </div>
  );
}
