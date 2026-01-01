# AssignX Database Schema Documentation

> Auto-generated documentation of the Supabase PostgreSQL database
> Last updated: December 27, 2025

## Overview

| Metric | Count |
|--------|-------|
| Tables | 64 |
| Enum Types | 11 |
| Functions | 17 |
| Triggers | 40 |
| Indexes | 401 |
| Foreign Key Relationships | 107 |

---

## Enum Types

### chat_room_type
Chat room classification for different communication contexts.
```
project_user_supervisor | project_supervisor_doer | project_all | support | direct
```

### listing_status
Marketplace listing lifecycle states.
```
draft | pending_review | active | sold | rented | expired | rejected | removed
```

### listing_type
Types of marketplace listings.
```
sell | rent | free | opportunity | housing | community_post | poll | event
```

### message_type
Chat message content types.
```
text | file | image | system | action
```

### notification_type
System notification categories.
```
project_submitted | quote_ready | payment_received | project_assigned | task_available | task_assigned | work_submitted | qc_approved | qc_rejected | revision_requested | project_delivered | project_completed | new_message | payout_processed | system_alert | promotional
```

### payment_status
Payment transaction states.
```
initiated | pending | processing | completed | failed | cancelled | refunded | partially_refunded
```

### payout_status
Payout transaction states.
```
pending | processing | completed | failed | cancelled
```

### project_status
Project workflow states.
```
draft | submitted | analyzing | quoted | payment_pending | paid | assigning | assigned | in_progress | submitted_for_qc | qc_in_progress | qc_approved | qc_rejected | delivered | revision_requested | in_revision | completed | auto_approved | cancelled | refunded
```

### service_type
Types of services offered.
```
new_project | proofreading | plagiarism_check | ai_detection | expert_opinion
```

### ticket_priority
Support ticket priority levels.
```
low | medium | high | urgent
```

### ticket_status
Support ticket lifecycle states.
```
open | in_progress | waiting_response | resolved | closed | reopened
```

### transaction_type
Wallet transaction categories.
```
credit | debit | refund | withdrawal | top_up | project_payment | project_earning | commission | bonus | penalty | reversal
```

---

## Tables

### User Management

#### profiles
Base user profile for all user types (students, professionals, doers, supervisors, admins).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| full_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| phone_verified | BOOLEAN | DEFAULT false |
| avatar_url | TEXT | |
| user_type | VARCHAR(20) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| is_blocked | BOOLEAN | DEFAULT false |
| block_reason | TEXT | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| country | VARCHAR(100) | DEFAULT 'India' |
| last_login_at | TIMESTAMPTZ | |
| login_count | INTEGER | DEFAULT 0 |
| device_tokens | TEXT[] | |
| onboarding_step | VARCHAR(50) | DEFAULT 'role_selection' |
| onboarding_completed | BOOLEAN | DEFAULT false |
| onboarding_completed_at | TIMESTAMPTZ | |
| referral_code | VARCHAR(20) | UNIQUE |
| referred_by | UUID | FK → profiles.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |
| deleted_at | TIMESTAMPTZ | |

#### students
Student-specific extension of profiles.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| university_id | UUID | FK → universities.id |
| course_id | UUID | FK → courses.id |
| semester | INTEGER | |
| year_of_study | INTEGER | |
| student_id_number | VARCHAR(50) | |
| expected_graduation_year | INTEGER | |
| college_email | VARCHAR(255) | |
| college_email_verified | BOOLEAN | DEFAULT false |
| student_id_verified | BOOLEAN | DEFAULT false |
| preferred_subjects | TEXT[] | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### professionals
Professional user extension (job seekers, business owners).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| professional_type | VARCHAR(20) | NOT NULL |
| industry_id | UUID | FK → industries.id |
| company_name | VARCHAR(255) | |
| job_title | VARCHAR(255) | |
| linkedin_url | TEXT | |
| business_type | VARCHAR(100) | |
| gst_number | VARCHAR(20) | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### doers
Service providers who complete projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| qualification | VARCHAR(50) | NOT NULL |
| university_name | VARCHAR(255) | |
| experience_level | VARCHAR(20) | NOT NULL |
| years_of_experience | INTEGER | DEFAULT 0 |
| bio | TEXT | |
| is_available | BOOLEAN | DEFAULT true |
| availability_updated_at | TIMESTAMPTZ | |
| max_concurrent_projects | INTEGER | DEFAULT 3 |
| is_activated | BOOLEAN | DEFAULT false |
| activated_at | TIMESTAMPTZ | |
| total_projects_completed | INTEGER | DEFAULT 0 |
| total_earnings | NUMERIC | DEFAULT 0 |
| average_rating | NUMERIC | DEFAULT 0 |
| total_reviews | INTEGER | DEFAULT 0 |
| success_rate | NUMERIC | DEFAULT 100 |
| on_time_delivery_rate | NUMERIC | DEFAULT 100 |
| bank_account_name | VARCHAR(255) | |
| bank_account_number | VARCHAR(50) | |
| bank_ifsc_code | VARCHAR(20) | |
| bank_name | VARCHAR(100) | |
| upi_id | VARCHAR(100) | |
| bank_verified | BOOLEAN | DEFAULT false |
| is_flagged | BOOLEAN | DEFAULT false |
| flag_reason | TEXT | |
| flagged_by | UUID | FK → profiles.id |
| flagged_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### supervisors
Quality controllers and project managers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| qualification | VARCHAR(50) | NOT NULL |
| years_of_experience | INTEGER | NOT NULL |
| cv_url | TEXT | |
| cv_verified | BOOLEAN | DEFAULT false |
| cv_verified_at | TIMESTAMPTZ | |
| cv_verified_by | UUID | FK → profiles.id |
| is_available | BOOLEAN | DEFAULT true |
| availability_updated_at | TIMESTAMPTZ | |
| max_concurrent_projects | INTEGER | DEFAULT 10 |
| is_activated | BOOLEAN | DEFAULT false |
| activated_at | TIMESTAMPTZ | |
| total_projects_managed | INTEGER | DEFAULT 0 |
| total_earnings | NUMERIC | DEFAULT 0 |
| average_rating | NUMERIC | DEFAULT 0 |
| total_reviews | INTEGER | DEFAULT 0 |
| success_rate | NUMERIC | DEFAULT 100 |
| average_response_time_hours | NUMERIC | |
| bank_account_name | VARCHAR(255) | |
| bank_account_number | VARCHAR(50) | |
| bank_ifsc_code | VARCHAR(20) | |
| bank_name | VARCHAR(100) | |
| upi_id | VARCHAR(100) | |
| bank_verified | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### admins
Platform administrators.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| admin_role | VARCHAR(50) | NOT NULL |
| permissions | JSONB | DEFAULT '{}' |
| last_active_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

