# Database Schema Analysis - Supervisor Web Application

**Analysis Date:** 2026-01-20
**Analyzed By:** Researcher Agent (Hive Mind)
**Database:** Supabase PostgreSQL (Public Schema)

---

## Executive Summary

The AssignX platform uses a comprehensive Supabase database schema supporting:
- **Supervisor/Expert Management** (supervisors table)
- **Doer/Freelancer Management** (doers table)
- **Project/Assignment Workflow** (projects table)
- **User Profiles** (profiles table)
- **College Social Features** (colleges, campus_posts)
- **Expert Consultations** (experts, expert_bookings)

---

## Core Tables

### 1. supervisors

**Purpose:** Manages supervisor/expert accounts who oversee project quality and assign doers.

**Primary Key:** `id` (UUID)

**Key Fields:**
- **Identity:** `id`, `profile_id` (FK to profiles)
- **Verification:** `cv_url`, `cv_verified`, `cv_verified_at`, `cv_verified_by`, `bank_verified`
- **Activation:** `is_activated`, `activated_at`, `is_available`, `availability_updated_at`
- **Qualifications:** `qualification`, `years_of_experience`
- **Capacity:** `max_concurrent_projects`, `total_projects_managed`
- **Performance:** `average_rating`, `success_rate`, `total_reviews`, `average_response_time_hours`
- **Financial:** `total_earnings`, `bank_account_name`, `bank_account_number`, `bank_ifsc_code`, `bank_name`, `upi_id`

**Foreign Keys:**
1. `profile_id` → `profiles(id)` (one-to-one) - Links to user profile
2. `cv_verified_by` → `profiles(id)` (many-to-one) - Admin who verified CV

**Relationships:**
- One supervisor manages MANY projects (via projects.supervisor_id)
- One supervisor can blacklist MANY doers (via supervisor_blacklisted_doers)

---

### 2. doers

**Purpose:** Manages freelancer/doer accounts who execute project work.

**Primary Key:** `id` (UUID)

**Key Fields:**
- **Identity:** `id`, `profile_id` (FK to profiles)
- **Qualifications:** `qualification`, `experience_level`, `years_of_experience`, `university_name`, `bio`
- **Activation:** `is_activated`, `activated_at`, `is_available`, `availability_updated_at`
- **Capacity:** `max_concurrent_projects`, `total_projects_completed`
- **Performance:** `average_rating`, `success_rate`, `on_time_delivery_rate`, `total_reviews`
- **Moderation:** `is_flagged`, `flag_reason`, `flagged_at`, `flagged_by`
- **Financial:** `total_earnings`, `bank_account_name`, `bank_account_number`, `bank_ifsc_code`, `bank_name`, `upi_id`, `bank_verified`

**Foreign Keys:**
1. `profile_id` → `profiles(id)` (one-to-one)
2. `flagged_by` → `profiles(id)` (many-to-one)

**Relationships:**
- One doer can work on MANY projects (via projects.doer_id)
- One doer can be blacklisted by MANY supervisors (via supervisor_blacklisted_doers)

---

### 3. projects

**Purpose:** Central table for managing assignment/project lifecycle from creation to completion.

**Primary Key:** `id` (UUID)

**Key Fields:**

**Identity & Classification:**
- `id`, `project_number` (unique identifier)
- `title`, `description`, `topic`
- `service_type` (enum: essay_writing, research_paper, thesis, dissertation, coursework, etc.)
- `subject_id` (FK to subjects), `source`

**User Assignments:**
- `user_id` (FK to profiles - client)
- `supervisor_id` (FK to supervisors)
- `doer_id` (FK to doers)
- `supervisor_assigned_at`, `doer_assigned_at`

**Requirements:**
- `word_count`, `page_count`
- `reference_style_id` (FK to reference_styles)
- `focus_areas` (text array)
- `specific_instructions`

**Deadlines:**
- `deadline`, `original_deadline`
- `deadline_extended`, `deadline_extension_reason`
- `expected_delivery_at`

**Status & Progress:**
- `status` (enum: draft, pending_approval, approved, supervisor_assigned, doer_assigned, in_progress, submitted_for_qc, qc_approved, qc_rejected, delivered, revision_requested, completed, cancelled, on_hold)
- `status_updated_at`
- `progress_percentage`

**Delivery & Quality:**
- `delivered_at`, `completed_at`
- `live_document_url`
- `plagiarism_score`, `plagiarism_report_url`
- `ai_score`, `ai_report_url`

**Financial:**
- `user_quote` (client pays)
- `doer_payout` (doer receives)
- `supervisor_commission` (supervisor receives)
- `platform_fee`
- `payment_id` (FK to payments)
- `is_paid`, `paid_at`

**Approval & Feedback:**
- `user_approved`, `user_approved_at`
- `user_feedback`, `user_grade`
- `auto_approve_at`
- `completion_notes`

