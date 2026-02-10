/**
 * @fileoverview Comprehensive mock seed data for supervisor account fallback.
 * Used when Supabase auth/session fails to provide data for dashboard,
 * projects, earnings, and profile pages.
 * @module lib/mock-data/seed
 */

import type {
  Profile,
  Supervisor,
  Wallet,
  WalletTransaction,
  WalletWithTransactions,
  SupervisorWithProfile,
  TransactionType,
  ServiceType,
  ProjectStatus,
} from "@/types/database"

// ---------------------------------------------------------------------------
// Helper constants
// ---------------------------------------------------------------------------

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const MOCK_PROFILE_ID = "mock-profile-001"
const MOCK_SUPERVISOR_ID = "mock-supervisor-001"
const MOCK_WALLET_ID = "mock-wallet-001"

// ---------------------------------------------------------------------------
// 1. MOCK_PROFILE
// ---------------------------------------------------------------------------

export const MOCK_PROFILE: Profile = {
  id: MOCK_PROFILE_ID,
  full_name: "Jasvin Taneja",
  email: "jasvintaneja2307@gmail.com",
  phone: "+91 98765 00001",
  avatar_url: null,
  user_type: "professional",
  city: "New Delhi",
  state: "Delhi",
  country: "India",
  is_active: true,
  is_blocked: false,
  block_reason: null,
  phone_verified: true,
  login_count: 142,
  device_tokens: null,
  deleted_at: null,
  last_login_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - 365 * DAY).toISOString(),
  updated_at: new Date(Date.now() - 2 * DAY).toISOString(),
}

// ---------------------------------------------------------------------------
// 2. MOCK_SUPERVISOR
// ---------------------------------------------------------------------------

export const MOCK_SUPERVISOR: SupervisorWithProfile = {
  id: MOCK_SUPERVISOR_ID,
  profile_id: MOCK_PROFILE_ID,
  qualification: "M.Tech Computer Science",
  years_of_experience: 4,
  average_rating: 4.7,
  total_projects_managed: 47,
  total_earnings: 125600,
  total_reviews: 38,
  is_activated: true,
  is_available: true,
  success_rate: 94,
  average_response_time_hours: 1.8,
  max_concurrent_projects: 10,
  activated_at: new Date(Date.now() - 360 * DAY).toISOString(),
  availability_updated_at: new Date(Date.now() - 1 * HOUR).toISOString(),
  bank_name: "HDFC Bank",
  bank_account_name: "Jasvin Taneja",
  bank_account_number: "XXXX XXXX 4521",
  bank_ifsc_code: "HDFC0001234",
  bank_verified: true,
  upi_id: "jasvin@upi",
  cv_url: null,
  cv_verified: true,
  cv_verified_at: new Date(Date.now() - 350 * DAY).toISOString(),
  cv_verified_by: null,
  created_at: new Date(Date.now() - 365 * DAY).toISOString(),
  updated_at: new Date(Date.now() - 2 * DAY).toISOString(),
  profiles: MOCK_PROFILE,
}

// ---------------------------------------------------------------------------
// 3. MOCK_WALLET
// ---------------------------------------------------------------------------

export const MOCK_WALLET: WalletWithTransactions = {
  id: MOCK_WALLET_ID,
  profile_id: MOCK_PROFILE_ID,
  balance: 6325,
  total_credited: 125600,
  total_debited: 119275,
  total_withdrawn: 115000,
  locked_amount: 0,
  currency: "INR",
  created_at: new Date(Date.now() - 365 * DAY).toISOString(),
  updated_at: new Date(Date.now() - 1 * DAY).toISOString(),
  wallet_transactions: [], // populated below
}