---

### Doer/Supervisor Skills & Activation

#### doer_skills
Skills associated with doers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| doer_id | UUID | NOT NULL, FK → doers.id |
| skill_id | UUID | NOT NULL, FK → skills.id |
| proficiency_level | VARCHAR(20) | DEFAULT 'intermediate' |
| is_verified | BOOLEAN | DEFAULT false |
| verified_at | TIMESTAMPTZ | |
| verified_by | UUID | FK → profiles.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (doer_id, skill_id)

#### doer_subjects
Subjects a doer can work on.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| doer_id | UUID | NOT NULL, FK → doers.id |
| subject_id | UUID | NOT NULL, FK → subjects.id |
| is_primary | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (doer_id, subject_id)

#### doer_activation
Tracks doer onboarding/activation steps.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| doer_id | UUID | NOT NULL, UNIQUE, FK → doers.id |
| training_completed | BOOLEAN | DEFAULT false |
| training_completed_at | TIMESTAMPTZ | |
| quiz_passed | BOOLEAN | DEFAULT false |
| quiz_passed_at | TIMESTAMPTZ | |
| quiz_attempt_id | UUID | FK → quiz_attempts.id |
| total_quiz_attempts | INTEGER | DEFAULT 0 |
| bank_details_added | BOOLEAN | DEFAULT false |
| bank_details_added_at | TIMESTAMPTZ | |
| is_fully_activated | BOOLEAN | DEFAULT false |
| activated_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### supervisor_expertise
Subjects a supervisor has expertise in.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| supervisor_id | UUID | NOT NULL, FK → supervisors.id |
| subject_id | UUID | NOT NULL, FK → subjects.id |
| is_primary | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (supervisor_id, subject_id)

#### supervisor_activation
Tracks supervisor onboarding/activation steps.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| supervisor_id | UUID | NOT NULL, UNIQUE, FK → supervisors.id |
| cv_submitted | BOOLEAN | DEFAULT false |
| cv_submitted_at | TIMESTAMPTZ | |
| cv_verified | BOOLEAN | DEFAULT false |
| cv_verified_at | TIMESTAMPTZ | |
| cv_verified_by | UUID | FK → admins.id |
| cv_rejection_reason | TEXT | |
| training_completed | BOOLEAN | DEFAULT false |
| training_completed_at | TIMESTAMPTZ | |
| quiz_passed | BOOLEAN | DEFAULT false |
| quiz_passed_at | TIMESTAMPTZ | |
| quiz_attempt_id | UUID | FK → quiz_attempts.id |
| total_quiz_attempts | INTEGER | DEFAULT 0 |
| bank_details_added | BOOLEAN | DEFAULT false |
| bank_details_added_at | TIMESTAMPTZ | |
| is_fully_activated | BOOLEAN | DEFAULT false |
| activated_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### supervisor_blacklisted_doers
Doers a supervisor has blacklisted.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| supervisor_id | UUID | NOT NULL, FK → supervisors.id |
| doer_id | UUID | NOT NULL, FK → doers.id |
| reason | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (supervisor_id, doer_id)

---

### Project Management

