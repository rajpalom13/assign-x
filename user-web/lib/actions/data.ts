"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createProjectSchema,
  fileUploadSchema,
  createSupportTicketSchema,
} from "@/lib/validations";

/**
 * Get current user's profile with related data
 */
export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      students (
        *,
        university:universities (*),
        course:courses (*)
      ),
      professionals (
        *,
        industry:industries (*)
      ),
      wallet:wallets (*)
    `)
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Get user's projects with filtering
 */
export async function getProjects(status?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("projects")
    .select(`
      *,
      subject:subjects (id, name, icon, slug),
      reference_style:reference_styles (id, name, version)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: projects, error } = await query;

  if (error) {
    return [];
  }

  return projects || [];
}

/**
 * Get single project by ID
 */
export async function getProjectById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      subject:subjects (id, name, icon, slug),
      reference_style:reference_styles (id, name, version),
      files:project_files (*),
      deliverables:project_deliverables (*),
      quotes:project_quotes (*),
      revisions:project_revisions (*),
      timeline:project_timeline (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return project;
}

/**
 * Get user's notifications
 */
export async function getNotifications(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return notifications || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Get user's wallet
 */
export async function getWallet() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return wallet;
}

/**
 * Get wallet transactions
 */
export async function getWalletTransactions(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!wallet) return [];

  const { data: transactions, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return transactions || [];
}

/**
 * Get active banners
 */
export async function getBanners(location = "dashboard") {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: banners, error } = await supabase
    .from("banners")
    .select("*")
    .eq("display_location", location)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("display_order", { ascending: true });

  if (error) {
    return [];
  }

  return banners || [];
}

/**
 * Get FAQs
 */
export async function getFAQs(category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: faqs, error } = await query;

  if (error) {
    return [];
  }

  return faqs || [];
}

/**
 * Get support tickets
 */
export async function getSupportTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return tickets || [];
}

/**
 * Create support ticket
 */
export async function createSupportTicket(data: {
  subject: string;
  description: string;
  category?: string;
  projectId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Generate ticket number
  const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      ticket_number: ticketNumber,
      requester_id: user.id,
      subject: data.subject,
      description: data.description,
      category: data.category,
      project_id: data.projectId,
      status: "open",
      priority: "medium",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/support");
  return { success: true, ticket };
}

/**
 * Get universities list
 */
export async function getUniversities() {
  const supabase = await createClient();

  const { data: universities, error } = await supabase
    .from("universities")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return [];
  }

  return universities || [];
}

/**
 * Get courses list
 */
export async function getCourses() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return [];
  }

  return courses || [];
}

/**
 * Get subjects list
 */
export async function getSubjects() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return [];
  }

  return subjects || [];
}

/**
 * Get industries list
 */
export async function getIndustries() {
  const supabase = await createClient();

  const { data: industries, error } = await supabase
    .from("industries")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return [];
  }

  return industries || [];
}

/**
 * Get reference styles
 * Orders by name alphabetically since display_order column doesn't exist
 */
export async function getReferenceStyles() {
  const supabase = await createClient();

  const { data: styles, error } = await supabase
    .from("reference_styles")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return styles || [];
}

/**
 * Submit user feedback
 * Matches user_feedback table schema from database
 */
