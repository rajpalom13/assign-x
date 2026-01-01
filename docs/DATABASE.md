# AssignX Database Documentation

> **Database:** Supabase (PostgreSQL 15+)
> **Authentication:** Supabase Auth + Google OAuth
> **Version:** 1.2
> **Last Updated:** January 2, 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Statistics](#2-database-statistics)
3. [ENUM Types](#3-enum-types)
4. [Tables by Category](#4-tables-by-category)
   - [Core/Auth Tables](#41-coreauth-tables)
   - [Configuration Tables](#42-configuration-tables)
   - [Project & Workflow Tables](#43-project--workflow-tables)
   - [Financial Tables](#44-financial-tables)
   - [Chat & Communication Tables](#45-chat--communication-tables)
   - [Marketplace Tables](#46-marketplace-tables)
   - [Training & Activation Tables](#47-training--activation-tables)
   - [Reviews & Ratings Tables](#48-reviews--ratings-tables)
   - [Support & Audit Tables](#49-support--audit-tables)
5. [Indexes](#5-indexes)
6. [Functions](#6-functions)
7. [Triggers](#7-triggers)
8. [Entity Relationships](#8-entity-relationships)
9. [Seed Data](#9-seed-data)
10. [Security Notes](#10-security-notes)

---

## 1. Overview

AssignX is an academic assistance platform connecting students/professionals with expert doers and supervisors. The database supports:

- **Multi-role user system** (Students, Professionals, Doers, Supervisors, Admins)
- **Project workflow management** with 20 status states
- **Real-time chat** with contact info detection
- **Financial transactions** (wallets, payments, payouts)
- **Marketplace** for student services
- **Training & activation** system for doers/supervisors
- **Reviews & ratings** system

---

## 2. Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 58 |
| ENUM Types | 12 |
| Functions | 8 |
| Triggers | 30+ |
| Indexes | 150+ |

### Tables by Category

| Category | Tables |
|----------|--------|
| Core/Auth | 9 |
| Configuration | 12 |
| Project & Workflow | 9 |
| Financial | 7 |
| Chat & Communication | 4 |
| Marketplace | 4 |
| Training & Activation | 6 |
| Reviews & Ratings | 3 |
| Support & Audit | 4 |

---

## 3. ENUM Types

### 3.1 `project_status`
Tracks the lifecycle of a project through 20 states.

```sql
CREATE TYPE project_status AS ENUM (
    'draft',              -- Initial draft state
    'submitted',          -- User submitted project
    'analyzing',          -- Supervisor analyzing requirements
    'quoted',             -- Quote sent to user
    'payment_pending',    -- Awaiting payment
    'paid',               -- Payment received
    'assigning',          -- Finding a doer
    'assigned',           -- Doer assigned
    'in_progress',        -- Work in progress
    'submitted_for_qc',   -- Submitted for quality check
    'qc_in_progress',     -- QC being performed
    'qc_approved',        -- QC passed
    'qc_rejected',        -- QC failed, needs revision
    'delivered',          -- Delivered to user
    'revision_requested', -- User requested changes
    'in_revision',        -- Revision in progress
    'completed',          -- Successfully completed
    'auto_approved',      -- Auto-approved after 48h
    'cancelled',          -- Project cancelled
    'refunded'            -- Payment refunded
);
```

### 3.2 `service_type`
Types of services offered on the platform.

```sql
CREATE TYPE service_type AS ENUM (
    'new_project',      -- New assignment/project
    'proofreading',     -- Proofreading service
    'plagiarism_check', -- Plagiarism detection
    'ai_detection',     -- AI content detection
    'expert_opinion'    -- Expert consultation
);
```

### 3.3 `transaction_type`
Types of wallet transactions.

```sql
CREATE TYPE transaction_type AS ENUM (
    'credit',           -- Money added
    'debit',            -- Money deducted
    'refund',           -- Refund processed
    'withdrawal',       -- Withdrawal to bank
    'top_up',           -- Wallet top-up
    'project_payment',  -- Payment for project
    'project_earning',  -- Earnings from project
    'commission',       -- Commission earned
    'bonus',            -- Bonus credit
    'penalty',          -- Penalty deduction
    'reversal'          -- Transaction reversal
);
```

### 3.4 `payment_status`
Status of payment transactions.

```sql
CREATE TYPE payment_status AS ENUM (
    'initiated',          -- Payment initiated
    'pending',            -- Awaiting confirmation
    'processing',         -- Being processed
    'completed',          -- Successfully completed
    'failed',             -- Payment failed
    'cancelled',          -- Payment cancelled
    'refunded',           -- Fully refunded
    'partially_refunded'  -- Partially refunded
);
```

### 3.5 `payout_status`
Status of payout to doers/supervisors.

```sql
CREATE TYPE payout_status AS ENUM (
    'pending',     -- Awaiting processing
    'processing',  -- Being processed
    'completed',   -- Successfully sent
    'failed',      -- Payout failed
    'cancelled'    -- Payout cancelled
);
```

### 3.6 `chat_room_type`
Types of chat rooms.

```sql
CREATE TYPE chat_room_type AS ENUM (
    'project_user_supervisor',  -- User <-> Supervisor
    'project_supervisor_doer',  -- Supervisor <-> Doer
    'project_all',              -- All parties
    'support',                  -- Support chat
    'direct'                    -- Direct message
);
```

### 3.7 `message_type`
Types of chat messages.

```sql
CREATE TYPE message_type AS ENUM (
    'text',    -- Text message
    'file',    -- File attachment
    'image',   -- Image attachment
    'system',  -- System notification
    'action'   -- Action message
);
```

### 3.8 `notification_type`
Types of notifications.

```sql
CREATE TYPE notification_type AS ENUM (
    'project_submitted',   -- New project submitted
    'quote_ready',         -- Quote available
    'payment_received',    -- Payment confirmed
    'project_assigned',    -- Project assigned to doer
    'task_available',      -- New task available
    'task_assigned',       -- Task assigned
    'work_submitted',      -- Work submitted for review
    'qc_approved',         -- Quality check passed
    'qc_rejected',         -- Quality check failed
    'revision_requested',  -- Revision needed
    'project_delivered',   -- Project delivered
    'project_completed',   -- Project completed
    'new_message',         -- New chat message
    'payout_processed',    -- Payout completed
    'system_alert',        -- System notification
    'promotional'          -- Promotional message
);
```

### 3.9 `listing_type`
Types of marketplace listings.

```sql
CREATE TYPE listing_type AS ENUM (
    'sell',            -- Item for sale
    'rent',            -- Item for rent
    'free',            -- Free item
    'opportunity',     -- Job/internship
    'housing',         -- Housing listing
    'community_post',  -- Community post
    'poll',            -- Poll
    'event'            -- Event listing
);
```

### 3.10 `listing_status`
Status of marketplace listings.

```sql
CREATE TYPE listing_status AS ENUM (
    'draft',           -- Draft listing
    'pending_review',  -- Awaiting moderation
    'active',          -- Live listing
    'sold',            -- Item sold
    'rented',          -- Item rented
    'expired',         -- Listing expired
    'rejected',        -- Rejected by moderator
    'removed'          -- Removed by user/admin
);
```

### 3.11 `ticket_status`
Status of support tickets.

```sql
CREATE TYPE ticket_status AS ENUM (
    'open',              -- New ticket
    'in_progress',       -- Being handled
    'waiting_response',  -- Awaiting user response
    'resolved',          -- Issue resolved
    'closed',            -- Ticket closed
    'reopened'           -- Reopened by user
);
```

### 3.12 `ticket_priority`
Priority levels for support tickets.

```sql
CREATE TYPE ticket_priority AS ENUM (
    'low',     -- Low priority
    'medium',  -- Medium priority
    'high',    -- High priority
    'urgent'   -- Urgent/Critical
);
```

---

## 4. Tables by Category

### 4.1 Core/Auth Tables

#### `profiles`
Base user table linked to Supabase Auth. All authenticated users have a profile.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK(auth.users) | User ID from Supabase Auth |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email |
| `full_name` | VARCHAR(255) | NOT NULL | Full name |
| `phone` | VARCHAR(20) | | Phone number |
| `phone_verified` | BOOLEAN | DEFAULT FALSE | Phone verification status |
| `avatar_url` | TEXT | | Profile picture URL |
| `user_type` | VARCHAR(20) | NOT NULL | student/professional/doer/supervisor/admin |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `is_blocked` | BOOLEAN | DEFAULT FALSE | Block status |
| `block_reason` | TEXT | | Reason for blocking |
| `city` | VARCHAR(100) | | City |
| `state` | VARCHAR(100) | | State |
| `country` | VARCHAR(100) | DEFAULT 'India' | Country |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |
| `login_count` | INTEGER | DEFAULT 0 | Total login count |
| `device_tokens` | TEXT[] | | Push notification tokens |
| `two_factor_enabled` | BOOLEAN | DEFAULT FALSE | 2FA enabled status |
| `two_factor_secret` | TEXT | | TOTP secret (Base32 encoded) |
| `two_factor_verified_at` | TIMESTAMPTZ | | When 2FA was verified |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |

**Indexes:**
- `idx_profiles_email` - Email lookup
- `idx_profiles_user_type` - Filter by user type
- `idx_profiles_phone` - Phone lookup
- `idx_profiles_city` - Filter by city
- `idx_profiles_is_active` - Active users (partial)
- `idx_profiles_created_at` - Sort by creation date

---

#### `students`
Extension table for student users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Student record ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Link to profiles |
| `university_id` | UUID | FK | University reference |
| `course_id` | UUID | FK | Course reference |
| `semester` | INTEGER | CHECK(1-12) | Current semester |
| `year_of_study` | INTEGER | CHECK(1-6) | Year of study |
| `student_id_number` | VARCHAR(50) | | College ID number |
| `expected_graduation_year` | INTEGER | | Graduation year |
| `college_email` | VARCHAR(255) | | College email address |
| `college_email_verified` | BOOLEAN | DEFAULT FALSE | Email verification |
| `student_id_verified` | BOOLEAN | DEFAULT FALSE | ID verification |
| `preferred_subjects` | UUID[] | | Array of subject IDs |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_students_profile_id` - Profile lookup
- `idx_students_university_id` - University filter
- `idx_students_course_id` - Course filter
- `idx_students_college_email` - Email lookup

---

#### `professionals`
Extension table for professional users (job seekers, business owners).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Professional record ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Link to profiles |
| `professional_type` | VARCHAR(20) | NOT NULL | job_seeker/business/creator |
| `industry_id` | UUID | FK | Industry reference |
| `company_name` | VARCHAR(255) | | Company name |
| `job_title` | VARCHAR(255) | | Current job title |
| `linkedin_url` | TEXT | | LinkedIn profile URL |
| `business_type` | VARCHAR(100) | | Type of business |
| `gst_number` | VARCHAR(20) | | GST number (India) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_professionals_profile_id` - Profile lookup
- `idx_professionals_type` - Type filter
- `idx_professionals_industry_id` - Industry filter

---

#### `doers`
Expert/freelancer table for users who complete assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Doer record ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Link to profiles |
| `qualification` | VARCHAR(50) | NOT NULL | high_school/undergraduate/postgraduate/phd |
| `university_name` | VARCHAR(255) | | University attended |
| `experience_level` | VARCHAR(20) | NOT NULL | beginner/intermediate/pro |
| `years_of_experience` | INTEGER | DEFAULT 0 | Years of experience |
| `bio` | TEXT | | Biography/description |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |
| `availability_updated_at` | TIMESTAMPTZ | | Last availability update |
| `max_concurrent_projects` | INTEGER | DEFAULT 3 | Max active projects |
| `is_activated` | BOOLEAN | DEFAULT FALSE | Activation status |
| `activated_at` | TIMESTAMPTZ | | Activation timestamp |
| `total_projects_completed` | INTEGER | DEFAULT 0 | Completed project count |
| `total_earnings` | DECIMAL(12,2) | DEFAULT 0 | Total earnings |
| `average_rating` | DECIMAL(3,2) | DEFAULT 0 | Average rating (0-5) |
| `total_reviews` | INTEGER | DEFAULT 0 | Total review count |
| `success_rate` | DECIMAL(5,2) | DEFAULT 100 | Success percentage |
| `on_time_delivery_rate` | DECIMAL(5,2) | DEFAULT 100 | On-time delivery % |
| `bank_account_name` | VARCHAR(255) | | Bank account holder name |
| `bank_account_number` | VARCHAR(50) | | Bank account number |
| `bank_ifsc_code` | VARCHAR(20) | | Bank IFSC code |
| `bank_name` | VARCHAR(100) | | Bank name |
| `upi_id` | VARCHAR(100) | | UPI ID |
| `bank_verified` | BOOLEAN | DEFAULT FALSE | Bank verification status |
| `is_flagged` | BOOLEAN | DEFAULT FALSE | Flag status |
| `flag_reason` | TEXT | | Reason for flagging |
| `flagged_by` | UUID | FK | Who flagged |
| `flagged_at` | TIMESTAMPTZ | | When flagged |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_doers_profile_id` - Profile lookup
- `idx_doers_is_available` - Available doers (partial)
- `idx_doers_is_activated` - Activated doers (partial)
- `idx_doers_qualification` - Qualification filter
- `idx_doers_experience_level` - Experience filter
- `idx_doers_average_rating` - Rating sort (DESC)
- `idx_doers_success_rate` - Success rate sort (DESC)
- `idx_doers_is_flagged` - Flagged doers (partial)

---

#### `doer_skills`
Junction table linking doers to their skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Record ID |
| `doer_id` | UUID | NOT NULL, FK | Doer reference |
| `skill_id` | UUID | NOT NULL, FK | Skill reference |
| `proficiency_level` | VARCHAR(20) | DEFAULT 'intermediate' | beginner/intermediate/expert |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Skill verified |
| `verified_at` | TIMESTAMPTZ | | Verification timestamp |
| `verified_by` | UUID | FK | Verifier profile |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:** UNIQUE(doer_id, skill_id)

**Indexes:**
- `idx_doer_skills_doer_id` - Doer lookup
- `idx_doer_skills_skill_id` - Skill lookup
- `idx_doer_skills_is_verified` - Verified skills (partial)

---

#### `doer_subjects`
Junction table linking doers to their subject expertise.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Record ID |
| `doer_id` | UUID | NOT NULL, FK | Doer reference |
| `subject_id` | UUID | NOT NULL, FK | Subject reference |
| `is_primary` | BOOLEAN | DEFAULT FALSE | Primary subject flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:** UNIQUE(doer_id, subject_id)

**Indexes:**
- `idx_doer_subjects_doer_id` - Doer lookup
- `idx_doer_subjects_subject_id` - Subject lookup
- `idx_doer_subjects_is_primary` - Primary subjects (partial)

---

#### `supervisors`
Supervisor/quality manager table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Supervisor record ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Link to profiles |
| `qualification` | VARCHAR(50) | NOT NULL | undergraduate/postgraduate/phd/professional |
| `years_of_experience` | INTEGER | NOT NULL | Years of experience |
| `cv_url` | TEXT | | CV/Resume URL |
| `cv_verified` | BOOLEAN | DEFAULT FALSE | CV verification status |
| `cv_verified_at` | TIMESTAMPTZ | | CV verification timestamp |
| `cv_verified_by` | UUID | FK | Verifier profile |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |
| `availability_updated_at` | TIMESTAMPTZ | | Last availability update |
| `max_concurrent_projects` | INTEGER | DEFAULT 10 | Max active projects |
| `is_activated` | BOOLEAN | DEFAULT FALSE | Activation status |
| `activated_at` | TIMESTAMPTZ | | Activation timestamp |
| `total_projects_managed` | INTEGER | DEFAULT 0 | Total projects managed |
| `total_earnings` | DECIMAL(12,2) | DEFAULT 0 | Total earnings |
| `average_rating` | DECIMAL(3,2) | DEFAULT 0 | Average rating |
| `total_reviews` | INTEGER | DEFAULT 0 | Review count |
| `success_rate` | DECIMAL(5,2) | DEFAULT 100 | Success percentage |
| `average_response_time_hours` | DECIMAL(5,2) | | Avg response time |
| `bank_account_name` | VARCHAR(255) | | Bank account holder |
| `bank_account_number` | VARCHAR(50) | | Account number |
| `bank_ifsc_code` | VARCHAR(20) | | IFSC code |
| `bank_name` | VARCHAR(100) | | Bank name |
| `upi_id` | VARCHAR(100) | | UPI ID |
| `bank_verified` | BOOLEAN | DEFAULT FALSE | Bank verified |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_supervisors_profile_id` - Profile lookup
- `idx_supervisors_is_available` - Available supervisors (partial)
- `idx_supervisors_is_activated` - Activated supervisors (partial)
- `idx_supervisors_average_rating` - Rating sort (DESC)
- `idx_supervisors_success_rate` - Success rate sort (DESC)

---

#### `supervisor_expertise`
Junction table linking supervisors to subject expertise.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Record ID |
| `supervisor_id` | UUID | NOT NULL, FK | Supervisor reference |
| `subject_id` | UUID | NOT NULL, FK | Subject reference |
| `is_primary` | BOOLEAN | DEFAULT FALSE | Primary expertise |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:** UNIQUE(supervisor_id, subject_id)

**Indexes:**
- `idx_supervisor_expertise_supervisor_id` - Supervisor lookup
- `idx_supervisor_expertise_subject_id` - Subject lookup

---

#### `admins`
Admin panel user table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Admin record ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Link to profiles |
| `admin_role` | VARCHAR(50) | NOT NULL | super_admin/admin/moderator/support |
| `permissions` | JSONB | DEFAULT '{}' | Permission object |
| `last_active_at` | TIMESTAMPTZ | | Last activity |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_admins_profile_id` - Profile lookup
- `idx_admins_role` - Role filter

---

### 4.2 Configuration Tables

#### `universities`
Master list of universities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | University ID |
| `name` | VARCHAR(255) | NOT NULL | University name |
| `short_name` | VARCHAR(50) | | Abbreviation |
| `city` | VARCHAR(100) | | City |
| `state` | VARCHAR(100) | | State |
| `country` | VARCHAR(100) | DEFAULT 'India' | Country |
| `email_domains` | TEXT[] | | Valid email domains |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_universities_name` - Name search
- `idx_universities_city` - City filter
- `idx_universities_is_active` - Active universities (partial)
- `idx_universities_email_domains` - Domain lookup (GIN)

---

#### `courses`
Master list of academic courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Course ID |
| `name` | VARCHAR(255) | NOT NULL | Course name |
| `short_name` | VARCHAR(50) | | Abbreviation (B.Tech, MBA) |
| `degree_type` | VARCHAR(50) | | undergraduate/postgraduate/diploma |
| `duration_years` | INTEGER | | Course duration |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_courses_name` - Name search
- `idx_courses_degree_type` - Degree filter
- `idx_courses_is_active` - Active courses (partial)

---

#### `subjects`
Master list of subjects/topics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Subject ID |
| `name` | VARCHAR(255) | NOT NULL | Subject name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug |
| `description` | TEXT | | Description |
| `icon` | VARCHAR(100) | | Icon identifier |
| `parent_id` | UUID | FK(self) | Parent subject |
| `category` | VARCHAR(100) | | academic/professional/creative |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_subjects_slug` - Slug lookup
- `idx_subjects_parent_id` - Parent lookup
- `idx_subjects_category` - Category filter
- `idx_subjects_is_active` - Active subjects (partial)

---

#### `skills`
Master list of skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Skill ID |
| `name` | VARCHAR(100) | NOT NULL | Skill name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug |
| `category` | VARCHAR(100) | | programming/writing/data/etc |
| `subject_id` | UUID | FK | Related subject |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_skills_slug` - Slug lookup
- `idx_skills_category` - Category filter
- `idx_skills_subject_id` - Subject filter
- `idx_skills_is_active` - Active skills (partial)

---

#### `industries`
Master list of industries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Industry ID |
| `name` | VARCHAR(100) | NOT NULL | Industry name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_industries_slug` - Slug lookup
- `idx_industries_is_active` - Active industries (partial)

---

#### `reference_styles`
Citation/reference style formats.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Style ID |
| `name` | VARCHAR(100) | NOT NULL | Style name (APA, Harvard) |
| `slug` | TEXT | UNIQUE | URL-friendly identifier (apa7, harvard) |
| `version` | VARCHAR(50) | | Version (7th Edition) |
| `description` | TEXT | | Description |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_reference_styles_name` - Name search
- `reference_styles_slug_idx` - Slug lookup (unique)

---

#### `referral_codes`
Promo and referral codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Code ID |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | The code string |
| `description` | TEXT | | Description |
| `code_type` | VARCHAR(20) | NOT NULL | referral/promo/campaign |
| `owner_id` | UUID | FK | Code owner (for referrals) |
| `discount_type` | VARCHAR(20) | NOT NULL | percentage/fixed |
| `discount_value` | DECIMAL(10,2) | NOT NULL | Discount amount |
| `max_discount` | DECIMAL(10,2) | | Max discount (for %) |
| `min_order_value` | DECIMAL(10,2) | | Minimum order |
| `max_uses` | INTEGER | | Total usage limit |
| `max_uses_per_user` | INTEGER | DEFAULT 1 | Per-user limit |
| `current_uses` | INTEGER | DEFAULT 0 | Current usage count |
| `valid_from` | TIMESTAMPTZ | DEFAULT NOW() | Start date |
| `valid_until` | TIMESTAMPTZ | | End date |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_referral_codes_code` - Code lookup
- `idx_referral_codes_owner_id` - Owner lookup
- `idx_referral_codes_type` - Type filter
- `idx_referral_codes_is_active` - Active codes (partial)
- `idx_referral_codes_valid` - Valid date range (partial)

---

#### `referral_usage`
Tracks usage of referral/promo codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Usage record ID |
| `referral_code_id` | UUID | NOT NULL, FK | Code used |
| `used_by` | UUID | NOT NULL, FK | User who used it |
| `project_id` | UUID | FK | Related project |
| `payment_id` | UUID | FK | Related payment |
| `discount_applied` | DECIMAL(10,2) | NOT NULL | Discount amount |
| `used_at` | TIMESTAMPTZ | DEFAULT NOW() | Usage timestamp |

**Indexes:**
- `idx_referral_usage_code_id` - Code lookup
- `idx_referral_usage_used_by` - User lookup
- `idx_referral_usage_used_at` - Time sort (DESC)

---

#### `banners`
Promotional banners for the app.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Banner ID |
| `title` | VARCHAR(255) | NOT NULL | Banner title |
| `subtitle` | TEXT | | Subtitle text |
| `image_url` | TEXT | NOT NULL | Desktop image URL |
| `image_url_mobile` | TEXT | | Mobile image URL |
| `cta_text` | VARCHAR(100) | | Button text |
| `cta_url` | TEXT | | Button URL |
| `cta_action` | VARCHAR(50) | | navigate/open_url/open_modal |
| `target_user_types` | TEXT[] | | Target user types |
| `target_roles` | TEXT[] | | Target roles |
| `display_location` | VARCHAR(50) | NOT NULL | home/marketplace/project |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `start_date` | TIMESTAMPTZ | DEFAULT NOW() | Start showing |
| `end_date` | TIMESTAMPTZ | | Stop showing |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `impression_count` | INTEGER | DEFAULT 0 | View count |
| `click_count` | INTEGER | DEFAULT 0 | Click count |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_banners_display_location` - Location filter
- `idx_banners_is_active` - Active banners (partial)
- `idx_banners_schedule` - Date range (partial)
- `idx_banners_target_user_types` - Target filter (GIN)

---

#### `pricing_guides`
Pricing configuration for services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Guide ID |
| `service_type` | service_type | NOT NULL | Service type |
| `subject_id` | UUID | FK | Subject (optional) |
| `base_price_per_page` | DECIMAL(10,2) | | Price per page |
| `base_price_per_word` | DECIMAL(10,4) | | Price per word |
| `base_price_fixed` | DECIMAL(10,2) | | Fixed price |
| `urgency_24h_multiplier` | DECIMAL(3,2) | DEFAULT 1.5 | 24hr multiplier |
| `urgency_48h_multiplier` | DECIMAL(3,2) | DEFAULT 1.3 | 48hr multiplier |
| `urgency_72h_multiplier` | DECIMAL(3,2) | DEFAULT 1.15 | 72hr multiplier |
| `complexity_easy_multiplier` | DECIMAL(3,2) | DEFAULT 1.0 | Easy multiplier |
| `complexity_medium_multiplier` | DECIMAL(3,2) | DEFAULT 1.2 | Medium multiplier |
| `complexity_hard_multiplier` | DECIMAL(3,2) | DEFAULT 1.5 | Hard multiplier |
| `supervisor_percentage` | DECIMAL(5,2) | DEFAULT 15 | Supervisor cut % |
| `platform_percentage` | DECIMAL(5,2) | DEFAULT 20 | Platform cut % |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_pricing_guides_service_type` - Service filter
- `idx_pricing_guides_subject_id` - Subject filter
- `idx_pricing_guides_is_active` - Active guides (partial)

---

#### `app_settings`
Global application settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Setting ID |
| `key` | VARCHAR(100) | NOT NULL, UNIQUE | Setting key |
| `value` | JSONB | NOT NULL | Setting value |
| `description` | TEXT | | Description |
| `category` | VARCHAR(100) | | Category |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_app_settings_key` - Key lookup
- `idx_app_settings_category` - Category filter

---

#### `faqs`
Frequently asked questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | FAQ ID |
| `question` | TEXT | NOT NULL | Question text |
| `answer` | TEXT | NOT NULL | Answer text |
| `category` | VARCHAR(100) | | Category |
| `target_role` | VARCHAR(20) | | user/doer/supervisor/all |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `helpful_count` | INTEGER | DEFAULT 0 | Helpful votes |
| `not_helpful_count` | INTEGER | DEFAULT 0 | Not helpful votes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_faqs_category` - Category filter
- `idx_faqs_target_role` - Role filter
- `idx_faqs_is_active` - Active FAQs (partial)

---

### 4.3 Project & Workflow Tables

#### `projects`
Main projects table - the core of the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Project ID |
| `project_number` | VARCHAR(20) | NOT NULL, UNIQUE | Display number (AX-00001) |
| `user_id` | UUID | NOT NULL, FK | Project owner |
| `service_type` | service_type | NOT NULL | Type of service |
| `title` | VARCHAR(255) | NOT NULL | Project title |
| `subject_id` | UUID | FK | Subject area |
| `topic` | VARCHAR(500) | | Specific topic |
| `description` | TEXT | | Full description |
| `word_count` | INTEGER | | Required word count |
| `page_count` | INTEGER | | Required pages |
| `reference_style_id` | UUID | FK | Citation style |
| `specific_instructions` | TEXT | | Special instructions |
| `focus_areas` | TEXT[] | | Areas to focus on |
| `deadline` | TIMESTAMPTZ | NOT NULL | Current deadline |
| `original_deadline` | TIMESTAMPTZ | | Original deadline |
| `deadline_extended` | BOOLEAN | DEFAULT FALSE | Was extended? |
| `deadline_extension_reason` | TEXT | | Extension reason |
| `status` | project_status | NOT NULL, DEFAULT 'submitted' | Current status |
| `status_updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last status change |
| `supervisor_id` | UUID | FK | Assigned supervisor |
| `supervisor_assigned_at` | TIMESTAMPTZ | | Supervisor assignment time |
| `doer_id` | UUID | FK | Assigned doer |
| `doer_assigned_at` | TIMESTAMPTZ | | Doer assignment time |
| `user_quote` | DECIMAL(10,2) | | Amount user pays |
| `doer_payout` | DECIMAL(10,2) | | Amount doer receives |
| `supervisor_commission` | DECIMAL(10,2) | | Supervisor earnings |
| `platform_fee` | DECIMAL(10,2) | | Platform earnings |
| `is_paid` | BOOLEAN | DEFAULT FALSE | Payment received |
| `paid_at` | TIMESTAMPTZ | | Payment timestamp |
| `payment_id` | UUID | FK | Payment reference |
| `delivered_at` | TIMESTAMPTZ | | Delivery timestamp |
| `expected_delivery_at` | TIMESTAMPTZ | | Expected delivery |
| `auto_approve_at` | TIMESTAMPTZ | | Auto-approval deadline |
| `ai_report_url` | TEXT | | AI detection report |
| `ai_score` | DECIMAL(5,2) | | AI detection score |
| `plagiarism_report_url` | TEXT | | Plagiarism report |
| `plagiarism_score` | DECIMAL(5,2) | | Plagiarism score |
| `live_document_url` | TEXT | | Live Google Docs link |
| `progress_percentage` | INTEGER | DEFAULT 0, CHECK(0-100) | Progress % |
| `completed_at` | TIMESTAMPTZ | | Completion timestamp |
| `completion_notes` | TEXT | | Completion notes |
| `user_approved` | BOOLEAN | | User approval status |
| `user_approved_at` | TIMESTAMPTZ | | Approval timestamp |
| `user_feedback` | TEXT | | User feedback |
| `user_grade` | VARCHAR(10) | | Grade received |
| `cancelled_at` | TIMESTAMPTZ | | Cancellation time |
| `cancelled_by` | UUID | FK | Who cancelled |
| `cancellation_reason` | TEXT | | Reason |
| `source` | VARCHAR(20) | DEFAULT 'app' | app/website |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_projects_project_number` - Number lookup
- `idx_projects_user_id` - User's projects
- `idx_projects_supervisor_id` - Supervisor's projects
- `idx_projects_doer_id` - Doer's projects
- `idx_projects_status` - Status filter
- `idx_projects_service_type` - Service filter
- `idx_projects_subject_id` - Subject filter
- `idx_projects_deadline` - Deadline sort
- `idx_projects_is_paid` - Payment filter
- `idx_projects_created_at` - Creation sort (DESC)
- `idx_projects_status_supervisor` - Supervisor dashboard (partial)
- `idx_projects_status_doer` - Doer dashboard (partial)
- `idx_projects_pending_payment` - Payment reminders (partial)
- `idx_projects_auto_approve` - Auto-approval scheduler (partial)
- `idx_projects_user_status` - User's projects by status
- `idx_projects_doer_active` - Doer's active projects (partial)
- `idx_projects_supervisor_active` - Supervisor's active projects (partial)

---

#### `project_files`
User-uploaded files for projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | File ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `file_name` | VARCHAR(255) | NOT NULL | Original filename |
| `file_url` | TEXT | NOT NULL | Storage URL |
| `file_type` | VARCHAR(50) | | MIME type |
| `file_size_bytes` | BIGINT | | File size |
| `file_category` | VARCHAR(50) | DEFAULT 'reference' | reference/brief/attachment/other |
| `uploaded_by` | UUID | NOT NULL, FK | Uploader |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_project_files_project_id` - Project lookup
- `idx_project_files_uploaded_by` - Uploader lookup

---

#### `project_deliverables`
Completed work files delivered by doers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Deliverable ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `file_name` | VARCHAR(255) | NOT NULL | Filename |
| `file_url` | TEXT | NOT NULL | Storage URL |
| `file_type` | VARCHAR(50) | | MIME type |
| `file_size_bytes` | BIGINT | | File size |
| `version` | INTEGER | DEFAULT 1 | Version number |
| `is_final` | BOOLEAN | DEFAULT FALSE | Final version flag |
| `qc_status` | VARCHAR(20) | DEFAULT 'pending' | pending/approved/rejected |
| `qc_notes` | TEXT | | QC feedback |
| `qc_by` | UUID | FK | QC supervisor |
| `qc_at` | TIMESTAMPTZ | | QC timestamp |
| `uploaded_by` | UUID | NOT NULL, FK | Uploader |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_project_deliverables_project_id` - Project lookup
- `idx_project_deliverables_qc_status` - QC filter
- `idx_project_deliverables_is_final` - Final versions (partial)

---

#### `project_status_history`
Audit trail for project status changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | History ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `from_status` | project_status | | Previous status |
| `to_status` | project_status | NOT NULL | New status |
| `changed_by` | UUID | FK | Who changed it |
| `changed_by_type` | VARCHAR(20) | | user/doer/supervisor/admin/system |
| `notes` | TEXT | | Change notes |
| `metadata` | JSONB | | Additional data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Change timestamp |

**Indexes:**
- `idx_project_status_history_project_id` - Project lookup
- `idx_project_status_history_created_at` - Time sort (DESC)
- `idx_project_status_history_to_status` - Status filter

---

#### `project_revisions`
Revision requests for projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Revision ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `revision_number` | INTEGER | NOT NULL | Revision number |
| `requested_by` | UUID | NOT NULL, FK | Requester |
| `requested_by_type` | VARCHAR(20) | NOT NULL | user/supervisor |
| `feedback` | TEXT | NOT NULL | Feedback text |
| `specific_changes` | TEXT | | Specific changes needed |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending/in_progress/completed/rejected |
| `response_notes` | TEXT | | Response/resolution |
| `completed_at` | TIMESTAMPTZ | | Completion timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_project_revisions_project_id` - Project lookup
- `idx_project_revisions_status` - Status filter
- `idx_project_revisions_requested_by` - Requester lookup

---

#### `project_quotes`
Pricing quotes for projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Quote ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `user_amount` | DECIMAL(10,2) | NOT NULL | User pays |
| `doer_amount` | DECIMAL(10,2) | NOT NULL | Doer receives |
| `supervisor_amount` | DECIMAL(10,2) | NOT NULL | Supervisor cut |
| `platform_amount` | DECIMAL(10,2) | NOT NULL | Platform cut |
| `base_price` | DECIMAL(10,2) | | Base price |
| `urgency_fee` | DECIMAL(10,2) | DEFAULT 0 | Urgency fee |
| `complexity_fee` | DECIMAL(10,2) | DEFAULT 0 | Complexity fee |
| `discount_amount` | DECIMAL(10,2) | DEFAULT 0 | Discount |
| `discount_code` | VARCHAR(50) | | Code used |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending/sent/accepted/rejected/expired |
| `valid_until` | TIMESTAMPTZ | | Expiry time |
| `quoted_by` | UUID | NOT NULL, FK | Supervisor who quoted |
| `responded_at` | TIMESTAMPTZ | | Response timestamp |
| `rejection_reason` | TEXT | | Why rejected |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_project_quotes_project_id` - Project lookup
- `idx_project_quotes_status` - Status filter
- `idx_project_quotes_quoted_by` - Supervisor lookup

---

#### `project_assignments`
Assignment history for projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Assignment ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `assignment_type` | VARCHAR(20) | NOT NULL | supervisor/doer |
| `assignee_id` | UUID | NOT NULL | Assignee ID |
| `assigned_by` | UUID | NOT NULL, FK | Assigner |
| `status` | VARCHAR(20) | DEFAULT 'active' | active/reassigned/completed/cancelled |
| `reassignment_reason` | TEXT | | Why reassigned |
| `assigned_at` | TIMESTAMPTZ | DEFAULT NOW() | Assignment time |
| `ended_at` | TIMESTAMPTZ | | End time |

**Indexes:**
- `idx_project_assignments_project_id` - Project lookup
- `idx_project_assignments_assignee_id` - Assignee lookup
- `idx_project_assignments_type` - Type filter
- `idx_project_assignments_status` - Status filter

---

#### `quality_reports`
AI detection and plagiarism reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Report ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `deliverable_id` | UUID | FK | Deliverable reference |
| `report_type` | VARCHAR(20) | NOT NULL | ai_detection/plagiarism |
| `score` | DECIMAL(5,2) | | Score percentage |
| `result` | VARCHAR(20) | | pass/fail/warning |
| `report_url` | TEXT | | Report URL |
| `details` | JSONB | | Detailed breakdown |
| `generated_by` | UUID | FK | Generator |
| `tool_used` | VARCHAR(100) | | Tool name |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_quality_reports_project_id` - Project lookup
- `idx_quality_reports_deliverable_id` - Deliverable lookup
- `idx_quality_reports_type` - Type filter
- `idx_quality_reports_result` - Result filter

---

#### `project_timeline`
Milestone tracking for projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Timeline ID |
| `project_id` | UUID | NOT NULL, FK | Project reference |
| `milestone_type` | VARCHAR(50) | NOT NULL | Milestone type |
| `milestone_title` | VARCHAR(255) | NOT NULL | Title |
| `description` | TEXT | | Description |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `sequence_order` | INTEGER | NOT NULL | Order |
| `expected_at` | TIMESTAMPTZ | | Expected time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_project_timeline_project_id` - Project lookup
- `idx_project_timeline_is_completed` - Completion filter

---

### 4.4 Financial Tables

#### `wallets`
User wallet for internal balance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Wallet ID |
| `profile_id` | UUID | NOT NULL, UNIQUE, FK | Owner |
| `balance` | DECIMAL(12,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Current balance |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency |
| `total_credited` | DECIMAL(12,2) | DEFAULT 0 | Lifetime credits |
| `total_debited` | DECIMAL(12,2) | DEFAULT 0 | Lifetime debits |
| `total_withdrawn` | DECIMAL(12,2) | DEFAULT 0 | Lifetime withdrawals |
| `locked_amount` | DECIMAL(12,2) | DEFAULT 0 | Locked for pending |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_wallets_profile_id` - Owner lookup
- `idx_wallets_balance` - Balance filter (partial > 0)

---

#### `wallet_transactions`
Transaction history for wallets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Transaction ID |
| `wallet_id` | UUID | NOT NULL, FK | Wallet reference |
| `transaction_type` | transaction_type | NOT NULL | Type |
| `amount` | DECIMAL(12,2) | NOT NULL | Amount |
| `balance_before` | DECIMAL(12,2) | NOT NULL | Balance before |
| `balance_after` | DECIMAL(12,2) | NOT NULL | Balance after |
| `reference_type` | VARCHAR(50) | | Reference entity type |
| `reference_id` | UUID | | Reference entity ID |
| `description` | TEXT | | Description |
| `notes` | TEXT | | Notes |
| `status` | VARCHAR(20) | DEFAULT 'completed' | pending/completed/failed/reversed |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Transaction time |

**Indexes:**
- `idx_wallet_transactions_wallet_id` - Wallet lookup
- `idx_wallet_transactions_type` - Type filter
- `idx_wallet_transactions_reference` - Reference lookup
- `idx_wallet_transactions_created_at` - Time sort (DESC)
- `idx_wallet_transactions_status` - Status filter
- `idx_wallet_transactions_recent` - Recent transactions

---

#### `payments`
Payment records from payment gateway.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Payment ID |
| `user_id` | UUID | NOT NULL, FK | Payer |
| `amount` | DECIMAL(12,2) | NOT NULL | Amount |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency |
| `gateway` | VARCHAR(50) | DEFAULT 'razorpay' | Payment gateway |
| `gateway_order_id` | VARCHAR(255) | | Gateway order ID |
| `gateway_payment_id` | VARCHAR(255) | | Gateway payment ID |
| `gateway_signature` | VARCHAR(255) | | Gateway signature |
| `payment_method` | VARCHAR(50) | | upi/card/netbanking/wallet |
| `payment_method_details` | JSONB | | Method details |
| `reference_type` | VARCHAR(50) | NOT NULL | project/top_up/subscription |
| `reference_id` | UUID | | Reference ID |
| `status` | payment_status | NOT NULL, DEFAULT 'initiated' | Status |
| `failure_reason` | TEXT | | Failure reason |
| `failure_code` | VARCHAR(50) | | Error code |
| `refund_amount` | DECIMAL(12,2) | | Refund amount |
| `refund_id` | VARCHAR(255) | | Refund ID |
| `refunded_at` | TIMESTAMPTZ | | Refund time |
| `refund_reason` | TEXT | | Refund reason |
| `initiated_at` | TIMESTAMPTZ | DEFAULT NOW() | Initiation time |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_payments_user_id` - User lookup
- `idx_payments_status` - Status filter
- `idx_payments_gateway_order_id` - Order lookup
- `idx_payments_gateway_payment_id` - Payment lookup
- `idx_payments_reference` - Reference lookup
- `idx_payments_created_at` - Time sort (DESC)

---

#### `payment_methods`
Saved payment methods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Method ID |
| `profile_id` | UUID | NOT NULL, FK | Owner |
| `method_type` | VARCHAR(20) | NOT NULL | upi/card/netbanking |
| `upi_id` | VARCHAR(100) | | UPI ID |
| `card_last_four` | VARCHAR(4) | | Last 4 digits |
| `card_network` | VARCHAR(20) | | visa/mastercard/rupay |
| `card_type` | VARCHAR(20) | | debit/credit |
| `card_token` | TEXT | | Gateway token |
| `bank_name` | VARCHAR(100) | | Bank name |
| `display_name` | VARCHAR(100) | | Display name |
| `is_default` | BOOLEAN | DEFAULT FALSE | Default method |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Verified |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_payment_methods_profile_id` - Owner lookup
- `idx_payment_methods_is_default` - Default method (partial)

---

#### `payouts`
Payouts to doers/supervisors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Payout ID |
| `recipient_id` | UUID | NOT NULL, FK | Recipient |
| `recipient_type` | VARCHAR(20) | NOT NULL | doer/supervisor |
| `amount` | DECIMAL(12,2) | NOT NULL | Amount |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency |
| `bank_account_name` | VARCHAR(255) | | Account holder |
| `bank_account_number` | VARCHAR(50) | | Account number |
| `bank_ifsc_code` | VARCHAR(20) | | IFSC code |
| `bank_name` | VARCHAR(100) | | Bank name |
| `upi_id` | VARCHAR(100) | | UPI ID |
| `payout_method` | VARCHAR(20) | NOT NULL | bank_transfer/upi |
| `gateway` | VARCHAR(50) | DEFAULT 'razorpay' | Gateway |
| `gateway_payout_id` | VARCHAR(255) | | Gateway payout ID |
| `gateway_reference` | VARCHAR(255) | | Gateway reference |
| `status` | payout_status | NOT NULL, DEFAULT 'pending' | Status |
| `failure_reason` | TEXT | | Failure reason |
| `retry_count` | INTEGER | DEFAULT 0 | Retry count |
| `reference_type` | VARCHAR(50) | | Reference type |
| `reference_ids` | UUID[] | | Reference IDs |
| `requested_at` | TIMESTAMPTZ | DEFAULT NOW() | Request time |
| `processed_at` | TIMESTAMPTZ | | Processing time |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_payouts_recipient_id` - Recipient lookup
- `idx_payouts_recipient_type` - Type filter
- `idx_payouts_status` - Status filter
- `idx_payouts_created_at` - Time sort (DESC)
- `idx_payouts_gateway_payout_id` - Gateway lookup

---

#### `payout_requests`
Withdrawal requests from users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Request ID |
| `profile_id` | UUID | NOT NULL, FK | Requester |
| `requester_type` | VARCHAR(20) | NOT NULL | doer/supervisor |
| `requested_amount` | DECIMAL(12,2) | NOT NULL | Requested amount |
| `approved_amount` | DECIMAL(12,2) | | Approved amount |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending/approved/rejected/processing/completed/cancelled |
| `reviewed_by` | UUID | FK | Reviewer (admin) |
| `reviewed_at` | TIMESTAMPTZ | | Review time |
| `rejection_reason` | TEXT | | Rejection reason |
| `payout_id` | UUID | FK | Linked payout |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_payout_requests_profile_id` - Requester lookup
- `idx_payout_requests_status` - Status filter
- `idx_payout_requests_created_at` - Time sort (DESC)

---

#### `invoices`
Generated invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Invoice ID |
| `invoice_number` | VARCHAR(50) | NOT NULL, UNIQUE | Number (INV-2025-00001) |
| `user_id` | UUID | NOT NULL, FK | Customer |
| `project_id` | UUID | FK | Related project |
| `payment_id` | UUID | FK | Related payment |
| `subtotal` | DECIMAL(12,2) | NOT NULL | Subtotal |
| `tax_amount` | DECIMAL(12,2) | DEFAULT 0 | Tax |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0 | Discount |
| `total_amount` | DECIMAL(12,2) | NOT NULL | Total |
| `tax_rate` | DECIMAL(5,2) | | Tax rate % |
| `tax_type` | VARCHAR(20) | | GST/etc |
| `invoice_date` | DATE | NOT NULL, DEFAULT TODAY | Invoice date |
| `due_date` | DATE | | Due date |
| `status` | VARCHAR(20) | DEFAULT 'generated' | draft/generated/sent/paid/cancelled |
| `pdf_url` | TEXT | | PDF URL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_invoices_invoice_number` - Number lookup
- `idx_invoices_user_id` - Customer lookup
- `idx_invoices_project_id` - Project lookup
- `idx_invoices_status` - Status filter

---

### 4.5 Chat & Communication Tables

#### `chat_rooms`
Chat rooms for project communication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Room ID |
| `room_type` | chat_room_type | NOT NULL | Room type |
| `name` | VARCHAR(255) | | Room name |
| `project_id` | UUID | FK | Linked project |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `is_suspended` | BOOLEAN | DEFAULT FALSE | Suspended |
| `suspended_by` | UUID | FK | Who suspended |
| `suspended_at` | TIMESTAMPTZ | | Suspension time |
| `suspension_reason` | TEXT | | Reason |
| `last_message_at` | TIMESTAMPTZ | | Last message time |
| `message_count` | INTEGER | DEFAULT 0 | Message count |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_chat_rooms_project_id` - Project lookup
- `idx_chat_rooms_room_type` - Type filter
- `idx_chat_rooms_is_active` - Active rooms (partial)
- `idx_chat_rooms_last_message_at` - Recent sort (DESC)

---

#### `chat_participants`
Participants in chat rooms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Participant ID |
| `chat_room_id` | UUID | NOT NULL, FK | Room reference |
| `profile_id` | UUID | NOT NULL, FK | User reference |
| `participant_role` | VARCHAR(20) | NOT NULL | user/doer/supervisor/admin/support |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active in room |
| `left_at` | TIMESTAMPTZ | | Leave time |
| `last_read_at` | TIMESTAMPTZ | | Last read time |
| `unread_count` | INTEGER | DEFAULT 0 | Unread count |
| `notifications_enabled` | BOOLEAN | DEFAULT TRUE | Notifications on |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | Join time |

**Constraints:** UNIQUE(chat_room_id, profile_id)

**Indexes:**
- `idx_chat_participants_room_id` - Room lookup
- `idx_chat_participants_profile_id` - User lookup
- `idx_chat_participants_is_active` - Active participants (partial)

---

#### `chat_messages`
Messages in chat rooms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Message ID |
| `chat_room_id` | UUID | NOT NULL, FK | Room reference |
| `sender_id` | UUID | NOT NULL, FK | Sender |
| `message_type` | message_type | NOT NULL, DEFAULT 'text' | Message type |
| `content` | TEXT | | Text content |
| `file_url` | TEXT | | File URL |
| `file_name` | VARCHAR(255) | | File name |
| `file_type` | VARCHAR(50) | | MIME type |
| `file_size_bytes` | BIGINT | | File size |
| `action_type` | VARCHAR(50) | | Action type |
| `action_metadata` | JSONB | | Action data |
| `reply_to_id` | UUID | FK(self) | Reply reference |
| `is_edited` | BOOLEAN | DEFAULT FALSE | Was edited |
| `edited_at` | TIMESTAMPTZ | | Edit time |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft deleted |
| `deleted_at` | TIMESTAMPTZ | | Delete time |
| `is_flagged` | BOOLEAN | DEFAULT FALSE | Flagged |
| `flagged_reason` | TEXT | | Flag reason |
| `contains_contact_info` | BOOLEAN | DEFAULT FALSE | Auto-detected |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Send time |

**Indexes:**
- `idx_chat_messages_room_id` - Room lookup
- `idx_chat_messages_sender_id` - Sender lookup
- `idx_chat_messages_created_at` - Time sort (DESC)
- `idx_chat_messages_room_created` - Room + time composite
- `idx_chat_messages_is_deleted` - Non-deleted (partial)
- `idx_chat_messages_is_flagged` - Flagged messages (partial)

---

#### `notifications`
Push/in-app notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Notification ID |
| `profile_id` | UUID | NOT NULL, FK | Recipient |
| `notification_type` | notification_type | NOT NULL | Type |
| `title` | VARCHAR(255) | NOT NULL | Title |
| `body` | TEXT | NOT NULL | Body text |
| `reference_type` | VARCHAR(50) | | Reference entity type |
| `reference_id` | UUID | | Reference entity ID |
| `action_url` | TEXT | | Deep link URL |
| `push_sent` | BOOLEAN | DEFAULT FALSE | Push sent |
| `push_sent_at` | TIMESTAMPTZ | | Push time |
| `whatsapp_sent` | BOOLEAN | DEFAULT FALSE | WhatsApp sent |
| `whatsapp_sent_at` | TIMESTAMPTZ | | WhatsApp time |
| `email_sent` | BOOLEAN | DEFAULT FALSE | Email sent |
| `email_sent_at` | TIMESTAMPTZ | | Email time |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `read_at` | TIMESTAMPTZ | | Read time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_notifications_profile_id` - User lookup
- `idx_notifications_type` - Type filter
- `idx_notifications_is_read` - Unread filter (partial)
- `idx_notifications_created_at` - Time sort (DESC)
- `idx_notifications_reference` - Reference lookup
- `idx_notifications_user_unread` - User's unread (partial)

---

### 4.6 Marketplace Tables

#### `marketplace_categories`
Categories for marketplace listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Category ID |
| `name` | VARCHAR(100) | NOT NULL | Name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug |
| `description` | TEXT | | Description |
| `icon` | VARCHAR(100) | | Icon |
| `parent_id` | UUID | FK(self) | Parent category |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_marketplace_categories_slug` - Slug lookup
- `idx_marketplace_categories_parent_id` - Parent lookup
- `idx_marketplace_categories_is_active` - Active (partial)

---

#### `marketplace_listings`
Items/services for sale in marketplace.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Listing ID |
| `seller_id` | UUID | NOT NULL, FK | Seller |
| `listing_type` | listing_type | NOT NULL | Type |
| `category_id` | UUID | FK | Category |
| `title` | VARCHAR(255) | NOT NULL | Title |
| `description` | TEXT | | Description |
| `price` | DECIMAL(10,2) | | Price |
| `price_negotiable` | BOOLEAN | DEFAULT TRUE | Negotiable |
| `rent_period` | VARCHAR(20) | | daily/weekly/monthly |
| `item_condition` | VARCHAR(20) | | new/like_new/good/fair/poor |
| `city` | VARCHAR(100) | | City |
| `university_id` | UUID | FK | University |
| `location_text` | VARCHAR(255) | | Location text |
| `latitude` | DECIMAL(10,8) | | Latitude |
| `longitude` | DECIMAL(11,8) | | Longitude |
| `distance_km` | DECIMAL(5,2) | | Distance (calculated) |
| `housing_type` | VARCHAR(50) | | room/flat/pg/flatmate |
| `bedrooms` | INTEGER | | Bedrooms |
| `available_from` | DATE | | Available date |
| `opportunity_type` | VARCHAR(50) | | internship/job/gig/event |
| `company_name` | VARCHAR(255) | | Company |
| `application_deadline` | DATE | | Deadline |
| `opportunity_url` | TEXT | | Apply URL |
| `post_content` | TEXT | | Community post content |
| `poll_options` | JSONB | | Poll options |
| `poll_ends_at` | TIMESTAMPTZ | | Poll end |
| `status` | listing_status | NOT NULL, DEFAULT 'pending_review' | Status |
| `reviewed_by` | UUID | FK | Reviewer |
| `reviewed_at` | TIMESTAMPTZ | | Review time |
| `rejection_reason` | TEXT | | Rejection reason |
| `view_count` | INTEGER | DEFAULT 0 | Views |
| `inquiry_count` | INTEGER | DEFAULT 0 | Inquiries |
| `expires_at` | TIMESTAMPTZ | | Expiry |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_marketplace_listings_seller_id` - Seller lookup
- `idx_marketplace_listings_type` - Type filter
- `idx_marketplace_listings_category_id` - Category filter
- `idx_marketplace_listings_status` - Status filter
- `idx_marketplace_listings_city` - City filter
- `idx_marketplace_listings_university_id` - University filter
- `idx_marketplace_listings_price` - Price filter
- `idx_marketplace_listings_created_at` - Time sort (DESC)
- `idx_marketplace_listings_active` - Active listings (partial)

---

#### `listing_images`
Images for marketplace listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Image ID |
| `listing_id` | UUID | NOT NULL, FK | Listing reference |
| `image_url` | TEXT | NOT NULL | Image URL |
| `thumbnail_url` | TEXT | | Thumbnail URL |
| `display_order` | INTEGER | DEFAULT 0 | Order |
| `is_primary` | BOOLEAN | DEFAULT FALSE | Primary image |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Upload time |

**Indexes:**
- `idx_listing_images_listing_id` - Listing lookup
- `idx_listing_images_is_primary` - Primary image (partial)

---

#### `listing_inquiries`
Buyer inquiries on listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Inquiry ID |
| `listing_id` | UUID | NOT NULL, FK | Listing reference |
| `inquirer_id` | UUID | NOT NULL, FK | Inquirer |
| `message` | TEXT | | Inquiry message |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending/responded/closed |
| `response` | TEXT | | Seller response |
| `responded_at` | TIMESTAMPTZ | | Response time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Inquiry time |

**Indexes:**
- `idx_listing_inquiries_listing_id` - Listing lookup
- `idx_listing_inquiries_inquirer_id` - Inquirer lookup
- `idx_listing_inquiries_status` - Status filter

---

### 4.7 Training & Activation Tables

#### `training_modules`
Training content for doers/supervisors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Module ID |
| `title` | VARCHAR(255) | NOT NULL | Title |
| `description` | TEXT | | Description |
| `target_role` | VARCHAR(20) | NOT NULL | doer/supervisor |
| `content_type` | VARCHAR(20) | NOT NULL | video/pdf/article/quiz |
| `content_url` | TEXT | | Content URL |
| `content_html` | TEXT | | HTML content |
| `duration_minutes` | INTEGER | | Duration |
| `sequence_order` | INTEGER | NOT NULL | Order |
| `is_mandatory` | BOOLEAN | DEFAULT TRUE | Required |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_training_modules_target_role` - Role filter
- `idx_training_modules_is_active` - Active (partial)
- `idx_training_modules_sequence` - Role + sequence

---

#### `training_progress`
User progress through training.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Progress ID |
| `profile_id` | UUID | NOT NULL, FK | User |
| `module_id` | UUID | NOT NULL, FK | Module |
| `status` | VARCHAR(20) | DEFAULT 'not_started' | not_started/in_progress/completed |
| `progress_percentage` | INTEGER | DEFAULT 0, CHECK(0-100) | Progress % |
| `started_at` | TIMESTAMPTZ | | Start time |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `time_spent_minutes` | INTEGER | DEFAULT 0 | Time spent |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Constraints:** UNIQUE(profile_id, module_id)

**Indexes:**
- `idx_training_progress_profile_id` - User lookup
- `idx_training_progress_module_id` - Module lookup
- `idx_training_progress_status` - Status filter

---

#### `quiz_questions`
Quiz questions for activation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Question ID |
| `target_role` | VARCHAR(20) | NOT NULL | doer/supervisor |
| `question_text` | TEXT | NOT NULL | Question |
| `question_type` | VARCHAR(20) | DEFAULT 'multiple_choice' | multiple_choice/true_false/scenario |
| `options` | JSONB | NOT NULL | Answer options |
| `correct_option_ids` | TEXT[] | | Correct answers |
| `explanation` | TEXT | | Explanation |
| `points` | INTEGER | DEFAULT 1 | Points |
| `sequence_order` | INTEGER | | Order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_quiz_questions_target_role` - Role filter
- `idx_quiz_questions_is_active` - Active (partial)

---

#### `quiz_attempts`
Quiz attempt records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Attempt ID |
| `profile_id` | UUID | NOT NULL, FK | User |
| `target_role` | VARCHAR(20) | NOT NULL | doer/supervisor |
| `attempt_number` | INTEGER | NOT NULL | Attempt # |
| `answers` | JSONB | NOT NULL | Answers given |
| `total_questions` | INTEGER | NOT NULL | Question count |
| `correct_answers` | INTEGER | NOT NULL | Correct count |
| `score_percentage` | DECIMAL(5,2) | NOT NULL | Score % |
| `passing_score` | DECIMAL(5,2) | NOT NULL | Pass threshold |
| `is_passed` | BOOLEAN | NOT NULL | Passed? |
| `started_at` | TIMESTAMPTZ | NOT NULL | Start time |
| `completed_at` | TIMESTAMPTZ | NOT NULL | End time |
| `time_taken_seconds` | INTEGER | | Duration |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_quiz_attempts_profile_id` - User lookup
- `idx_quiz_attempts_target_role` - Role filter
- `idx_quiz_attempts_is_passed` - Pass filter
- `idx_quiz_attempts_created_at` - Time sort (DESC)

---

#### `doer_activation`
Doer activation status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Activation ID |
| `doer_id` | UUID | NOT NULL, UNIQUE, FK | Doer |
| `training_completed` | BOOLEAN | DEFAULT FALSE | Training done |
| `training_completed_at` | TIMESTAMPTZ | | Training time |
| `quiz_passed` | BOOLEAN | DEFAULT FALSE | Quiz passed |
| `quiz_passed_at` | TIMESTAMPTZ | | Quiz time |
| `quiz_attempt_id` | UUID | FK | Passing attempt |
| `total_quiz_attempts` | INTEGER | DEFAULT 0 | Attempt count |
| `bank_details_added` | BOOLEAN | DEFAULT FALSE | Bank added |
| `bank_details_added_at` | TIMESTAMPTZ | | Bank time |
| `is_fully_activated` | BOOLEAN | DEFAULT FALSE | Fully active |
| `activated_at` | TIMESTAMPTZ | | Activation time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_doer_activation_doer_id` - Doer lookup
- `idx_doer_activation_is_activated` - Activated filter

---

#### `supervisor_activation`
Supervisor activation status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Activation ID |
| `supervisor_id` | UUID | NOT NULL, UNIQUE, FK | Supervisor |
| `cv_submitted` | BOOLEAN | DEFAULT FALSE | CV submitted |
| `cv_submitted_at` | TIMESTAMPTZ | | CV submit time |
| `cv_verified` | BOOLEAN | DEFAULT FALSE | CV verified |
| `cv_verified_at` | TIMESTAMPTZ | | Verification time |
| `cv_verified_by` | UUID | FK | Verifier |
| `cv_rejection_reason` | TEXT | | Rejection reason |
| `training_completed` | BOOLEAN | DEFAULT FALSE | Training done |
| `training_completed_at` | TIMESTAMPTZ | | Training time |
| `quiz_passed` | BOOLEAN | DEFAULT FALSE | Quiz passed |
| `quiz_passed_at` | TIMESTAMPTZ | | Quiz time |
| `quiz_attempt_id` | UUID | FK | Passing attempt |
| `total_quiz_attempts` | INTEGER | DEFAULT 0 | Attempt count |
| `bank_details_added` | BOOLEAN | DEFAULT FALSE | Bank added |
| `bank_details_added_at` | TIMESTAMPTZ | | Bank time |
| `is_fully_activated` | BOOLEAN | DEFAULT FALSE | Fully active |
| `activated_at` | TIMESTAMPTZ | | Activation time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_supervisor_activation_supervisor_id` - Supervisor lookup
- `idx_supervisor_activation_is_activated` - Activated filter
- `idx_supervisor_activation_cv_verified` - CV verified filter

---

### 4.8 Reviews & Ratings Tables

#### `doer_reviews`
Reviews for doers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Review ID |
| `doer_id` | UUID | NOT NULL, FK | Doer reviewed |
| `reviewer_id` | UUID | NOT NULL, FK | Reviewer |
| `reviewer_type` | VARCHAR(20) | NOT NULL | user/supervisor |
| `project_id` | UUID | FK | Related project |
| `overall_rating` | INTEGER | NOT NULL, CHECK(1-5) | Overall rating |
| `quality_rating` | INTEGER | CHECK(1-5) | Quality rating |
| `timeliness_rating` | INTEGER | CHECK(1-5) | Timeliness rating |
| `communication_rating` | INTEGER | CHECK(1-5) | Communication rating |
| `review_text` | TEXT | | Review text |
| `is_public` | BOOLEAN | DEFAULT TRUE | Public review |
| `is_flagged` | BOOLEAN | DEFAULT FALSE | Flagged |
| `flag_reason` | TEXT | | Flag reason |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |

**Indexes:**
- `idx_doer_reviews_doer_id` - Doer lookup
- `idx_doer_reviews_reviewer_id` - Reviewer lookup
- `idx_doer_reviews_project_id` - Project lookup
- `idx_doer_reviews_overall_rating` - Rating filter
- `idx_doer_reviews_created_at` - Time sort (DESC)

---

#### `supervisor_reviews`
Reviews for supervisors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Review ID |
| `supervisor_id` | UUID | NOT NULL, FK | Supervisor reviewed |
| `reviewer_id` | UUID | NOT NULL, FK | Reviewer |
| `reviewer_type` | VARCHAR(20) | NOT NULL | user/doer |
| `project_id` | UUID | FK | Related project |
| `overall_rating` | INTEGER | NOT NULL, CHECK(1-5) | Overall rating |
| `communication_rating` | INTEGER | CHECK(1-5) | Communication rating |
| `helpfulness_rating` | INTEGER | CHECK(1-5) | Helpfulness rating |
| `review_text` | TEXT | | Review text |
| `is_public` | BOOLEAN | DEFAULT TRUE | Public review |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_supervisor_reviews_supervisor_id` - Supervisor lookup
- `idx_supervisor_reviews_reviewer_id` - Reviewer lookup
- `idx_supervisor_reviews_project_id` - Project lookup
- `idx_supervisor_reviews_created_at` - Time sort (DESC)

---

#### `user_feedback`
General user satisfaction feedback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Feedback ID |
| `user_id` | UUID | NOT NULL, FK | User |
| `project_id` | UUID | FK | Related project |
| `overall_satisfaction` | INTEGER | NOT NULL, CHECK(1-5) | Satisfaction |
| `would_recommend` | BOOLEAN | | Would recommend |
| `feedback_text` | TEXT | | Feedback text |
| `improvement_suggestions` | TEXT | | Suggestions |
| `nps_score` | INTEGER | CHECK(0-10) | NPS score |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_user_feedback_user_id` - User lookup
- `idx_user_feedback_project_id` - Project lookup
- `idx_user_feedback_nps_score` - NPS filter

---

### 4.9 Support & Audit Tables

#### `support_tickets`
Support tickets from users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Ticket ID |
| `ticket_number` | VARCHAR(20) | NOT NULL, UNIQUE | Number (TKT-2025-00001) |
| `requester_id` | UUID | NOT NULL, FK | Requester |
| `subject` | VARCHAR(255) | NOT NULL | Subject |
| `description` | TEXT | NOT NULL | Description |
| `category` | VARCHAR(100) | | Category |
| `project_id` | UUID | FK | Related project |
| `priority` | ticket_priority | DEFAULT 'medium' | Priority |
| `status` | ticket_status | DEFAULT 'open' | Status |
| `assigned_to` | UUID | FK | Assigned agent |
| `assigned_at` | TIMESTAMPTZ | | Assignment time |
| `resolution_notes` | TEXT | | Resolution |
| `resolved_at` | TIMESTAMPTZ | | Resolution time |
| `resolved_by` | UUID | FK | Resolver |
| `satisfaction_rating` | INTEGER | CHECK(1-5) | Satisfaction |
| `satisfaction_feedback` | TEXT | | Feedback |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update time |
| `first_response_at` | TIMESTAMPTZ | | First response |
| `closed_at` | TIMESTAMPTZ | | Close time |

**Indexes:**
- `idx_support_tickets_ticket_number` - Number lookup
- `idx_support_tickets_requester_id` - Requester lookup
- `idx_support_tickets_status` - Status filter
- `idx_support_tickets_priority` - Priority filter
- `idx_support_tickets_assigned_to` - Agent lookup
- `idx_support_tickets_created_at` - Time sort (DESC)
- `idx_support_tickets_open` - Open tickets (partial)

---

#### `ticket_messages`
Messages in support tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Message ID |
| `ticket_id` | UUID | NOT NULL, FK | Ticket reference |
| `sender_id` | UUID | NOT NULL, FK | Sender |
| `sender_type` | VARCHAR(20) | NOT NULL | requester/support/admin |
| `message` | TEXT | NOT NULL | Message text |
| `attachments` | JSONB | | Attachments |
| `is_internal` | BOOLEAN | DEFAULT FALSE | Internal note |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Send time |

**Indexes:**
- `idx_ticket_messages_ticket_id` - Ticket lookup
- `idx_ticket_messages_sender_id` - Sender lookup
- `idx_ticket_messages_created_at` - Time sort

---

#### `activity_logs`
User activity audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Log ID |
| `profile_id` | UUID | FK | User |
| `action` | VARCHAR(100) | NOT NULL | Action name |
| `action_category` | VARCHAR(50) | | auth/project/payment/profile/admin |
| `target_type` | VARCHAR(50) | | Target entity type |
| `target_id` | UUID | | Target entity ID |
| `description` | TEXT | | Description |
| `metadata` | JSONB | | Additional data |
| `ip_address` | INET | | IP address |
| `user_agent` | TEXT | | User agent |
| `device_type` | VARCHAR(20) | | Device type |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Log time |

**Indexes:**
- `idx_activity_logs_profile_id` - User lookup
- `idx_activity_logs_action` - Action filter
- `idx_activity_logs_action_category` - Category filter
- `idx_activity_logs_target` - Target lookup
- `idx_activity_logs_created_at` - Time sort (DESC)

---

#### `error_logs`
Application error logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Log ID |
| `error_type` | VARCHAR(100) | NOT NULL | Error type |
| `error_message` | TEXT | NOT NULL | Error message |
| `stack_trace` | TEXT | | Stack trace |
| `profile_id` | UUID | FK | Affected user |
| `request_url` | TEXT | | Request URL |
| `request_method` | VARCHAR(10) | | HTTP method |
| `request_body` | JSONB | | Request body |
| `app_version` | VARCHAR(20) | | App version |
| `platform` | VARCHAR(20) | | ios/android/web |
| `device_info` | JSONB | | Device info |
| `sentry_event_id` | VARCHAR(100) | | Sentry ID |
| `is_resolved` | BOOLEAN | DEFAULT FALSE | Resolved |
| `resolved_at` | TIMESTAMPTZ | | Resolution time |
| `resolution_notes` | TEXT | | Resolution notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Error time |

**Indexes:**
- `idx_error_logs_error_type` - Type filter
- `idx_error_logs_profile_id` - User lookup
- `idx_error_logs_is_resolved` - Unresolved (partial)
- `idx_error_logs_created_at` - Time sort (DESC)
- `idx_error_logs_sentry_id` - Sentry lookup

---

## 5. Indexes

### Performance-Critical Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `projects` | `idx_projects_status_supervisor` | Supervisor dashboard queries |
| `projects` | `idx_projects_pending_payment` | Payment reminder triggers |
| `projects` | `idx_projects_auto_approve` | Auto-approval scheduler |
| `doers` | `idx_doers_is_available` | Task assignment queries |
| `chat_messages` | `idx_chat_messages_room_created` | Chat history loading |
| `notifications` | `idx_notifications_is_read` | Unread count queries |
| `marketplace_listings` | `idx_marketplace_listings_active` | Feed queries |

### Composite Indexes

```sql
-- User's projects with status
idx_projects_user_status ON projects(user_id, status)

-- Doer's active assignments
idx_projects_doer_active ON projects(doer_id, status)
    WHERE status IN ('assigned', 'in_progress', 'submitted_for_qc')

-- Supervisor's workload
idx_projects_supervisor_active ON projects(supervisor_id, status)
    WHERE status IN ('analyzing', 'quoted', 'assigned', 'in_progress', 'qc_in_progress')

-- Recent transactions for wallet
idx_wallet_transactions_recent ON wallet_transactions(wallet_id, created_at DESC)

-- User's unread notifications
idx_notifications_user_unread ON notifications(profile_id, created_at DESC)
    WHERE is_read = FALSE
```

---

## 6. Functions

### `update_updated_at_column()`
Automatically updates the `updated_at` column on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `generate_project_number()`
Generates unique project numbers in format `AX-XXXXX`.

```sql
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM projects;

    NEW.project_number := 'AX-' || LPAD(next_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `generate_ticket_number()`
Generates unique ticket numbers in format `TKT-YYYY-XXXXX`.

```sql
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    next_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;

    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 10) AS INTEGER)), 0) + 1
    INTO next_num
    FROM support_tickets
    WHERE ticket_number LIKE 'TKT-' || year_str || '-%';

    NEW.ticket_number := 'TKT-' || year_str || '-' || LPAD(next_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `log_project_status_change()`
Logs project status changes to history table.

```sql
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO project_status_history (
            project_id, from_status, to_status, changed_by_type, created_at
        ) VALUES (
            NEW.id, OLD.status, NEW.status, 'system', NOW()
        );

        NEW.status_updated_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `update_wallet_balance()`
Updates wallet balance on completed transactions.

```sql
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type IN ('credit', 'refund', 'top_up', 'project_earning', 'commission', 'bonus') THEN
        UPDATE wallets
        SET balance = balance + NEW.amount,
            total_credited = total_credited + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.wallet_id;
    ELSIF NEW.transaction_type IN ('debit', 'withdrawal', 'project_payment', 'penalty') THEN
        UPDATE wallets
        SET balance = balance - NEW.amount,
            total_debited = total_debited + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.wallet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `update_doer_stats()`
Updates doer statistics on project completion.

```sql
CREATE OR REPLACE FUNCTION update_doer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE doers
        SET
            total_projects_completed = total_projects_completed + 1,
            total_earnings = total_earnings + COALESCE(NEW.doer_payout, 0),
            updated_at = NOW()
        WHERE id = NEW.doer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `create_wallet_for_profile()`
Auto-creates a wallet for new profiles.

```sql
CREATE OR REPLACE FUNCTION create_wallet_for_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (profile_id, balance, currency)
    VALUES (NEW.id, 0, 'INR');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `detect_contact_info()`
Detects potential contact information in chat messages.

```sql
CREATE OR REPLACE FUNCTION detect_contact_info()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.content ~* '(\+91|91)?[6-9][0-9]{9}' OR  -- Indian mobile
       NEW.content ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR  -- Email
       NEW.content ~* '@[a-zA-Z0-9_]{3,}' OR  -- Social handles
       NEW.content ~* 'whatsapp|telegram|instagram|facebook' THEN
        NEW.contains_contact_info := TRUE;
        NEW.is_flagged := TRUE;
        NEW.flagged_reason := 'Potential contact information detected';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Triggers

### Updated At Triggers
Applied to all tables with `updated_at` column:

```sql
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

Applied to: `profiles`, `students`, `professionals`, `doers`, `supervisors`, `admins`, `projects`, `project_revisions`, `project_quotes`, `wallets`, `payments`, `payment_methods`, `payouts`, `payout_requests`, `chat_rooms`, `marketplace_listings`, `training_modules`, `training_progress`, `quiz_questions`, `doer_activation`, `supervisor_activation`, `doer_reviews`, `support_tickets`, `referral_codes`, `banners`, `pricing_guides`, `app_settings`, `faqs`

### Project Number Generation
```sql
CREATE TRIGGER set_project_number
    BEFORE INSERT ON projects
    FOR EACH ROW
    WHEN (NEW.project_number IS NULL)
    EXECUTE FUNCTION generate_project_number();
```

### Ticket Number Generation
```sql
CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();
```

### Project Status Change Logging
```sql
CREATE TRIGGER project_status_change_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_status_change();
```

### Wallet Balance Updates
```sql
CREATE TRIGGER wallet_balance_trigger
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_wallet_balance();
```

### Doer Stats Updates
```sql
CREATE TRIGGER doer_stats_trigger
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_doer_stats();
```

### Auto Wallet Creation
```sql
CREATE TRIGGER create_wallet_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_profile();
```

### Contact Info Detection
```sql
CREATE TRIGGER detect_contact_trigger
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION detect_contact_info();
```

---

## 8. Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ASSIGNX DATABASE SCHEMA                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   PROFILES   │────<│   STUDENTS   │     │ PROFESSIONALS│                 │
│  │   (base)     │     └──────────────┘     └──────────────┘                 │
│  └──────┬───────┘                                                            │
│         │                                                                    │
│         ├─────────────────────────────────────────────────────┐              │
│         │                                                     │              │
│  ┌──────▼───────┐     ┌──────────────┐     ┌──────────────┐  │              │
│  │    DOERS     │────<│DOER_SKILLS   │     │DOER_ACTIVATION│  │              │
│  └──────┬───────┘     └──────────────┘     └──────────────┘  │              │
│         │                                                     │              │
│  ┌──────▼───────┐     ┌──────────────┐     ┌──────────────┐  │              │
│  │  SUPERVISORS │────<│SUP_EXPERTISE │     │SUP_ACTIVATION │  │              │
│  └──────┬───────┘     └──────────────┘     └──────────────┘  │              │
│         │                                                     │              │
│         └─────────────────────┬───────────────────────────────┘              │
│                               │                                              │
│                        ┌──────▼───────┐                                      │
│                        │   PROJECTS   │                                      │
│                        └──────┬───────┘                                      │
│                               │                                              │
│      ┌────────────────────────┼────────────────────────┐                    │
│      │                        │                        │                    │
│ ┌────▼─────┐  ┌───────────────▼──────┐  ┌─────────────▼────────┐           │
│ │  FILES   │  │  PROJECT_ASSIGNMENTS │  │  PROJECT_DELIVERABLES│           │
│ └──────────┘  └───────────────┬──────┘  └──────────────────────┘           │
│                               │                                              │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│       ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐                    │
│       │   QUOTES    │  │  PAYMENTS   │  │    CHATS    │                    │
│       └─────────────┘  └─────────────┘  └─────────────┘                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Key Relationships

| Parent Table | Child Table | Relationship | Description |
|--------------|-------------|--------------|-------------|
| `auth.users` | `profiles` | 1:1 | Supabase auth link |
| `profiles` | `students` | 1:1 | Student extension |
| `profiles` | `professionals` | 1:1 | Professional extension |
| `profiles` | `doers` | 1:1 | Doer extension |
| `profiles` | `supervisors` | 1:1 | Supervisor extension |
| `profiles` | `admins` | 1:1 | Admin extension |
| `profiles` | `wallets` | 1:1 | User wallet |
| `profiles` | `projects` | 1:N | User's projects |
| `doers` | `doer_skills` | 1:N | Doer's skills |
| `doers` | `doer_subjects` | 1:N | Doer's subjects |
| `supervisors` | `supervisor_expertise` | 1:N | Supervisor's expertise |
| `projects` | `project_files` | 1:N | Uploaded files |
| `projects` | `project_deliverables` | 1:N | Deliverables |
| `projects` | `project_quotes` | 1:N | Pricing quotes |
| `projects` | `project_revisions` | 1:N | Revisions |
| `projects` | `chat_rooms` | 1:N | Chat rooms |
| `chat_rooms` | `chat_messages` | 1:N | Messages |
| `chat_rooms` | `chat_participants` | 1:N | Participants |
| `marketplace_listings` | `listing_images` | 1:N | Listing images |
| `marketplace_listings` | `listing_inquiries` | 1:N | Buyer inquiries |
| `support_tickets` | `ticket_messages` | 1:N | Ticket messages |

---

## 9. Seed Data

### Reference Styles
- APA (7th Edition)
- Harvard (Standard)
- MLA (9th Edition)
- Chicago (17th Edition)
- IEEE (Standard)
- Vancouver (Standard)

### Subjects (20 entries)
Computer Science, Business & Management, Engineering, Mathematics, Physics, Marketing, Finance, Law, Medicine, Psychology, Economics, Literature, History, Chemistry, Biology, Nursing, Accounting, Statistics, Philosophy, Political Science

### Skills (20 entries)
Python, JavaScript, Java, SQL, Excel, Data Analysis, Content Writing, Academic Writing, Research, Proofreading, Statistical Analysis, Machine Learning, R Programming, MATLAB, Technical Writing, Report Writing, Thesis Writing, Literature Review, Case Study Analysis, PowerPoint

### Marketplace Categories
- Books & Study Material
- Electronics
- Hostel Essentials
- Housing
- Jobs & Internships
- Events
- Community

### Industries
IT, Finance & Banking, Healthcare, Education, E-commerce, Manufacturing, Consulting, Media & Entertainment, Real Estate, Legal Services

### Courses
B.Tech, MBA, B.Com, M.Tech, B.A., M.A., B.Sc, M.Sc, BBA, PhD

### Universities
LPU, DU, IIT Delhi, IIM-A, JNU, BHU, Anna University, Mumbai University, Amity University, VIT University

---

## 10. Security Notes

### Row Level Security (RLS)
**Status:** Not implemented in initial release

RLS policies are intentionally **not enabled** for the initial release. All data access control is handled at the application/API layer. This approach was chosen for:
- Faster initial development
- Easier debugging during development phase
- Flexibility in access control logic

RLS policies will be implemented in a future phase for enhanced database-level security.

### Data Protection Considerations

1. **Sensitive Data:** Bank account details, UPI IDs are stored in `doers` and `supervisors` tables
2. **Payment Data:** Tokenized via Razorpay, no raw card data stored
3. **Contact Info Detection:** Automatic flagging in chat messages
4. **Soft Delete:** `deleted_at` column in profiles for GDPR compliance

### API Layer Security Recommendations

1. Validate user ownership before any data access
2. Implement rate limiting on sensitive endpoints
3. Use parameterized queries to prevent SQL injection
4. Encrypt sensitive data at rest
5. Implement audit logging for sensitive operations

---

## Appendix: Extensions Used

| Extension | Schema | Purpose |
|-----------|--------|---------|
| `uuid-ossp` | extensions | UUID generation |
| `pgcrypto` | extensions | Cryptographic functions |
| `cube` | extensions | Multidimensional cubes (for earthdistance) |
| `earthdistance` | extensions | Geographic distance calculations |

---

*Documentation generated: December 2025*
*Database: Supabase (PostgreSQL 15+)*
*Project: AssignX v1.0*