#### projects
Main project table - core business entity.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_number | VARCHAR(20) | NOT NULL, UNIQUE |
| user_id | UUID | NOT NULL, FK → profiles.id |
| service_type | service_type | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| subject_id | UUID | FK → subjects.id |
| topic | VARCHAR(500) | |
| description | TEXT | |
| word_count | INTEGER | |
| page_count | INTEGER | |
| reference_style_id | UUID | FK → reference_styles.id |
| specific_instructions | TEXT | |
| focus_areas | TEXT[] | |
| deadline | TIMESTAMPTZ | NOT NULL |
| original_deadline | TIMESTAMPTZ | |
| deadline_extended | BOOLEAN | DEFAULT false |
| deadline_extension_reason | TEXT | |
| status | project_status | NOT NULL, DEFAULT 'submitted' |
| status_updated_at | TIMESTAMPTZ | DEFAULT now() |
| supervisor_id | UUID | FK → supervisors.id |
| supervisor_assigned_at | TIMESTAMPTZ | |
| doer_id | UUID | FK → doers.id |
| doer_assigned_at | TIMESTAMPTZ | |
| user_quote | NUMERIC | |
| doer_payout | NUMERIC | |
| supervisor_commission | NUMERIC | |
| platform_fee | NUMERIC | |
| is_paid | BOOLEAN | DEFAULT false |
| paid_at | TIMESTAMPTZ | |
| payment_id | UUID | FK → payments.id |
| delivered_at | TIMESTAMPTZ | |
| expected_delivery_at | TIMESTAMPTZ | |
| auto_approve_at | TIMESTAMPTZ | |
| ai_report_url | TEXT | |
| ai_score | NUMERIC | |
| plagiarism_report_url | TEXT | |
| plagiarism_score | NUMERIC | |
| live_document_url | TEXT | |
| progress_percentage | INTEGER | DEFAULT 0 |
| completed_at | TIMESTAMPTZ | |
| completion_notes | TEXT | |
| user_approved | BOOLEAN | |
| user_approved_at | TIMESTAMPTZ | |
| user_feedback | TEXT | |
| user_grade | VARCHAR(10) | |
| cancelled_at | TIMESTAMPTZ | |
| cancelled_by | UUID | FK → profiles.id |
| cancellation_reason | TEXT | |
| source | VARCHAR(20) | DEFAULT 'app' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### project_files
Files uploaded by users for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| file_name | VARCHAR(255) | NOT NULL |
| file_url | TEXT | NOT NULL |
| file_type | VARCHAR(50) | |
| file_size_bytes | BIGINT | |
| file_category | VARCHAR(50) | DEFAULT 'reference' |
| uploaded_by | UUID | NOT NULL, FK → profiles.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### project_deliverables
Files delivered by doers for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| file_name | VARCHAR(255) | NOT NULL |
| file_url | TEXT | NOT NULL |
| file_type | VARCHAR(50) | |
| file_size_bytes | BIGINT | |
| version | INTEGER | DEFAULT 1 |
| is_final | BOOLEAN | DEFAULT false |
| qc_status | VARCHAR(20) | DEFAULT 'pending' |
| qc_notes | TEXT | |
| qc_by | UUID | FK → supervisors.id |
| qc_at | TIMESTAMPTZ | |
| uploaded_by | UUID | NOT NULL, FK → profiles.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### project_quotes
Price quotes for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| user_amount | NUMERIC | NOT NULL |
| doer_amount | NUMERIC | NOT NULL |
| supervisor_amount | NUMERIC | NOT NULL |
| platform_amount | NUMERIC | NOT NULL |
| base_price | NUMERIC | |
| urgency_fee | NUMERIC | DEFAULT 0 |
| complexity_fee | NUMERIC | DEFAULT 0 |
| discount_amount | NUMERIC | DEFAULT 0 |
| discount_code | VARCHAR(50) | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| valid_until | TIMESTAMPTZ | |
| quoted_by | UUID | NOT NULL, FK → supervisors.id |
| responded_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### project_revisions
Revision requests for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| revision_number | INTEGER | NOT NULL |
| requested_by | UUID | NOT NULL, FK → profiles.id |
| requested_by_type | VARCHAR(20) | NOT NULL |
| feedback | TEXT | NOT NULL |
| specific_changes | TEXT | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| response_notes | TEXT | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### project_assignments
Assignment history for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| assignment_type | VARCHAR(20) | NOT NULL |
| assignee_id | UUID | NOT NULL |
| assigned_by | UUID | NOT NULL, FK → profiles.id |
| status | VARCHAR(20) | DEFAULT 'active' |
| reassignment_reason | TEXT | |
| assigned_at | TIMESTAMPTZ | DEFAULT now() |
| ended_at | TIMESTAMPTZ | |

#### project_status_history
Audit log for project status changes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| from_status | project_status | |
| to_status | project_status | NOT NULL |
| changed_by | UUID | FK → profiles.id |
| changed_by_type | VARCHAR(20) | |
| notes | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### project_timeline
Milestone tracking for projects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| milestone_type | VARCHAR(50) | NOT NULL |
| milestone_title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| is_completed | BOOLEAN | DEFAULT false |
| completed_at | TIMESTAMPTZ | |
| sequence_order | INTEGER | NOT NULL |
| expected_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### Chat & Communication

#### chat_rooms
Chat room containers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| room_type | chat_room_type | NOT NULL |
| name | VARCHAR(255) | |
| project_id | UUID | FK → projects.id |
| is_active | BOOLEAN | DEFAULT true |
| is_suspended | BOOLEAN | DEFAULT false |
| suspended_by | UUID | FK → profiles.id |
| suspended_at | TIMESTAMPTZ | |
| suspension_reason | TEXT | |
| last_message_at | TIMESTAMPTZ | |
| message_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### chat_messages
Individual chat messages.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| chat_room_id | UUID | NOT NULL, FK → chat_rooms.id |
| sender_id | UUID | NOT NULL, FK → profiles.id |
| message_type | message_type | NOT NULL, DEFAULT 'text' |
| content | TEXT | |
| file_url | TEXT | |
| file_name | VARCHAR(255) | |
| file_type | VARCHAR(50) | |
| file_size_bytes | BIGINT | |
| action_type | VARCHAR(50) | |
| action_metadata | JSONB | |
| reply_to_id | UUID | FK → chat_messages.id |
| is_edited | BOOLEAN | DEFAULT false |
| edited_at | TIMESTAMPTZ | |
| is_deleted | BOOLEAN | DEFAULT false |
| deleted_at | TIMESTAMPTZ | |
| is_flagged | BOOLEAN | DEFAULT false |
| flagged_reason | TEXT | |
| contains_contact_info | BOOLEAN | DEFAULT false |
| read_by | JSONB | DEFAULT '[]' |
| delivered_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### chat_participants
Users participating in chat rooms.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| chat_room_id | UUID | NOT NULL, FK → chat_rooms.id |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| participant_role | VARCHAR(20) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| left_at | TIMESTAMPTZ | |
| last_read_at | TIMESTAMPTZ | |
| unread_count | INTEGER | DEFAULT 0 |
| notifications_enabled | BOOLEAN | DEFAULT true |
| joined_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (chat_room_id, profile_id)

#### chat_read_receipts
Detailed read receipts for messages.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| message_id | UUID | NOT NULL, FK → chat_messages.id |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| read_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (message_id, profile_id)