// ---------------------------------------------------------------------------
// 4. MOCK_WALLET_TRANSACTIONS
// ---------------------------------------------------------------------------

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "mock-txn-001",
    wallet_id: MOCK_WALLET_ID,
    amount: 2800,
    balance_before: 3525,
    balance_after: 6325,
    transaction_type: "commission" as TransactionType,
    description: "Commission for AX-00340 - Financial Modeling Report",
    status: "completed",
    created_at: new Date(Date.now() - 1 * DAY).toISOString(),
    reference_id: "mock-proj-comp-006",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-002",
    wallet_id: MOCK_WALLET_ID,
    amount: 3500,
    balance_before: 25,
    balance_after: 3525,
    transaction_type: "project_earning" as TransactionType,
    description: "Project earning for Finance Assignment AX-00338",
    status: "completed",
    created_at: new Date(Date.now() - 3 * DAY).toISOString(),
    reference_id: "mock-proj-comp-005",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-003",
    wallet_id: MOCK_WALLET_ID,
    amount: -3500,
    balance_before: 3525,
    balance_after: 25,
    transaction_type: "withdrawal" as TransactionType,
    description: "Withdrawal to HDFC Bank account ending 4521",
    status: "completed",
    created_at: new Date(Date.now() - 5 * DAY).toISOString(),
    reference_id: "mock-payout-001",
    reference_type: "payout",
    notes: null,
  },
  {
    id: "mock-txn-004",
    wallet_id: MOCK_WALLET_ID,
    amount: 1500,
    balance_before: 2025,
    balance_after: 3525,
    transaction_type: "bonus" as TransactionType,
    description: "Monthly performance bonus - January 2026",
    status: "completed",
    created_at: new Date(Date.now() - 8 * DAY).toISOString(),
    reference_id: "mock-bonus-001",
    reference_type: "bonus",
    notes: null,
  },
  {
    id: "mock-txn-005",
    wallet_id: MOCK_WALLET_ID,
    amount: 2025,
    balance_before: 0,
    balance_after: 2025,
    transaction_type: "commission" as TransactionType,
    description: "Commission for AX-00335 - Marketing Strategy Paper",
    status: "completed",
    created_at: new Date(Date.now() - 12 * DAY).toISOString(),
    reference_id: "mock-proj-comp-004",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-006",
    wallet_id: MOCK_WALLET_ID,
    amount: -5000,
    balance_before: 5000,
    balance_after: 0,
    transaction_type: "withdrawal" as TransactionType,
    description: "Withdrawal to HDFC Bank account ending 4521",
    status: "completed",
    created_at: new Date(Date.now() - 15 * DAY).toISOString(),
    reference_id: "mock-payout-002",
    reference_type: "payout",
    notes: null,
  },
  {
    id: "mock-txn-007",
    wallet_id: MOCK_WALLET_ID,
    amount: 3200,
    balance_before: 1800,
    balance_after: 5000,
    transaction_type: "project_earning" as TransactionType,
    description: "Project earning for Economics Case Study AX-00330",
    status: "completed",
    created_at: new Date(Date.now() - 20 * DAY).toISOString(),
    reference_id: "mock-proj-comp-003",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-008",
    wallet_id: MOCK_WALLET_ID,
    amount: 1800,
    balance_before: 0,
    balance_after: 1800,
    transaction_type: "commission" as TransactionType,
    description: "Commission for AX-00328 - Psychology Research Paper",
    status: "completed",
    created_at: new Date(Date.now() - 25 * DAY).toISOString(),
    reference_id: "mock-proj-comp-002",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-009",
    wallet_id: MOCK_WALLET_ID,
    amount: -8000,
    balance_before: 8000,
    balance_after: 0,
    transaction_type: "withdrawal" as TransactionType,
    description: "Withdrawal to HDFC Bank account ending 4521",
    status: "completed",
    created_at: new Date(Date.now() - 30 * DAY).toISOString(),
    reference_id: "mock-payout-003",
    reference_type: "payout",
    notes: null,
  },
  {
    id: "mock-txn-010",
    wallet_id: MOCK_WALLET_ID,
    amount: 4500,
    balance_before: 3500,
    balance_after: 8000,
    transaction_type: "project_earning" as TransactionType,
    description: "Project earning for Computer Science Assignment AX-00325",
    status: "completed",
    created_at: new Date(Date.now() - 35 * DAY).toISOString(),
    reference_id: "mock-proj-comp-001",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-011",
    wallet_id: MOCK_WALLET_ID,
    amount: 2500,
    balance_before: 1000,
    balance_after: 3500,
    transaction_type: "commission" as TransactionType,
    description: "Commission for AX-00320 - Business Analytics Project",
    status: "completed",
    created_at: new Date(Date.now() - 45 * DAY).toISOString(),
    reference_id: "mock-proj-older-001",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-012",
    wallet_id: MOCK_WALLET_ID,
    amount: 1000,
    balance_before: 0,
    balance_after: 1000,
    transaction_type: "bonus" as TransactionType,
    description: "Referral bonus - New doer onboarding",
    status: "completed",
    created_at: new Date(Date.now() - 55 * DAY).toISOString(),
    reference_id: "mock-bonus-002",
    reference_type: "bonus",
    notes: null,
  },
  {
    id: "mock-txn-013",
    wallet_id: MOCK_WALLET_ID,
    amount: -6500,
    balance_before: 6500,
    balance_after: 0,
    transaction_type: "withdrawal" as TransactionType,
    description: "Withdrawal to HDFC Bank account ending 4521",
    status: "completed",
    created_at: new Date(Date.now() - 60 * DAY).toISOString(),
    reference_id: "mock-payout-004",
    reference_type: "payout",
    notes: null,
  },
  {
    id: "mock-txn-014",
    wallet_id: MOCK_WALLET_ID,
    amount: 3800,
    balance_before: 2700,
    balance_after: 6500,
    transaction_type: "project_earning" as TransactionType,
    description: "Project earning for Engineering Design AX-00315",
    status: "completed",
    created_at: new Date(Date.now() - 65 * DAY).toISOString(),
    reference_id: "mock-proj-older-002",
    reference_type: "project",
    notes: null,
  },
  {
    id: "mock-txn-015",
    wallet_id: MOCK_WALLET_ID,
    amount: 2700,
    balance_before: 0,
    balance_after: 2700,
    transaction_type: "commission" as TransactionType,
    description: "Commission for AX-00310 - Data Science Report",
    status: "completed",
    created_at: new Date(Date.now() - 75 * DAY).toISOString(),
    reference_id: "mock-proj-older-003",
    reference_type: "project",
    notes: null,
  },
]

