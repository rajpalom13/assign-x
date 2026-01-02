"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Payment method types
 */
export type PaymentMethodType = "card" | "upi";

/**
 * Payment method interface matching database schema
 */
export interface PaymentMethod {
  id: string;
  profile_id: string;
  method_type: PaymentMethodType;
  is_default: boolean;
  is_verified: boolean;
  // Card fields
  card_last_four: string | null;
  card_network: string | null;
  card_token: string | null;
  card_type: string | null;
  display_name: string | null;
  // UPI fields
  upi_id: string | null;
  // Bank fields (for UPI)
  bank_name: string | null;
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

/**
 * Data for adding a new card via Razorpay tokenization
 */
export interface AddCardData {
  cardToken: string;
  cardLast4: string;
  cardNetwork: string;
  cardType?: string;
  displayName?: string;
}

/**
 * Data for adding a new UPI ID
 */
export interface AddUPIData {
  upiId: string;
  bankName?: string;
  displayName?: string;
}

/**
 * Get all payment methods for the current user
 * Fetches from payment_methods table
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: methods, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (methods || []).map((method) => ({
    ...method,
    method_type: method.method_type as PaymentMethodType,
    is_default: method.is_default ?? false,
    is_verified: method.is_verified ?? false,
    created_at: method.created_at ?? new Date().toISOString(),
  }));
}

/**
 * Get a single payment method by ID
 */
export async function getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return null;
  }

  const { data: method, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (error || !method) {
    return null;
  }

  return {
    ...method,
    method_type: method.method_type as PaymentMethodType,
    is_default: method.is_default ?? false,
    is_verified: method.is_verified ?? false,
    created_at: method.created_at ?? new Date().toISOString(),
  };
}

/**
 * Get the default payment method for the current user
 */
export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: method, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .single();

  if (error || !method) {
    return null;
  }

  return {
    ...method,
    method_type: method.method_type as PaymentMethodType,
    is_default: method.is_default ?? false,
    is_verified: method.is_verified ?? false,
    created_at: method.created_at ?? new Date().toISOString(),
  };
}

/**
 * Add a new card payment method
 * Stores the Razorpay token (not card details) for tokenized payments
 * Card tokenization should happen on the client via Razorpay Checkout
 */
export async function addCard(data: AddCardData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate required fields
  if (!data.cardToken || data.cardToken.trim().length === 0) {
    return { error: "Card token is required" };
  }
  if (!data.cardLast4 || data.cardLast4.length !== 4) {
    return { error: "Last 4 digits of card are required" };
  }
  if (!data.cardNetwork || data.cardNetwork.trim().length === 0) {
    return { error: "Card network is required" };
  }

  // Check if this is the first payment method (make it default)
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const isFirstMethod = (count ?? 0) === 0;

  // Check for duplicate token
  const { data: existingToken } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("profile_id", user.id)
    .eq("card_token", data.cardToken)
    .single();

  if (existingToken) {
    return { error: "This card is already saved" };
  }

  const { data: method, error } = await supabase
    .from("payment_methods")
    .insert({
      profile_id: user.id,
      method_type: "card",
      card_token: data.cardToken.trim(),
      card_last_four: data.cardLast4,
      card_network: data.cardNetwork.toLowerCase().trim(),
      card_type: data.cardType?.toLowerCase().trim() || "unknown",
      display_name: data.displayName?.trim() || null,
      is_default: isFirstMethod,
      is_verified: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: user.id,
    action: "payment_method_added",
    action_category: "payment",
    description: `Added card ending in ${data.cardLast4}`,
    metadata: {
      method_id: method.id,
      method_type: "card",
      card_network: data.cardNetwork,
    },
  });

  revalidatePath("/payment-methods");
  return { success: true, method };
}

/**
 * Add a new UPI payment method
 * Validates UPI ID format before saving
 */
