"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceDownloadProps {
  projectId: string;
  projectNumber: string;
  className?: string;
}

/**
 * Invoice download button component
 * Downloads invoice PDF for completed projects
 */
export function InvoiceDownload({
  projectId,
  projectNumber,
  className,
}: InvoiceDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: In production, this would trigger actual file download
    const fileName = `Invoice_${projectNumber.replace("#", "")}.pdf`;
    toast.success(`Invoice download started: ${fileName}`);

    setIsDownloading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn("gap-2", className)}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Download Invoice
        </>
      )}
    </Button>
  );
}
