"use client";

import { useState, useEffect, useRef } from "react";
import { PaymentPromptModal } from "@/components/projects";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";
import { createClient } from "@/lib/supabase/client";
import { walletService } from "@/services";
import { useProjectStore, type Project } from "@/stores";
import { PageSkeletonProvider, ProjectsSkeleton } from "@/components/skeletons";
import { ProjectsPro } from "./projects-pro";

/**
 * My Projects page
 * Premium SAAS-style design with glassmorphism
 * Header is now rendered by the dashboard layout
 *
 * Uses PageSkeletonProvider for unified skeleton loading:
 * - Shows ProjectsSkeleton while loading
 * - Minimum 1000ms display time
 * - Staggered reveal animations on content
 */
export default function ProjectsPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [walletBalance, setWalletBalance] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track if initial fetch has been done to prevent re-fetches
  const hasFetched = useRef(false);

  // Get loading state and fetch function from project store
  const { isLoading: projectsLoading, fetchProjects } = useProjectStore();

  // Determine overall loading state - only for initial load
  const isLoading = !initialLoadComplete;

  // Fetch projects and user data on mount (ONCE)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadData = async () => {
      const supabase = createClient();

      // Fetch user data and projects in parallel
      const [userResult] = await Promise.all([
        supabase.auth.getUser(),
        fetchProjects(), // Fetch projects here, not in ProjectsPro
      ]);

      if (userResult.data.user) {
        setUserId(userResult.data.user.id);
        setUserEmail(userResult.data.user.email);
        setUserName(userResult.data.user.user_metadata?.full_name);

        // Get wallet balance
        try {
          const balance = await walletService.getBalance(userResult.data.user.id);
          setWalletBalance(balance);
        } catch (error) {
          console.error("Failed to get wallet balance:", error);
        }
      }

      setInitialLoadComplete(true);
    };

    loadData();
  }, [fetchProjects]);

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
      {/* Page Skeleton Provider - shows skeleton for minimum 1000ms */}
      <PageSkeletonProvider
        isLoading={isLoading}
        skeleton={<ProjectsSkeleton />}
        minimumDuration={1000}
      >
        {/* Premium Projects View */}
        <ProjectsPro onPayNow={handlePayNow} />
      </PageSkeletonProvider>

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