#### notifications
System notifications.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| notification_type | notification_type | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL |
| reference_type | VARCHAR(50) | |
| reference_id | UUID | |
| action_url | TEXT | |
| push_sent | BOOLEAN | DEFAULT false |
| push_sent_at | TIMESTAMPTZ | |
| whatsapp_sent | BOOLEAN | DEFAULT false |
| whatsapp_sent_at | TIMESTAMPTZ | |
| email_sent | BOOLEAN | DEFAULT false |
| email_sent_at | TIMESTAMPTZ | |
| is_read | BOOLEAN | DEFAULT false |
| read_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### Payments & Wallet

#### payments
Payment transactions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL, FK → profiles.id |
| amount | NUMERIC | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| gateway | VARCHAR(50) | DEFAULT 'razorpay' |
| gateway_order_id | VARCHAR(255) | |
| gateway_payment_id | VARCHAR(255) | |
| gateway_signature | VARCHAR(255) | |
| payment_method | VARCHAR(50) | |
| payment_method_details | JSONB | |
| reference_type | VARCHAR(50) | NOT NULL |
| reference_id | UUID | |
| status | payment_status | NOT NULL, DEFAULT 'initiated' |
| failure_reason | TEXT | |
| failure_code | VARCHAR(50) | |
| refund_amount | NUMERIC | |
| refund_id | VARCHAR(255) | |
| refunded_at | TIMESTAMPTZ | |
| refund_reason | TEXT | |
| initiated_at | TIMESTAMPTZ | DEFAULT now() |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### payouts
Payouts to doers/supervisors.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| recipient_id | UUID | NOT NULL, FK → profiles.id |
| recipient_type | VARCHAR(20) | NOT NULL |
| amount | NUMERIC | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| bank_account_name | VARCHAR(255) | |
| bank_account_number | VARCHAR(50) | |
| bank_ifsc_code | VARCHAR(20) | |
| bank_name | VARCHAR(100) | |
| upi_id | VARCHAR(100) | |
| payout_method | VARCHAR(20) | NOT NULL |
| gateway | VARCHAR(50) | DEFAULT 'razorpay' |
| gateway_payout_id | VARCHAR(255) | |
| gateway_reference | VARCHAR(255) | |
| status | payout_status | NOT NULL, DEFAULT 'pending' |
| failure_reason | TEXT | |
| retry_count | INTEGER | DEFAULT 0 |
| reference_type | VARCHAR(50) | |
| reference_ids | UUID[] | |
| requested_at | TIMESTAMPTZ | DEFAULT now() |
| processed_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### payout_requests
Payout withdrawal requests.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| requester_type | VARCHAR(20) | NOT NULL |
| requested_amount | NUMERIC | NOT NULL |
| approved_amount | NUMERIC | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| reviewed_by | UUID | FK → admins.id |
| reviewed_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | |
| payout_id | UUID | FK → payouts.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### wallets
User wallets for earnings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, UNIQUE, FK → profiles.id |
| balance | NUMERIC | NOT NULL, DEFAULT 0 |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| total_credited | NUMERIC | DEFAULT 0 |
| total_debited | NUMERIC | DEFAULT 0 |
| total_withdrawn | NUMERIC | DEFAULT 0 |
| locked_amount | NUMERIC | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### wallet_transactions
Wallet transaction history.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| wallet_id | UUID | NOT NULL, FK → wallets.id |
| transaction_type | transaction_type | NOT NULL |
| amount | NUMERIC | NOT NULL |
| balance_before | NUMERIC | NOT NULL |
| balance_after | NUMERIC | NOT NULL |
| reference_type | VARCHAR(50) | |
| reference_id | UUID | |
| description | TEXT | |
| notes | TEXT | |
| status | VARCHAR(20) | DEFAULT 'completed' |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### invoices
Generated invoices.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| invoice_number | VARCHAR(50) | NOT NULL, UNIQUE |
| user_id | UUID | NOT NULL, FK → profiles.id |
| project_id | UUID | FK → projects.id |
| payment_id | UUID | FK → payments.id |
| subtotal | NUMERIC | NOT NULL |
| tax_amount | NUMERIC | DEFAULT 0 |
| discount_amount | NUMERIC | DEFAULT 0 |
| total_amount | NUMERIC | NOT NULL |
| tax_rate | NUMERIC | |
| tax_type | VARCHAR(20) | |
| invoice_date | DATE | NOT NULL, DEFAULT CURRENT_DATE |
| due_date | DATE | |
| status | VARCHAR(20) | DEFAULT 'generated' |
| pdf_url | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### payment_methods
Saved payment methods.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| method_type | VARCHAR(20) | NOT NULL |
| upi_id | VARCHAR(100) | |
| card_last_four | VARCHAR(4) | |
| card_network | VARCHAR(20) | |
| card_type | VARCHAR(20) | |
| card_token | TEXT | |
| bank_name | VARCHAR(100) | |
| display_name | VARCHAR(100) | |
| is_default | BOOLEAN | DEFAULT false |
| is_verified | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

---

### Campus Pulse (Marketplace)

#### marketplace_listings
Marketplace listings for campus items, opportunities, housing, etc.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| seller_id | UUID | NOT NULL, FK → profiles.id |
| listing_type | listing_type | NOT NULL |
| category_id | UUID | FK → marketplace_categories.id |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| price | NUMERIC | |
| price_negotiable | BOOLEAN | DEFAULT true |
| rent_period | VARCHAR(20) | |
| item_condition | VARCHAR(20) | |
| city | VARCHAR(100) | |
| university_id | UUID | FK → universities.id |
| location_text | VARCHAR(255) | |
| latitude | NUMERIC | |
| longitude | NUMERIC | |
| distance_km | NUMERIC | |
| housing_type | VARCHAR(50) | |
| bedrooms | INTEGER | |
| available_from | DATE | |
| opportunity_type | VARCHAR(50) | |
| company_name | VARCHAR(255) | |
| application_deadline | DATE | |
| opportunity_url | TEXT | |
| post_content | TEXT | |
| poll_options | JSONB | |
| poll_ends_at | TIMESTAMPTZ | |
| status | listing_status | NOT NULL, DEFAULT 'pending_review' |
| reviewed_by | UUID | FK → admins.id |
| reviewed_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | |
| view_count | INTEGER | DEFAULT 0 |
| inquiry_count | INTEGER | DEFAULT 0 |
| favorites_count | INTEGER | DEFAULT 0 |
| total_votes | INTEGER | DEFAULT 0 |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### marketplace_categories
Listing categories.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| description | TEXT | |
| icon | VARCHAR(100) | |
| parent_id | UUID | FK → marketplace_categories.id |
| display_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### marketplace_favorites
User favorites/saved listings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| listing_id | UUID | NOT NULL, FK → marketplace_listings.id |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (profile_id, listing_id)

