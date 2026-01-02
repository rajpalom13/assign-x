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
 * Request body types
 */
interface AddCardRequest {
  type: "card"
  cardLast4: string
  cardBrand?: string
  cardType?: string
  cardholderName: string
  cardToken?: string
  cardExpiry?: string
  bankName?: string
}

interface AddUpiRequest {
  type: "upi"
  upiId: string
}

interface SetDefaultRequest {
  type: "set_default"
  methodId: string
}

interface DeleteMethodRequest {
  type: "delete"
  methodId: string
}

type PaymentMethodRequest =
  | AddCardRequest
  | AddUpiRequest
  | SetDefaultRequest
  | DeleteMethodRequest

/**
 * Payment method response type
 */
interface PaymentMethodData {
  id: string
  type: "card" | "upi"
  isDefault: boolean
  isVerified: boolean
  cardLast4?: string
  cardBrand?: string
  cardType?: string
  cardholderName?: string
  cardExpiry?: string
  bankName?: string
  upiId?: string
  createdAt: string
}

/**
 * Validate UPI ID format
 * Format: username@provider (e.g., john@okaxis, jane@ybl)
 */
function validateUpiId(upiId: string): boolean {
  const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
  return upiPattern.test(upiId)
}

/**
 * GET /api/payments/methods
 * Fetches all saved payment methods for the authenticated user
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

    // Apply rate limiting (using less strict limit for reads)
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

    // Fetch payment methods from database
    const { data: methods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("profile_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch payment methods error:", error)
      return NextResponse.json(
        { error: "Failed to fetch payment methods" },
        { status: 500 }
      )
    }

    // Transform database schema to frontend format
    const transformedMethods: PaymentMethodData[] = (methods || []).map((method) => ({
      id: method.id,
      type: method.method_type === "upi" ? "upi" : "card",
      isDefault: method.is_default ?? false,
      isVerified: method.is_verified ?? false,
      cardLast4: method.card_last_four,
      cardBrand: method.card_network,
      cardType: method.card_type,
      cardholderName: method.display_name,
      cardExpiry: method.card_expiry,
      bankName: method.bank_name,
      upiId: method.upi_id,
      createdAt: method.created_at,
    }))

    return NextResponse.json({
      success: true,
      methods: transformedMethods,
    })
  } catch (error) {
    console.error("Get payment methods error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payments/methods
 * Handles card tokenization and UPI verification
 * Also handles setting default and deleting methods
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

    const body: PaymentMethodRequest = await request.json()

    // Route to appropriate handler based on type
    switch (body.type) {
      case "card":
        return handleAddCard(supabase, user.id, body)
      case "upi":
        return handleAddUpi(supabase, user.id, body)
      case "set_default":
        return handleSetDefault(supabase, user.id, body)
      case "delete":
        return handleDelete(supabase, user.id, body)
      default:
        return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Payment methods error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

/**
 * Handle adding a new card payment method
 */
async function handleAddCard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: AddCardRequest
): Promise<NextResponse> {
  // Validate card details
  if (!data.cardLast4 || data.cardLast4.length !== 4) {
    return NextResponse.json(
      { error: "Invalid card last 4 digits" },
      { status: 400 }
    )
  }

  if (!data.cardholderName || data.cardholderName.trim().length < 2) {
    return NextResponse.json(
      { error: "Invalid cardholder name" },
      { status: 400 }
    )
  }

  // Check existing payment methods count to determine if this is the first
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId)

  const isFirstMethod = (count ?? 0) === 0

  // Insert card into database
  const { data: method, error } = await supabase
    .from("payment_methods")
    .insert({
      profile_id: userId,
      method_type: "card",
      card_last_four: data.cardLast4,
      card_network: data.cardBrand || "unknown",
      card_type: data.cardType || "debit",
      card_expiry: data.cardExpiry,
      display_name: data.cardholderName.trim(),
      card_token: data.cardToken,
      bank_name: data.bankName,
      is_default: isFirstMethod,
      is_verified: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Add card error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add card" },
      { status: 500 }
    )
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: userId,
    action: "payment_method_added",
    action_category: "payment",
    description: `Added card ending in ${data.cardLast4}`,
    metadata: {
      method_id: method.id,
      method_type: "card",
      card_network: data.cardBrand,
    },
  })

  return NextResponse.json({
    success: true,
    method: {
      id: method.id,
      type: "card" as const,
      isDefault: method.is_default ?? false,
      isVerified: true,
      cardLast4: method.card_last_four,
      cardBrand: method.card_network,
      cardType: method.card_type,
      cardholderName: method.display_name,
      cardExpiry: method.card_expiry,
      bankName: method.bank_name,
      createdAt: method.created_at,
    },
  })
}

/**
 * Handle adding a new UPI payment method
 * Includes UPI ID verification via Razorpay
 */
