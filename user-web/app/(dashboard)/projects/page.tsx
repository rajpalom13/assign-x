"use client";

import { useState, useEffect } from "react";
import { PaymentPromptModal } from "@/components/projects";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";
import { createClient } from "@/lib/supabase/client";
import { walletService } from "@/services";
import type { Project } from "@/stores";
import { ProjectsPro } from "./projects-pro";

/**
 * My Projects page
 * Premium SAAS-style design with glassmorphism
 * Header is now rendered by the dashboard layout
 */
export default function ProjectsPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [walletBalance, setWalletBalance] = useState(0);

  // Get user data and wallet balance on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        setUserName(data.user.user_metadata?.full_name);

        // Get wallet balance
        try {
          const balance = await walletService.getBalance(data.user.id);
          setWalletBalance(balance);
        } catch (error) {
          console.error("Failed to get wallet balance:", error);
        }
      }
    });
  }, []);

  const handlePayNow = (project: Project) => {
    setSelectedProject(project);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedProject(null);
    window.location.reload();
  };

  const paymentAmount = selectedProject
    ? (selectedProject.quoteAmount || selectedProject.final_quote || selectedProject.user_quote || 0)
    : 0;

  return (
    <>
      {/* Premium Projects View */}
      <ProjectsPro onPayNow={handlePayNow} />

      {/* Payment Prompt Modal */}
      <PaymentPromptModal onPay={handlePayNow} />

      {/* Razorpay Checkout */}
      {selectedProject && (
        <RazorpayCheckout
          open={showPayment}
          onOpenChange={setShowPayment}
          amount={paymentAmount}
          type="project_payment"
          projectId={selectedProject.id}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          walletBalance={walletBalance}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error("Project payment error:", error);
          }}
        />
      )}
    </>
  );
}
