"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  FileText,
  ExternalLink,
  BookOpen,
  Hash,
  Calendar,
  MoreHorizontal,
  XCircle,
  Loader2,
  Send,
  Paperclip,
  ChevronRight,
  Check,
  User,
  AlertTriangle,
  ChevronUp,
  Download,
  Package,
  CreditCard,
  Eye,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DeliverablesSection,
  QualityReportBadge,
  AttachedFiles,
} from "@/components/project-detail";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { generateInvoiceHTML } from "@/lib/actions/invoice";
import { createRevisionRequest, markProjectComplete } from "@/lib/actions/data";
import { useChat } from "@/hooks/useChat";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { validateChatContent, getValidationErrorMessage } from "@/lib/validations/chat-content";
import { flagUserForViolation, type FlagReason } from "@/lib/actions/user-flagging";
import type { ProjectDetail, ProjectStatus } from "@/types/project";
import { STATUS_CONFIG } from "@/types/project";
import { projectService, type TimelineEvent } from "@/services";

/**
 * Get time-based gradient class for dynamic theming
 */
function getTimeBasedGradientClass(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "mesh-gradient-morning";
  if (hour >= 12 && hour < 18) return "mesh-gradient-afternoon";
  return "mesh-gradient-evening";
}

interface ProjectDetailClientProps {
  project: ProjectDetail;
  userId: string;
}

// Step configuration
const STEPS = [
  { id: "submitted", label: "Submitted" },
  { id: "analyzing", label: "Under Review" },
  { id: "quoted", label: "Quote Ready" },
  { id: "paid", label: "Paid" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "qc", label: "Quality Check" },
  { id: "delivered", label: "Delivered" },
];

function getStepIndex(status: ProjectStatus): number {
  const map: Record<string, number> = {
    draft: 0, submitted: 0, analyzing: 1, quoted: 2, payment_pending: 2,
    paid: 3, assigning: 4, assigned: 4, in_progress: 5, submitted_for_qc: 6,
    qc_in_progress: 6, qc_approved: 6, qc_rejected: 5, delivered: 7,
    revision_requested: 7, in_revision: 5, completed: 8, auto_approved: 8,
  };
  return map[status] ?? 0;
}

// Format time helper
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Status explanations
const statusExplanations: Record<number, { title: string; description: string }> = {
  0: { title: "In Queue", description: "Your project is being reviewed. You'll be notified when the quote is ready." },
  1: { title: "Under Review", description: "An expert is analyzing your requirements to prepare an accurate quote." },
  3: { title: "Payment Received", description: "We're assigning the best expert for your project." },
  4: { title: "Expert Assigned", description: "Your expert is preparing to start work on your project." },
  5: { title: "Work in Progress", description: "Your expert is actively working on your project." },
  6: { title: "Quality Check", description: "Our QC team is reviewing your work to ensure quality standards." },
  7: { title: "Delivered", description: "Your project is complete. Review the deliverables below." },
};