export async function addUPI(data: AddUPIData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate UPI ID format (must contain @)
  if (!data.upiId || !data.upiId.includes("@")) {
    return { error: "Invalid UPI ID format. Must contain @" };
  }

  const normalizedUpiId = data.upiId.toLowerCase().trim();

  // Validate UPI ID pattern (basic validation)
  const upiPattern = /^[\w.-]+@[\w.-]+$/;
  if (!upiPattern.test(normalizedUpiId)) {
    return { error: "Invalid UPI ID format" };
  }

  // Check for duplicate UPI ID
  const { data: existingUpi } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("profile_id", user.id)
    .eq("upi_id", normalizedUpiId)
    .single();

  if (existingUpi) {
    return { error: "This UPI ID is already saved" };
  }

  // Check if this is the first payment method (make it default)
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const isFirstMethod = (count ?? 0) === 0;

  const { data: method, error } = await supabase
    .from("payment_methods")
    .insert({
      profile_id: user.id,
      method_type: "upi",
      upi_id: normalizedUpiId,
      bank_name: data.bankName?.trim() || null,
      display_name: data.displayName?.trim() || null,
      is_default: isFirstMethod,
      is_verified: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    profile_id: user.id,
    action: "payment_method_added",
    action_category: "payment",
    description: `Added UPI ID ${normalizedUpiId}`,
    metadata: {
      method_id: method.id,
      method_type: "upi",
      upi_id: normalizedUpiId,
    },
  });

  revalidatePath("/payment-methods");
  return { success: true, method };
}

/**
 * Set a payment method as default
 * Removes default status from all other methods
 */
export async function setDefaultPaymentMethod(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { error: "Invalid payment method ID" };
  }

  // Verify method exists and belongs to user
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, method_type")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!method) {
    return { error: "Payment method not found" };
  }

  // Remove default from all user's payment methods
  await supabase
    .from("payment_methods")
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  // Set the selected method as default
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/payment-methods");
  return { success: true };
}

/**
 * Delete a payment method
 * Prevents deletion of default method if other methods exist
 */
export async function deletePaymentMethod(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { error: "Invalid payment method ID" };
  }

  // Get the method to delete
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, is_default, method_type, card_last_four, upi_id")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!method) {
    return { error: "Payment method not found" };
  }

  // Check if trying to delete default with other methods present
  if (method.is_default) {
    const { count } = await supabase
      .from("payment_methods")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id);

    if ((count ?? 0) > 1) {
      return { error: "Set another payment method as default before deleting this one" };
    }
  }

  // Delete the payment method
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Log activity
  const methodDescription = method.method_type === "card"
    ? `card ending in ${method.card_last_four}`
    : `UPI ID ${method.upi_id}`;

  await supabase.from("activity_logs").insert({
    profile_id: user.id,
    action: "payment_method_deleted",
    action_category: "payment",
    description: `Deleted ${methodDescription}`,
    metadata: {
      method_id: id,
      method_type: method.method_type,
    },
  });

  revalidatePath("/payment-methods");
  return { success: true };
}

/**
 * Update payment method display name
 */
export async function updatePaymentMethodName(id: string, displayName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { error: "Invalid payment method ID" };
  }

  // Verify ownership
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!method) {
    return { error: "Payment method not found" };
  }

  const { error } = await supabase
    .from("payment_methods")
    .update({
      display_name: displayName?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/payment-methods");
  return { success: true };
}

/**
 * Check if user has any saved payment methods
 */
export async function hasPaymentMethods(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

  return (count ?? 0) > 0;
}

/**
 * Get count of saved payment methods by type
 */
export async function getPaymentMethodCounts(): Promise<{ cards: number; upi: number; total: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { cards: 0, upi: 0, total: 0 };

  const { data: methods } = await supabase
    .from("payment_methods")
    .select("method_type")
    .eq("profile_id", user.id);

  if (!methods) return { cards: 0, upi: 0, total: 0 };

  const cards = methods.filter((m) => m.method_type === "card").length;
  const upi = methods.filter((m) => m.method_type === "upi").length;

  return { cards, upi, total: methods.length };
}
