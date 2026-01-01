"use client";

import { MessageCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FAQSection, ContactForm, TicketHistory } from "@/components/support";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Help & Support page
 * FAQs, contact form, and ticket history
 */
export default function SupportPage() {
  /** Opens live chat (mock) */
  const handleLiveChat = () => {
    toast.info("Live chat coming soon!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground">Get help and contact our support team</p>
          </div>
          <Button onClick={handleLiveChat}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Live Chat
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <FAQSection />
          </div>
          <div className="space-y-6">
            <ContactForm />
            <TicketHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
