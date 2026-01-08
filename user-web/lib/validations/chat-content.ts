/**
 * Chat content validation utility
 * Detects and blocks phone numbers, addresses, and external links
 * to prevent sharing personal/contact information in chats
 */

/**
 * Result of content validation
 */
export interface ContentValidationResult {
  isValid: boolean
  reason?: "phone" | "address" | "link" | "email"
  message?: string
}

/**
 * Phone number patterns for various formats
 * Matches: +91 1234567890, (123) 456-7890, 123-456-7890, 1234567890, etc.
 */
const PHONE_PATTERNS = [
  // International format with country code
  /\+\d{1,4}[\s.-]?\d{5,14}/,
  // Indian phone numbers (10 digits, optionally starting with 0 or +91)
  /(?:\+91|0)?[\s.-]?[6-9]\d{9}/,
  // US/Canada format
  /\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  // Generic 10+ digit numbers
  /\d{10,}/,
  // Numbers with spaces/dashes that look like phone numbers
  /\d{3,4}[\s.-]\d{3,4}[\s.-]\d{3,4}/,
  // WhatsApp style: "call me at" or "contact" followed by numbers
  /(?:call|contact|whatsapp|phone|mobile|number|msg|text|dial)[\s:]*\+?\d[\d\s.-]{7,}/i,
]

/**
 * Address patterns
 * Matches: street addresses, pin codes, house numbers with locality
 */
const ADDRESS_PATTERNS = [
  // Pin codes (Indian format: 6 digits)
  /\b\d{6}\b/,
  // ZIP codes (US format: 5 or 9 digits)
  /\b\d{5}(?:-\d{4})?\b/,
  // Street address indicators
  /\b(?:house|flat|apt|apartment|building|floor|block|sector|plot|street|road|lane|nagar|colony|society|enclave|extension|phase|avenue|boulevard|drive|court|way|place|circle)\b[\s,]*(?:#?\d+|no\.?\s*\d+)?/i,
  // Detailed addresses with numbers
  /\b(?:h\.?no\.?|house\s*no\.?|flat\s*no\.?|door\s*no\.?)\s*[:\-]?\s*\d+/i,
  // Common address formats with locality
  /\d+[\s,/]+(?:[\w\s]+)(?:street|road|lane|avenue|nagar|colony|sector)/i,
  // Location sharing keywords
  /(?:my\s+)?(?:address|location|stay|live|reside|residing)[\s:]+[A-Za-z0-9\s,.-]{10,}/i,
  // Near/opposite/behind location
  /(?:near|opposite|behind|next\s+to|adjacent\s+to|beside)\s+[\w\s]{5,}/i,
]

/**
 * URL/Link patterns
 * Matches: http(s) links, www links, common TLDs
 */
const LINK_PATTERNS = [
  // HTTP/HTTPS URLs
  /https?:\/\/[^\s<>"{}|\\^`[\]]+/i,
  // www URLs
  /www\.[^\s<>"{}|\\^`[\]]+/i,
  // Common domain patterns
  /[a-zA-Z0-9-]+\.(?:com|org|net|io|co|in|edu|gov|info|biz|me|app|dev|xyz|online|site|tech|cloud|store|shop|blog|link|click)\b/i,
  // Shortened URLs
  /(?:bit\.ly|goo\.gl|t\.co|tinyurl\.com|ow\.ly|is\.gd|buff\.ly|cutt\.ly|rb\.gy|short\.io|tr\.im|v\.gd)\/[\w-]+/i,
  // Social media and messaging app links
  /(?:instagram|facebook|twitter|linkedin|telegram|discord|snapchat|tiktok|youtube|whatsapp)\.(?:com|me)\/[\w./-]*/i,
  // Google Drive/Docs/Meet links
  /(?:docs|drive|meet)\.google\.com\/[\w./?=&-]*/i,
  // Zoom/Teams links
  /(?:zoom\.us|teams\.microsoft\.com|teams\.live\.com)\/[\w./?=&-]*/i,
]

/**
 * Email patterns
 */
const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  // Obfuscated emails
  /[a-zA-Z0-9._%+-]+\s*(?:at|@|\[at\])\s*[a-zA-Z0-9.-]+\s*(?:dot|\.)?\s*[a-zA-Z]{2,}/i,
]

/**
 * Check if content contains a phone number
 */
function containsPhoneNumber(content: string): boolean {
  return PHONE_PATTERNS.some((pattern) => pattern.test(content))
}

/**
 * Check if content contains an address
 */
function containsAddress(content: string): boolean {
  return ADDRESS_PATTERNS.some((pattern) => pattern.test(content))
}

/**
 * Check if content contains a link
 */
function containsLink(content: string): boolean {
  return LINK_PATTERNS.some((pattern) => pattern.test(content))
}

/**
 * Check if content contains an email
 */
function containsEmail(content: string): boolean {
  return EMAIL_PATTERNS.some((pattern) => pattern.test(content))
}

/**
 * Validate chat message content
 * Returns validation result with reason if content is blocked
 */
export function validateChatContent(content: string): ContentValidationResult {
  if (!content || typeof content !== "string") {
    return { isValid: true }
  }

  const normalizedContent = content.trim()

  // Check for phone numbers
  if (containsPhoneNumber(normalizedContent)) {
    return {
      isValid: false,
      reason: "phone",
      message: "Sharing phone numbers is not allowed for your safety.",
    }
  }

  // Check for email addresses
  if (containsEmail(normalizedContent)) {
    return {
      isValid: false,
      reason: "email",
      message: "Sharing email addresses is not allowed for your safety.",
    }
  }

  // Check for links
  if (containsLink(normalizedContent)) {
    return {
      isValid: false,
      reason: "link",
      message: "Sharing external links is not allowed for your safety.",
    }
  }

  // Check for addresses
  if (containsAddress(normalizedContent)) {
    return {
      isValid: false,
      reason: "address",
      message: "Sharing addresses is not allowed for your safety.",
    }
  }

  return { isValid: true }
}

/**
 * Get user-friendly error message for validation failure
 */
export function getValidationErrorMessage(result: ContentValidationResult): string {
  if (result.isValid) return ""

  const messages: Record<string, string> = {
    phone: "Phone numbers cannot be shared in chat for your safety. This conversation will be closed.",
    email: "Email addresses cannot be shared in chat for your safety. This conversation will be closed.",
    link: "External links cannot be shared in chat for your safety. This conversation will be closed.",
    address: "Personal addresses cannot be shared in chat for your safety. This conversation will be closed.",
  }

  return messages[result.reason || ""] || result.message || "This content is not allowed."
}