**Cancellation:**
- `cancelled_at`, `cancelled_by` (FK to profiles)
- `cancellation_reason`

**Foreign Keys:**
1. `user_id` → `profiles(id)` - Client who created project
2. `supervisor_id` → `supervisors(id)` - Assigned supervisor
3. `doer_id` → `doers(id)` - Assigned doer
4. `subject_id` → `subjects(id)` - Academic subject
5. `reference_style_id` → `reference_styles(id)` - Citation style
6. `payment_id` → `payments(id)` - Payment record
7. `cancelled_by` → `profiles(id)` - Who cancelled

---

### 4. profiles

**Purpose:** Core user profiles table (extends Supabase auth.users).

**Primary Key:** `id` (UUID, matches auth.users.id)

**Key Fields:**
- **Identity:** `id`, `email`, `full_name`, `phone_number`, `role`
- **Profile:** `avatar_url`, `bio`, `headline`
- **College:** `college_email`, `college_id` (FK to colleges), `is_college_verified`, `college_verified_at`
- **Onboarding:** `has_completed_tour`, `tour_completed_at`
- **Social:** `social_links` (JSONB), `skills` (array), `interests` (array)
- **Preferences:** `notification_preferences` (JSONB), `is_profile_public`

**Relationships:**
- One profile can have ONE supervisor extension (supervisors.profile_id)
- One profile can have ONE doer extension (doers.profile_id)
- One profile can create MANY projects (projects.user_id)

---

## Supporting Tables

### supervisor_blacklisted_doers
- **Purpose:** Junction table for supervisors to blacklist specific doers
- **Fields:** `id`, `supervisor_id`, `doer_id`, `reason`, `created_at`
- **Relationships:**
  - `supervisor_id` → `supervisors(id)`
  - `doer_id` → `doers(id)`

### project_assignments
- **Purpose:** Audit trail for project assignment history
- **Fields:** `id`, `project_id`, `assigned_to`, `assigned_by`, `assignment_type`, `reassignment_reason`

### project_deliverables
- **Purpose:** Tracks deliverable files submitted for projects
- **Relationships:** `project_id` → `projects(id)`

### project_files
- **Purpose:** Stores project file attachments (requirements, references)
- **Relationships:** `project_id` → `projects(id)`

### project_revisions
- **Purpose:** Tracks revision requests, QC feedback, and quality issues
- **Relationships:** `project_id` → `projects(id)`

### subjects
- **Purpose:** Academic subject/discipline catalog
- **Usage:** Classification and filtering of projects

### reference_styles
- **Purpose:** Citation formats (APA, MLA, Chicago, Harvard, etc.)

### colleges
- **Purpose:** Educational institution directory
- **Fields:** `id`, `name`, `short_name`, `domain`, `city`, `state`, `country`, `is_verified`
- **Relationships:** `profiles.college_id` → `colleges(id)`

### Campus Features (Recent Additions)
- **campus_posts:** College social posts (events, opportunities, marketplace, etc.)
- **campus_post_likes, campus_post_comments, campus_saved_posts:** Social interactions
- **experts:** Expert consultation service
- **expert_bookings:** Booking management for expert sessions
- **expert_reviews:** Reviews and ratings for experts

---

## Data Access Patterns for Supervisors

### 1. Dashboard Overview
**Query Requirements:**
```sql
-- Get supervisor profile with stats
SELECT s.*, p.full_name, p.avatar_url
FROM supervisors s
JOIN profiles p ON s.profile_id = p.id
WHERE s.profile_id = [current_user_id]

-- Count projects by status
SELECT status, COUNT(*) as count
FROM projects
WHERE supervisor_id = [supervisor_id]
GROUP BY status

-- Recent projects
SELECT p.*,
       u.full_name as user_name,
       d.profiles.full_name as doer_name,
       sub.name as subject_name
FROM projects p
LEFT JOIN profiles u ON p.user_id = u.id
LEFT JOIN doers d ON p.doer_id = d.id
LEFT JOIN subjects sub ON p.subject_id = sub.id
WHERE p.supervisor_id = [supervisor_id]
ORDER BY p.created_at DESC
LIMIT 10
```

### 2. Project Management
**Operations:**
- **Assign Doer:** Update `projects.doer_id`, set `doer_assigned_at`
- **Update Status:** Change `projects.status`, update `status_updated_at`
- **QC Approval:** Set status to `qc_approved`, add `completion_notes`
- **QC Rejection:** Set status to `qc_rejected`, create entry in `project_revisions`

### 3. Doer Management
**Query Requirements:**
```sql
-- Available doers (not blacklisted, with capacity)
SELECT d.*, p.full_name, p.avatar_url
FROM doers d
JOIN profiles p ON d.profile_id = p.id
WHERE d.is_activated = true
  AND d.is_available = true
  AND d.is_flagged = false
  AND d.id NOT IN (
    SELECT doer_id FROM supervisor_blacklisted_doers
    WHERE supervisor_id = [supervisor_id]
  )
ORDER BY d.average_rating DESC, d.success_rate DESC
```