export async function submitFeedback(data: {
  overallSatisfaction: number;
  feedbackText?: string;
  wouldRecommend?: boolean;
  improvementSuggestions?: string;
  npsScore?: number;
  projectId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_feedback")
    .insert({
      user_id: user.id,
      overall_satisfaction: data.overallSatisfaction,
      feedback_text: data.feedbackText,
      would_recommend: data.wouldRecommend,
      improvement_suggestions: data.improvementSuggestions,
      nps_score: data.npsScore,
      project_id: data.projectId,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Update profile
 */
export async function updateProfile(data: {
  fullName?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone: data.phone,
      city: data.city,
      state: data.state,
      country: data.country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Update student profile
 */
export async function updateStudentProfile(data: {
  universityId?: string;
  courseId?: string;
  semester?: number;
  yearOfStudy?: number;
  expectedGraduationYear?: number;
  studentId?: string;
  dateOfBirth?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("students")
    .update({
      university_id: data.universityId,
      course_id: data.courseId,
      semester: data.semester,
      year_of_study: data.yearOfStudy,
      expected_graduation_year: data.expectedGraduationYear,
      student_id_number: data.studentId,
      date_of_birth: data.dateOfBirth,
    })
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Helper to check if a string is a valid UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Create a new project
 * Handles project creation with server-side validation
 * Supports both UUID and slug identifiers for subjects and reference styles
 */
export async function createProject(data: {
  serviceType: "new_project" | "proofreading" | "plagiarism_check" | "ai_detection" | "expert_opinion";
  title: string;
  subjectId?: string;
  topic?: string;
  wordCount?: number;
  referenceStyleId?: string;
  deadline: string;
  urgencyLevel?: string;
  instructions?: string;
}) {
  // Validate input data
  const validationResult = createProjectSchema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return { error: `Validation failed: ${errors}` };
  }

  const validatedData = validationResult.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Resolve subject ID - lookup by slug if not a UUID
  let resolvedSubjectId: string | null = null;
  if (validatedData.subjectId) {
    if (isUUID(validatedData.subjectId)) {
      resolvedSubjectId = validatedData.subjectId;
    } else {
      // Look up subject by slug
      const { data: subject } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", validatedData.subjectId)
        .eq("is_active", true)
        .single();

      if (subject) {
        resolvedSubjectId = subject.id;
      }
      // If not found, leave as null (optional field)
    }
  }

  // Resolve reference style ID - lookup by slug if not a UUID
  let resolvedReferenceStyleId: string | null = null;
  if (validatedData.referenceStyleId) {
    if (isUUID(validatedData.referenceStyleId)) {
      resolvedReferenceStyleId = validatedData.referenceStyleId;
    } else {
      // Look up reference style by slug (try slug first, then name match)
      const { data: refStyle } = await supabase
        .from("reference_styles")
        .select("id")
        .or(`slug.eq.${validatedData.referenceStyleId},name.ilike.%${validatedData.referenceStyleId}%`)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (refStyle) {
        resolvedReferenceStyleId = refStyle.id;
      }
      // If not found, leave as null (optional field)
    }
  }

  // Generate project number (format: AX-YYYYYY)
  // Note: The database trigger should handle this, but we provide a fallback
  const projectNumber = `AX-${Date.now().toString().slice(-6)}`;

  // Insert project record with validated and resolved data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      project_number: projectNumber,
      service_type: validatedData.serviceType,
      title: validatedData.title,
      subject_id: resolvedSubjectId,
      topic: validatedData.topic || null,
      word_count: validatedData.wordCount || null,
      reference_style_id: resolvedReferenceStyleId,
      deadline: validatedData.deadline,
      specific_instructions: validatedData.instructions || null,
      status: "submitted",
      source: "website",
    })
    .select("id, project_number")
    .single();

  if (projectError) {
    return { error: "Failed to create project. Please try again." };
  }

  revalidatePath("/projects");
  return {
    success: true,
    projectId: project.id,
    projectNumber: project.project_number,
  };
}

/**
 * Upload file for a project
 * Includes file type and size validation
 */
export async function uploadProjectFile(
  projectId: string,
  file: {
    name: string;
    type: string;
    size: number;
    base64Data: string;
  }
) {
  // Validate projectId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    return { error: "Invalid project ID" };
  }

  // Validate file data
  const validationResult = fileUploadSchema.safeParse(file);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return { error: `File validation failed: ${errors}` };
  }

  const validatedFile = validationResult.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify project belongs to user
  const { data: projectOwner } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (!projectOwner || projectOwner.user_id !== user.id) {
    return { error: "Project not found or access denied" };
  }

  // Sanitize file name (remove path separators and special chars)
  const sanitizedFileName = validatedFile.name.replace(/[/\\:*?"<>|]/g, "_");

  // Generate unique file path
  const fileName = `${projectId}/${Date.now()}_${sanitizedFileName}`;
  const filePath = `project-files/${fileName}`;

  // Decode base64 and upload to storage
  const base64 = validatedFile.base64Data.split(",")[1] || validatedFile.base64Data;
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const { error: uploadError } = await supabase.storage
    .from("projects")
    .upload(filePath, bytes, {
      contentType: validatedFile.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: "Failed to upload file. Please try again." };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("projects")
    .getPublicUrl(filePath);

  // Create project_files record
  const { error: fileError } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      file_name: sanitizedFileName,
      file_url: urlData.publicUrl,
      file_type: validatedFile.type,
      file_size_bytes: validatedFile.size,
      file_category: "user_upload",
      uploaded_by: user.id,
    });

  if (fileError) {
    return { error: "Failed to save file record. Please try again." };
  }

  return { success: true, fileUrl: urlData.publicUrl };
}

// =============================================================================
// PAYMENT METHODS ACTIONS
// =============================================================================

/**
 * Payment method type definition (aligned with database schema)
 */
interface PaymentMethodData {
  id: string;
  type: "card" | "upi";
  isDefault: boolean;
  isVerified: boolean;
  // Card fields
  cardLast4?: string | null;
  cardBrand?: string | null;
  cardType?: string | null;
  cardholderName?: string | null;
  bankName?: string | null;
  // UPI fields
  upiId?: string | null;
  createdAt?: string | null;
}

/**
 * Get user's saved payment methods
 * Fetches from Supabase payment_methods table
 */
export async function getPaymentMethods(): Promise<PaymentMethodData[]> {
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

  // Transform database schema to frontend format
  return (methods || []).map((method) => ({
    id: method.id,
    type: method.method_type === "upi" ? "upi" : "card",
    isDefault: method.is_default ?? false,
    isVerified: method.is_verified ?? false,
    cardLast4: method.card_last_four,
    cardBrand: method.card_network,
    cardType: method.card_type,
    cardholderName: method.display_name,
    bankName: method.bank_name,
    upiId: method.upi_id,
    createdAt: method.created_at,
  })) as PaymentMethodData[];
}

/**
 * Add a new card payment method
 * Stores card token and last 4 digits (not full card number)
 */
export async function addCardPaymentMethod(data: {
  cardLast4: string;
  cardBrand?: string;
  cardType?: string;
  cardholderName: string;
  cardToken?: string;
  bankName?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate card details
  if (!data.cardLast4 || data.cardLast4.length !== 4) {
    return { error: "Invalid card last 4 digits" };
  }

  if (!data.cardholderName || data.cardholderName.trim().length < 2) {
    return { error: "Invalid cardholder name" };
  }

  // Check existing payment methods count
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const isFirstMethod = (count ?? 0) === 0;

  const { data: method, error } = await supabase
    .from("payment_methods")
    .insert({
      profile_id: user.id,
      method_type: "card",
      card_last_four: data.cardLast4,
      card_network: data.cardBrand || "unknown",
      card_type: data.cardType || "debit",
      display_name: data.cardholderName.trim(),
      card_token: data.cardToken,
      bank_name: data.bankName,
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
      card_network: data.cardBrand,
    },
  });

  revalidatePath("/payment-methods");

  return {
    success: true,
    method: {
      id: method.id,
      type: "card" as const,
      isDefault: method.is_default ?? false,
      isVerified: true,
      cardLast4: method.card_last_four,
      cardBrand: method.card_network,
      cardholderName: method.display_name,
    },
  };
}

/**
 * Add a new UPI payment method
 * Stores verified UPI ID
 */
export async function addUpiPaymentMethod(data: {
  upiId: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate UPI ID format
  const upiIdPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  if (!data.upiId || !upiIdPattern.test(data.upiId)) {
    return { error: "Invalid UPI ID format" };
  }

  // Check for duplicate UPI ID
  const { data: existing } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("profile_id", user.id)
    .eq("upi_id", data.upiId.toLowerCase())
    .maybeSingle();

  if (existing) {
    return { error: "This UPI ID is already saved" };
  }

  // Check existing payment methods count
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
      upi_id: data.upiId.toLowerCase(),
      display_name: data.upiId.toLowerCase(),
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
    description: `Added UPI ID ${data.upiId}`,
    metadata: {
      method_id: method.id,
      method_type: "upi",
    },
  });

  revalidatePath("/payment-methods");

  return {
    success: true,
    method: {
      id: method.id,
      type: "upi" as const,
      isDefault: method.is_default ?? false,
      isVerified: true,
      upiId: method.upi_id,
    },
  };
}

/**
 * Set a payment method as default
 * Unsets all other methods and sets the specified one as default
 */
export async function setDefaultPaymentMethod(methodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate method belongs to user
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, method_type")
    .eq("id", methodId)
    .eq("profile_id", user.id)
    .single();

  if (!method) {
    return { error: "Payment method not found" };
  }

  // Unset all defaults for this user
  await supabase
    .from("payment_methods")
    .update({ is_default: false })
    .eq("profile_id", user.id);

  // Set new default
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", methodId)
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/payment-methods");
  return { success: true };
}

/**
 * Delete a payment method
 * Prevents deletion if it's the only default method
 */
export async function deletePaymentMethod(methodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get the method to check if it's default
  const { data: method } = await supabase
    .from("payment_methods")
    .select("id, is_default, method_type, card_last_four, upi_id")
    .eq("id", methodId)
    .eq("profile_id", user.id)
    .single();

  if (!method) {
    return { error: "Payment method not found" };
  }

  // Check if this is the only method and it's default
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);

  if (method.is_default && (count ?? 0) > 1) {
    return { error: "Please set another method as default before deleting" };
  }

  // Delete the payment method
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", methodId)
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Log activity
  const methodDesc = method.method_type === "upi"
    ? `UPI ID ${method.upi_id}`
    : `Card ending in ${method.card_last_four}`;

  await supabase.from("activity_logs").insert({
    profile_id: user.id,
    action: "payment_method_removed",
    action_category: "payment",
    description: `Removed ${methodDesc}`,
    metadata: {
      method_id: methodId,
      method_type: method.method_type,
    },
  });

  revalidatePath("/payment-methods");
  return { success: true };
}

/**
 * Get user's default payment method
 * Returns null if no default is set
 */
export async function getDefaultPaymentMethod(): Promise<PaymentMethodData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: method, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  if (error || !method) {
    return null;
  }

  return {
    id: method.id,
    type: method.method_type === "upi" ? "upi" : "card",
    isDefault: true,
    isVerified: method.is_verified ?? false,
    cardLast4: method.card_last_four,
    cardBrand: method.card_network,
    cardType: method.card_type,
    cardholderName: method.display_name,
    bankName: method.bank_name,
    upiId: method.upi_id,
    createdAt: method.created_at,
  };
}

// =============================================================================
// USER PREFERENCES ACTIONS
// =============================================================================

/**
 * Notification preferences structure (matches frontend interface)
 */
interface NotificationPreferencesData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  projectUpdates: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

/**
 * User preferences data structure (matches frontend interface)
 */
interface UserPreferencesData {
  id?: string;
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr";
  notifications: NotificationPreferencesData;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Default preferences when not set in database
 */
const defaultPreferences: Omit<UserPreferencesData, "id" | "createdAt" | "updatedAt"> = {
  theme: "system",
  language: "en",
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    projectUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
  },
};

/**
 * Get user's preferences
 * Returns default preferences if none are stored in database
 */
export async function getUserPreferences(): Promise<UserPreferencesData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return defaultPreferences as UserPreferencesData;
  }

  const { data: preferences, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !preferences) {
    // Return defaults if no preferences found
    return defaultPreferences as UserPreferencesData;
  }

  // Transform database format to frontend format
  return {
    id: preferences.id,
    theme: preferences.theme || defaultPreferences.theme,
    language: preferences.language || defaultPreferences.language,
    notifications: preferences.notifications || defaultPreferences.notifications,
    createdAt: preferences.created_at,
    updatedAt: preferences.updated_at,
  };
}