// Attach transactions to the wallet object
MOCK_WALLET.wallet_transactions = MOCK_WALLET_TRANSACTIONS

// ---------------------------------------------------------------------------
// 5. MOCK_NEW_REQUESTS  (status: "submitted", supervisor_id: null)
// ---------------------------------------------------------------------------

interface MockNewRequest {
  id: string
  project_number: string
  title: string
  status: ProjectStatus
  service_type: ServiceType
  deadline: string
  word_count: number
  page_count: number
  created_at: string
  user_id: string
  subject_id: string
  supervisor_id: null
  profiles: { full_name: string; email: string }
  subjects: { name: string }
}

export const MOCK_NEW_REQUESTS: MockNewRequest[] = [
  {
    id: "mock-req-001",
    project_number: "AX-00345",
    title: "Macroeconomic Analysis of Indian Banking Sector Post-COVID",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 8 * HOUR).toISOString(),
    word_count: 3500,
    page_count: 12,
    created_at: new Date(Date.now() - 2 * HOUR).toISOString(),
    user_id: "mock-student-001",
    subject_id: "mock-subj-econ",
    supervisor_id: null,
    profiles: { full_name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    subjects: { name: "Economics" },
  },
  {
    id: "mock-req-002",
    project_number: "AX-00346",
    title: "Machine Learning Algorithm Comparison for Image Classification",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 48 * HOUR).toISOString(),
    word_count: 5000,
    page_count: 18,
    created_at: new Date(Date.now() - 3 * HOUR).toISOString(),
    user_id: "mock-student-002",
    subject_id: "mock-subj-cs",
    supervisor_id: null,
    profiles: { full_name: "Priya Verma", email: "priya.verma@outlook.com" },
    subjects: { name: "Computer Science" },
  },
  {
    id: "mock-req-003",
    project_number: "AX-00347",
    title: "Digital Marketing Strategy for D2C Fashion Brand",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 36 * HOUR).toISOString(),
    word_count: 2500,
    page_count: 9,
    created_at: new Date(Date.now() - 5 * HOUR).toISOString(),
    user_id: "mock-student-003",
    subject_id: "mock-subj-mkt",
    supervisor_id: null,
    profiles: { full_name: "Rohan Gupta", email: "rohan.gupta@gmail.com" },
    subjects: { name: "Marketing" },
  },
  {
    id: "mock-req-004",
    project_number: "AX-00348",
    title: "Corporate Finance: Startup Valuation Using DCF Method",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 72 * HOUR).toISOString(),
    word_count: 3000,
    page_count: 11,
    created_at: new Date(Date.now() - 6 * HOUR).toISOString(),
    user_id: "mock-student-004",
    subject_id: "mock-subj-fin",
    supervisor_id: null,
    profiles: { full_name: "Ananya Singh", email: "ananya.s@yahoo.com" },
    subjects: { name: "Finance" },
  },
  {
    id: "mock-req-005",
    project_number: "AX-00349",
    title: "Cognitive Behavioral Therapy: Efficacy in Treating Anxiety Disorders",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 5 * DAY).toISOString(),
    word_count: 4200,
    page_count: 15,
    created_at: new Date(Date.now() - 1 * HOUR).toISOString(),
    user_id: "mock-student-005",
    subject_id: "mock-subj-psy",
    supervisor_id: null,
    profiles: { full_name: "Diya Kapoor", email: "diya.kapoor@gmail.com" },
    subjects: { name: "Psychology" },
  },
  {
    id: "mock-req-006",
    project_number: "AX-00350",
    title: "Plagiarism Check for Thermodynamics Research Paper",
    status: "submitted",
    service_type: "plagiarism_check",
    deadline: new Date(Date.now() + 12 * HOUR).toISOString(),
    word_count: 6000,
    page_count: 22,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user_id: "mock-student-006",
    subject_id: "mock-subj-eng",
    supervisor_id: null,
    profiles: { full_name: "Karthik Reddy", email: "karthik.r@gmail.com" },
    subjects: { name: "Engineering" },
  },
  {
    id: "mock-req-007",
    project_number: "AX-00351",
    title: "AI Detection Check for MBA Capstone Project",
    status: "submitted",
    service_type: "ai_detection",
    deadline: new Date(Date.now() + 6 * HOUR).toISOString(),
    word_count: 1500,
    page_count: 5,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    user_id: "mock-student-007",
    subject_id: "mock-subj-mgt",
    supervisor_id: null,
    profiles: { full_name: "Ishita Jain", email: "ishita.jain@outlook.com" },
    subjects: { name: "Management" },
  },
  {
    id: "mock-req-008",
    project_number: "AX-00352",
    title: "Proofreading: Dissertation on Behavioral Economics in India",
    status: "submitted",
    service_type: "proofreading",
    deadline: new Date(Date.now() + 24 * HOUR).toISOString(),
    word_count: 12000,
    page_count: 45,
    created_at: new Date(Date.now() - 2 * HOUR).toISOString(),
    user_id: "mock-student-008",
    subject_id: "mock-subj-econ",
    supervisor_id: null,
    profiles: { full_name: "Vivek Mehta", email: "vivek.mehta@gmail.com" },
    subjects: { name: "Economics" },
  },
  {
    id: "mock-req-009",
    project_number: "AX-00353",
    title: "Expert Opinion: Investment Portfolio Analysis for Mutual Funds",
    status: "submitted",
    service_type: "expert_opinion",
    deadline: new Date(Date.now() + 3 * HOUR).toISOString(),
    word_count: 1000,
    page_count: 4,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    user_id: "mock-student-009",
    subject_id: "mock-subj-fin",
    supervisor_id: null,
    profiles: { full_name: "Neha Agarwal", email: "neha.ag@gmail.com" },
    subjects: { name: "Finance" },
  },
  {
    id: "mock-req-010",
    project_number: "AX-00354",
    title: "Structural Analysis of Reinforced Concrete Beam Design",
    status: "submitted",
    service_type: "new_project",
    deadline: new Date(Date.now() + 96 * HOUR).toISOString(),
    word_count: 2800,
    page_count: 10,
    created_at: new Date(Date.now() - 4 * HOUR).toISOString(),
    user_id: "mock-student-010",
    subject_id: "mock-subj-eng",
    supervisor_id: null,
    profiles: { full_name: "Amit Patel", email: "amit.patel@gmail.com" },
    subjects: { name: "Engineering" },
  },
]