async function handleAddUpi(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: AddUpiRequest
): Promise<NextResponse> {
  // Validate UPI ID format
  if (!data.upiId || !validateUpiId(data.upiId)) {
    return NextResponse.json(
      { error: "Invalid UPI ID format. Expected format: yourname@upi" },
      { status: 400 }
    )
  }

  const normalizedUpiId = data.upiId.toLowerCase().trim()

  // Check for duplicate UPI ID
  const { data: existing } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("profile_id", userId)
    .eq("upi_id", normalizedUpiId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "This UPI ID is already saved" },
      { status: 400 }
    )
  }

  // Verify UPI ID via Razorpay VPA validation
  // Note: VPA validation requires making a direct API call to Razorpay
  // as the Node SDK may not expose this method directly
  let isVerified = false
  try {
    const razorpay = getRazorpay()
    // Try to validate VPA if the method exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const razorpayAny = razorpay as any
    if (typeof razorpayAny.payments?.validateVpa === "function") {
      const validationResult = await razorpayAny.payments.validateVpa({
        vpa: normalizedUpiId,
      })
      isVerified = validationResult?.success === true
    } else {
      // If validateVpa is not available, use direct API call
      const response = await fetch("https://api.razorpay.com/v1/payments/validate/vpa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        },
        body: JSON.stringify({ vpa: normalizedUpiId }),
      })

      if (response.ok) {
        const result = await response.json()
        isVerified = result?.success === true
      }
    }
  } catch (error) {
    // If Razorpay VPA validation fails or is not available,
    // still allow adding but mark as unverified
    // This is acceptable as the UPI ID will be validated during actual payment
    console.warn("UPI verification skipped or failed:", error)
    isVerified = false
  }

  // Check existing payment methods count
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId)

  const isFirstMethod = (count ?? 0) === 0

  // Insert UPI into database
  const { data: method, error } = await supabase
    .from("payment_methods")
    .insert({
      profile_id: userId,
      method_type: "upi",
      upi_id: normalizedUpiId,
      display_name: normalizedUpiId,
      is_default: isFirstMethod,
      is_verified: isVerified,
    })
    .select()
    .single()

  if (error) {
    console.error("Add UPI error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add UPI ID" },
      { status: 500 }
    )
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: userId,
    action: "payment_method_added",
    action_category: "payment",
    description: `Added UPI ID ${normalizedUpiId}`,
    metadata: {
      method_id: method.id,
      method_type: "upi",
      is_verified: isVerified,
    },
  })

  return NextResponse.json({
    success: true,
    method: {
      id: method.id,
      type: "upi" as const,
      isDefault: method.is_default ?? false,
      isVerified,
      upiId: method.upi_id,
      createdAt: method.created_at,
    },
    verification: isVerified
      ? "UPI ID verified successfully"
      : "UPI ID added but could not be verified. You can still use it for payments.",
  })
}

/**
 * Handle setting a payment method as default
 */
async function handleSetDefault(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: SetDefaultRequest
): Promise<NextResponse> {
  if (!data.methodId) {
    return NextResponse.json(
      { error: "Method ID is required" },
      { status: 400 }
    )
  }

  // Validate method belongs to user
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, method_type")
    .eq("id", data.methodId)
    .eq("profile_id", userId)
    .single()

  if (!method) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 }
    )
  }

  // Unset all defaults for this user
  await supabase
    .from("payment_methods")
    .update({ is_default: false })
    .eq("profile_id", userId)

  // Set new default
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", data.methodId)
    .eq("profile_id", userId)

  if (error) {
    console.error("Set default error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to set default payment method" },
      { status: 500 }
    )
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: userId,
    action: "payment_method_default_changed",
    action_category: "payment",
    description: `Set ${method.method_type} as default payment method`,
    metadata: {
      method_id: data.methodId,
      method_type: method.method_type,
    },
  })

  return NextResponse.json({
    success: true,
    message: "Default payment method updated",
  })
}

/**
 * Handle deleting a payment method
 */
async function handleDelete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: DeleteMethodRequest
): Promise<NextResponse> {
  if (!data.methodId) {
    return NextResponse.json(
      { error: "Method ID is required" },
      { status: 400 }
    )
  }

  // Validate method belongs to user and check if it's default
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, method_type, is_default, display_name")
    .eq("id", data.methodId)
    .eq("profile_id", userId)
    .single()

  if (!method) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 }
    )
  }

  // If deleting default, check if there are other methods
  if (method.is_default) {
    const { count } = await supabase
      .from("payment_methods")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId)

    if ((count ?? 0) > 1) {
      return NextResponse.json(
        { error: "Cannot delete default payment method. Set another method as default first." },
        { status: 400 }
      )
    }
  }

  // Delete the method
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", data.methodId)
    .eq("profile_id", userId)

  if (error) {
    console.error("Delete method error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    )
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: userId,
    action: "payment_method_deleted",
    action_category: "payment",
    description: `Removed ${method.method_type}: ${method.display_name}`,
    metadata: {
      method_id: data.methodId,
      method_type: method.method_type,
    },
  })

  return NextResponse.json({
    success: true,
    message: "Payment method removed",
  })
}

/**
 * DELETE /api/payments/methods
 * Alternative endpoint for deleting a payment method
 */
export async function DELETE(request: NextRequest) {
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

    // Apply rate limiting
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

    // Get method ID from URL search params
    const { searchParams } = new URL(request.url)
    const methodId = searchParams.get("id")

    if (!methodId) {
      return NextResponse.json(
        { error: "Method ID is required" },
        { status: 400 }
      )
    }

    return handleDelete(supabase, user.id, { type: "delete", methodId })
  } catch (error) {
    console.error("Delete payment method error:", error)
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/payments/methods
 * Update a payment method (e.g., set as default)
 */
export async function PATCH(request: NextRequest) {
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

    // Apply rate limiting
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

    const body = await request.json()
    const { methodId, action } = body

    if (!methodId) {
      return NextResponse.json(
        { error: "Method ID is required" },
        { status: 400 }
      )
    }

    if (action === "set_default") {
      return handleSetDefault(supabase, user.id, { type: "set_default", methodId })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Update payment method error:", error)
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    )
  }
}