#### listing_images
Images for marketplace listings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| listing_id | UUID | NOT NULL, FK → marketplace_listings.id |
| image_url | TEXT | NOT NULL |
| thumbnail_url | TEXT | |
| display_order | INTEGER | DEFAULT 0 |
| is_primary | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### listing_inquiries
Inquiries on marketplace listings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| listing_id | UUID | NOT NULL, FK → marketplace_listings.id |
| inquirer_id | UUID | NOT NULL, FK → profiles.id |
| message | TEXT | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| response | TEXT | |
| responded_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### poll_votes
Votes on poll-type listings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| listing_id | UUID | NOT NULL, FK → marketplace_listings.id |
| voter_id | UUID | NOT NULL, FK → profiles.id |
| option_index | INTEGER | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (listing_id, voter_id)

---

### Support & Reviews

#### support_tickets
Customer support tickets.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| ticket_number | VARCHAR(20) | NOT NULL, UNIQUE |
| requester_id | UUID | NOT NULL, FK → profiles.id |
| subject | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR(100) | |
| project_id | UUID | FK → projects.id |
| priority | ticket_priority | DEFAULT 'medium' |
| status | ticket_status | DEFAULT 'open' |
| assigned_to | UUID | FK → admins.id |
| assigned_at | TIMESTAMPTZ | |
| resolution_notes | TEXT | |
| resolved_at | TIMESTAMPTZ | |
| resolved_by | UUID | FK → profiles.id |
| satisfaction_rating | INTEGER | |
| satisfaction_feedback | TEXT | |
| first_response_at | TIMESTAMPTZ | |
| closed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### ticket_messages
Messages within support tickets.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| ticket_id | UUID | NOT NULL, FK → support_tickets.id |
| sender_id | UUID | NOT NULL, FK → profiles.id |
| sender_type | VARCHAR(20) | NOT NULL |
| message | TEXT | NOT NULL |
| attachments | JSONB | |
| is_internal | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### doer_reviews
Reviews for doers.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| doer_id | UUID | NOT NULL, FK → doers.id |
| reviewer_id | UUID | NOT NULL, FK → profiles.id |
| reviewer_type | VARCHAR(20) | NOT NULL |
| project_id | UUID | FK → projects.id |
| overall_rating | INTEGER | NOT NULL |
| quality_rating | INTEGER | |
| timeliness_rating | INTEGER | |
| communication_rating | INTEGER | |
| review_text | TEXT | |
| is_public | BOOLEAN | DEFAULT true |
| is_flagged | BOOLEAN | DEFAULT false |
| flag_reason | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### supervisor_reviews
Reviews for supervisors.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| supervisor_id | UUID | NOT NULL, FK → supervisors.id |
| reviewer_id | UUID | NOT NULL, FK → profiles.id |
| reviewer_type | VARCHAR(20) | NOT NULL |
| project_id | UUID | FK → projects.id |
| overall_rating | INTEGER | NOT NULL |
| communication_rating | INTEGER | |
| helpfulness_rating | INTEGER | |
| review_text | TEXT | |
| is_public | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### quality_reports
AI/Plagiarism reports for deliverables.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| project_id | UUID | NOT NULL, FK → projects.id |
| deliverable_id | UUID | FK → project_deliverables.id |
| report_type | VARCHAR(20) | NOT NULL |
| score | NUMERIC | |
| result | VARCHAR(20) | |
| report_url | TEXT | |
| details | JSONB | |
| generated_by | UUID | FK → profiles.id |
| tool_used | VARCHAR(100) | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### user_feedback
General platform feedback from users.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL, FK → profiles.id |
| project_id | UUID | FK → projects.id |
| overall_satisfaction | INTEGER | NOT NULL |
| would_recommend | BOOLEAN | |
| feedback_text | TEXT | |
| improvement_suggestions | TEXT | |
| nps_score | INTEGER | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### Training & Quizzes

#### training_modules
Training content for doers/supervisors.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| target_role | VARCHAR(20) | NOT NULL |
| content_type | VARCHAR(20) | NOT NULL |
| content_url | TEXT | |
| content_html | TEXT | |
| duration_minutes | INTEGER | |
| sequence_order | INTEGER | NOT NULL |
| is_mandatory | BOOLEAN | DEFAULT true |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### training_progress
User progress through training modules.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| module_id | UUID | NOT NULL, FK → training_modules.id |
| status | VARCHAR(20) | DEFAULT 'not_started' |
| progress_percentage | INTEGER | DEFAULT 0 |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| time_spent_minutes | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

**Unique Constraint:** (profile_id, module_id)