// ---------------------------------------------------------------------------
// 6. MOCK_READY_TO_ASSIGN  (status: "paid", doer_id: null)
// ---------------------------------------------------------------------------

interface MockReadyToAssign {
  id: string
  project_number: string
  title: string
  status: ProjectStatus
  service_type: ServiceType
  deadline: string
  word_count: number
  page_count: number
  created_at: string
  user_id: string
  subject_id: string
  supervisor_id: string
  doer_id: null
  user_quote: number
  doer_payout: number
  supervisor_commission: number
  platform_fee: number
  is_paid: boolean
  paid_at: string
  profiles: { full_name: string; email: string }
  subjects: { name: string }
}

export const MOCK_READY_TO_ASSIGN: MockReadyToAssign[] = [
  {
    id: "mock-ready-001",
    project_number: "AX-00355",
    title: "Organizational Behavior Study: Leadership Styles in Indian MNCs",
    status: "paid",
    service_type: "new_project",
    deadline: new Date(Date.now() + 96 * HOUR).toISOString(),
    word_count: 3800,
    page_count: 13,
    created_at: new Date(Date.now() - 6 * HOUR).toISOString(),
    user_id: "mock-student-001",
    subject_id: "mock-subj-mgt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: null,
    user_quote: 3200,
    doer_payout: 2400,
    supervisor_commission: 480,
    platform_fee: 320,
    is_paid: true,
    paid_at: new Date(Date.now() - 4 * HOUR).toISOString(),
    profiles: { full_name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    subjects: { name: "Management" },
  },
  {
    id: "mock-ready-002",
    project_number: "AX-00356",
    title: "Supply Chain Optimization Using Linear Programming",
    status: "paid",
    service_type: "new_project",
    deadline: new Date(Date.now() + 84 * HOUR).toISOString(),
    word_count: 3000,
    page_count: 10,
    created_at: new Date(Date.now() - 10 * HOUR).toISOString(),
    user_id: "mock-student-003",
    subject_id: "mock-subj-mgt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: null,
    user_quote: 2800,
    doer_payout: 2100,
    supervisor_commission: 420,
    platform_fee: 280,
    is_paid: true,
    paid_at: new Date(Date.now() - 8 * HOUR).toISOString(),
    profiles: { full_name: "Rohan Gupta", email: "rohan.gupta@gmail.com" },
    subjects: { name: "Operations Management" },
  },
  {
    id: "mock-ready-003",
    project_number: "AX-00357",
    title: "Econometrics Analysis of Stock Market Volatility in NSE",
    status: "paid",
    service_type: "new_project",
    deadline: new Date(Date.now() + 120 * HOUR).toISOString(),
    word_count: 5500,
    page_count: 20,
    created_at: new Date(Date.now() - 12 * HOUR).toISOString(),
    user_id: "mock-student-004",
    subject_id: "mock-subj-econ",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: null,
    user_quote: 4500,
    doer_payout: 3375,
    supervisor_commission: 675,
    platform_fee: 450,
    is_paid: true,
    paid_at: new Date(Date.now() - 10 * HOUR).toISOString(),
    profiles: { full_name: "Ananya Singh", email: "ananya.s@yahoo.com" },
    subjects: { name: "Economics" },
  },
]

// ---------------------------------------------------------------------------
// 7. MOCK_IN_PROGRESS  (various in-progress states with doer info)
// ---------------------------------------------------------------------------

interface MockInProgressProject {
  id: string
  project_number: string
  title: string
  status: ProjectStatus
  service_type: ServiceType
  deadline: string
  word_count: number
  page_count: number
  created_at: string
  user_id: string
  subject_id: string
  supervisor_id: string
  doer_id: string
  user_quote: number
  doer_payout: number
  supervisor_commission: number
  platform_fee: number
  is_paid: boolean
  doer_assigned_at: string
  progress_percentage: number
  profiles: { full_name: string; email: string }
  subjects: { name: string }
  doers: { profiles: { full_name: string; email: string } }
}

export const MOCK_IN_PROGRESS: MockInProgressProject[] = [
  {
    id: "mock-ip-001",
    project_number: "AX-00340",
    title: "Financial Accounting Comprehensive Project",
    status: "assigned",
    service_type: "new_project",
    deadline: new Date(Date.now() + 28 * HOUR).toISOString(),
    word_count: 4000,
    page_count: 14,
    created_at: new Date(Date.now() - 4 * DAY).toISOString(),
    user_id: "mock-student-001",
    subject_id: "mock-subj-fin",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-001",
    user_quote: 4200,
    doer_payout: 3150,
    supervisor_commission: 630,
    platform_fee: 420,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 2 * DAY).toISOString(),
    progress_percentage: 15,
    profiles: { full_name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    subjects: { name: "Finance" },
    doers: { profiles: { full_name: "Amit Sharma", email: "amit.sharma@example.com" } },
  },
  {
    id: "mock-ip-002",
    project_number: "AX-00338",
    title: "Marketing Research: Consumer Behavior in Tier-2 Cities",
    status: "in_progress",
    service_type: "new_project",
    deadline: new Date(Date.now() + 15 * HOUR).toISOString(),
    word_count: 3500,
    page_count: 12,
    created_at: new Date(Date.now() - 5 * DAY).toISOString(),
    user_id: "mock-student-003",
    subject_id: "mock-subj-mkt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-002",
    user_quote: 3800,
    doer_payout: 2850,
    supervisor_commission: 570,
    platform_fee: 380,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 3 * DAY).toISOString(),
    progress_percentage: 65,
    profiles: { full_name: "Rohan Gupta", email: "rohan.gupta@gmail.com" },
    subjects: { name: "Marketing" },
    doers: { profiles: { full_name: "Priya Patel", email: "priya.patel@example.com" } },
  },
  {
    id: "mock-ip-003",
    project_number: "AX-00335",
    title: "Data Science Project: Predictive Analytics for E-Commerce",
    status: "in_progress",
    service_type: "new_project",
    deadline: new Date(Date.now() + 60 * HOUR).toISOString(),
    word_count: 2500,
    page_count: 9,
    created_at: new Date(Date.now() - 3 * DAY).toISOString(),
    user_id: "mock-student-002",
    subject_id: "mock-subj-cs",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-003",
    user_quote: 5500,
    doer_payout: 4125,
    supervisor_commission: 825,
    platform_fee: 550,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 2 * DAY).toISOString(),
    progress_percentage: 40,
    profiles: { full_name: "Priya Verma", email: "priya.verma@outlook.com" },
    subjects: { name: "Computer Science" },
    doers: { profiles: { full_name: "Sneha Gupta", email: "sneha.gupta@example.com" } },
  },
  {
    id: "mock-ip-004",
    project_number: "AX-00332",
    title: "International Business Strategy: India-Japan Trade Relations",
    status: "in_progress",
    service_type: "new_project",
    deadline: new Date(Date.now() + 40 * HOUR).toISOString(),
    word_count: 4500,
    page_count: 16,
    created_at: new Date(Date.now() - 6 * DAY).toISOString(),
    user_id: "mock-student-005",
    subject_id: "mock-subj-mgt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-001",
    user_quote: 4800,
    doer_payout: 3600,
    supervisor_commission: 720,
    platform_fee: 480,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 4 * DAY).toISOString(),
    progress_percentage: 78,
    profiles: { full_name: "Diya Kapoor", email: "diya.kapoor@gmail.com" },
    subjects: { name: "International Business" },
    doers: { profiles: { full_name: "Amit Sharma", email: "amit.sharma@example.com" } },
  },
  {
    id: "mock-ip-005",
    project_number: "AX-00328",
    title: "Psychology Research: Impact of Social Media on Adolescent Mental Health",
    status: "in_revision",
    service_type: "new_project",
    deadline: new Date(Date.now() + 10 * HOUR).toISOString(),
    word_count: 3200,
    page_count: 11,
    created_at: new Date(Date.now() - 8 * DAY).toISOString(),
    user_id: "mock-student-009",
    subject_id: "mock-subj-psy",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-004",
    user_quote: 3600,
    doer_payout: 2700,
    supervisor_commission: 540,
    platform_fee: 360,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 6 * DAY).toISOString(),
    progress_percentage: 90,
    profiles: { full_name: "Neha Agarwal", email: "neha.ag@gmail.com" },
    subjects: { name: "Psychology" },
    doers: { profiles: { full_name: "Rahul Verma", email: "rahul.verma@example.com" } },
  },
]