/**
 * Update user preferences
 * Creates preferences if they don't exist (upsert)
 */
export async function updateUserPreferences(data: {
  theme?: "light" | "dark" | "system";
  language?: "en" | "es" | "fr";
  notifications?: Partial<NotificationPreferencesData>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get existing preferences to merge with updates
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const now = new Date().toISOString();

  // Merge notifications with existing or defaults
  const currentNotifications = existing?.notifications || defaultPreferences.notifications;
  const mergedNotifications = data.notifications
    ? { ...currentNotifications, ...data.notifications }
    : currentNotifications;

  if (existing) {
    // Update existing preferences
    const { error } = await supabase
      .from("user_preferences")
      .update({
        theme: data.theme || existing.theme,
        language: data.language || existing.language,
        notifications: mergedNotifications,
        updated_at: now,
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new preferences record
    const { error } = await supabase
      .from("user_preferences")
      .insert({
        user_id: user.id,
        theme: data.theme || defaultPreferences.theme,
        language: data.language || defaultPreferences.language,
        notifications: mergedNotifications,
        created_at: now,
        updated_at: now,
      });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Update theme preference only
 * Convenience method for theme toggle
 */
export async function updateThemePreference(theme: "light" | "dark" | "system") {
  return updateUserPreferences({ theme });
}

/**
 * Update language preference only
 * Convenience method for language selector
 */
export async function updateLanguagePreference(language: "en" | "es" | "fr") {
  return updateUserPreferences({ language });
}

/**
 * Update notification preferences
 * Convenience method for notification settings
 */
export async function updateNotificationPreferences(
  notifications: Partial<NotificationPreferencesData>
) {
  return updateUserPreferences({ notifications });
}

/**
 * Reset user preferences to defaults
 * Deletes the user_preferences record, falling back to defaults
 */
export async function resetUserPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_preferences")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