#### quiz_questions
Quiz questions for activation.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| target_role | VARCHAR(20) | NOT NULL |
| question_text | TEXT | NOT NULL |
| question_type | VARCHAR(20) | DEFAULT 'multiple_choice' |
| options | JSONB | NOT NULL |
| correct_option_ids | INTEGER[] | |
| explanation | TEXT | |
| points | INTEGER | DEFAULT 1 |
| sequence_order | INTEGER | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### quiz_attempts
Quiz attempt records.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | NOT NULL, FK → profiles.id |
| target_role | VARCHAR(20) | NOT NULL |
| attempt_number | INTEGER | NOT NULL |
| answers | JSONB | NOT NULL |
| total_questions | INTEGER | NOT NULL |
| correct_answers | INTEGER | NOT NULL |
| score_percentage | NUMERIC | NOT NULL |
| passing_score | NUMERIC | NOT NULL |
| is_passed | BOOLEAN | NOT NULL |
| started_at | TIMESTAMPTZ | NOT NULL |
| completed_at | TIMESTAMPTZ | NOT NULL |
| time_taken_seconds | INTEGER | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### Reference Data

#### universities
University master data.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| short_name | VARCHAR(50) | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| country | VARCHAR(100) | DEFAULT 'India' |
| email_domains | TEXT[] | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### courses
Academic course master data.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| short_name | VARCHAR(50) | |
| degree_type | VARCHAR(50) | |
| duration_years | INTEGER | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### subjects
Academic subjects (hierarchical).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| description | TEXT | |
| icon | VARCHAR(100) | |
| parent_id | UUID | FK → subjects.id |
| category | VARCHAR(100) | |
| display_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### skills
Technical/soft skills.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| category | VARCHAR(100) | |
| subject_id | UUID | FK → subjects.id |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### industries
Industry master data for professionals.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### reference_styles
Citation/reference styles (APA, MLA, etc.).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| version | VARCHAR(50) | |
| description | TEXT | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

---

### Referrals & Discounts

#### referral_codes
Referral/discount codes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| code | VARCHAR(50) | NOT NULL, UNIQUE |
| description | TEXT | |
| code_type | VARCHAR(20) | NOT NULL |
| owner_id | UUID | FK → profiles.id |
| discount_type | VARCHAR(20) | NOT NULL |
| discount_value | NUMERIC | NOT NULL |
| max_discount | NUMERIC | |
| min_order_value | NUMERIC | |
| max_uses | INTEGER | |
| max_uses_per_user | INTEGER | DEFAULT 1 |
| current_uses | INTEGER | DEFAULT 0 |
| valid_from | TIMESTAMPTZ | DEFAULT now() |
| valid_until | TIMESTAMPTZ | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### referral_usage
Usage records for referral codes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| referral_code_id | UUID | NOT NULL, FK → referral_codes.id |
| used_by | UUID | NOT NULL, FK → profiles.id |
| project_id | UUID | FK → projects.id |
| payment_id | UUID | FK → payments.id |
| discount_applied | NUMERIC | NOT NULL |
| used_at | TIMESTAMPTZ | DEFAULT now() |

---

### System & Logging

#### activity_logs
User activity audit log.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| profile_id | UUID | FK → profiles.id |
| action | VARCHAR(100) | NOT NULL |
| action_category | VARCHAR(50) | |
| target_type | VARCHAR(50) | |
| target_id | UUID | |
| description | TEXT | |
| metadata | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| device_type | VARCHAR(20) | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### activity_logs_archive
Archived activity logs (>90 days old).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| profile_id | UUID | |
| action | VARCHAR(100) | NOT NULL |
| action_category | VARCHAR(50) | |
| target_type | VARCHAR(50) | |
| target_id | UUID | |
| description | TEXT | |
| metadata | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| device_type | VARCHAR(20) | |
| created_at | TIMESTAMPTZ | |
| archived_at | TIMESTAMPTZ | DEFAULT now() |

#### error_logs
Application error log.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| error_type | VARCHAR(100) | NOT NULL |
| error_message | TEXT | NOT NULL |
| stack_trace | TEXT | |
| profile_id | UUID | FK → profiles.id |
| request_url | TEXT | |
| request_method | VARCHAR(10) | |
| request_body | JSONB | |
| app_version | VARCHAR(20) | |
| platform | VARCHAR(20) | |
| device_info | JSONB | |
| sentry_event_id | VARCHAR(100) | |
| is_resolved | BOOLEAN | DEFAULT false |
| resolved_at | TIMESTAMPTZ | |
| resolution_notes | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### error_logs_archive
Archived error logs (>30 days old, resolved).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| error_type | VARCHAR(100) | NOT NULL |
| error_message | TEXT | NOT NULL |
| stack_trace | TEXT | |
| profile_id | UUID | |
| request_url | TEXT | |
| request_method | VARCHAR(10) | |
| request_body | JSONB | |
| app_version | VARCHAR(20) | |
| platform | VARCHAR(20) | |
| device_info | JSONB | |
| sentry_event_id | VARCHAR(100) | |
| is_resolved | BOOLEAN | DEFAULT false |
| resolved_at | TIMESTAMPTZ | |
| resolution_notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| archived_at | TIMESTAMPTZ | DEFAULT now() |

#### app_settings
Application configuration settings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| key | VARCHAR(100) | NOT NULL, UNIQUE |
| value | JSONB | NOT NULL |
| description | TEXT | |
| category | VARCHAR(100) | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### banners
Promotional banners.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | VARCHAR(255) | NOT NULL |
| subtitle | TEXT | |
| image_url | TEXT | NOT NULL |
| image_url_mobile | TEXT | |
| cta_text | VARCHAR(100) | |
| cta_url | TEXT | |
| cta_action | VARCHAR(50) | |
| target_user_types | TEXT[] | |
| target_roles | TEXT[] | |
| display_location | VARCHAR(50) | NOT NULL |
| display_order | INTEGER | DEFAULT 0 |
| start_date | TIMESTAMPTZ | DEFAULT now() |
| end_date | TIMESTAMPTZ | |
| is_active | BOOLEAN | DEFAULT true |
| impression_count | INTEGER | DEFAULT 0 |
| click_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### faqs
Frequently asked questions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| question | TEXT | NOT NULL |
| answer | TEXT | NOT NULL |
| category | VARCHAR(100) | |
| target_role | VARCHAR(20) | |
| display_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| helpful_count | INTEGER | DEFAULT 0 |
| not_helpful_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