// ---------------------------------------------------------------------------
// 8. MOCK_NEEDS_QC  (status: "submitted_for_qc")
// ---------------------------------------------------------------------------

interface MockNeedsQCProject {
  id: string
  project_number: string
  title: string
  status: ProjectStatus
  service_type: ServiceType
  deadline: string
  word_count: number
  page_count: number
  created_at: string
  user_id: string
  subject_id: string
  supervisor_id: string
  doer_id: string
  user_quote: number
  doer_payout: number
  supervisor_commission: number
  platform_fee: number
  is_paid: boolean
  doer_assigned_at: string
  submitted_for_qc_at: string
  profiles: { full_name: string; email: string }
  subjects: { name: string }
  doers: { profiles: { full_name: string; email: string } }
}

export const MOCK_NEEDS_QC: MockNeedsQCProject[] = [
  {
    id: "mock-qc-001",
    project_number: "AX-00330",
    title: "Operations Management Case Study: Toyota Production System",
    status: "submitted_for_qc",
    service_type: "new_project",
    deadline: new Date(Date.now() + 10 * HOUR).toISOString(),
    word_count: 3200,
    page_count: 11,
    created_at: new Date(Date.now() - 7 * DAY).toISOString(),
    user_id: "mock-student-004",
    subject_id: "mock-subj-mgt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-004",
    user_quote: 3400,
    doer_payout: 2550,
    supervisor_commission: 510,
    platform_fee: 340,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 5 * DAY).toISOString(),
    submitted_for_qc_at: new Date(Date.now() - 3 * HOUR).toISOString(),
    profiles: { full_name: "Ananya Singh", email: "ananya.s@yahoo.com" },
    subjects: { name: "Business Studies" },
    doers: { profiles: { full_name: "Rahul Verma", email: "rahul.verma@example.com" } },
  },
  {
    id: "mock-qc-002",
    project_number: "AX-00325",
    title: "Statistical Modeling: Regression Analysis of Housing Prices",
    status: "submitted_for_qc",
    service_type: "new_project",
    deadline: new Date(Date.now() + 18 * HOUR).toISOString(),
    word_count: 2800,
    page_count: 10,
    created_at: new Date(Date.now() - 6 * DAY).toISOString(),
    user_id: "mock-student-006",
    subject_id: "mock-subj-econ",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-003",
    user_quote: 3000,
    doer_payout: 2250,
    supervisor_commission: 450,
    platform_fee: 300,
    is_paid: true,
    doer_assigned_at: new Date(Date.now() - 4 * DAY).toISOString(),
    submitted_for_qc_at: new Date(Date.now() - 5 * HOUR).toISOString(),
    profiles: { full_name: "Karthik Reddy", email: "karthik.r@gmail.com" },
    subjects: { name: "Statistics" },
    doers: { profiles: { full_name: "Sneha Gupta", email: "sneha.gupta@example.com" } },
  },
]

