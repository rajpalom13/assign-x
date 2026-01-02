import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { createClient } from "@/lib/supabase/server"
import {
  paymentRateLimiter,
  getClientIdentifier,
  rateLimitHeaders,
} from "@/lib/rate-limit"
import { validateOriginOnly, csrfError } from "@/lib/csrf"
import { env } from "@/lib/env"

/**
 * Get or create Razorpay instance lazily
 */
let razorpayInstance: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayInstance
}

/**
 * Razorpay customer creation response
 */
interface RazorpayCustomer {
  id: string
  entity: string
  name: string
  email: string
  contact: string
  gstin: string | null
  notes: Record<string, string>
  created_at: number
}

/**
 * POST /api/payments/customers
 * Creates or retrieves a Razorpay customer for the authenticated user
 * Used for tokenization of payment methods
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
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Fetch user profile for customer creation
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

    // Create Razorpay customer
    const razorpay = getRazorpay()

    // Prepare customer data
    const customerData: {
      name: string
      email: string
      contact?: string
      notes: Record<string, string>
    } = {
      name: profile.full_name || user.email?.split("@")[0] || "User",
      email: profile.email || user.email || "",
      notes: {
        profile_id: user.id,
      },
    }

    // Add phone only if available and valid
    if (profile.phone && profile.phone.length >= 10) {
      customerData.contact = profile.phone
    }

    const customer = await razorpay.customers.create(customerData) as RazorpayCustomer

    // Log customer creation
    await supabase.from("activity_logs").insert({
      profile_id: user.id,
      action: "razorpay_customer_created",
      action_category: "payment",
      description: `Created Razorpay customer: ${customer.id}`,
      metadata: {
        customer_id: customer.id,
      },
    })

    return NextResponse.json({
      customer_id: customer.id,
      name: customer.name,
      email: customer.email,
    })
  } catch (error) {
    console.error("Create customer error:", error)
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/customers
 * Retrieves the Razorpay customer ID for the authenticated user
 * Creates a new customer if one doesn't exist
 */
export async function GET(request: NextRequest) {
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

    // Apply rate limiting (10 requests per minute for GET)
    const clientId = getClientIdentifier(user.id, request)
    const rateLimitResult = await paymentRateLimiter.check(10, clientId)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Fetch user profile for customer creation
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

    // Create or get Razorpay customer
    const razorpay = getRazorpay()

    // Prepare customer data
    const customerData: {
      name: string
      email: string
      contact?: string
      notes: Record<string, string>
    } = {
      name: profile.full_name || user.email?.split("@")[0] || "User",
      email: profile.email || user.email || "",
      notes: {
        profile_id: user.id,
      },
    }

    // Add phone only if available and valid
    if (profile.phone && profile.phone.length >= 10) {
      customerData.contact = profile.phone
    }

    const customer = await razorpay.customers.create(customerData) as RazorpayCustomer

    return NextResponse.json({
      customer_id: customer.id,
      name: customer.name,
      email: customer.email,
    })
  } catch (error) {
    console.error("Get customer error:", error)
    return NextResponse.json(
      { error: "Failed to get customer" },
      { status: 500 }
    )
  }
}