### 4. Financial Tracking
**Query Requirements:**
```sql
-- Earnings summary
SELECT
  SUM(supervisor_commission) as total_commission,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_projects
FROM projects
WHERE supervisor_id = [supervisor_id]
  AND status IN ('completed', 'delivered', 'qc_approved')
```

---

## Key Relationships Diagram

```
profiles (core user table)
  ├─ supervisors (1:1 via profile_id)
  │   └─ projects (1:many via supervisor_id)
  │       ├─ project_files
  │       ├─ project_deliverables
  │       ├─ project_revisions
  │       └─ project_assignments
  │
  ├─ doers (1:1 via profile_id)
  │   └─ projects (1:many via doer_id)
  │
  └─ projects (1:many via user_id as client)

supervisors ←→ doers (many:many via supervisor_blacklisted_doers)
```

---

## Enums

### service_type
- `essay_writing`
- `research_paper`
- `thesis`
- `dissertation`
- `coursework`
- `case_study`
- `lab_report`
- `other`

### project_status (Workflow Stages)
1. `draft` - Initial creation
2. `pending_approval` - Awaiting admin approval
3. `approved` - Approved, ready for assignment
4. `supervisor_assigned` - Supervisor assigned
5. `doer_assigned` - Doer assigned
6. `in_progress` - Work in progress
7. `submitted_for_qc` - Submitted for quality check
8. `qc_approved` - Passed QC, ready for delivery
9. `qc_rejected` - Failed QC, needs revision
10. `delivered` - Delivered to client
11. `revision_requested` - Client requested changes
12. `completed` - Fully completed and approved
13. `cancelled` - Project cancelled
14. `on_hold` - Temporarily paused

---

## Row Level Security (RLS) Policies

### supervisors table
- **SELECT:** Own profile OR admin
- **INSERT:** Own profile (user can register as supervisor)
- **UPDATE:** Own profile OR admin (for verification fields)

### projects table
- **SELECT:**
  - Project owner (user_id)
  - Assigned supervisor (supervisor_id)
  - Assigned doer (doer_id)
- **UPDATE:**
  - Assigned supervisor (for status changes, assignments)
  - Project owner (limited fields)

### doers table
- **SELECT:** Public (active, non-flagged doers) OR own profile
- **UPDATE:** Own profile OR admin/supervisor (for moderation)

---

## Performance Recommendations

### Critical Indexes
1. `projects(supervisor_id, status)` - Dashboard queries
2. `projects(doer_id, status)` - Doer workload tracking
3. `supervisors(is_activated, is_available)` - Assignment queries
4. `doers(is_activated, is_available, is_flagged)` - Doer selection
5. `profiles(college_id)` WHERE `college_id IS NOT NULL`

### Query Optimization Targets
1. Dashboard aggregate statistics (use materialized views)
2. Available doers with capacity calculations
3. Projects with full relation data (profiles, subjects, doers)

---

## Migration History Insights

**Platform Evolution:**
- Started as academic assignment platform (core: projects, supervisors, doers)
- Added college social features (colleges, campus_posts)
- Expanded to expert consultations (experts, expert_bookings)
- Enhanced user profiles (college verification, onboarding tours)

**Recent Migrations:**
- `20260117_001_colleges.sql` - College directory
- `20260117_002_campus_posts.sql` - Social posting
- `20260117_003_campus_interactions.sql` - Likes, comments, saves
- `20260117_004_experts.sql` - Expert profiles
- `20260117_005_expert_bookings.sql` - Consultation booking
- `20260117_006_profile_updates.sql` - Profile enhancements

---

## Data Access Summary for Supervisor Web App

### Critical Tables (Must Access)
1. **supervisors** - Current supervisor profile and stats
2. **projects** - All assigned projects with full details
3. **doers** - Available doers for assignment
4. **profiles** - User information (clients, doers, own profile)
5. **subjects** - For project classification

### Supporting Tables (Secondary)
6. **supervisor_blacklisted_doers** - Blacklist management
7. **project_revisions** - QC feedback and revision history
8. **project_files** - Project attachments
9. **project_deliverables** - Submitted work
10. **reference_styles** - Citation formats

### Read-Only Reference Tables
11. **colleges** - Educational institutions
12. **subjects** - Academic disciplines

---

## Next Steps for Development

1. **Create TypeScript interfaces** matching these schemas
2. **Build React hooks** for common queries (useProjects, useDoers, etc.)
3. **Implement RLS policies** in Supabase dashboard
4. **Set up indexes** for performance optimization
5. **Create database functions** for complex operations (assignment logic, statistics)
6. **Build real-time subscriptions** for project status updates

---

*End of Analysis*
