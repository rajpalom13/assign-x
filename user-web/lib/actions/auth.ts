"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProfileSchema,
  createStudentProfileSchema,
  createProfessionalProfileSchema,
} from "@/lib/validations";
import { createHmac, randomBytes } from "crypto";

/**
 * Sign in with Google OAuth
 * Redirects to Google's OAuth consent screen
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sign out the current user
 * Note: localStorage clearing must be done client-side before calling this
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Get current user session
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get auth user data for onboarding forms
 * Returns email, name, and avatar from OAuth provider metadata
 */
export async function getAuthUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get data from user metadata (set by OAuth provider)
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";
  const email = user.email || "";
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

  // Also check if we have a profile with data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email,
    fullName: profile?.full_name || fullName,
    avatarUrl: profile?.avatar_url || avatarUrl,
  };
}

/**
 * Create or update user profile after signup
 * Includes server-side validation
 */
export async function createProfile(data: {
  fullName: string;
  phone?: string;
  userType: "student" | "professional" | "business";
}) {
  // Validate input data
  const validationResult = createProfileSchema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return { error: `Validation failed: ${errors}` };
  }

  const validatedData = validationResult.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email!,
    full_name: validatedData.fullName,
    phone: validatedData.phone,
    user_type: validatedData.userType,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Failed to create profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Create student profile with additional details
 * Includes server-side validation
 */
export async function createStudentProfile(data: {
  fullName: string;
  dateOfBirth?: string;
  universityId: string;
  courseId: string;
  semester: number;
  yearOfStudy?: number;
  collegeEmail?: string;
  phone: string;
}) {
  // Validate input data
  const validationResult = createStudentProfileSchema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return { error: `Validation failed: ${errors}` };
  }

  const validatedData = validationResult.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Create base profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email!,
    full_name: validatedData.fullName,
    phone: validatedData.phone,
    user_type: "student",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: "Failed to create profile. Please try again." };
  }

  // Create student extension
  const { error: studentError } = await supabase.from("students").upsert({
    profile_id: user.id,
    university_id: validatedData.universityId,
    course_id: validatedData.courseId,
    semester: validatedData.semester,
    year_of_study: validatedData.yearOfStudy,
    college_email: validatedData.collegeEmail || null,
    date_of_birth: validatedData.dateOfBirth,
  });

  if (studentError) {
    return { error: "Failed to create student profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Create professional profile
 * Includes server-side validation
 */
export async function createProfessionalProfile(data: {
  fullName: string;
  industryId: string;
  phone: string;
}) {
  // Validate input data
  const validationResult = createProfessionalProfileSchema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => e.message).join(", ");
    return { error: `Validation failed: ${errors}` };
  }

  const validatedData = validationResult.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Create base profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email!,
    full_name: validatedData.fullName,
    phone: validatedData.phone,
    user_type: "professional",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: "Failed to create profile. Please try again." };
  }

  // Create professional extension
  const { error: profError } = await supabase.from("professionals").upsert({
    profile_id: user.id,
    industry_id: validatedData.industryId,
    professional_type: "job_seeker",
  });

  if (profError) {
    return { error: "Failed to create professional profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Generate Base32 encoded string from bytes
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >>> bits) & 31];
    }
  }

  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }

  return result;
}

/**
 * Decode Base32 string to buffer
 */
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanInput = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleanInput) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate TOTP code from secret
 */
function generateTOTP(secret: string, timeStep = 30): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));

  const key = base32Decode(secret);
  const hmac = createHmac("sha1", key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return String(code % 1000000).padStart(6, "0");
}

/**
 * Generate a new 2FA secret and QR code URL
 */
export async function generate2FASecret() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Generate a random 20-byte secret
  const secretBuffer = randomBytes(20);
  const secret = base32Encode(secretBuffer);

  // Get user email for the label
  const email = user.email || "user";
  const issuer = "AssignX";

  // Generate otpauth URL for QR code
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // Generate QR code URL using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

  return {
    secret,
    qrCodeUrl,
    otpauthUrl,
  };
}

/**
 * Verify a 2FA code against a secret
 */
export async function verify2FACode(secret: string, code: string) {
  // Check current time window and adjacent windows for clock drift
  const currentCode = generateTOTP(secret);
  const prevCode = generateTOTP(secret, 30);

  // Allow 1 step drift
  const time = Math.floor(Date.now() / 1000 / 30);
  const prevTimeBuffer = Buffer.alloc(8);
  prevTimeBuffer.writeBigInt64BE(BigInt(time - 1));
  const key = base32Decode(secret);
  const prevHmac = createHmac("sha1", key);
  prevHmac.update(prevTimeBuffer);
  const prevHash = prevHmac.digest();
  const prevOffset = prevHash[prevHash.length - 1] & 0x0f;
  const prevCodeCalc =
    ((prevHash[prevOffset] & 0x7f) << 24) |
    ((prevHash[prevOffset + 1] & 0xff) << 16) |
    ((prevHash[prevOffset + 2] & 0xff) << 8) |
    (prevHash[prevOffset + 3] & 0xff);
  const prevCodeStr = String(prevCodeCalc % 1000000).padStart(6, "0");

  const isValid = code === currentCode || code === prevCodeStr;

  return { valid: isValid };
}

/**
 * Enable 2FA for the current user
 */
export async function enable2FA(secret: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Store the 2FA secret in the profiles table
  const { error } = await supabase
    .from("profiles")
    .update({
      two_factor_secret: secret,
      two_factor_enabled: true,
      two_factor_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to enable 2FA. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Disable 2FA for the current user
 */
export async function disable2FA() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      two_factor_secret: null,
      two_factor_enabled: false,
      two_factor_verified_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to disable 2FA. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Check if user has 2FA enabled
 */
export async function get2FAStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { enabled: false };
  }

  const { data } = await supabase
    .from("profiles")
    .select("two_factor_enabled, two_factor_verified_at")
    .eq("id", user.id)
    .single();

  return {
    enabled: data?.two_factor_enabled || false,
    verifiedAt: data?.two_factor_verified_at || null,
  };
}