#### pricing_guides
Pricing configuration by service/subject.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| service_type | service_type | NOT NULL |
| subject_id | UUID | FK → subjects.id |
| base_price_per_page | NUMERIC | |
| base_price_per_word | NUMERIC | |
| base_price_fixed | NUMERIC | |
| urgency_24h_multiplier | NUMERIC | DEFAULT 1.5 |
| urgency_48h_multiplier | NUMERIC | DEFAULT 1.3 |
| urgency_72h_multiplier | NUMERIC | DEFAULT 1.15 |
| complexity_easy_multiplier | NUMERIC | DEFAULT 1.0 |
| complexity_medium_multiplier | NUMERIC | DEFAULT 1.2 |
| complexity_hard_multiplier | NUMERIC | DEFAULT 1.5 |
| supervisor_percentage | NUMERIC | DEFAULT 15 |
| platform_percentage | NUMERIC | DEFAULT 20 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

---

## Functions

### update_updated_at_column()
Automatically updates the `updated_at` column on row updates.
```sql
RETURNS trigger
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
```

### create_wallet_for_profile()
Creates a wallet automatically when a new profile is created.
```sql
RETURNS trigger
BEGIN
    INSERT INTO wallets (profile_id, balance, currency)
    VALUES (NEW.id, 0, 'INR');
    RETURN NEW;
END;
```

### generate_referral_code()
Generates a unique referral code for new profiles.
```sql
RETURNS trigger
-- Generates codes like: EXPERT + random 4 chars (e.g., EXPERT7B3F)
```

### generate_project_number()
Generates sequential project numbers (AX-00001, AX-00002, etc.).
```sql
RETURNS trigger
-- Format: AX-XXXXX (zero-padded 5-digit number)
```

### generate_ticket_number()
Generates sequential ticket numbers with year prefix.
```sql
RETURNS trigger
-- Format: TKT-YYYY-XXXXX
```

### log_project_status_change()
Logs project status changes to project_status_history.
```sql
RETURNS trigger
-- Inserts record when status changes
-- Updates status_updated_at
```

### update_doer_stats()
Updates doer statistics when project is completed.
```sql
RETURNS trigger
-- Increments total_projects_completed
-- Adds doer_payout to total_earnings
```

### update_wallet_balance()
Updates wallet balance based on transaction type.
```sql
RETURNS trigger
-- Credits: credit, refund, top_up, project_earning, commission, bonus
-- Debits: debit, withdrawal, project_payment, penalty
```

### detect_contact_info()
Detects and flags messages containing contact information.
```sql
RETURNS trigger
-- Detects: phone numbers, emails, social media handles
-- Sets: contains_contact_info, is_flagged, flagged_reason
```

### mark_message_as_read(p_message_id UUID, p_profile_id UUID)
Marks a specific chat message as read.
```sql
RETURNS BOOLEAN
-- Inserts into chat_read_receipts
-- Updates read_by JSONB column
-- Updates participant unread_count
```

### mark_room_messages_as_read(p_chat_room_id UUID, p_profile_id UUID)
Marks all unread messages in a chat room as read.
```sql
RETURNS INTEGER (number of messages marked)
-- Bulk inserts read receipts
-- Resets participant unread_count to 0
```

### update_listing_favorites_count()
Updates favorites_count when listings are favorited/unfavorited.
```sql
RETURNS trigger
-- INSERT: Increments count
-- DELETE: Decrements count
```

### update_poll_votes_count()
Updates vote counts when poll votes are added/removed.
```sql
RETURNS trigger
-- Updates total_votes
-- Updates poll_options JSONB vote counts
```

### archive_old_activity_logs(days_to_keep INTEGER DEFAULT 90)
Archives activity logs older than specified days.
```sql
RETURNS INTEGER (rows archived)
-- Moves old logs to activity_logs_archive
-- Deletes from main table
```

### archive_old_error_logs(days_to_keep INTEGER DEFAULT 30)
Archives resolved error logs older than specified days.
```sql
RETURNS INTEGER (rows archived)
-- Only archives resolved errors (or >60 days unresolved)
-- Moves to error_logs_archive
```

### cleanup_archived_logs(days_to_keep INTEGER DEFAULT 365)
Permanently deletes very old archived logs.
```sql
RETURNS TABLE(activity_deleted INTEGER, error_deleted INTEGER)
-- Deletes from both archive tables
```

### get_log_statistics()
Returns statistics about log tables.
```sql
RETURNS TABLE(table_name TEXT, row_count BIGINT, oldest_entry TIMESTAMPTZ, newest_entry TIMESTAMPTZ)
-- Returns stats for all 4 log tables
```

---

## Triggers

### Auto-update timestamps
Applied to 25+ tables to automatically update `updated_at`:
- profiles, students, professionals, doers, supervisors, admins
- projects, project_quotes, project_revisions
- chat_rooms, marketplace_listings
- payments, payouts, payout_requests, wallets
- support_tickets, referral_codes
- quiz_questions, training_modules, training_progress
- doer_activation, supervisor_activation
- doer_reviews, faqs, banners, app_settings, pricing_guides, payment_methods

### Profile triggers
| Trigger | Event | Function |
|---------|-------|----------|
| create_wallet_trigger | AFTER INSERT | create_wallet_for_profile() |
| trigger_generate_referral_code | BEFORE INSERT | generate_referral_code() |

### Project triggers
| Trigger | Event | Function |
|---------|-------|----------|
| set_project_number | BEFORE INSERT | generate_project_number() |
| project_status_change_trigger | BEFORE UPDATE | log_project_status_change() |
| doer_stats_trigger | AFTER UPDATE | update_doer_stats() |

### Support ticket triggers
| Trigger | Event | Function |
|---------|-------|----------|
| set_ticket_number | BEFORE INSERT | generate_ticket_number() |

