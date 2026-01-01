# Supervisor Web Application - Comprehensive Implementation Plan

> **Project:** AssignX Supervisor Panel
> **Technology:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + **shadcn/ui (New York style)**
> **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
> **Version:** 1.0 | **Date:** December 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Setup Requirements](#2-tech-stack--setup-requirements)
3. [Feature Summary](#3-feature-summary)
4. [Implementation Batches](#4-implementation-batches)
5. [Database Tables Required](#5-database-tables-required)
6. [Folder Structure](#6-folder-structure)
7. [Detailed Feature Specifications](#7-detailed-feature-specifications)
8. [Database Schema Details](#8-database-schema-details)
9. [Implementation Notes](#implementation-notes)

---

## 1. Project Overview

The Supervisor Web Application (AdminX) is designed for senior professionals and subject matter experts who manage the quality control workflow in AssignX. Supervisors are the bridge between Users (clients) and Doers (experts), responsible for:

- Analyzing project requests and setting quotes
- Assigning doers to projects
- Quality control (QC) of submitted work
- Managing chat communications
- Tracking earnings and performance

### App Identity
- **App Name:** AdminX
- **Visual Theme:** Professional, Sharp, Authority-driven
- **Color Scheme:** Dark Blue/Slate Grey & White
- **Tagline:** "Quality. Integrity. Supervision."

---

## 2. Tech Stack & Setup Requirements

### Core Dependencies to Install

```bash
# UI Framework - shadcn/ui with New York style
npx shadcn@latest init

# When prompted, select:
# - Style: New York
# - Base color: Slate
# - CSS variables: Yes

# Additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install lucide-react
npm install recharts
npm install @radix-ui/react-icons
npm install sonner
npm install framer-motion
```

### shadcn/ui Components to Install

```bash
npx shadcn@latest add button card input label form
npx shadcn@latest add dialog sheet dropdown-menu
npx shadcn@latest add tabs table badge avatar
npx shadcn@latest add select checkbox radio-group
npx shadcn@latest add toast sonner alert
npx shadcn@latest add separator skeleton
npx shadcn@latest add progress scroll-area
npx shadcn@latest add switch toggle textarea
npx shadcn@latest add calendar popover command
npx shadcn@latest add navigation-menu sidebar
npx shadcn@latest add chart
```

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## 3. Feature Summary

| Category | Features Count | Priority |
|----------|---------------|----------|
| Onboarding & Registration | 11 | Core |
| Activation Phase | 6 | Core |
| Main Dashboard / Requests | 12 | Core |
| Active Projects Management | 10 | Core |
| Training & Resources | 5 | Core |
| Profile & Statistics | 10 | Core |
| Doer & User Management + Support | 7 | Core |
| **Total Features** | **61** | - |

---

## 4. Implementation Batches

### BATCH 1: Foundation & Authentication (Week 1)
**Priority: Critical - Must complete before other batches**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | SETUP-01 | Project Setup | Configure Next.js with shadcn/ui New York style, Tailwind, TypeScript |
| 2 | SETUP-02 | Supabase Setup | Configure Supabase client, auth helpers, middleware |
| 3 | SETUP-03 | Theme System | Dark/Light mode support with shadcn theming |
| 4 | S01 | Splash Screen | Professional Dark Blue background, AdminX Logo, Tagline |
| 5 | S05 | Basic Credentials Form | Full Name, Email, Phone (OTP verify), Password |
| 6 | AUTH-01 | Login Page | Email/Password login with validation |
| 7 | AUTH-02 | Session Management | Protected routes, auth middleware |
| 8 | LAYOUT-01 | App Shell | Sidebar, Header, Main content area layout |

**Deliverables:**
- Working authentication flow
- Protected route structure
- Base layout with responsive sidebar
- Theme switching capability

---

### BATCH 2: Registration & Onboarding (Week 2)
**Priority: High - Required for new supervisor signup**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S02 | Onboarding Slide 1 | "Can you supervise with the knowledge which you have?" |
| 2 | S03 | Onboarding Slide 2 | "Do you want to increase the knowledge in your field?" |
| 3 | S04 | Onboarding Slide 3 | "Admin X is for you!" with value proposition |
| 4 | S06 | Professional Profile Step | Qualification, Areas of Expertise, Years of Experience, CV Upload |
| 5 | S07 | Banking Setup Step | Bank Name, Account Number, IFSC Code, UPI ID |
| 6 | S08 | Submit Application CTA | Application submission for admin review |
| 7 | S09 | Application Pending State | Waiting screen with status indicator |
| 8 | S10 | CV Verification Status | Show verification progress |
| 9 | S11 | Experience Validation Display | Years of experience validation status |

**Deliverables:**
- Multi-step registration wizard
- File upload for CV
- Bank details form with validation
- Application submission flow

---

### BATCH 3: Activation Flow (Week 3)
**Priority: High - Gate to access dashboard**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S12 | Activation Lock Screen | Dashboard LOCKED with "Unlock Your Admin Rights" header |
| 2 | S13 | Training Module | Videos/PDFs: "How to QC a file", "Pricing Guidelines", "Communication Ethics" |
| 3 | S14 | Mark Complete Button | Unlocks next step after training |
| 4 | S15 | Supervisor Test | 10 scenario-based questions |
| 5 | S16 | Test Pass/Fail Logic | Success unlocks dashboard, Fail requires re-review |
| 6 | S17 | Welcome Message | "Welcome, Admin. Your dashboard is ready." |

**Deliverables:**
- Training content viewer (video/PDF support)
- Quiz system with scoring
- Progress tracking
- Activation status management

---

### BATCH 4: Main Dashboard & Requests (Week 4-5)
**Priority: Core - Primary supervisor workflow**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S18 | Top Bar Greeting | "Hello, [Name]." with Notification Bell |
| 2 | S19 | Menu Drawer | Profile Card (Name + Rating), Availability Toggle, Menu Items |
| 3 | S20 | Availability Toggle | 🟢 Available / ⚪ Busy for receiving new projects |
| 4 | S21 | Drawer Menu Items | Doer Reviews, My Reviews, Earnings, Settings |
| 5 | S22 | Field Filter | "My Field Only" default filter for requests |
| 6 | S23 | Section A: New Requests | Projects needing quote - Card with Title, Student Name, "Analyze & Quote" button |
| 7 | S24 | Analyze & Quote Action | Modal/Page to set the price for the Client |
| 8 | S25 | Section B: Ready to Assign | Paid projects - Card with Title, "PAID" badge, "Assign Doer" button |
| 9 | S26 | Assign Doer Action | Opens list of available Experts with filters |
| 10 | S27 | Doer Selection List | Shows Doer name, rating, skills, availability status |
| 11 | S28 | Project Pricing | Set both user quote and doer payout amounts |
| 12 | S29 | Doer Reviews Access | Check ratings/feedback of Experts before assignment |

**Deliverables:**
- Dashboard with request sections
- Quote creation interface
- Doer assignment system
- Real-time notifications

---

### BATCH 5: Active Projects Management (Week 6-7)
**Priority: Core - Project lifecycle management**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S30 | Active Projects Tabs | On Going, For Review (QC), Completed |
| 2 | S31 | On Going Tab | Project ID, Expert Name, Timer, Chat button |
| 3 | S32 | For Review (QC) Tab | Expert submitted file, awaiting supervisor review |
| 4 | S33 | Approve & Deliver Action | QC passed, sends deliverable to client |
| 5 | S34 | Reject/Revision Action | Sends back to Doer with feedback for rework |
| 6 | S35 | Completed Tab | Project history with status |
| 7 | S36 | Unified Chat Interface | Talk to Client AND Doer - separate or group chats |
| 8 | S37 | Chat Monitoring | Supervisor can view all chat messages |
| 9 | S38 | Chat Suspension | Supervisor can suspend chat when contact sharing detected |
| 10 | S39 | Contact Sharing Prevention | Chat blocks doer from sending contact details |

**Deliverables:**
- Project tabs with filtering
- QC workflow (approve/reject)
- Real-time chat with Supabase Realtime
- File preview and download

---

### BATCH 6: Training & Resources (Week 8)
**Priority: Important - Tools for supervisors**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S40 | Plagiarism Checker | Internal tool to verify Doer's work |
| 2 | S41 | AI Detector | Check for AI-generated content in submissions |
| 3 | S42 | Pricing Guide | Reference sheet for standard quote amounts |
| 4 | S43 | Advanced Training | Upskill videos for supervisors |
| 5 | S44 | Resources Grid | Clean layout for all tools |

**Deliverables:**
- Resource center page
- Tool integrations (plagiarism/AI detection APIs)
- Pricing guide reference
- Training video library

---

### BATCH 7: Profile, Statistics & Earnings (Week 9)
**Priority: Important - Performance tracking**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S45 | Stats Dashboard | Active Projects, Projects Completed, Success Rate (%), Total Earnings |
| 2 | S46 | Edit Profile | Update skills/qualifications |
| 3 | S47 | Payment Ledger | Transaction history with commission details |
| 4 | S48 | Contact Support | Help line access |
| 5 | S49 | Log Out | Profile action |
| 6 | S50 | My Reviews | See feedback Clients gave you |
| 7 | S51 | Doer Blacklist | Flag bad Experts to avoid future assignments |
| 8 | S52 | Commission Tracking | Earnings per project visible |
| 9 | S53 | Performance Metrics | Success rate, response time, client satisfaction |
| 10 | S54 | Earnings Graph | Visual earnings over time |

**Deliverables:**
- Profile management page
- Statistics dashboard with charts
- Earnings/commission tracker
- Review management

---

### BATCH 8: Doer & User Management + Support (Week 10)
**Priority: Important - Management capabilities**

| # | Feature ID | Feature Name | Description |
|---|-----------|--------------|-------------|
| 1 | S55 | Doer Management | View skills, ratings, availability of all doers |
| 2 | S56 | User Management | View profiles and project history of clients |
| 3 | S57 | Notification System | Alerts for new projects, submissions, payments |
| 4 | S58 | Earnings Overview | Commission tracking per project with breakdown |
| 5 | S59 | Support Ticket System | Create and view support tickets (TKT-YYYY-XXXXX) |
| 6 | S60 | Ticket Messages | Communicate with support team |
| 7 | S61 | FAQ Access | View frequently asked questions |

**Deliverables:**
- Doer listing with filters
- User listing with project history
- Notification center
- Commission breakdown view
- Support ticket creation and tracking
- FAQ viewer

---

### BATCH 9: Polish & Optimization (Week 11)
**Priority: Enhancement - Quality improvements**

| # | Task | Description |
|---|------|-------------|
| 1 | Performance Optimization | Code splitting, lazy loading, image optimization |
| 2 | Accessibility Audit | WCAG compliance, keyboard navigation |
| 3 | Error Handling | Global error boundaries, toast notifications |
| 4 | Loading States | Skeleton loaders, optimistic updates |
| 5 | Mobile Responsiveness | Tablet and mobile breakpoints |
| 6 | SEO Optimization | Meta tags, Open Graph |
| 7 | Analytics Integration | Sentry error tracking |
| 8 | Testing | Unit tests, integration tests |

---

## 5. Database Tables Required

### Core Tables (Supervisor-specific)
```
- profiles (base user table)
- supervisors (supervisor extension)
- supervisor_expertise (subject areas)
- supervisor_activation (activation status)
- supervisor_reviews (reviews for supervisors)
```

### Project Tables
```
- projects (main projects)
- project_files (uploaded files)
- project_deliverables (completed work)
- project_status_history (audit trail)
- project_revisions (revision requests)
- project_quotes (pricing quotes)
- project_assignments (assignment history)
- quality_reports (AI/plagiarism reports)
- project_timeline (milestone tracking)
```

### Financial Tables
```
- wallets (balance management)
- wallet_transactions (transaction history)
- payments (payment records)
- payouts (doer/supervisor payouts)
- payout_requests (withdrawal requests)
```

### Chat Tables
```
- chat_rooms (chat rooms)
- chat_participants (room participants)
- chat_messages (messages)
- notifications (push/in-app notifications)
```

### Training Tables
```
- training_modules (training content)
- training_progress (user progress)
- quiz_questions (quiz questions)
- quiz_attempts (quiz attempt records)
```

### Configuration Tables
```
- subjects (subject master)
- skills (skills master)
- reference_styles (citation styles)
- pricing_guides (pricing configuration with multipliers)
- app_settings (global application settings)
- faqs (frequently asked questions)
- banners (promotional banners)
- referral_codes (promo/referral codes)
- referral_usage (code usage tracking)
- doers (doer information for assignment)
- doer_skills (doer skills)
- doer_subjects (doer subject areas)
- doer_reviews (doer reviews)
```

### Support & Audit Tables
```
- support_tickets (support ticket system)
- ticket_messages (messages in tickets)
- activity_logs (user activity audit trail)
- error_logs (application error logs)
- invoices (generated invoices)
```

---

## 6. Folder Structure

```
superviser-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── requests/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── quote/
│   │   │           └── page.tsx
│   │   ├── doers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   └── [roomId]/
│   │   │       └── page.tsx
│   │   ├── earnings/
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── support/
│   │   │   ├── page.tsx
│   │   │   ├── tickets/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── faq/
│   │   │       └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (activation)/
│   │   ├── activation/
│   │   │   └── page.tsx
│   │   ├── training/
│   │   │   └── page.tsx
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-user.tsx
│   │   └── app-sidebar.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── otp-input.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── request-card.tsx
│   │   └── project-card.tsx
│   ├── projects/
│   │   ├── project-list.tsx
│   │   ├── project-detail.tsx
│   │   ├── quote-form.tsx
│   │   └── qc-review-form.tsx
│   ├── doers/
│   │   ├── doer-list.tsx
│   │   ├── doer-card.tsx
│   │   └── assign-doer-modal.tsx
│   ├── chat/
│   │   ├── chat-window.tsx
│   │   ├── message-list.tsx
│   │   └── message-input.tsx
│   ├── training/
│   │   ├── training-viewer.tsx
│   │   └── quiz-component.tsx
│   ├── support/
│   │   ├── ticket-form.tsx
│   │   ├── ticket-list.tsx
│   │   ├── ticket-detail.tsx
│   │   └── faq-accordion.tsx
│   ├── notifications/
│   │   ├── notification-list.tsx
│   │   └── notification-item.tsx
│   └── shared/
│       ├── file-upload.tsx
│       ├── data-table.tsx
│       ├── status-badge.tsx
│       └── loading-skeleton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── database.types.ts
│   ├── utils.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   └── project.ts
│   └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-projects.ts
│   ├── use-doers.ts
│   ├── use-chat.ts
│   └── use-notifications.ts
├── store/
│   ├── auth-store.ts
│   ├── project-store.ts
│   └── ui-store.ts
├── types/
│   ├── database.ts
│   ├── api.ts
│   └── index.ts
└── public/
    ├── logo.svg
    └── images/
```

---

## 7. Detailed Feature Specifications

### 7.1 Authentication Flow

**Login Page:**
- Email/Password authentication
- "Remember me" checkbox
- Forgot password link
- Social login (Google) - optional

**Registration Flow:**
1. Basic credentials (name, email, phone with OTP, password)
2. Professional profile (qualification, expertise, experience, CV)
3. Banking details (bank name, account number, IFSC, UPI)
4. Submit for review

### 7.2 Dashboard Features

**Request Sections:**
- **New Requests:** Projects awaiting quote
  - Card shows: Title, Subject, Student Name, Deadline
  - Action: "Analyze & Quote" button

- **Ready to Assign:** Paid projects
  - Card shows: Title, Subject, "PAID" badge, User amount
  - Action: "Assign Doer" button

**Quick Stats:**
- Active Projects count
- Pending QC count
- Today's Earnings
- Average Rating

### 7.3 Project Management

**Project Status Flow:**
```
submitted → analyzing → quoted → payment_pending → paid →
assigned → in_progress → submitted_for_qc → qc_in_progress →
qc_approved → delivered → completed
```

**QC Actions:**
- View deliverable files
- Check AI/Plagiarism reports
- Approve & Deliver to client
- Reject with feedback

### 7.4 Chat System

**Chat Types:**
- `project_user_supervisor` - User ↔ Supervisor
- `project_supervisor_doer` - Supervisor ↔ Doer
- `project_all` - Group chat (all parties)

**Features:**
- Real-time messaging (Supabase Realtime)
- File sharing
- Read receipts
- Contact info blocking

### 7.5 Notification Types

```typescript
type NotificationType =
  | 'project_submitted'      // New project request
  | 'payment_received'       // User paid for project
  | 'work_submitted'         // Doer submitted work for QC
  | 'revision_requested'     // User requested changes
  | 'new_message'            // New chat message
  | 'payout_processed'       // Earnings transferred
```

---

## Status Color Coding Reference

| Color | Status | Description |
|-------|--------|-------------|
| 🟡 Yellow | Analyzing | Supervisor reviewing requirements |
| 🟠 Orange | Payment Pending | Quote ready, awaiting payment |
| 🔵 Blue | In Progress | Expert actively working |
| 🟢 Green | For Review | Work delivered, awaiting approval |
| ⚫ Grey | Completed | Archived in history |
| 🔴 Red | Urgent/Revision | <6h deadline or revision requested |

---

## 8. Database Schema Details

### ENUM Types Required

```sql
-- Project lifecycle states (20 states)
CREATE TYPE project_status AS ENUM (
    'draft', 'submitted', 'analyzing', 'quoted', 'payment_pending',
    'paid', 'assigning', 'assigned', 'in_progress', 'submitted_for_qc',
    'qc_in_progress', 'qc_approved', 'qc_rejected', 'delivered',
    'revision_requested', 'in_revision', 'completed', 'auto_approved',
    'cancelled', 'refunded'
);

-- Service types
CREATE TYPE service_type AS ENUM (
    'new_project', 'proofreading', 'plagiarism_check', 'ai_detection', 'expert_opinion'
);

-- Transaction types for wallet
CREATE TYPE transaction_type AS ENUM (
    'credit', 'debit', 'refund', 'withdrawal', 'top_up',
    'project_payment', 'project_earning', 'commission', 'bonus', 'penalty', 'reversal'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
    'initiated', 'pending', 'processing', 'completed', 'failed',
    'cancelled', 'refunded', 'partially_refunded'
);

-- Payout status
CREATE TYPE payout_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
);

-- Chat room types
CREATE TYPE chat_room_type AS ENUM (
    'project_user_supervisor', 'project_supervisor_doer', 'project_all', 'support', 'direct'
);

-- Message types
CREATE TYPE message_type AS ENUM (
    'text', 'file', 'image', 'system', 'action'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'project_submitted', 'quote_ready', 'payment_received', 'project_assigned',
    'task_available', 'task_assigned', 'work_submitted', 'qc_approved', 'qc_rejected',
    'revision_requested', 'project_delivered', 'project_completed', 'new_message',
    'payout_processed', 'system_alert', 'promotional'
);

-- Support ticket status
CREATE TYPE ticket_status AS ENUM (
    'open', 'in_progress', 'waiting_response', 'resolved', 'closed', 'reopened'
);

-- Ticket priority
CREATE TYPE ticket_priority AS ENUM (
    'low', 'medium', 'high', 'urgent'
);
```

### Key Database Functions

| Function | Purpose |
|----------|---------|
| `update_updated_at_column()` | Auto-updates `updated_at` timestamp on row changes |
| `generate_project_number()` | Generates unique project numbers (AX-00001) |
| `generate_ticket_number()` | Generates unique ticket numbers (TKT-2025-00001) |
| `log_project_status_change()` | Logs status changes to history table |
| `update_wallet_balance()` | Updates wallet balance on transactions |
| `update_doer_stats()` | Updates doer statistics on project completion |
| `create_wallet_for_profile()` | Auto-creates wallet for new profiles |
| `detect_contact_info()` | Detects contact info in chat messages (phones, emails, social handles) |

### Key Triggers

| Trigger | Table | Purpose |
|---------|-------|---------|
| `set_project_number` | projects | Auto-generate project number on insert |
| `set_ticket_number` | support_tickets | Auto-generate ticket number on insert |
| `project_status_change_trigger` | projects | Log status changes to history |
| `wallet_balance_trigger` | wallet_transactions | Update wallet balance |
| `doer_stats_trigger` | projects | Update doer stats on completion |
| `create_wallet_trigger` | profiles | Create wallet for new users |
| `detect_contact_trigger` | chat_messages | Detect contact info sharing |
| `update_*_updated_at` | (all tables) | Auto-update timestamps |

### Pricing Configuration (pricing_guides table)

| Field | Description |
|-------|-------------|
| `base_price_per_page` | Base price per page |
| `base_price_per_word` | Base price per word |
| `urgency_24h_multiplier` | 1.5x for 24h deadline |
| `urgency_48h_multiplier` | 1.3x for 48h deadline |
| `urgency_72h_multiplier` | 1.15x for 72h deadline |
| `complexity_easy_multiplier` | 1.0x for easy tasks |
| `complexity_medium_multiplier` | 1.2x for medium tasks |
| `complexity_hard_multiplier` | 1.5x for hard tasks |
| `supervisor_percentage` | Default 15% commission |
| `platform_percentage` | Default 20% platform fee |

---

## Implementation Notes

### shadcn/ui New York Style
- Use the New York style variant when initializing shadcn
- Enables more refined, professional UI components
- Pairs well with the authority-driven theme

### Real-time Features
- Use Supabase Realtime for:
  - Chat messages
  - Project status updates
  - Notification delivery
  - Availability status sync

### File Handling
- CV uploads → Supabase Storage (private bucket)
- Project files → Supabase Storage (with RLS)
- Max file size: 10MB

### Security Considerations
- RLS policies on all tables
- Server-side validation
- Rate limiting on API routes
- Input sanitization

---

*Document Generated: December 2025*
*Project: AssignX Supervisor Panel v1.0*
