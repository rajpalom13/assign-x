"use client";

import Link from "next/link";
import { FileText, FileSearch, Brain, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const uploadOptions = [
  {
    id: "new-project",
    title: "New Project",
    description: "Submit a new project for expert help",
    icon: FileText,
    href: "/projects/new",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "proofreading",
    title: "Quick Proofread",
    description: "Get your document reviewed and polished",
    icon: FileSearch,
    href: "/projects/new?type=proofreading",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "ai-check",
    title: "AI/Plagiarism Check",
    description: "Verify originality of your content",
    icon: Brain,
    href: "/projects/new?type=report",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "expert-opinion",
    title: "Expert Opinion",
    description: "Ask an expert for guidance",
    icon: MessageSquare,
    href: "/projects/new?type=consultation",
    color: "bg-green-500/10 text-green-500",
    badge: "Free",
  },
];

interface UploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Upload sheet with quick action options
 * Bottom sheet on mobile, side sheet on desktop
 */
export function UploadSheet({ open, onOpenChange }: UploadSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-xl lg:hidden">
        <SheetHeader className="text-left">
          <SheetTitle>What would you like to do?</SheetTitle>
          <SheetDescription>
            Choose an option to get started
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid gap-3">
          {uploadOptions.map((option) => (
            <Link
              key={option.id}
              href={option.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  option.color
                )}
              >
                <option.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.title}</span>
                  {option.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SheetContent>

      {/* Desktop side sheet */}
      <SheetContent side="right" className="hidden w-96 lg:block">
        <SheetHeader>
          <SheetTitle>What would you like to do?</SheetTitle>
          <SheetDescription>
            Choose an option to get started
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid gap-3">
          {uploadOptions.map((option) => (
            <Link
              key={option.id}
              href={option.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  option.color
                )}
              >
                <option.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.title}</span>
                  {option.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