### Chat triggers
| Trigger | Event | Function |
|---------|-------|----------|
| detect_contact_trigger | BEFORE INSERT | detect_contact_info() |

### Wallet triggers
| Trigger | Event | Function |
|---------|-------|----------|
| wallet_balance_trigger | AFTER INSERT | update_wallet_balance() |

### Marketplace triggers
| Trigger | Event | Function |
|---------|-------|----------|
| trigger_update_favorites_count | AFTER INSERT/DELETE | update_listing_favorites_count() |
| trigger_update_poll_votes | AFTER INSERT/DELETE | update_poll_votes_count() |

---

## Foreign Key Relationships

### profiles (Central Entity)
```
profiles.referred_by → profiles.id (self-reference)
students.profile_id → profiles.id
professionals.profile_id → profiles.id
doers.profile_id → profiles.id
supervisors.profile_id → profiles.id
admins.profile_id → profiles.id
wallets.profile_id → profiles.id
notifications.profile_id → profiles.id
activity_logs.profile_id → profiles.id
error_logs.profile_id → profiles.id
chat_participants.profile_id → profiles.id
chat_messages.sender_id → profiles.id
payment_methods.profile_id → profiles.id
payments.user_id → profiles.id
payouts.recipient_id → profiles.id
payout_requests.profile_id → profiles.id
referral_codes.owner_id → profiles.id
referral_usage.used_by → profiles.id
training_progress.profile_id → profiles.id
quiz_attempts.profile_id → profiles.id
support_tickets.requester_id → profiles.id
ticket_messages.sender_id → profiles.id
user_feedback.user_id → profiles.id
marketplace_listings.seller_id → profiles.id
marketplace_favorites.profile_id → profiles.id
listing_inquiries.inquirer_id → profiles.id
poll_votes.voter_id → profiles.id
```

### projects (Core Business Entity)
```
projects.user_id → profiles.id
projects.supervisor_id → supervisors.id
projects.doer_id → doers.id
projects.subject_id → subjects.id
projects.reference_style_id → reference_styles.id
projects.payment_id → payments.id
projects.cancelled_by → profiles.id
project_files.project_id → projects.id
project_deliverables.project_id → projects.id
project_quotes.project_id → projects.id
project_revisions.project_id → projects.id
project_assignments.project_id → projects.id
project_status_history.project_id → projects.id
project_timeline.project_id → projects.id
chat_rooms.project_id → projects.id
support_tickets.project_id → projects.id
invoices.project_id → projects.id
user_feedback.project_id → projects.id
quality_reports.project_id → projects.id
doer_reviews.project_id → projects.id
supervisor_reviews.project_id → projects.id
referral_usage.project_id → projects.id
```

### Other Key Relationships
```
students.university_id → universities.id
students.course_id → courses.id
professionals.industry_id → industries.id
doer_skills.skill_id → skills.id
doer_subjects.subject_id → subjects.id
supervisor_expertise.subject_id → subjects.id
skills.subject_id → subjects.id
subjects.parent_id → subjects.id (self-reference)
marketplace_categories.parent_id → marketplace_categories.id (self-reference)
marketplace_listings.category_id → marketplace_categories.id
marketplace_listings.university_id → universities.id
chat_messages.reply_to_id → chat_messages.id (self-reference)
chat_read_receipts.message_id → chat_messages.id
wallet_transactions.wallet_id → wallets.id
```

---

## Indexes Summary

Total: **401 indexes**

### By Category:
- **Primary Keys (64)**: One per table
- **Unique Constraints (~25)**: email, slugs, composite unique keys
- **Foreign Key Indexes (~107)**: One per FK relationship
- **Query Optimization (~205)**: Status filters, date ranges, composite indexes

### Key Performance Indexes:

#### High-Traffic Tables
```sql
-- projects
idx_projects_status
idx_projects_user_status
idx_projects_supervisor_active
idx_projects_doer_active
idx_projects_deadline_status
idx_projects_created_status

-- chat_messages
idx_chat_messages_room_created
idx_chat_messages_sender_created
idx_chat_messages_read_by (GIN)

-- notifications
idx_notifications_profile_unread
idx_notifications_user_unread

-- marketplace_listings
idx_marketplace_listings_active
idx_marketplace_listings_category_status
idx_marketplace_listings_university
```

#### Partial Indexes (Space-Efficient)
```sql
-- Active records only
idx_profiles_is_active WHERE (is_active = true)
idx_doers_is_activated WHERE (is_activated = true)
idx_doers_available_activated WHERE (is_available = true AND is_activated = true)

-- Unread notifications only
idx_notifications_is_read WHERE (is_read = false)

-- Open tickets only
idx_support_tickets_open WHERE status IN ('open', 'in_progress', 'waiting_response')
```

---

## Notes

### Security
- RLS (Row Level Security) is currently **disabled** on all tables
- Authentication is via **Google OAuth only** (no password-based login)
- Functions use `SECURITY INVOKER` and explicit `search_path = public`

### Data Retention
- Activity logs: Archived after 90 days
- Error logs: Archived after 30 days (resolved) or 60 days (unresolved)
- Archived logs: Deleted after 365 days

### Auto-Generated Values
- `referral_code`: Auto-generated on profile creation (format: EXPERTXXXX)
- `project_number`: Auto-generated sequential (format: AX-XXXXX)
- `ticket_number`: Auto-generated with year (format: TKT-YYYY-XXXXX)
- `wallet`: Auto-created when profile is created

### Common Patterns
- All tables use UUID primary keys with `gen_random_uuid()`
- Most tables have `created_at` and `updated_at` timestamps
- Soft delete via `deleted_at` timestamp (profiles table)
- JSONB for flexible data (metadata, options, settings)
- Arrays for multi-value fields (device_tokens, focus_areas, email_domains)
