"use server"

/**
 * @fileoverview Server actions for quote operations.
 * Uses admin client to bypass RLS for authorized operations.
 * @module app/actions/quote
 */

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

interface SubmitQuoteParams {
  projectId: string
  userQuote: number
  doerPayout: number
  supervisorCommission: number
  platformFee: number
}

interface QuoteResult {
  success: boolean
  error?: string
}

/**
 * Submit a quote for a project.
 * Validates the supervisor is assigned to the project before updating.
 */
export async function submitQuoteAction(params: SubmitQuoteParams): Promise<QuoteResult> {
  const { projectId, userQuote, doerPayout, supervisorCommission, platformFee } = params

  try {
    // Get the authenticated user from the server client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the supervisor ID for this user
    const { data: supervisor, error: supervisorError } = await supabase
      .from("supervisors")
      .select("id")
      .eq("profile_id", user.id)
      .single()

    if (supervisorError || !supervisor) {
      return { success: false, error: "Supervisor profile not found" }
    }

    // Use admin client for the database operations (bypasses RLS)
    const adminClient = createAdminClient()

    // Verify the supervisor is assigned to this project
    const { data: project, error: projectCheckError } = await adminClient
      .from("projects")
      .select("id, supervisor_id, status")
      .eq("id", projectId)
      .single()

    if (projectCheckError || !project) {
      return { success: false, error: "Project not found" }
    }

    if (project.supervisor_id !== supervisor.id) {
      return { success: false, error: "Not authorized to quote this project" }
    }

    // Insert the quote record
    const { error: quoteError } = await adminClient.from("project_quotes").insert({
      project_id: projectId,
      user_amount: userQuote,
      doer_amount: doerPayout,
      supervisor_amount: supervisorCommission,
      platform_amount: platformFee,
      quoted_by: supervisor.id,
      status: "pending",
    })

    if (quoteError) {
      console.error("Quote insert error:", quoteError)
      return { success: false, error: "Failed to create quote record" }
    }

    // Update the project status and financials
    const { error: updateError } = await adminClient
      .from("projects")
      .update({
        status: "quoted",
        user_quote: userQuote,
        doer_payout: doerPayout,
        supervisor_commission: supervisorCommission,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)

    if (updateError) {
      console.error("Project update error:", updateError)
      return { success: false, error: "Failed to update project" }
    }

    return { success: true }
  } catch (error) {
    console.error("Submit quote error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
