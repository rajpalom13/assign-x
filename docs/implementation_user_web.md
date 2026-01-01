# AssignX - User Web Implementation Plan

> **Version:** 1.0 | **Date:** December 2025
> **Platform:** Next.js 16 + React 19
> **UI Framework:** shadcn/ui (New York Style)
> **Total Features:** 100 | **Target:** Students, Job Seekers, Business Owners

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Tables Required](#3-database-tables-required)
4. [Batch 1: Project Setup & Infrastructure](#batch-1-project-setup--infrastructure)
5. [Batch 2: Authentication & Onboarding](#batch-2-authentication--onboarding)
6. [Batch 3: Home Dashboard](#batch-3-home-dashboard)
7. [Batch 4: My Projects Module](#batch-4-my-projects-module)
8. [Batch 5: Project Detail Page](#batch-5-project-detail-page)
9. [Batch 6: Add Project Module](#batch-6-add-project-module)
10. [Batch 7: Student Connect / Marketplace](#batch-7-student-connect--marketplace)
11. [Batch 8: Profile & Settings](#batch-8-profile--settings)
12. [Batch 9: Cross-Platform Features](#batch-9-cross-platform-features)
13. [Batch 10: Testing & Polish](#batch-10-testing--polish)

---

## 1. Overview

The User application serves students, job seekers, and business owners who need task/project completion services.

### Platforms
| Platform | Technology | Repository |
|----------|------------|------------|
| User Website | Next.js 16 + shadcn (New York) | `user-web/` |
| User App | Flutter | `user_app/` |

### Core User Journey
```
Onboarding → Dashboard → Submit Project → Track Progress → Review & Approve → Download Deliverables
```

---

## 2. Technology Stack

### User Web
| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1.1 (App Router) |
| React | React 19 |
| UI Library | **shadcn/ui (New York Style)** |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion, GSAP, Rive |
| Smooth Scroll | Lenis |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

### User App (Flutter)
| Component | Technology |
|-----------|------------|
| Framework | Flutter |
| State Management | Riverpod / Bloc |
| Local Storage | Hive / SharedPreferences |
| HTTP Client | Dio |

### Backend (Shared)
| Component | Technology |
|-----------|------------|
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + Google OAuth |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Payments | Razorpay |
| Notifications | WhatsApp Business API + FCM |

---

## 3. Database Tables Required

### Core Tables (8 tables)
| Table | Purpose |
|-------|---------|
| `profiles` | Base user table |
| `students` | Student user extension |
| `professionals` | Professional user extension |
| `universities` | University master data |
| `courses` | Course master data |
| `subjects` | Subject master data |
| `industries` | Industry master data |
| `reference_styles` | Citation styles |

### Project Tables (9 tables)
| Table | Purpose |
|-------|---------|
| `projects` | Main projects table |
| `project_files` | User uploaded files |
| `project_deliverables` | Completed work files |
| `project_status_history` | Status audit trail |
| `project_revisions` | Revision requests |
| `project_quotes` | Pricing quotes |
| `project_timeline` | Milestone tracking |
| `quality_reports` | AI/Plagiarism reports |

### Financial Tables (5 tables)
| Table | Purpose |
|-------|---------|
| `wallets` | User wallets |
| `wallet_transactions` | Transaction history |
| `payments` | Payment records |
| `payment_methods` | Saved payment methods |
| `invoices` | Invoice generation |

### Chat Tables (4 tables)
| Table | Purpose |
|-------|---------|
| `chat_rooms` | Chat rooms |
| `chat_participants` | Room participants |
| `chat_messages` | Messages |
| `notifications` | Notifications |

### Marketplace Tables (4 tables)
| Table | Purpose |
|-------|---------|
| `marketplace_categories` | Listing categories |
| `marketplace_listings` | Items for sale/rent |
| `listing_images` | Listing media |
| `listing_inquiries` | Buyer inquiries |

### Other Tables (4 tables)
| Table | Purpose |
|-------|---------|
| `referral_codes` | Promo codes |
| `referral_usage` | Code usage tracking |
| `banners` | Promotional banners |
| `user_feedback` | User satisfaction |

**Total: 34 tables for User Application**

---

## Batch 1: Project Setup & Infrastructure

### Priority: Critical | Complexity: Medium

### 1.1 shadcn/ui New York Setup
| # | Task | Description |
|---|------|-------------|
| 1.1.1 | Initialize shadcn | `npx shadcn@latest init` with New York style |
| 1.1.2 | Configure theme | Brand colors (Dark Blue/Slate Grey & White) |
| 1.1.3 | Install components | Button, Input, Card, Dialog, Sheet, Tabs, Badge, Avatar, Dropdown, Toast |
| 1.1.4 | Setup dark mode | Theme toggle support |
| 1.1.5 | Typography | Configure Inter font |

### 1.2 Supabase Setup
| # | Task | Description |
|---|------|-------------|
| 1.2.1 | Create project | Setup Supabase project |
| 1.2.2 | Auth configuration | Google OAuth + Email/OTP |
| 1.2.3 | Create core tables | profiles, students, professionals |
| 1.2.4 | Create config tables | universities, courses, subjects |
| 1.2.5 | Setup RLS policies | User data isolation |
| 1.2.6 | Generate types | TypeScript types from schema |

### 1.3 Project Structure
```
user-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   │   ├── student/
│   │   │   └── professional/
│   │   └── onboarding/
│   ├── (dashboard)/
│   │   ├── page.tsx (home)
│   │   ├── projects/
│   │   ├── connect/
│   │   └── profile/
│   ├── project/[id]/
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn)
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── marketplace/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── hooks/
│   ├── utils/
│   └── validations/
├── stores/
└── types/
```

### 1.4 Dependencies to Install
```bash
# Core
npm install @supabase/supabase-js @supabase/ssr zustand

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# UI & Animations
npm install framer-motion gsap @rive-app/react-canvas lenis

# Utilities
npm install date-fns clsx tailwind-merge lucide-react

# Payments
npm install razorpay
```

---

## Batch 2: Authentication & Onboarding

### Priority: Critical | Features: U01-U11 (11 features)

### 2.1 Splash Screen (U01)
| Component | Description |
|-----------|-------------|
| `SplashScreen` | Logo animation with tagline "Your Task, Our Expertise" |
| Duration | 2-second auto-transition |
| Animation | Rive or Framer Motion |

### 2.2 Onboarding Carousel (U02)
| Component | Description |
|-----------|-------------|
| `OnboardingCarousel` | 3 slides with Skip, Next, Get Started |
| Slide 1 | Concept - What AssignX does |
| Slide 2 | Versatility - Range of services |
| Slide 3 | Trust - Security and quality |

### 2.3 Role Selection (U03)
| Component | Description |
|-----------|-------------|
| `RoleSelectionScreen` | 3 premium cards |
| Card 1 | Student - "Get expert help with your academic projects" |
| Card 2 | Job Seeker - "Professional assistance for career growth" |
| Card 3 | Business/Creator - "Scale your business with expert support" |

### 2.4 Student Sign-up Flow (U04)
| Step | Fields | Validation |
|------|--------|------------|
| Step 1 | Full Name, DOB | Required, Age 16+ |
| Step 2 | University (dropdown), Course, Semester, Student ID | University from DB |
| Step 3 | College Email (.edu/.ac), Mobile + OTP | Email domain validation |

**Components:**
- `StudentSignupForm`
- `UniversitySelector`
- `OTPVerification`
- `ProgressBar` (U06)

### 2.5 Professional Sign-up Flow (U05)
| Step | Fields | Validation |
|------|--------|------------|
| Step 1 | Google/LinkedIn OAuth | Social login |
| Step 2 | Industry dropdown, Mobile | Industry from DB |
| Step 3 | OTP verification | SMS OTP |

**Components:**
- `ProfessionalSignupForm`
- `SocialLoginButtons`
- `IndustrySelector`

### 2.6 Supporting Components (U07-U11)
| Feature | Component | Description |
|---------|-----------|-------------|
| U07 | `TermsModal` | Mandatory T&C acceptance |
| U08 | `SupportButton` | Floating support button on all pages |
| U09 | `SuccessAnimation` | Confetti/Checkmark on signup complete |
| U10 | Smart Keyboard | Auto-detect input type |
| U11 | `FormError` | Red outline error states |

### Database Operations
```sql
-- On signup
INSERT INTO profiles (id, email, full_name, phone, user_type, city)
INSERT INTO students (profile_id, university_id, course_id, semester, student_id_number, college_email)
-- OR
INSERT INTO professionals (profile_id, professional_type, industry_id)
```

---

## Batch 3: Home Dashboard

### Priority: Critical | Features: U12-U23 (12 features)

### 3.1 Dashboard Header (U12-U14)
| Component | Description |
|-----------|-------------|
| `DashboardHeader` | Contains greeting, wallet, notifications |
| `PersonalizedGreeting` | "Hi, [Name]" with University & Semester |
| `WalletPill` | Balance pill (e.g., "₹240"), tap to top-up |
| `NotificationBell` | Bell icon with unread count badge |

### 3.2 Promotional Section (U15)
| Component | Description |
|-----------|-------------|
| `BannerCarousel` | Auto-scrolling (4s) promotional banners |
| Data Source | `banners` table filtered by user type |
| Actions | CTAs for core services |

### 3.3 Services Grid (U16, U22)
| Component | Description |
|-----------|-------------|
| `ServicesGrid` | 2x2 grid of service cards |
| `ServiceCard` | Icon + Title + Description |

**Services:**
| Service | Icon | Action |
|---------|------|--------|
| Project Support | 📝 | New project flow |
| AI/Plag Report | 🔍 | Report request |
| Consult Doctor | 🩺 | Placeholder (disabled) |
| Ref. Generator | 📚 | Free tool |

### 3.4 Campus Pulse (U17, U21)
| Component | Description |
|-----------|-------------|
| `CampusPulseSection` | "Trending at [University]" |
| `CampusPulseCard` | Marketplace item preview |
| Filter | By user's university and city |

### 3.5 Navigation (U18-U20)
| Component | Description |
|-----------|-------------|
| `BottomNavigation` | 5 items: Home, My Projects, FAB, Connect, Profile |
| `CentralFAB` | Large + button, opens upload sheet |
| `UploadSheet` | Bottom sheet (50% screen) with quick actions |

**Upload Sheet Options:**
- Upload New Project
- Quick Proofread

### 3.6 Safe Language (U23)
- Replace "Assignment" with "Project" everywhere
- "Upload Project Brief" not "Upload Assignment"

### Components to Build
```
components/
├── dashboard/
│   ├── DashboardHeader.tsx
│   ├── PersonalizedGreeting.tsx
│   ├── WalletPill.tsx
│   ├── NotificationBell.tsx
│   ├── BannerCarousel.tsx
│   ├── ServicesGrid.tsx
│   ├── ServiceCard.tsx
│   ├── CampusPulseSection.tsx
│   └── CampusPulseCard.tsx
├── navigation/
│   ├── BottomNavigation.tsx
│   ├── CentralFAB.tsx
│   └── UploadSheet.tsx
```

---

## Batch 4: My Projects Module

### Priority: Critical | Features: U24-U41 (18 features)

### 4.1 Tab Navigation (U24)
| Component | Description |
|-----------|-------------|
| `ProjectTabs` | 4 tabs using shadcn Tabs |

**Tabs:**
| Tab | Filter | Description |
|-----|--------|-------------|
| In Review | `analyzing`, `quoted`, `payment_pending` | Projects being reviewed/awaiting payment |
| In Progress | `paid`, `assigned`, `in_progress` | Active work |
| For Review | `delivered`, `qc_approved` | Awaiting user approval |
| History | `completed`, `cancelled`, `refunded` | Past projects |

### 4.2 Project Card (U25-U27)
| Section | Content |
|---------|---------|
| Header | Project Title + Subject Icon |
| Body | Project ID (#AX-2940), Deadline (color-coded), Progress Bar |
| Footer | Status Badge + Action Button |

### 4.3 Status System (U28-U36)
| Status | Color | Badge Text | Action Button |
|--------|-------|------------|---------------|
| Analyzing | 🟡 Yellow | "Analyzing Requirements..." | Disabled |
| Payment Pending | 🟠 Orange | "Payment pending: ₹300" | "Pay Now" |
| In Progress | 🔵 Blue | "Expert Working" / "70% Completed" | "View Details" |
| For Review | 🟢 Green | "Files Uploaded - Action Required" | "Review" |
| Completed | ⚫ Grey | "Successfully Completed" | "View Details" |

### 4.4 Payment Prompt (U30)
| Component | Description |
|-----------|-------------|
| `PaymentPromptModal` | Paytm-style bottom sheet on app open |
| Trigger | When user has unpaid quotes |
| Content | "Your project is ready! Pay now to begin" |

### 4.5 Auto-Approval Timer (U33)
| Component | Description |
|-----------|-------------|
| `AutoApprovalTimer` | Countdown: "Auto-approves in 48h" |
| Display | On "For Review" projects |
| Logic | Server-side auto-approval after 48h |

### 4.6 Request Changes Flow (U34)
| Component | Description |
|-----------|-------------|
| `RevisionRequestForm` | Text box for feedback |
| Action | Creates revision request, moves to In Progress with "Revision" tag |

### 4.7 Notifications (U39-U40)
| Trigger | Channels |
|---------|----------|
| Quote Ready | Push + WhatsApp |
| Work Delivered | Push + WhatsApp |
| Revision Complete | Push + WhatsApp |

### 4.8 Timeline View (U41)
| Component | Description |
|-----------|-------------|
| `ProjectTimeline` | Visual progress timeline |
| Milestones | Submitted → Analyzed → Paid → Assigned → In Progress → QC → Delivered |

### Components to Build
```
components/
├── projects/
│   ├── ProjectTabs.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectCardHeader.tsx
│   ├── ProjectCardBody.tsx
│   ├── ProjectCardFooter.tsx
│   ├── StatusBadge.tsx
│   ├── DeadlineDisplay.tsx
│   ├── ProgressBar.tsx
│   ├── PaymentPromptModal.tsx
│   ├── AutoApprovalTimer.tsx
│   ├── RevisionRequestForm.tsx
│   ├── ProjectTimeline.tsx
│   └── InvoiceDownload.tsx
```

### Database Queries
```typescript
// Fetch user projects by tab
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    subject:subjects(*),
    deliverables:project_deliverables(*),
    quote:project_quotes(*)
  `)
  .eq('user_id', userId)
  .in('status', statusFilters[activeTab])
  .order('created_at', { ascending: false })
```

---

## Batch 5: Project Detail Page

### Priority: High | Features: U42-U55 (14 features)

### 5.1 Page Layout (U42-U43)
| Component | Description |
|-----------|-------------|
| `ProjectDetailHeader` | Sticky header with back arrow, title, kebab menu |
| `StatusBanner` | Thin colored strip showing current status |
| Menu Options | Cancel Project, Support |

### 5.2 Deadline & Progress (U44-U46)
| Component | Description |
|-----------|-------------|
| `DeadlineCountdown` | Real-time: "Due in: 3 Days, 4 Hours" |
| `LiveDraftTracker` | Card with "Track Progress Live" |
| `GoogleDocsViewer` | Read-only WebView for live document |

### 5.3 Project Brief (U47, U55)
| Component | Description |
|-----------|-------------|
| `ProjectBriefAccordion` | Collapsed by default |
| Content | Subject, Word Count, References, Instructions, Budget |
| `AttachedFiles` | User's original uploaded files |

### 5.4 Deliverables (U48)
| Component | Description |
|-----------|-------------|
| `DeliverablesSection` | List of delivered files |
| Action | "Download Final Solution" button |
| Versions | Show version history if multiple |

### 5.5 Quality Reports (U49-U51)
| Component | Description |
|-----------|-------------|
| `AIReportBadge` | Robot icon - "Human Written" ✓ or "Download Report" |
| `PlagiarismBadge` | Document icon - "Unique Content" ✓ or "Download Turnitin Report" |
| Lock State | Badges grayed out during "In Progress" |

### 5.6 Chat System (U52-U54)
| Component | Description |
|-----------|-------------|
| `FloatingChatButton` | Fixed bottom-right, notification badge |
| `ChatWindow` | Overlay chat with supervisor |
| Context | Auto-linked to current Project ID |

### Components to Build
```
components/
├── project-detail/
│   ├── ProjectDetailHeader.tsx
│   ├── StatusBanner.tsx
│   ├── DeadlineCountdown.tsx
│   ├── LiveDraftTracker.tsx
│   ├── GoogleDocsViewer.tsx
│   ├── ProjectBriefAccordion.tsx
│   ├── DeliverablesSection.tsx
│   ├── DeliverableItem.tsx
│   ├── QualityReportBadge.tsx
│   ├── FloatingChatButton.tsx
│   └── ChatWindow.tsx
```

---

## Batch 6: Add Project Module

### Priority: Critical | Features: U56-U72 (17 features)

### 6.1 Service Selection (U56-U61)
| Component | Description |
|-----------|-------------|
| `ServiceSelectionSheet` | Bottom sheet via FAB |
| Layout | 2-column grid |

**Services:**
| Service | Icon | Type | Price |
|---------|------|------|-------|
| New Project | 📝 | Full creation | Quoted |
| Proofreading | 👓 | Polish drafts | Quoted |
| Plagiarism Check | 🕵️ | Turnitin report | Fixed |
| AI Detection | 🤖 | AI verification | Fixed |
| Expert Opinion | 💡 | Consultation | FREE |

### 6.2 New Project Form (U62-U64)
**Step 1:**
| Field | Type | Validation |
|-------|------|------------|
| Subject | Dropdown | Required, from `subjects` table |
| Topic Name | Text | Required, max 255 chars |
| Word Count | Number | Optional |
| Deadline | Date/Time picker | Required, future date |

**Pricing Note:** "More time = Lesser price"

**Step 2:**
| Field | Type | Validation |
|-------|------|------------|
| Project Guidelines | Textarea | Required |
| Attachments | File upload | PDF/DOC/DOCX/IMG, max 10MB each |
| Reference Style | Dropdown | APA, Harvard, MLA, Chicago |

### 6.3 Proofreading Form (U65)
| Field | Type |
|-------|------|
| File Upload | Required |
| Focus Areas | Multi-select chips: Grammar, Flow, Formatting, Citations, Expert Opinion |
| Deadline | Required |

### 6.4 Plag/AI Report Form (U66)
| Field | Type |
|-------|------|
| Document Upload | Required |
| Options | Checkboxes: Similarity Check, AI Content Detection |

### 6.5 Expert Opinion Form (U67)
| Field | Type |
|-------|------|
| Subject | Dropdown |
| Question | Textarea |
| Attachment | Optional file |

### 6.6 CTAs & Success (U68-U72)
| Service | CTA Text |
|---------|----------|
| New Project | "Submit for Quote" |
| Proofreading | "Request Review" |
| Plag/AI | "Get Report" |
| Expert Opinion | "Ask Expert" |

**Success Popup:** "Project Received! Supervisor is reviewing it." + WhatsApp notification mention

### Components to Build
```
components/
├── add-project/
│   ├── ServiceSelectionSheet.tsx
│   ├── ServiceCard.tsx
│   ├── NewProjectForm/
│   │   ├── Step1.tsx
│   │   ├── Step2.tsx
│   │   └── index.tsx
│   ├── ProofreadingForm.tsx
│   ├── ReportRequestForm.tsx
│   ├── ExpertOpinionForm.tsx
│   ├── FileUploader.tsx
│   ├── DeadlinePicker.tsx
│   ├── SubjectSelector.tsx
│   ├── ReferenceStyleSelector.tsx
│   ├── FocusAreaChips.tsx
│   └── SuccessDialog.tsx
```

### Database Operations
```typescript
// Create new project
const { data: project } = await supabase
  .from('projects')
  .insert({
    project_number: generateProjectNumber(), // #AX-XXXX
    user_id: userId,
    service_type: 'new_project',
    title: formData.topic,
    subject_id: formData.subject,
    word_count: formData.wordCount,
    deadline: formData.deadline,
    description: formData.guidelines,
    reference_style_id: formData.referenceStyle,
    status: 'submitted'
  })
  .select()
  .single()

// Upload files
for (const file of files) {
  const { data: uploadedFile } = await supabase.storage
    .from('project-files')
    .upload(`${project.id}/${file.name}`, file)

  await supabase.from('project_files').insert({
    project_id: project.id,
    file_name: file.name,
    file_url: uploadedFile.path,
    file_type: file.type,
    file_size_bytes: file.size,
    uploaded_by: userId
  })
}
```

---

## Batch 7: Student Connect / Marketplace

### Priority: Medium | Features: U73-U85 (13 features)

### 7.1 Layout (U73)
| Component | Description |
|-----------|-------------|
| `MasonryGrid` | Pinterest-style staggered layout |
| Library | react-masonry-css or CSS Grid |

### 7.2 Feed Algorithm (U74-U75)
| Factor | Weight |
|--------|--------|
| User's City | High |
| User's Course/Interest | Medium |
| Recency | Medium |
| Random Mix | Low (for discovery) |

### 7.3 Filters (U76)
| Component | Description |
|-----------|-------------|
| `FilterBar` | Optional top bar filters |
| Filters | City, Category |

### 7.4 Categories (U77-U80)
| Category | Examples |
|----------|----------|
| Hard Goods | Books, Drafters, Calculators, Coolers |
| Housing | Flatmates, Rooms (5km radius) |
| Opportunities | Internships, Gigs, Events |
| Community | Polls, Reviews, Questions |

### 7.5 Card Types (U81-U83)
| Card Type | Component | Content |
|-----------|-----------|---------|
| Item Card | `ItemCard` | Image + Price + Distance |
| Text Card | `TextCard` | Solid background + Question/Review |
| Banner Card | `BannerCard` | Full-width for Events/Jobs |

### 7.6 Posting (U84-U85)
| Component | Description |
|-----------|-------------|
| `MarketplaceFAB` | Secondary FAB inside Connect section |
| `CreateListingSheet` | Posting options |

**Posting Options:**
| Option | Form |
|--------|------|
| Sell/Rent Item | Camera → `SellItemForm` |
| Post Opportunity | `OpportunityForm` |
| Community Post | `CommunityPostForm` (Text/Poll) |

### Components to Build
```
components/
├── marketplace/
│   ├── MasonryGrid.tsx
│   ├── FilterBar.tsx
│   ├── CategoryChips.tsx
│   ├── ItemCard.tsx
│   ├── TextCard.tsx
│   ├── BannerCard.tsx
│   ├── MarketplaceFAB.tsx
│   ├── CreateListingSheet.tsx
│   ├── SellItemForm.tsx
│   ├── OpportunityForm.tsx
│   ├── CommunityPostForm.tsx
│   └── PollCreator.tsx
```

---

## Batch 8: Profile & Settings

### Priority: High | Features: U86-U100 (15 features)

### 8.1 Hero Section (U86-U87, U100)
| Component | Description |
|-----------|-------------|
| `ProfileHero` | Top 30% with dark/colored background |
| Content | Avatar, Name, Tagline (University/Role) |
| `StatsCard` | Floating card: Wallet Balance + Projects Completed |

### 8.2 Wallet Section (U88, U98-U99)
| Component | Description |
|-----------|-------------|
| `WalletSection` | Balance display with "Available Credits" |
| `TransactionHistory` | Detailed transaction list |
| `TopUpSheet` | Add money bottom sheet |

### 8.3 Personal Details (U89-U90)
| Component | Description |
|-----------|-------------|
| `PersonalDetailsForm` | Edit Name, Phone, Email |
| `CollegeInfoForm` | University, Course, Year, City |

### 8.4 Payment Methods (U91)
| Component | Description |
|-----------|-------------|
| `PaymentMethodsManager` | Manage saved cards/UPI |
| Actions | Add, Remove, Set Default |

### 8.5 Support & Info (U92-U93)
| Component | Description |
|-----------|-------------|
| `HelpSupportSection` | WhatsApp link + Raise Ticket form |
| `HowItWorks` | Re-launch onboarding tutorial |

### 8.6 Referral & Account (U94-U97)
| Component | Description |
|-----------|-------------|
| `ReferralCodeCard` | "Share Code: EXPERT20" with copy button |
| `LogoutButton` | Footer action |
| `AppVersion` | Version display (v1.0.0) |
| `TrustBadges` | Lock icon + "Your data is encrypted" |

### Components to Build
```
components/
├── profile/
│   ├── ProfileHero.tsx
│   ├── AvatarUploader.tsx
│   ├── StatsCard.tsx
│   ├── WalletSection.tsx
│   ├── TransactionHistory.tsx
│   ├── TransactionItem.tsx
│   ├── TopUpSheet.tsx
│   ├── PersonalDetailsForm.tsx
│   ├── CollegeInfoForm.tsx
│   ├── PaymentMethodsManager.tsx
│   ├── PaymentMethodCard.tsx
│   ├── AddPaymentMethodSheet.tsx
│   ├── HelpSupportSection.tsx
│   ├── RaiseTicketForm.tsx
│   ├── HowItWorksOverlay.tsx
│   ├── ReferralCodeCard.tsx
│   ├── TrustBadges.tsx
│   └── LogoutButton.tsx
```

---

## Batch 9: Cross-Platform Features

### Priority: Critical | Features: C01-C20 (subset for User)

### 9.1 Real-Time Chat (C01-C06)
| Feature | Implementation |
|---------|----------------|
| Chat Provider | Supabase Realtime subscription |
| Project Context | Chat room per project |
| Message Notifications | FCM push notifications |
| Read Receipts | `last_read_at` tracking |
| File Sharing | Supabase Storage upload |

### 9.2 Notification System (C07-C10)
| Channel | Service |
|---------|---------|
| Push Notifications | Firebase Cloud Messaging |
| WhatsApp | WhatsApp Business API |
| In-App | Supabase Realtime + notifications table |

**Notification Triggers for User:**
| Event | Channels |
|-------|----------|
| Quote Ready | Push + WhatsApp + In-App |
| Payment Confirmed | Push + In-App |
| Work Delivered | Push + WhatsApp + In-App |
| Revision Complete | Push + WhatsApp |
| Message Received | Push + In-App |

### 9.3 Payment System (C11-C16)
| Feature | Implementation |
|---------|----------------|
| Razorpay Integration | Razorpay SDK |
| Wallet System | `wallets` + `wallet_transactions` tables |
| Payment Methods | UPI, Cards, Net Banking |
| Transaction History | From `wallet_transactions` |

**Payment Flow:**
```
User clicks "Pay Now"
→ Create Razorpay order
→ Open Razorpay checkout
→ On success: Update project status, create payment record
→ Trigger notifications
```

### 9.4 File Management (C17-C20)
| Feature | Implementation |
|---------|----------------|
| File Upload | Supabase Storage |
| Supported Types | PDF, DOC, DOCX, Images |
| Max Size | 10MB per file |
| Google Docs View | Read-only iframe/WebView |
| Secure Download | Signed URLs |

---

## Batch 10: Testing & Polish

### Priority: High

### 10.1 Testing
| Type | Tools |
|------|-------|
| Unit Tests | Jest + React Testing Library |
| Integration Tests | Playwright |
| E2E Tests | Cypress |

### 10.2 Performance
| Task | Goal |
|------|------|
| Lighthouse Score | 90+ Performance |
| Bundle Size | < 200KB initial JS |
| Image Optimization | Next.js Image component |
| Code Splitting | Dynamic imports for routes |

### 10.3 Accessibility
| Task | Standard |
|------|----------|
| ARIA Labels | All interactive elements |
| Keyboard Navigation | Full support |
| Color Contrast | WCAG AA |
| Screen Reader | Tested with VoiceOver/NVDA |

### 10.4 Error Handling
| Task | Implementation |
|------|----------------|
| Sentry Integration | Error tracking |
| Error Boundaries | Graceful fallbacks |
| Form Errors | Clear validation messages |
| Network Errors | Retry logic + offline support |

---

## Implementation Checklist

### Batch 1: Setup ⬜
- [ ] Initialize shadcn/ui New York
- [ ] Setup Supabase project
- [ ] Create core database tables
- [ ] Setup authentication
- [ ] Configure project structure

### Batch 2: Auth & Onboarding ⬜
- [ ] Splash screen
- [ ] Onboarding carousel
- [ ] Role selection
- [ ] Student signup flow
- [ ] Professional signup flow
- [ ] OTP verification

### Batch 3: Dashboard ⬜
- [ ] Dashboard header
- [ ] Wallet pill
- [ ] Notification bell
- [ ] Banner carousel
- [ ] Services grid
- [ ] Campus pulse section
- [ ] Bottom navigation
- [ ] FAB + Upload sheet

### Batch 4: My Projects ⬜
- [ ] Project tabs
- [ ] Project cards
- [ ] Status badge system
- [ ] Payment prompt modal
- [ ] Auto-approval timer
- [ ] Revision request flow
- [ ] Project timeline

### Batch 5: Project Detail ⬜
- [ ] Detail page layout
- [ ] Deadline countdown
- [ ] Live draft viewer
- [ ] Project brief accordion
- [ ] Deliverables section
- [ ] Quality report badges
- [ ] Chat integration

### Batch 6: Add Project ⬜
- [ ] Service selection sheet
- [ ] New project form
- [ ] Proofreading form
- [ ] Report request form
- [ ] Expert opinion form
- [ ] File uploader
- [ ] Success dialog

### Batch 7: Marketplace ⬜
- [ ] Masonry grid layout
- [ ] Filter bar
- [ ] Item/Text/Banner cards
- [ ] Posting forms
- [ ] Feed algorithm

### Batch 8: Profile ⬜
- [ ] Profile hero
- [ ] Wallet section
- [ ] Transaction history
- [ ] Personal details form
- [ ] Payment methods manager
- [ ] Help & support
- [ ] Referral code

### Batch 9: Cross-Platform ⬜
- [ ] Real-time chat
- [ ] Push notifications
- [ ] WhatsApp integration
- [ ] Razorpay integration
- [ ] File management

### Batch 10: Polish ⬜
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Error handling
- [ ] Sentry setup

---

*Document Generated: December 2025*
*Project: AssignX User Web & App*
*UI Framework: shadcn/ui (New York Style)*