// Main Component
export function ProjectDetailClient({ project, userId }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [mobileTab, setMobileTab] = useState<"info" | "chat">("chat");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const config = STATUS_CONFIG[project.status];
  const stepIndex = getStepIndex(project.status);
  const showInvoice = stepIndex >= 3;

  // Memoize time-based gradient class
  const gradientClass = useMemo(() => getTimeBasedGradientClass(), []);
  const isQuoted = project.status === "quoted" || project.status === "payment_pending";
  const isDelivered = stepIndex >= 7;
  const isCompleted = project.status === "completed" || project.status === "auto_approved";

  const paymentAmount = project.budget ? parseInt(project.budget.replace(/[^0-9]/g, "")) : 0;

  // Handlers
  const handleDownloadInvoice = async () => {
    if (!project.id) return;
    setIsDownloadingInvoice(true);
    try {
      const html = await generateInvoiceHTML(project.id);
      if (!html) { toast.error("Invoice not available"); return; }
      const win = window.open("", "_blank");
      if (!win) { toast.error("Allow popups"); return; }
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
    } catch { toast.error("Failed to generate invoice"); }
    finally { setIsDownloadingInvoice(false); }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful!");
    setTimeout(() => router.refresh(), 1500);
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.error("Please describe what changes you need");
      return;
    }
    setIsSubmittingRevision(true);
    try {
      const result = await createRevisionRequest(project.id, revisionFeedback.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Revision request submitted");
        setIsRevisionDialogOpen(false);
        setRevisionFeedback("");
        router.refresh();
      }
    } catch {
      toast.error("Failed to submit revision request");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      const result = await markProjectComplete(project.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project marked as complete!");
        setIsCompleteDialogOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to mark project as complete");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Time remaining
  const getTimeRemaining = () => {
    if (!project.deadline) return null;
    const diff = new Date(project.deadline).getTime() - Date.now();
    if (diff <= 0) return { text: "Overdue", urgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { text: days > 0 ? `${days}d ${hours}h` : `${hours}h`, urgent: days < 2 };
  };

  const timeInfo = getTimeRemaining();
  const explanation = statusExplanations[stepIndex];

  return (
    <div className={cn("h-screen flex overflow-hidden mesh-background mesh-gradient-bottom-right-animated", gradientClass)}>
      {/* Left Panel - Project Info */}
      <div className="hidden lg:flex flex-col w-[55%] max-w-2xl border-r border-border/50 h-screen backdrop-blur-sm bg-background/80">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border/50 bg-background/60 backdrop-blur-sm">
          <button
            onClick={() => router.push("/projects")}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-mono text-muted-foreground">{project.projectNumber}</span>
            <h1 className="text-base font-semibold truncate">{project.title}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {showInvoice && (
                <>
                  <DropdownMenuItem onClick={handleDownloadInvoice} disabled={isDownloadingInvoice}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="text-red-500">
                <XCircle className="h-4 w-4 mr-2" /> Cancel Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              stepIndex >= 7 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
              stepIndex >= 5 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {config.label}
            </span>
          </div>

          {/* Step Progress */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {STEPS.map((step, i) => (
                <div
                  key={step.id}
                  className={cn(
                    "h-1 rounded-full flex-1 transition-colors",
                    i < stepIndex ? "bg-emerald-500" :
                    i === stepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {stepIndex + 1} of {STEPS.length}</span>
              <span className="font-medium text-foreground">{STEPS[stepIndex]?.label}</span>
            </div>
          </div>

          {/* Quote Payment Card */}
          {isQuoted && paymentAmount > 0 && (
            <div className="action-card-glass p-5 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <CreditCard className="h-3.5 w-3.5" />
                Payment Required
              </div>
              <p className="text-3xl font-semibold mb-4">₹{paymentAmount.toLocaleString()}</p>
              <Button onClick={() => setIsPaymentOpen(true)} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Quote valid for 24 hours
              </p>
            </div>
          )}

          {/* Status Explanation */}
          {!isQuoted && explanation && (
            <div className="action-card-glass p-4 rounded-xl">
              <p className="text-sm font-medium mb-1">{explanation.title}</p>
              <p className="text-xs text-muted-foreground">{explanation.description}</p>
            </div>
          )}

          {/* Live Document Link */}
          {project.liveDocUrl && stepIndex === 5 && (
            <a
              href={project.liveDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <Eye className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Live Document</p>
                <p className="text-xs text-muted-foreground">Track progress in real-time</p>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-500" />
            </a>
          )}

          {/* Timeline Info */}
          {stepIndex >= 3 && stepIndex < 7 && project.deadline && (
            <div className="grid grid-cols-2 gap-3">
              <div className="action-card-glass p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </div>
                <p className="text-sm font-medium">
                  {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              {timeInfo && (
                <div className={cn(
                  "p-3 rounded-xl",
                  timeInfo.urgent ? "border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" : "action-card-glass"
                )}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Timer className="h-3 w-3" />
                    Time Left
                  </div>
                  <p className={cn("text-sm font-medium", timeInfo.urgent && "text-red-600 dark:text-red-400")}>
                    {timeInfo.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Expert Info */}
          {stepIndex >= 4 && stepIndex < 7 && project.supervisorName && (
            <div className="action-card-glass flex items-center gap-3 p-3 rounded-xl">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {project.supervisorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{project.supervisorName}</p>
                <p className="text-xs text-muted-foreground">
                  {stepIndex === 5 ? "Working on your project" : "Assigned to your project"}
                </p>
              </div>
            </div>
          )}

          {/* Project Details (Early steps) */}
          {stepIndex <= 2 && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="action-card-glass p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <BookOpen className="h-3 w-3" />
                      Subject
                    </div>
                    <p className="text-sm font-medium">{project.subjectName || "Not specified"}</p>
                  </div>
                  {project.wordCount && (
                    <div className="action-card-glass p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        Word Count
                      </div>
                      <p className="text-sm font-medium">{project.wordCount.toLocaleString()}</p>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="action-card-glass p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        Deadline
                      </div>
                      <p className="text-sm font-medium">
                        {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {project.instructions && (
                <div className="action-card-glass p-4 rounded-xl">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Instructions</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.instructions}</p>
                </div>
              )}

              {project.attachedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</p>
                    <span className="text-xs text-muted-foreground">{project.attachedFiles.length} files</span>
                  </div>
                  <div className="space-y-2">
                    {project.attachedFiles.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-card-glass flex items-center gap-3 p-3 rounded-xl hover:border-foreground/20 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.size && <p className="text-xs text-muted-foreground">{file.size}</p>}
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Delivered Content */}
          {isDelivered && (
            <>
              <DeliverablesSection status={project.status} deliverables={project.deliverables} />
              <QualityReportBadge reports={project.qualityReports} />

              {/* Only show action buttons if project is not completed */}
              {!isCompleted && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => setIsRevisionDialogOpen(true)} className="flex-1">
                      Request Revision
                    </Button>
                    <Button size="sm" onClick={() => setIsCompleteDialogOpen(true)} className="flex-1">
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              )}
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col h-screen backdrop-blur-sm bg-background/50">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b border-border/50 bg-background/60 backdrop-blur-sm">
          <button onClick={() => router.push("/projects")} className="p-2 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="flex-1 text-sm font-medium truncate">{project.title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-1">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showInvoice && (
                <DropdownMenuItem onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-2" /> Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex border-b border-border/50 bg-background/60 backdrop-blur-sm">
          <button
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", mobileTab === "info" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
            onClick={() => setMobileTab("info")}
          >
            Project Info
          </button>
          <button
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", mobileTab === "chat" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
            onClick={() => setMobileTab("chat")}
          >
            Chat
          </button>
        </div>

        {/* Mobile Info Content */}
        {mobileTab === "info" && (
          <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              stepIndex >= 7 ? "bg-emerald-100 text-emerald-700" : stepIndex >= 5 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
            )}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {config.label}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="action-card-glass p-3 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">{project.subjectName || "N/A"}</p>
              </div>
              {project.deadline && (
                <div className="action-card-glass p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                  <p className="text-sm font-medium">
                    {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              )}
            </div>

            {project.instructions && (
              <div className="action-card-glass p-4 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground mb-2">Instructions</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.instructions}</p>
              </div>
            )}

            {project.attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Files</p>
                <AttachedFiles files={project.attachedFiles} />
              </div>
            )}

            <DeliverablesSection status={project.status} deliverables={project.deliverables} />
          </div>
        )}

        {/* Chat Panel */}
        <div className={cn("flex-1 flex flex-col overflow-hidden", mobileTab !== "chat" && "hidden lg:flex")}>
          <ChatPanel projectId={project.id} userId={userId} supervisorName={project.supervisorName} />
        </div>
      </div>

      {/* Razorpay Payment Dialog */}
      <RazorpayCheckout
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        amount={paymentAmount}
        type="project_payment"
        projectId={project.id}
        userId={userId}
        onSuccess={handlePaymentSuccess}
        onError={(error) => toast.error(error || "Payment failed")}
      />

      {/* Revision Dialog */}
      <AlertDialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Request Revision</AlertDialogTitle>
            <AlertDialogDescription>
              Describe what changes you need. Our expert will review and make adjustments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="revision-feedback" className="text-sm font-medium">
              What changes do you need?
            </Label>
            <Textarea
              id="revision-feedback"
              placeholder="Describe the changes..."
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsRevisionDialogOpen(false)} disabled={isSubmittingRevision}>
              Cancel
            </Button>
            <Button onClick={handleRequestRevision} disabled={isSubmittingRevision || !revisionFeedback.trim()}>
              {isSubmittingRevision ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Mark Complete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you satisfied with the deliverables? The project will be closed but you can still access files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)} disabled={isMarkingComplete}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} disabled={isMarkingComplete} className="bg-emerald-500 hover:bg-emerald-600">
              {isMarkingComplete ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Completing...</> : <><Check className="h-4 w-4 mr-2" />Complete</>}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Chat Panel Component
interface ChatPanelProps {
  projectId: string;
  userId: string;
  supervisorName?: string;
}

function ChatPanel({ projectId, userId, supervisorName }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, isSending, hasMore, sendMessage, sendMessageWithAttachment, loadMore } = useChat(projectId, userId);

  // Fetch timeline events (quotes and status changes)
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const events = await projectService.getChatTimeline(projectId);
        setTimelineEvents(events);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
      }
    };
    fetchTimeline();
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, 100);
    }
  }, [messages]);

  const handleViolation = useCallback(async (reason: FlagReason, message: string) => {
    if (userId) await flagUserForViolation(userId, reason);
    setViolationMessage(message);
    setShowViolationAlert(true);
    setInputValue("");
  }, [userId]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;
    const validation = validateChatContent(inputValue);
    if (!validation.isValid) {
      const reasonMap: Record<string, FlagReason> = { phone: "phone_sharing", email: "email_sharing", link: "link_sharing", address: "address_sharing" };
      await handleViolation(reasonMap[validation.reason || ""] || "link_sharing", getValidationErrorMessage(validation));
      return;
    }
    const success = await sendMessage(inputValue);
    if (success) setInputValue("");
  }, [inputValue, isSending, sendMessage, handleViolation]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
      await sendMessageWithAttachment("", file);
      e.target.value = "";
    }
  };

  const supervisor = supervisorName || "Supervisor";

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Chat</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            Online
          </span>
        </div>
        <div className="action-card-glass flex items-center gap-3 p-3 rounded-xl">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium relative">
            {supervisor.charAt(0)}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <p className="text-sm font-medium">{supervisor}</p>
            <p className="text-xs text-muted-foreground">Project Coordinator</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {hasMore && !isLoading && messages.length > 0 && (
          <button onClick={loadMore} className="w-full py-2 text-xs text-primary hover:underline flex items-center justify-center gap-1 mb-4">
            <ChevronUp className="h-3 w-3" /> Load earlier
          </button>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && messages.length === 0 && timelineEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">Start the conversation</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">Ask questions or share details about your project</p>
          </div>
        )}

        {/* Timeline Events & Messages Combined */}
        {(() => {
          // Combine messages and timeline events
          const combined: Array<{ type: 'message' | 'event'; timestamp: string; data: any }> = [];

          messages.forEach((msg) => {
            combined.push({
              type: 'message',
              timestamp: msg.created_at || new Date().toISOString(),
              data: msg,
            });
          });

          timelineEvents.forEach((event) => {
            combined.push({
              type: 'event',
              timestamp: event.timestamp,
              data: event,
            });
          });

          // Sort by timestamp
          combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          return combined.map((item, index) => {
            if (item.type === 'event') {
              const event = item.data as TimelineEvent;
              return <TimelineEventCard key={`event-${event.id}`} event={event} supervisorName={supervisor} />;
            }

            const msg = item.data;
            const isUser = msg.sender_id === userId;
            const senderName = msg.sender?.full_name || supervisor;

            return (
              <div key={msg.id} className={cn("flex gap-2 mb-3", isUser && "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0",
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
                )}>
                  {isUser ? <User className="h-4 w-4" /> : senderName.charAt(0)}
                </div>
                <div className={cn("max-w-[75%]", isUser && "items-end")}>
                  <div className={cn(
                    "px-3 py-2 rounded-xl text-sm",
                    isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                  )}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    {msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-1 text-xs underline opacity-80">
                        <Paperclip className="h-3 w-3" /> Attachment
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.created_at && formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 p-1.5 pl-4 rounded-full border border-border bg-muted/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" />
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 transition-colors"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AlertDialog open={showViolationAlert} onOpenChange={setShowViolationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Policy Violation
            </AlertDialogTitle>
            <AlertDialogDescription>{violationMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowViolationAlert(false)} variant="destructive">I Understand</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Timeline Event Card - Message-style cards for quotes and status updates
 * Quotes appear from supervisor (left), payments appear from user (right)
 */
function TimelineEventCard({ event, supervisorName }: { event: TimelineEvent; supervisorName?: string }) {
  const supervisor = supervisorName || "Supervisor";

  // User-initiated actions (show on right side like user messages)
  const userActions = ["paid", "completed", "revision_requested", "submitted"];
  // Supervisor/system actions (show on left side like supervisor messages)
  const isUserAction = event.type === "status_change" && userActions.includes(event.data.to_status || "");

  const statusConfig: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    submitted: { label: "Project Submitted", description: "Your project has been submitted for review", icon: <FileText className="h-4 w-4" /> },
    analyzing: { label: "Under Review", description: "Our team is reviewing your requirements", icon: <Clock className="h-4 w-4" /> },
    quoted: { label: "Quote Prepared", description: "Your quote is ready for review", icon: <CreditCard className="h-4 w-4" /> },
    payment_pending: { label: "Awaiting Payment", description: "Please complete the payment to proceed", icon: <CreditCard className="h-4 w-4" /> },
    paid: { label: "Payment Successful", description: "Your payment has been received", icon: <CheckCircle2 className="h-4 w-4" /> },
    assigned: { label: "Expert Assigned", description: "An expert has been assigned to your project", icon: <User className="h-4 w-4" /> },
    in_progress: { label: "Work Started", description: "Your expert has started working", icon: <Zap className="h-4 w-4" /> },
    qc: { label: "Quality Check", description: "Your work is being reviewed for quality", icon: <ShieldCheck className="h-4 w-4" /> },
    delivered: { label: "Delivered", description: "Your project has been delivered", icon: <Package className="h-4 w-4" /> },
    completed: { label: "Marked Complete", description: "You marked this project as complete", icon: <CheckCircle2 className="h-4 w-4" /> },
    revision_requested: { label: "Revision Requested", description: "You requested changes to the delivery", icon: <ArrowLeft className="h-4 w-4" /> },
    in_revision: { label: "In Revision", description: "Your expert is making the requested changes", icon: <Clock className="h-4 w-4" /> },
  };

  // Quote card - appears from supervisor side
  if (event.type === "quote") {
    return (
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 bg-muted text-muted-foreground border border-border">
          {supervisor.charAt(0)}
        </div>
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-tl-sm overflow-hidden border border-border bg-card">
            {/* Quote Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Quote Ready</p>
                <p className="text-[10px] text-muted-foreground">Project quotation</p>
              </div>
            </div>
            {/* Quote Amount */}
            <div className="p-4 text-center">
              <p className="text-3xl font-bold tracking-tight">
                ₹{(event.data.amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Amount</p>
              {event.data.valid_until && (
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Timer className="h-3 w-3" />
                  Valid until {new Date(event.data.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {formatTime(event.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Status change events
  const status = event.data.to_status || "";
  const config = statusConfig[status] || { label: status, description: "Status updated", icon: <ChevronRight className="h-4 w-4" /> };

  // Payment successful - special card from user side (like Google Pay success)
  if (status === "paid") {
    return (
      <div className="flex gap-2 mb-4 flex-row-reverse">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-tr-sm overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30">
            <div className="p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Payment Successful</p>
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-1">Your payment has been received</p>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground mt-1 px-1">
              {formatTime(event.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // User-initiated status changes (right side)
  if (isUserAction) {
    return (
      <div className="flex gap-2 mb-3 flex-row-reverse">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
        <div className="max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 mb-1">
              {config.icon}
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <p className="text-xs opacity-80">{config.description}</p>
          </div>
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground mt-1 px-1">
              {formatTime(event.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // System/supervisor status changes (left side)
  return (
    <div className="flex gap-2 mb-3">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 bg-muted text-muted-foreground border border-border">
        {supervisor.charAt(0)}
      </div>
      <div className="max-w-[75%]">
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground">{config.icon}</span>
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatTime(event.timestamp)}
        </span>
      </div>
    </div>
  );
}
