# Doer Web - Code Review Issues Document

> **Review Date:** December 27, 2025
> **Reviewed By:** Claude Code Assistant
> **Scope:** Database schema alignment, query correctness, and data persistence

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Issues - Missing Database Operations](#critical-issues---missing-database-operations)
3. [TypeScript Type Mismatches](#typescript-type-mismatches)
4. [Service Layer Column Name Errors](#service-layer-column-name-errors)
5. [Auth Service Issues](#auth-service-issues)
6. [Minor Issues](#minor-issues)
7. [What's Working Correctly](#whats-working-correctly)
8. [Fix Priority Matrix](#fix-priority-matrix)

---

## Executive Summary

### Overview
The doer-web application has several critical issues that prevent proper data persistence and could cause runtime errors due to mismatched column names between the TypeScript types/queries and the actual database schema.

### Key Statistics
| Category | Count |
|----------|-------|
| Critical Issues | 4 |
| Type Mismatches | 25+ |
| Wrong Column Names in Services | 15+ |
| Auth Issues | 2 |

### Impact Assessment
- **User Registration Flow**: Data NOT being saved during onboarding/activation
- **Chat Functionality**: Will fail due to wrong column names
- **Training/Quiz System**: Progress not being tracked
- **Wallet Operations**: Incorrect column references

---

## Critical Issues - Missing Database Operations

### Issue #1: Profile Setup Data Not Saved

**File:** `app/(onboarding)/profile-setup/page.tsx`
**Lines:** 15-27
**Severity:** 🔴 CRITICAL

**Current Code:**
```typescript
const handleComplete = async (data: {
  qualification: string
  universityName?: string
  skills: string[]
  subjects: string[]
  experienceLevel: string
}) => {
  // TODO: Save profile data to database
  console.log('Profile setup complete:', data)

  // Navigate to activation flow or dashboard
  router.push(ROUTES.training)
}
```

**Problem:** User profile setup data (qualification, skills, subjects, experience) is only logged to console and never persisted to the database.

**Expected Behavior:** Should call the doerService to:
1. Update the doer record with qualification, experience_level
2. Insert skills into doer_skills table
3. Insert subjects into doer_subjects table

**Database Tables Affected:**
- `doers` - needs `qualification`, `experience_level`, `university_name` update
- `doer_skills` - needs skill insertions
- `doer_subjects` - needs subject insertions

**Required Fix:**
```typescript
const handleComplete = async (data) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get doer record
  const { data: doer } = await supabase
    .from('doers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  // Update doer profile
  await supabase
    .from('doers')
    .update({
      qualification: data.qualification,
      experience_level: data.experienceLevel,
      university_name: data.universityName,
    })
    .eq('id', doer.id)

  // Insert skills
  if (data.skills.length > 0) {
    await supabase.from('doer_skills').insert(
      data.skills.map(skillId => ({
        doer_id: doer.id,
        skill_id: skillId,
        proficiency_level: 'intermediate',
      }))
    )
  }

  // Insert subjects
  if (data.subjects.length > 0) {
    await supabase.from('doer_subjects').insert(
      data.subjects.map(subjectId => ({
        doer_id: doer.id,
        subject_id: subjectId,
      }))
    )
  }

  router.push(ROUTES.training)
}
```

---

### Issue #2: Training Completion Not Saved

**File:** `app/(activation)/training/page.tsx`
**Lines:** 15-21
**Severity:** 🔴 CRITICAL

**Current Code:**
```typescript
const handleComplete = async () => {
  // TODO: Save training completion status to database
  console.log('Training completed')

  // Navigate to quiz
  router.push(ROUTES.quiz)
}
```

**Problem:** Training completion status is never saved to the `doer_activation` table.

**Database Table:** `doer_activation`
- `training_completed` should be set to `true`
- `training_completed_at` should be set to current timestamp

**Required Fix:**
```typescript
const handleComplete = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get doer
  const { data: doer } = await supabase
    .from('doers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  // Update activation status
  await supabase
    .from('doer_activation')
    .update({
      training_completed: true,
      training_completed_at: new Date().toISOString(),
    })
    .eq('doer_id', doer.id)

  router.push(ROUTES.quiz)
}
```

---

### Issue #3: Quiz Results Not Saved

**File:** `app/(activation)/quiz/page.tsx`
**Lines:** 14-20
**Severity:** 🔴 CRITICAL

**Current Code:**
```typescript
const handlePass = async () => {
  // TODO: Save quiz pass status to database
  console.log('Quiz passed')

  // Navigate to bank details
  router.push(ROUTES.bankDetails)
}
```

**Problem:** Quiz pass status is never saved.

**Database Tables Affected:**
- `quiz_attempts` - should record the attempt
- `doer_activation` - should update `quiz_passed`, `quiz_passed_at`, `total_quiz_attempts`

**Required Fix:**
```typescript
const handlePass = async (score: number, totalQuestions: number, answers: Record<string, number>) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doer } = await supabase
    .from('doers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  // Record quiz attempt
  await supabase.from('quiz_attempts').insert({
    profile_id: user.id,
    target_role: 'doer',
    attempt_number: previousAttempts + 1,
    answers,
    total_questions: totalQuestions,
    correct_answers: score,
    score_percentage: (score / totalQuestions) * 100,
    passing_score: 80,
    is_passed: true,
    started_at: quizStartTime,
    completed_at: new Date().toISOString(),
  })

  // Update activation
  await supabase
    .from('doer_activation')
    .update({
      quiz_passed: true,
      quiz_passed_at: new Date().toISOString(),
    })
    .eq('doer_id', doer.id)

  // Increment attempts
  await supabase.rpc('increment_quiz_attempts', { doer_id_param: doer.id })

  router.push(ROUTES.bankDetails)
}
```

---

### Issue #4: Bank Details Not Saved

**File:** `app/(activation)/bank-details/page.tsx`
**Lines:** 15-30
**Severity:** 🔴 CRITICAL

**Current Code:**
```typescript
const handleComplete = async (data: {
  accountHolderName: string
  accountNumber: string
  confirmAccountNumber: string
  ifscCode: string
  upiId?: string
}) => {
  // TODO: Save bank details to database
  console.log('Bank details submitted:', data)

  // Mark onboarding as complete
  localStorage.setItem('hasSeenOnboarding', 'true')

  // Navigate to dashboard
  router.push(ROUTES.dashboard)
}
```

**Problem:** Bank details are only logged and localStorage is set, but data is never saved to database.

**Database Tables Affected:**
- `doers` - bank account fields
- `doer_activation` - `bank_details_added`, `bank_details_added_at`, `is_fully_activated`, `activated_at`

**Required Fix:**
```typescript
const handleComplete = async (data) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doer } = await supabase
    .from('doers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  // Update doer with bank details
  await supabase
    .from('doers')
    .update({
      bank_account_name: data.accountHolderName,
      bank_account_number: data.accountNumber,
      bank_ifsc_code: data.ifscCode,
      upi_id: data.upiId,
      is_activated: true,
      activated_at: new Date().toISOString(),
    })
    .eq('id', doer.id)

  // Complete activation
  await supabase
    .from('doer_activation')
    .update({
      bank_details_added: true,
      bank_details_added_at: new Date().toISOString(),
      is_fully_activated: true,
      activated_at: new Date().toISOString(),
    })
    .eq('doer_id', doer.id)

  router.push(ROUTES.dashboard)
}
```

---

## TypeScript Type Mismatches

### Chat Types (`types/chat.types.ts`)

| Line | Type Field | Database Column | Fix Required |
|------|-----------|-----------------|--------------|
| 54 | `ChatRoom.id` | ✅ Correct | - |
| 55 | `ChatRoom.project_id` | ✅ Correct | - |
| 10-15 | `ChatRoomType` | Enum mismatch | Change values |
| 79 | `ChatMessage.room_id` | `chat_room_id` | Rename field |
| 83-85 | `sender_name`, `sender_avatar` | Don't exist | Remove fields |
| 95 | `is_read` | `read_by` (JSONB) | Different structure |
| 109 | `ChatParticipant.room_id` | `chat_room_id` | Rename field |
| 111 | `ChatParticipant.user_id` | `profile_id` | Rename field |

**ChatRoomType Enum Fix:**
```typescript
// Current (WRONG)
export type ChatRoomType =
  | 'project'
  | 'support'
  | 'group'
  | 'direct'
  | 'system'

// Should be (from database.md)
export type ChatRoomType =
  | 'project_user_supervisor'
  | 'project_supervisor_doer'
  | 'project_all'
  | 'support'
  | 'direct'
```

**ChatMessage Fix:**
```typescript
// Current (WRONG)
export interface ChatMessage {
  id: string
  room_id: string           // WRONG
  sender_id: string
  sender_name: string | null  // DOESN'T EXIST
  sender_avatar: string | null  // DOESN'T EXIST
  message_type: MessageType
  content: string
  file_url: string | null
  file_name: string | null
  is_read: boolean           // WRONG - should be read_by JSONB
  created_at: string
}

// Should be (from database.md)
export interface ChatMessage {
  id: string
  chat_room_id: string
  sender_id: string
  message_type: MessageType
  content: string | null
  file_url: string | null
  file_name: string | null
  file_type: string | null
  file_size_bytes: number | null
  action_type: string | null
  action_metadata: Record<string, unknown> | null
  reply_to_id: string | null
  is_edited: boolean
  edited_at: string | null
  is_deleted: boolean
  deleted_at: string | null
  is_flagged: boolean
  flagged_reason: string | null
  contains_contact_info: boolean
  read_by: Record<string, unknown>  // JSONB array
  delivered_at: string | null
  created_at: string
}
```

---

### Activation Types (`types/activation.types.ts`)

| Line | Type Field | Database Column | Fix Required |
|------|-----------|-----------------|--------------|
| 30 | `TrainingModule.type` | `content_type` | Rename |
| 32 | `TrainingModule.content_url` | `content_url` or `content_html` | ✅ OK |
| 38 | `TrainingModule.order_index` | `sequence_order` | Rename |
| 39 | `TrainingModule.is_required` | `is_mandatory` | Rename |
| 55 | `TrainingProgress.doer_id` | `profile_id` | Rename |
| 82 | `QuizQuestion.correct_answer` | `correct_option_ids` (array) | Change type |
| 86 | `QuizQuestion.difficulty` | Doesn't exist | Remove |
| 87 | `QuizQuestion.order_index` | `sequence_order` | Rename |
| 101 | `QuizAttempt.doer_id` | `profile_id` | Rename |
| 134 | `DoerActivation.quiz_attempts` | `total_quiz_attempts` | Rename |
| 136 | `DoerActivation.bank_details_submitted` | `bank_details_added` | Rename |
| 137 | `DoerActivation.bank_details_submitted_at` | `bank_details_added_at` | Rename |

**TrainingModule Fix:**
```typescript
// Current (WRONG)
export interface TrainingModule {
  id: string
  title: string
  description: string | null
  type: TrainingModuleType        // WRONG
  content_url: string
  thumbnail_url: string | null
  duration_minutes: number | null
  order_index: number             // WRONG
  is_required: boolean            // WRONG
  is_active: boolean
  created_at: string
}

// Should be (from database.md)
export interface TrainingModule {
  id: string
  title: string
  description: string | null
  target_role: string             // NEW - 'doer' | 'supervisor'
  content_type: string            // RENAMED
  content_url: string | null
  content_html: string | null     // NEW
  duration_minutes: number | null
  sequence_order: number          // RENAMED
  is_mandatory: boolean           // RENAMED
  is_active: boolean
  created_at: string
  updated_at: string
}
```

**QuizQuestion Fix:**
```typescript
// Current (WRONG)
export interface QuizQuestion {
  id: string
  question: string
  question_type: QuizQuestionType
  options: string[]
  correct_answer: number          // WRONG - single value
  explanation: string | null
  difficulty: 'easy' | 'medium' | 'hard'  // DOESN'T EXIST
  order_index: number             // WRONG
  is_active: boolean
}

// Should be (from database.md)
export interface QuizQuestion {
  id: string
  target_role: string             // NEW
  question_text: string           // RENAMED from 'question'
  question_type: string
  options: Record<string, unknown>  // JSONB, not string[]
  correct_option_ids: number[]    // RENAMED & changed to array
  explanation: string | null
  points: number                  // NEW
  sequence_order: number | null   // RENAMED
  is_active: boolean
  created_at: string
  updated_at: string
}
```

---

### Finance Types (`types/finance.types.ts`)

| Line | Type Field | Database Column | Fix Required |
|------|-----------|-----------------|--------------|
| 37 | `Wallet.doer_id` | `profile_id` | Rename |
| 41 | `Wallet.locked_balance` | `locked_amount` | Rename |
| 43 | `Wallet.total_earned` | `total_credited` | Rename |
| 63 | `WalletTransaction.doer_id` | Doesn't exist | Remove |
| 66 | `WalletTransaction.type` | `transaction_type` | Rename |

**Wallet Fix:**
```typescript
// Current (WRONG)
export interface Wallet {
  id: string
  doer_id: string           // WRONG
  balance: number
  locked_balance: number    // WRONG
  total_earned: number      // WRONG
  total_withdrawn: number
  currency: string
  created_at: string
  updated_at: string
}

// Should be (from database.md)
export interface Wallet {
  id: string
  profile_id: string        // RENAMED
  balance: number
  currency: string
  total_credited: number    // RENAMED
  total_debited: number     // NEW
  total_withdrawn: number
  locked_amount: number     // RENAMED
  created_at: string
  updated_at: string
}
```

---

### Profile Types (`types/profile.types.ts`)

| Line | Type Field | Database Column | Fix Required |
|------|-----------|-----------------|--------------|
| 26 | `Profile.role` | `user_type` | Rename |
| 176 | `University.email_domain` | `email_domains` (TEXT[]) | Change type |

**Profile Fix:**
```typescript
// Current (WRONG)
export interface Profile {
  // ...
  role: UserRole              // WRONG
  // ...
}

// Should be (from database.md)
export interface Profile {
  // ...
  user_type: string           // RENAMED
  // ...
}
```

---

### Project Types (`types/project.types.ts`)

| Line | Type Field | Database Column | Fix Required |
|------|-----------|-----------------|--------------|
| 197 | `ProjectFile.is_reference` | Doesn't exist | Remove |
| 198 | `ProjectFile.is_deliverable` | Doesn't exist | Remove |
| 195 | `ProjectFile.uploaded_at` | `created_at` | Rename |
| 213 | `ProjectDeliverable.doer_id` | `uploaded_by` | Rename |

**ProjectFile Fix:**
```typescript
// Current (WRONG)
export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  uploaded_at: string         // WRONG
  is_reference: boolean       // DOESN'T EXIST
  is_deliverable: boolean     // DOESN'T EXIST
}

// Should be (from database.md)
export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size_bytes: number | null   // RENAMED
  file_category: string            // NEW - replaces is_reference/is_deliverable
  uploaded_by: string
  created_at: string               // RENAMED
}
```

---

## Service Layer Column Name Errors

### Chat Service (`services/chat.service.ts`)

**Issue 1: Wrong column name `room_id`**
- Lines: 27, 74, 77, 108, 128, 170, 211, 214, 234, 258, 288, 325, 346
- Current: `.eq('room_id', roomId)`
- Should be: `.eq('chat_room_id', roomId)`

**Issue 2: Wrong column name `user_id` for participants**
- Lines: 214, 222, 327
- Current: `.eq('user_id', userId)`
- Should be: `.eq('profile_id', userId)`

**Issue 3: Non-existent columns in message insert**
- Lines: 108-119
```typescript
// Current (WRONG)
.insert({
  room_id: roomId,           // WRONG - should be chat_room_id
  sender_id: senderId,
  sender_name: senderName,   // DOESN'T EXIST
  sender_avatar: senderAvatar || null,  // DOESN'T EXIST
  message_type: 'text' as MessageType,
  content,
  is_read: false,            // WRONG - should use read_by JSONB
})

// Should be
.insert({
  chat_room_id: roomId,
  sender_id: senderId,
  message_type: 'text',
  content,
  read_by: [],               // Empty JSONB array
})
```

---

### Activation Service (`services/activation.service.ts`)

**Issue 1: Wrong column name in order clause**
- Lines: 72, 161
- Current: `.order('order_index', { ascending: true })`
- Should be: `.order('sequence_order', { ascending: true })`

**Issue 2: Wrong column `doer_id` for training_progress**
- Line: 89, 111-116
- Current: `.eq('doer_id', doerId)`
- Should be: `.eq('profile_id', profileId)`

**Issue 3: Wrong column `doer_id` for quiz_attempts**
- Lines: 178, 205-214
- Current: `doer_id: doerId`
- Should be: `profile_id: profileId`

**Issue 4: Missing required fields in quiz_attempts insert**
- Lines: 205-214
```typescript
// Current (WRONG - missing required fields)
.insert({
  doer_id: doerId,                    // WRONG
  score: (score / totalQuestions) * 100,
  total_questions: totalQuestions,
  is_passed: isPassed,
  answers,
  completed_at: new Date().toISOString(),
})

// Should be
.insert({
  profile_id: profileId,              // RENAMED
  target_role: 'doer',                // NEW - required
  attempt_number: attemptNumber,      // NEW - required
  answers,
  total_questions: totalQuestions,
  correct_answers: score,             // NEW - required
  score_percentage: (score / totalQuestions) * 100,
  passing_score: 80,                  // NEW - required
  is_passed: isPassed,
  started_at: startTime,              // NEW - required
  completed_at: new Date().toISOString(),
})
```

---

### Wallet Service (`services/wallet.service.ts`)

**Issue 1: Wrong column names in getEarningsSummary**
- Lines: 183-186
```typescript
// Current (WRONG)
return {
  totalEarnings: Number(wallet.total_earned) || 0,      // WRONG
  pendingPayout: Number(wallet.locked_balance) || 0,   // WRONG
  completedPayouts: Number(wallet.total_withdrawn) || 0,
  currentBalance: Number(wallet.balance) || 0,
}

// Should be
return {
  totalEarnings: Number(wallet.total_credited) || 0,   // RENAMED
  pendingPayout: Number(wallet.locked_amount) || 0,    // RENAMED
  completedPayouts: Number(wallet.total_withdrawn) || 0,
  currentBalance: Number(wallet.balance) || 0,
}
```

---

### Project Service (`services/project.service.ts`)

**Issue 1: Wrong column name for ordering**
- Line: 125
- Current: `.order('uploaded_at', { ascending: false })`
- Should be: `.order('created_at', { ascending: false })`

**Issue 2: Wrong column in deliverable insert**
- Lines: 300-310
```typescript
// Current (WRONG)
.insert({
  project_id: projectId,
  doer_id: doerId,           // WRONG
  file_name: file.name,
  file_url: urlData.publicUrl,
  file_type: file.type,
  file_size: file.size,
  version: nextVersion,
  qc_status: 'pending',
})

// Should be
.insert({
  project_id: projectId,
  uploaded_by: doerId,       // RENAMED
  file_name: file.name,
  file_url: urlData.publicUrl,
  file_type: file.type,
  file_size_bytes: file.size,  // RENAMED
  version: nextVersion,
  qc_status: 'pending',
})
```

---

## Auth Service Issues

### Issue 1: createDoer Missing Required Fields

**File:** `services/auth.service.ts`
**Lines:** 124-141

```typescript
// Current (WRONG - missing NOT NULL fields)
async createDoer(profileId: string): Promise<Doer> {
  const { data, error } = await supabase
    .from('doers')
    .insert({
      profile_id: profileId,
      is_available: false,
      is_activated: false,
      total_earnings: 0,
      total_projects_completed: 0,
      average_rating: 0,
    })
    .select()
    .single()
  // ...
}
```

**Problem:** The `doers` table has `qualification` and `experience_level` as NOT NULL fields, but they're not provided.

**Database Schema (from database.md):**
```
| qualification | VARCHAR(50) | NOT NULL |
| experience_level | VARCHAR(20) | NOT NULL |
```

**Required Fix:**
```typescript
async createDoer(profileId: string): Promise<Doer> {
  const { data, error } = await supabase
    .from('doers')
    .insert({
      profile_id: profileId,
      qualification: 'undergraduate',     // ADD default
      experience_level: 'beginner',       // ADD default
      is_available: false,
      is_activated: false,
      total_earnings: 0,
      total_projects_completed: 0,
      average_rating: 0,
    })
    .select()
    .single()
  // ...
}
```

---

### Issue 2: Hardcoded User Name in Profile Setup

**File:** `app/(onboarding)/profile-setup/page.tsx`
**Line:** 32

```typescript
// Current (WRONG)
return (
  <ProfileSetupForm
    onComplete={handleComplete}
    userName="User"  // HARDCODED
  />
)

// Should be
const { user } = useAuth()
return (
  <ProfileSetupForm
    onComplete={handleComplete}
    userName={user?.full_name || 'User'}
  />
)
```

---

## Minor Issues

### 1. Transaction Type Enum Mismatch

**File:** `types/finance.types.ts` lines 10-21
**Current enum values don't match database enum.**

Database enum `transaction_type`:
```
credit | debit | refund | withdrawal | top_up | project_payment | project_earning | commission | bonus | penalty | reversal
```

Type enum:
```typescript
'project_earning' | 'bonus' | 'referral' | 'adjustment' | 'payout' | 'refund' | 'penalty' | 'tax_deduction' | 'hold' | 'release' | 'chargeback'
```

### 2. Missing profile_id in Wallet Queries

**File:** `services/wallet.service.ts`

The wallet table uses `profile_id`, but queries may be using wrong identifiers.

### 3. Notification Type Mismatch

**File:** `types/chat.types.ts` lines 32-48

Type has different values than database `notification_type` enum.

---

## What's Working Correctly

### Supabase Configuration
- `lib/supabase/client.ts` - Browser client setup ✅
- `lib/supabase/server.ts` - Server client setup ✅
- `lib/supabase/middleware.ts` - Session management ✅

### Authentication Flow
- `app/(auth)/login/page.tsx` - Google OAuth ✅
- `app/auth/callback/route.ts` - OAuth callback with proper checks ✅
- `hooks/useAuth.ts` - Auth state management ✅

### Protected Routes
- Middleware correctly protects dashboard, projects, profile routes ✅
- Redirects unauthenticated users to login ✅

### Dashboard & Profile Queries
- `services/project.service.ts` - Most project queries use correct `doer_id` ✅
- `services/profile.service.ts` - Profile fetching works correctly ✅

---

## Fix Priority Matrix

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 P0 | Profile setup not saving | Users can't complete onboarding | Medium |
| 🔴 P0 | Training completion not saving | Activation flow broken | Low |
| 🔴 P0 | Quiz results not saving | Activation flow broken | Medium |
| 🔴 P0 | Bank details not saving | Users can't get activated | Medium |
| 🟠 P1 | Chat service column names | Chat will fail at runtime | High |
| 🟠 P1 | Activation types mismatch | Queries will fail | Medium |
| 🟠 P1 | createDoer missing fields | New user creation fails | Low |
| 🟡 P2 | Wallet types mismatch | Earnings display wrong | Medium |
| 🟡 P2 | Project deliverable columns | File uploads may fail | Low |
| 🟢 P3 | Profile types mismatch | Minor display issues | Low |
| 🟢 P3 | Enum mismatches | Type safety issues | Medium |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)
1. Fix all 4 activation pages to save data to database
2. Fix createDoer to include required fields

### Phase 2: Service Layer Fixes (1-2 days)
1. Update chat.service.ts with correct column names
2. Update activation.service.ts with correct column names
3. Update wallet.service.ts with correct column names
4. Update project.service.ts with correct column names

### Phase 3: Type Alignment (2-3 days)
1. Update all TypeScript types to match database schema
2. Run TypeScript compiler to catch any breaking changes
3. Update components that use affected types

### Phase 4: Testing
1. Test complete onboarding flow
2. Test activation flow (training → quiz → bank)
3. Test chat functionality
4. Test wallet operations
5. Test project submissions

---

## Appendix: Database Schema Reference

For the complete database schema, refer to `database.md` in the project root.

Key tables affected by these issues:
- `profiles` (user_type, not role)
- `doers` (qualification, experience_level are NOT NULL)
- `doer_activation` (total_quiz_attempts, bank_details_added)
- `training_modules` (sequence_order, content_type, target_role)
- `training_progress` (profile_id, not doer_id)
- `quiz_questions` (sequence_order, correct_option_ids)
- `quiz_attempts` (profile_id, attempt_number, correct_answers, passing_score)
- `chat_rooms` (room_type enum values)
- `chat_messages` (chat_room_id, read_by JSONB)
- `chat_participants` (chat_room_id, profile_id)
- `wallets` (profile_id, total_credited, locked_amount)
- `wallet_transactions` (transaction_type, no doer_id)
- `project_files` (created_at, file_category)
- `project_deliverables` (uploaded_by, file_size_bytes)
