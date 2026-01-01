import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import {
  paymentRateLimiter,
  getClientIdentifier,
  rateLimitHeaders,
} from "@/lib/rate-limit"
import { validateOriginOnly, csrfError } from "@/lib/csrf"
import { env } from "@/lib/env"

/**
 * Request body type
 */
interface VerifyPaymentRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  profile_id: string
  amount: number // Amount in rupees
  project_id?: string // For project payments
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature and credits wallet/project
 * Uses atomic database transactions to prevent race conditions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // CSRF protection: Validate request origin
    const originCheck = validateOriginOnly(request)
    if (!originCheck.valid) {
      console.warn(`CSRF attempt detected from user ${user.id}`)
      return csrfError(originCheck.error)
    }

    // Apply rate limiting (5 requests per minute for payment endpoints)
    const clientId = getClientIdentifier(user.id, request)
    const rateLimitResult = await paymentRateLimiter.check(5, clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      )
    }

    const body: VerifyPaymentRequest = await request.json()

    // SECURITY: Verify profile ownership to prevent IDOR attacks
    if (user.id !== body.profile_id) {
      console.warn(
        `IDOR attempt detected: User ${user.id} tried to access profile ${body.profile_id}`
      )
      return NextResponse.json(
        { error: "Unauthorized: Profile ID mismatch" },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      )
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Verify Razorpay signature using constant-time comparison
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex")

    if (!secureCompare(expectedSignature, body.razorpay_signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Determine if this is a project payment or wallet top-up
    const isProjectPayment = !!body.project_id

    if (isProjectPayment) {
      // Process project payment atomically
      const { data, error } = await supabase.rpc("process_razorpay_project_payment", {
        p_profile_id: body.profile_id,
        p_project_id: body.project_id,
        p_amount: body.amount,
        p_razorpay_order_id: body.razorpay_order_id,
        p_razorpay_payment_id: body.razorpay_payment_id,
      })

      if (error) {
        console.error("Atomic project payment error:", error)
        return NextResponse.json(
          { error: error.message || "Failed to process project payment" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        transaction_id: data.transaction_id,
        project_id: data.project_id,
        message: "Project payment successful",
      })
    } else {
      // Process wallet top-up atomically
      const { data, error } = await supabase.rpc("process_wallet_topup", {
        p_profile_id: body.profile_id,
        p_amount: body.amount,
        p_razorpay_order_id: body.razorpay_order_id,
        p_razorpay_payment_id: body.razorpay_payment_id,
      })

      if (error) {
        console.error("Atomic wallet topup error:", error)
        return NextResponse.json(
          { error: error.message || "Failed to process wallet top-up" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        transaction_id: data.transaction_id,
        new_balance: data.new_balance,
        message: "Wallet topped up successfully",
      })
    }
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