// ---------------------------------------------------------------------------
// 9. MOCK_COMPLETED  (status: "completed", with completed_at)
// ---------------------------------------------------------------------------

interface MockCompletedProject {
  id: string
  project_number: string
  title: string
  status: ProjectStatus
  service_type: ServiceType
  deadline: string
  word_count: number
  page_count: number
  created_at: string
  completed_at: string
  user_id: string
  subject_id: string
  supervisor_id: string
  doer_id: string
  user_quote: number
  doer_payout: number
  supervisor_commission: number
  platform_fee: number
  is_paid: boolean
  profiles: { full_name: string; email: string }
  subjects: { name: string }
  doers: { profiles: { full_name: string; email: string } }
}

export const MOCK_COMPLETED: MockCompletedProject[] = [
  {
    id: "mock-comp-001",
    project_number: "AX-00320",
    title: "Financial Statement Analysis: Reliance Industries Ltd",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 5 * DAY).toISOString(),
    word_count: 3500,
    page_count: 12,
    created_at: new Date(Date.now() - 15 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 6 * DAY).toISOString(),
    user_id: "mock-student-004",
    subject_id: "mock-subj-fin",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-004",
    user_quote: 3800,
    doer_payout: 2850,
    supervisor_commission: 570,
    platform_fee: 380,
    is_paid: true,
    profiles: { full_name: "Ananya Singh", email: "ananya.s@yahoo.com" },
    subjects: { name: "Finance" },
    doers: { profiles: { full_name: "Rahul Verma", email: "rahul.verma@example.com" } },
  },
  {
    id: "mock-comp-002",
    project_number: "AX-00315",
    title: "Marketing Mix Strategy for FMCG Brand Launch",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 10 * DAY).toISOString(),
    word_count: 2800,
    page_count: 10,
    created_at: new Date(Date.now() - 22 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 11 * DAY).toISOString(),
    user_id: "mock-student-003",
    subject_id: "mock-subj-mkt",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-002",
    user_quote: 3200,
    doer_payout: 2400,
    supervisor_commission: 480,
    platform_fee: 320,
    is_paid: true,
    profiles: { full_name: "Rohan Gupta", email: "rohan.gupta@gmail.com" },
    subjects: { name: "Marketing" },
    doers: { profiles: { full_name: "Priya Patel", email: "priya.patel@example.com" } },
  },
  {
    id: "mock-comp-003",
    project_number: "AX-00310",
    title: "Database Management System Design for Hospital Records",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 15 * DAY).toISOString(),
    word_count: 4500,
    page_count: 16,
    created_at: new Date(Date.now() - 28 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 14 * DAY).toISOString(),
    user_id: "mock-student-002",
    subject_id: "mock-subj-cs",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-003",
    user_quote: 5200,
    doer_payout: 3900,
    supervisor_commission: 780,
    platform_fee: 520,
    is_paid: true,
    profiles: { full_name: "Priya Verma", email: "priya.verma@outlook.com" },
    subjects: { name: "Computer Science" },
    doers: { profiles: { full_name: "Sneha Gupta", email: "sneha.gupta@example.com" } },
  },
  {
    id: "mock-comp-004",
    project_number: "AX-00305",
    title: "Microeconomics: Game Theory Applications in Business Strategy",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 25 * DAY).toISOString(),
    word_count: 3000,
    page_count: 11,
    created_at: new Date(Date.now() - 38 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 26 * DAY).toISOString(),
    user_id: "mock-student-001",
    subject_id: "mock-subj-econ",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-001",
    user_quote: 3500,
    doer_payout: 2625,
    supervisor_commission: 525,
    platform_fee: 350,
    is_paid: true,
    profiles: { full_name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    subjects: { name: "Economics" },
    doers: { profiles: { full_name: "Amit Sharma", email: "amit.sharma@example.com" } },
  },
  {
    id: "mock-comp-005",
    project_number: "AX-00300",
    title: "Fluid Mechanics Lab Report and Analysis",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 35 * DAY).toISOString(),
    word_count: 2200,
    page_count: 8,
    created_at: new Date(Date.now() - 45 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 36 * DAY).toISOString(),
    user_id: "mock-student-010",
    subject_id: "mock-subj-eng",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-005",
    user_quote: 2600,
    doer_payout: 1950,
    supervisor_commission: 390,
    platform_fee: 260,
    is_paid: true,
    profiles: { full_name: "Amit Patel", email: "amit.patel@gmail.com" },
    subjects: { name: "Engineering" },
    doers: { profiles: { full_name: "Vikram Singh", email: "vikram.singh@example.com" } },
  },
  {
    id: "mock-comp-006",
    project_number: "AX-00295",
    title: "Consumer Psychology: Buying Patterns During Festive Season",
    status: "completed",
    service_type: "new_project",
    deadline: new Date(Date.now() - 45 * DAY).toISOString(),
    word_count: 3800,
    page_count: 14,
    created_at: new Date(Date.now() - 56 * DAY).toISOString(),
    completed_at: new Date(Date.now() - 46 * DAY).toISOString(),
    user_id: "mock-student-005",
    subject_id: "mock-subj-psy",
    supervisor_id: MOCK_SUPERVISOR_ID,
    doer_id: "mock-doer-002",
    user_quote: 4000,
    doer_payout: 3000,
    supervisor_commission: 600,
    platform_fee: 400,
    is_paid: true,
    profiles: { full_name: "Diya Kapoor", email: "diya.kapoor@gmail.com" },
    subjects: { name: "Psychology" },
    doers: { profiles: { full_name: "Priya Patel", email: "priya.patel@example.com" } },
  },
]

// ---------------------------------------------------------------------------
// 10. MOCK_SUPERVISOR_STATS
// ---------------------------------------------------------------------------

export const MOCK_SUPERVISOR_STATS: {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  pendingQuotes: number
  totalEarnings: number
  pendingEarnings: number
  averageRating: number
  totalDoers: number
} = {
  totalProjects: 47,
  activeProjects: 5,
  completedProjects: 38,
  pendingQuotes: 8,
  totalEarnings: 125600,
  pendingEarnings: 6325,
  averageRating: 4.7,
  totalDoers: 8,
}

// ---------------------------------------------------------------------------
// 11. MOCK_EARNINGS_STATS
// ---------------------------------------------------------------------------

export const MOCK_EARNINGS_STATS: {
  thisMonth: number
  lastMonth: number
  thisYear: number
  allTime: number
  pendingPayouts: number
  averagePerProject: number
  monthlyGrowth: number
} = {
  thisMonth: 18500,
  lastMonth: 15200,
  thisYear: 98500,
  allTime: 125600,
  pendingPayouts: 2500,
  averagePerProject: 2672,
  monthlyGrowth: 21.7,
}
