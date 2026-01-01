# User Web - Comprehensive Implementation Plan

> **Technology Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Shadcn/ui (New York Style)
> **Database:** Supabase (PostgreSQL 15+) - See `docs/DATABASE.md` for complete schema
> **Total Features:** 100 Features (U01-U100)
> **Target Audience:** Students (Gen Z), Job Seekers, Business Owners/Creators
> **Core Theme:** Professionalism, Security, Efficiency

---

## Database Reference

The complete database schema is documented in `docs/DATABASE.md`. Key statistics:

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

## Table of Contents

1. [Project Setup & Configuration](#batch-0-project-setup--configuration)
2. [Batch 1: Onboarding & Authentication](#batch-1-onboarding--authentication-11-features)
3. [Batch 2: Home Dashboard](#batch-2-home-dashboard-12-features)
4. [Batch 3: My Projects Module](#batch-3-my-projects-module-18-features)
5. [Batch 4: Project Detail Page](#batch-4-project-detail-page-14-features)
6. [Batch 5: Add Project Module](#batch-5-add-project-module-17-features)
7. [Batch 6: Student Connect / Campus Marketplace](#batch-6-student-connect--campus-marketplace-13-features)
8. [Batch 7: Profile & Settings](#batch-7-profile--settings-15-features)
9. [Cross-Platform Features](#cross-platform-features)
10. [Database Tables Required](#database-tables-required)

---

## Batch 0: Project Setup & Configuration

### 0.1 Install Dependencies

```bash
# Shadcn/ui with New York style
npx shadcn@latest init

# Select: New York style, CSS Variables, Base Color

# Required packages
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install zustand # State management
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install recharts # For statistics/graphs
npm install framer-motion # Animations
npm install next-themes # Dark/Light mode
npm install @rive-app/react-canvas # Rive animations
npm install lenis # Smooth scroll
npm install gsap # Animations
npm install razorpay # Payment integration
npm install react-confetti # Success animations
npm install react-masonry-css # Pinterest-style grid
```

### 0.2 Shadcn Components to Install

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add progress
npx shadcn@latest add sheet
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add carousel
npx shadcn@latest add accordion
npx shadcn@latest add table
npx shadcn@latest add textarea
npx shadcn@latest add scroll-area
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add navigation-menu
```

### 0.3 Folder Structure

```
user-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   ├── student/
│   │   │   │   └── page.tsx
│   │   │   ├── professional/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── verify-otp/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── marketplace/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   ├── wallet/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── [projectId]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (onboarding)/
│   │   ├── welcome/
│   │   │   └── page.tsx
│   │   ├── role-select/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── MainLayout.tsx
│   │   └── FABMenu.tsx
│   ├── onboarding/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingCarousel.tsx
│   │   ├── RoleSelector.tsx
│   │   ├── StudentSignupForm.tsx
│   │   ├── ProfessionalSignupForm.tsx
│   │   └── SuccessAnimation.tsx
│   ├── home/
│   │   ├── GreetingHeader.tsx
│   │   ├── WalletPill.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── PromoBannerCarousel.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── CampusPulseSection.tsx
│   │   └── QuickActionSheet.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DeadlineBadge.tsx
│   │   ├── PaymentPromptModal.tsx
│   │   ├── ReviewActions.tsx
│   │   ├── ProjectTimeline.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── LiveDraftViewer.tsx
│   │   ├── DeliverablesList.tsx
│   │   ├── QualityBadges.tsx
│   │   └── ProjectBriefAccordion.tsx
│   ├── forms/
│   │   ├── NewProjectForm.tsx
│   │   ├── ProofreadingForm.tsx
│   │   ├── ReportRequestForm.tsx
│   │   ├── ExpertOpinionForm.tsx
│   │   └── ServiceSelector.tsx
│   ├── marketplace/
│   │   ├── ItemCard.tsx
│   │   ├── TextCard.tsx
│   │   ├── BannerCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── MasonryGrid.tsx
│   │   ├── CreateListingForm.tsx
│   │   └── ItemDetail.tsx
│   ├── profile/
│   │   ├── ProfileHero.tsx
│   │   ├── StatsCard.tsx
│   │   ├── WalletSection.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── PaymentMethods.tsx
│   │   ├── ReferralSection.tsx
│   │   └── SettingsList.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── FloatingChatButton.tsx
│   └── shared/
│       ├── Logo.tsx
│       ├── LoadingSpinner.tsx
│       ├── OtpInput.tsx
│       ├── StepProgress.tsx
│       ├── FileUpload.tsx
│       ├── TrustBadge.tsx
│       ├── SupportFAB.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useProjects.ts
│   ├── useMarketplace.ts
│   ├── useWallet.ts
│   ├── useChat.ts
│   └── useNotifications.ts
├── stores/
│   ├── authStore.ts
│   ├── projectStore.ts
│   ├── marketplaceStore.ts
│   ├── walletStore.ts
│   └── uiStore.ts
├── types/
│   └── database.ts            # Auto-generated from Supabase
└── services/
    ├── auth.service.ts
    ├── user.service.ts
    ├── project.service.ts
    ├── marketplace.service.ts
    ├── wallet.service.ts
    ├── payment.service.ts
    ├── chat.service.ts
    └── notification.service.ts
```

### 0.4 Supabase Configuration

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 0.5 Theme Configuration

Update `tailwind.config.ts`:
```typescript
// Primary Color: Professional Blue (#2563EB)
// Accent: Bright Blue (#3B82F6)
// Background: Light Grey (#F8FAFC) / Dark (#0F172A)
// Visual Theme: Professionalism, Security, Efficiency

// Status Colors:
// Analyzing: Yellow (#EAB308)
// Payment Pending: Orange (#F59E0B)
// In Progress: Blue (#3B82F6)
// For Review: Green (#22C55E)
// Completed: Grey (#6B7280)
// Urgent/Revision: Red (#EF4444)
```

---

## Batch 1: Onboarding & Authentication (11 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U01 | Splash Screen | Logo animation + tagline "Your Task, Our Expertise", 2-sec transition | Core |
| U02 | Onboarding Carousel | 3 slides (Concept, Versatility, Trust) + Skip + Next + Get Started | Core |
| U03 | Role Selection Screen | 3 premium cards: Student, Job Seeker, Business/Creator | Core |
| U04 | Student Sign-up Flow | Multi-step: Name, DOB → University, Course, Student ID → Email + OTP | Core |
| U05 | Professional Sign-up Flow | Google/LinkedIn login → Industry, Mobile → OTP | Core |
| U06 | Progress Bar | Visual progress during sign-up (33%, 66%, 100%) | Important |
| U07 | Terms & Conditions | Mandatory acceptance before account creation | Core |
| U08 | Get Support Button | Present on every page during setup | Important |
| U09 | Success Animation | Confetti/Checkmark with personalized welcome | Important |
| U10 | Smart Keyboard | Context-aware inputs (email, phone fields) | Important |
| U11 | Error States | Red outlines for invalid inputs with messages | Important |

### Implementation Tasks

#### Task 1.1: Splash Screen Component
**File:** `components/onboarding/SplashScreen.tsx`
- Logo animation (fade-in + scale using framer-motion)
- Tagline: "Your Task, Our Expertise"
- Brand color background
- 2-second auto-transition
- Check auth state → route accordingly
- Uses: `framer-motion`, optional `@rive-app/react-canvas`

#### Task 1.2: Onboarding Carousel
**File:** `components/onboarding/OnboardingCarousel.tsx`
- 3 slides with illustrations:
  1. Concept: "Get expert help for your projects"
  2. Versatility: "Academic, Professional, Creative"
  3. Trust: "Quality assured, deadline guaranteed"
- Skip button (top-right)
- Next button / Get Started (final slide)
- Dot indicators
- Keyboard navigation support
- Uses: `shadcn/carousel`, `framer-motion`

#### Task 1.3: Role Selection
**File:** `components/onboarding/RoleSelector.tsx`
- 3 premium styled cards:
  1. Student: "Currently pursuing education" (graduation cap icon)
  2. Job Seeker: "Looking for opportunities" (briefcase icon)
  3. Business/Creator: "Building something amazing" (rocket icon)
- Card hover/selection animation
- Continue button (enabled on selection)
- Uses: `framer-motion`, `lucide-react` icons

#### Task 1.4: Student Signup Form
**File:** `components/onboarding/StudentSignupForm.tsx`
- Multi-step form with progress bar:
  - Step 1 (33%): Full Name, Date of Birth
  - Step 2 (66%): University (searchable dropdown), Course, Semester, Student ID
  - Step 3 (100%): College Email (.edu/.ac validation) + Mobile + OTP verification
- Input validation with Zod
- Student ID format validation
- College email domain validation
- Uses: `react-hook-form`, `zod`, `shadcn/form`, `shadcn/calendar`

#### Task 1.5: Professional Signup Form
**File:** `components/onboarding/ProfessionalSignupForm.tsx`
- Social login options: Google OAuth, LinkedIn OAuth
- Quick form: Industry dropdown, Mobile number
- OTP verification
- Progress bar (50%, 100%)
- Uses: Supabase Auth providers

#### Task 1.6: OTP Verification Component
**File:** `components/shared/OtpInput.tsx`
- 6-digit input with separate boxes
- Auto-focus next box on input
- Backspace handling
- 60-second resend timer
- Resend OTP button
- Error state for invalid OTP
- Uses: `shadcn/input`, custom focus management

#### Task 1.7: Success Animation
**File:** `components/onboarding/SuccessAnimation.tsx`
- Confetti explosion
- Checkmark animation
- "Welcome, [Name]!" personalized message
- "Your account is ready" subtext
- "Go to Dashboard" CTA button
- Uses: `react-confetti`, `framer-motion`

### Auth Pages
**Files:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(auth)/register/student/page.tsx`
- `app/(auth)/register/professional/page.tsx`
- `app/(auth)/verify-otp/page.tsx`
- `app/(onboarding)/welcome/page.tsx`
- `app/(onboarding)/role-select/page.tsx`

### Database Tables Used
- `profiles`
- `users`
- `universities`
- `courses`

---

## Batch 2: Home Dashboard (12 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U12 | Personalized Greeting | "Hi, [Name]" with University & Semester subtext | Core |
| U13 | Wallet Balance Pill | Shows balance, tap to top-up | Core |
| U14 | Notification Bell | Icon with unread count badge | Core |
| U15 | Promotional Banners Carousel | Auto-scrolling (4 sec) with CTAs | Core |
| U16 | Services Grid (2x2) | Project Support, AI/Plag Report, Consult Doctor, Ref. Generator | Core |
| U17 | Campus Pulse Teaser | "Trending at [University]" horizontal scroll | Important |
| U18 | Bottom Navigation Bar | Home, My Projects, FAB (+), The Quad, Profile | Core |
| U19 | Central FAB Button | Opens bottom sheet for quick actions | Core |
| U20 | Upload Bottom Sheet Modal | Upload New Project, Quick Proofread options | Core |
| U21 | Dynamic University Content | Campus Pulse filtered by university | Important |
| U22 | Service Icons | Thin-line professional icons | Important |
| U23 | Safe Language Compliance | Use "Project" not "Assignment" | Core |

### Implementation Tasks

#### Task 2.1: Dashboard Layout
**File:** `app/(main)/dashboard/page.tsx`
- Custom header with greeting + wallet + notification
- Scrollable content sections
- Sticky bottom navigation
- Floating action button
- Responsive design (mobile/desktop)

#### Task 2.2: Greeting Header
**File:** `components/home/GreetingHeader.tsx`
- "Hi, [Name]" greeting (personalized)
- University & Semester subtext
- Time-based greeting (Good Morning/Afternoon/Evening)
- User avatar (small)

#### Task 2.3: Wallet Pill
**File:** `components/home/WalletPill.tsx`
- Balance display (₹ format)
- Click to navigate to wallet page
- "Top Up" quick action
- Subtle animation on balance change

#### Task 2.4: Notification Bell
**File:** `components/home/NotificationBell.tsx`
- Bell icon with badge
- Unread count (red dot with number)
- Click to open notifications dropdown/page
- Real-time updates via Supabase

#### Task 2.5: Promo Banner Carousel
**File:** `components/home/PromoBannerCarousel.tsx`
- Auto-scroll (4-second interval)
- High-quality images
- CTA buttons on banners
- Dot indicators
- Pause on hover
- Uses: `shadcn/carousel`, `framer-motion`

#### Task 2.6: Services Grid
**File:** `components/home/ServicesGrid.tsx`
- 2x2 responsive grid
- Service cards:
  1. Project Support (main service)
  2. AI/Plagiarism Report
  3. Consult Doctor (Coming Soon badge)
  4. Reference Generator (FREE badge)
- Thin-line icons (lucide-react)
- Hover effects
- Click to navigate

#### Task 2.7: Campus Pulse Section
**File:** `components/home/CampusPulseSection.tsx`
- "Trending at [University]" header
- Horizontal scroll container
- Marketplace item cards (image, price, distance)
- "View All" link
- Filtered by user's university location

#### Task 2.8: Bottom Navigation
**File:** `components/layout/BottomNav.tsx`
- 5 items: Home, My Projects, [FAB], The Quad/Connect, Profile
- Central FAB notch design
- Active/inactive icon states
- Notification badges
- Mobile-only (hidden on desktop)

#### Task 2.9: FAB Quick Action Sheet
**File:** `components/layout/FABMenu.tsx`
- Floating + button
- Opens sheet/dialog with options:
  1. Upload New Project
  2. Quick Proofread
  3. Get AI/Plag Report
  4. Ask Expert (FREE badge)
- Smooth animations
- Uses: `shadcn/sheet` or `shadcn/dialog`

### Database Tables Used
- `profiles`
- `users`
- `wallets`
- `notifications`
- `promotional_banners`
- `marketplace_listings`

---

## Batch 3: My Projects Module (18 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U24 | Tab Navigation | In Review, In Progress, For Review, History | Core |
| U25 | Project Card - Header | Project Title + Subject Icon | Core |
| U26 | Project Card - Body | Project ID, Deadline (color-coded), Progress Bar | Core |
| U27 | Project Card - Footer | Status Badge + Action Button | Core |
| U28 | Status: Analyzing | Yellow - "Analyzing Requirements..." | Core |
| U29 | Status: Payment Pending | Orange - "Payment pending: $30" + Pay Now | Core |
| U30 | Payment Prompt Modal | Bottom sheet on page load for pending payments | Core |
| U31 | Status: In Progress | Blue - "Expert Working" or "70% Completed" | Core |
| U32 | Status: For Review | Green border - "Files Uploaded - Action Required" | Core |
| U33 | Auto-Approval Timer | Countdown: "Auto-approves in 48h" | Core |
| U34 | Request Changes Flow | Text box for feedback, moves back to In Progress | Core |
| U35 | Approve Button | Moves card to History | Core |
| U36 | Status: Completed | Green/Grey - "Successfully Completed" | Core |
| U37 | Download Invoice | Available in History tab | Important |
| U38 | Grade Entry | Optional field for final grade | Optional |
| U39 | Push Notification | When quote is ready | Core |
| U40 | WhatsApp Notification | When quote is ready | Core |
| U41 | View Timeline Button | Project progress timeline | Important |

### Implementation Tasks

#### Task 3.1: Projects List Page
**File:** `app/(main)/projects/page.tsx`
- Tab navigation: In Review | In Progress | For Review | History
- Project cards list per tab
- Empty states per tab
- Search/filter functionality
- Pull-to-refresh (mobile)
- Uses: `shadcn/tabs`, virtual scrolling for performance

#### Task 3.2: Project Card Component
**File:** `components/projects/ProjectCard.tsx`
- Header: Title + Subject icon
- Body:
  - Project ID (#AE-2940)
  - Deadline with color coding (red if <24h)
  - Progress bar (for In Progress)
- Footer:
  - Status badge (pill shape, color-coded)
  - Action button (context-aware)
- Click to navigate to detail
- Uses: `shadcn/card`, `shadcn/badge`, `shadcn/progress`

#### Task 3.3: Status Badge Component
**File:** `components/projects/StatusBadge.tsx`
- Color-coded pill shapes:
  - Analyzing: Yellow (#EAB308)
  - Payment Pending: Orange (#F59E0B)
  - In Progress: Blue (#3B82F6)
  - For Review: Green (#22C55E)
  - Completed: Grey (#6B7280)
  - Revision: Red (#EF4444)
- Icon + text
- Uses: `shadcn/badge`, `lucide-react`

#### Task 3.4: Payment Prompt Modal
**File:** `components/projects/PaymentPromptModal.tsx`
- Shows on page load if payment pending
- Project name display
- Amount due
- "Pay Now" CTA → Razorpay checkout
- "Remind Later" dismiss
- Uses: `shadcn/dialog`, Razorpay JS SDK

#### Task 3.5: Review Actions Component
**File:** `components/projects/ReviewActions.tsx`
- For "For Review" status projects
- "Approve" primary button
- "Request Changes" secondary button
- Auto-approval countdown timer (48h)
- Feedback textarea (on request changes)
- Uses: `shadcn/button`, `shadcn/textarea`

#### Task 3.6: Project Timeline
**File:** `components/projects/ProjectTimeline.tsx`
- Vertical timeline layout
- Milestone nodes with timestamps
- Current status highlight
- Expected completion date
- Uses: `shadcn/separator`, custom timeline CSS

### Database Tables Used
- `projects`
- `project_status_history`
- `project_quotes`
- `project_payments`
- `project_revisions`

---

## Batch 4: Project Detail Page (14 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U42 | Sticky Header | Back Arrow, Project Name, Kebab Menu | Core |
| U43 | Status Banner | Thin colored strip showing status | Core |
| U44 | Deadline Timer | Real-time countdown | Core |
| U45 | Live Draft Tracking | "Track Progress Live" + "Open Live Draft" button | Core |
| U46 | Read-Only WebView | Google Docs/Sheets in read-only mode | Core |
| U47 | Project Brief Accordion | Collapsed: Requirements + Budget; Expanded: Full details | Core |
| U48 | Deliverables Section | List of files + "Download Final Solution" | Core |
| U49 | AI Probability Report | "Human Written" badge or "Download Report" | Core |
| U50 | Plagiarism Check Badge | "Unique Content" or "Download Turnitin Report" | Core |
| U51 | Quality Badges Lock | Badges grayed out until "For Review" | Important |
| U52 | Floating Chat Button | Fixed bottom-right chat bubble | Core |
| U53 | Context-Aware Chat | Chat knows current Project ID | Core |
| U54 | Chat with Supervisor | Opens chat window/page | Core |
| U55 | Attached Reference Files | View uploaded files in accordion | Important |

### Implementation Tasks

#### Task 4.1: Project Detail Page
**File:** `app/(main)/projects/[id]/page.tsx`
- Sticky header with back navigation
- Status banner strip
- Scrollable content sections:
  - Deadline timer
  - Live draft section
  - Project brief accordion
  - Deliverables section
  - Quality badges
  - Reference files
- Floating chat button
- Kebab menu (Cancel Project, Support)

#### Task 4.2: Status Banner
**File:** `components/projects/StatusBanner.tsx`
- Thin strip at top
- Color matches current status
- Status text (e.g., "In Progress - On Track")
- Optional progress icon

#### Task 4.3: Deadline Timer
**File:** `components/projects/DeadlineTimer.tsx`
- Real-time countdown
- Format: "Due in: 3 Days, 4 Hours, 12 Minutes"
- Color transitions as deadline approaches
- Red when <24 hours
- Uses: `date-fns` for calculations

#### Task 4.4: Live Draft Section
**File:** `components/projects/LiveDraftViewer.tsx`
- "Track Progress Live" card
- Progress percentage (if available)
- "Open Live Draft" button
- Opens in new tab or iframe
- Read-only Google Docs/Sheets/Figma

#### Task 4.5: Project Brief Accordion
**File:** `components/projects/ProjectBriefAccordion.tsx`
- Collapsed: "Original Requirements" + Budget
- Expanded sections:
  - Subject
  - Word Count
  - Reference Style
  - Instructions
  - Attached reference files
- Smooth animation
- Uses: `shadcn/accordion`

#### Task 4.6: Deliverables Section
**File:** `components/projects/DeliverablesList.tsx`
- List of uploaded files
- File type icons
- File size display
- Individual download buttons
- "Download All" option
- Uses: `shadcn/table` or custom list

#### Task 4.7: Quality Badges
**File:** `components/projects/QualityBadges.tsx`
- AI Probability Badge:
  - Green check: "Human Written"
  - Link: "Download Report"
- Plagiarism Badge:
  - Green check: "Unique Content"
  - Link: "Download Turnitin Report"
- Locked/grayed state until For Review
- Uses: `shadcn/badge`, `lucide-react` icons

#### Task 4.8: Floating Chat Button
**File:** `components/chat/FloatingChatButton.tsx`
- Fixed position (bottom-right)
- Chat bubble icon
- Unread message badge
- Opens chat window or navigates to chat page
- Project context preserved

### Database Tables Used
- `projects`
- `project_files`
- `project_deliverables`
- `quality_reports`
- `chat_rooms`
- `chat_messages`

---

## Batch 5: Add Project Module (17 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U56 | Service Selection Menu | Bottom sheet via FAB with 2-column grid | Core |
| U57 | New Project Service | Full task creation flow | Core |
| U58 | Proofreading Service | Polish existing drafts | Core |
| U59 | Plagiarism Check Service | Turnitin report request | Core |
| U60 | AI Detection Report Service | AI verification report | Core |
| U61 | Expert Opinion Service | Consultation/Advice (FREE) | Core |
| U62 | New Project Form - Step 1 | Subject, Topic, Word Count, Deadline | Core |
| U63 | Pricing Note | "More time = lesser price" info | Important |
| U64 | New Project Form - Step 2 | Guidelines, Attachments, Reference Style | Core |
| U65 | Proofreading Form | File upload, Focus Areas, Deadline | Core |
| U66 | Plag/AI Report Form | Document upload, Checkboxes for report types | Core |
| U67 | Expert Opinion Form | Subject, Question, Optional attachment | Core |
| U68 | Submit for Quote CTA | New Project submit | Core |
| U69 | Request Review CTA | Proofreading submit | Core |
| U70 | Get Report CTA | Plag/AI submit | Core |
| U71 | Ask Expert CTA | Expert Opinion submit | Core |
| U72 | Success Popup | "Project Received! Supervisor reviewing" | Core |

### Implementation Tasks

#### Task 5.1: Service Selector
**File:** `components/forms/ServiceSelector.tsx`
- 2-column grid layout
- Service options:
  1. New Project (main)
  2. Proofreading
  3. Plagiarism Check
  4. AI Detection
  5. Expert Opinion (FREE badge)
- Icons for each service
- Click to navigate to respective form
- Uses: `shadcn/card`, `lucide-react`

#### Task 5.2: New Project Form
**File:** `app/(main)/projects/new/page.tsx` + `components/forms/NewProjectForm.tsx`
- Multi-step wizard:
  - Step 1:
    - Subject dropdown (searchable)
    - Topic Name input
    - Word Count (optional number input)
    - Deadline date/time picker
    - Pricing note tooltip
  - Step 2:
    - Project Guidelines (rich textarea)
    - File attachments (drag & drop)
    - Reference Style dropdown (APA, Harvard, MLA, Chicago)
- Progress indicator
- "Submit for Quote" button
- Uses: `react-hook-form`, `zod`, `shadcn/form`, `shadcn/calendar`, file upload component

#### Task 5.3: Proofreading Form
**File:** `components/forms/ProofreadingForm.tsx`
- Document upload (drag & drop)
- Focus Area chips (multi-select):
  - Grammar
  - Flow
  - Formatting
  - Citations
  - Expert Opinion
- Deadline picker
- "Request Review" button
- Uses: `shadcn/checkbox` styled as chips

#### Task 5.4: Report Request Form
**File:** `components/forms/ReportRequestForm.tsx`
- Document upload
- Checkboxes:
  - Similarity Check (Turnitin)
  - AI Content Detection
- "Get Report" button

#### Task 5.5: Expert Opinion Form
**File:** `components/forms/ExpertOpinionForm.tsx`
- Subject dropdown
- Question textarea (large)
- Optional file attachment
- FREE badge prominently displayed
- "Ask Expert" button

#### Task 5.6: Success Dialog
**File:** `components/forms/SubmissionSuccess.tsx`
- Success animation (checkmark)
- "Project Received!" title
- "Supervisor is reviewing it" subtext
- WhatsApp notification info
- "View My Projects" button
- "Submit Another" button
- Uses: `shadcn/dialog`, `framer-motion`

### Database Tables Used
- `projects`
- `project_files`
- `subjects`
- `reference_styles`

---

## Batch 6: Student Connect / Campus Marketplace (13 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U73 | Pinterest-Style Layout | Staggered Grid / Masonry Layout | Core |
| U74 | Feed Algorithm | Based on Location + Course interest | Core |
| U75 | Discovery Mix | Randomized content without forced filters | Important |
| U76 | Optional Filters | Top bar filters for City, Category | Important |
| U77 | Hard Goods Category | Books, Drafters, Calculators, etc. | Core |
| U78 | Housing Category | Flatmates, Room availability (5km) | Core |
| U79 | Opportunities Category | Internships, Gigs, Events | Core |
| U80 | Community Category | Polls, Reviews, Questions | Core |
| U81 | Item Card | Variable aspect ratio image + Price + Distance | Core |
| U82 | Text Card | Solid background + Question/Review text | Core |
| U83 | Banner Card | Full-width for Events/Jobs | Core |
| U84 | Secondary FAB | For posting content in Connect section | Core |
| U85 | Posting Options | Sell/Rent, Post Opportunity, Community Post | Core |

### Implementation Tasks

#### Task 6.1: Marketplace Page
**File:** `app/(main)/marketplace/page.tsx`
- Masonry/Pinterest-style grid
- Filter chips bar
- Infinite scroll
- Search functionality
- Secondary FAB for posting
- Uses: `react-masonry-css`, virtual scrolling

#### Task 6.2: Filter Bar
**File:** `components/marketplace/FilterBar.tsx`
- Horizontal scroll chips:
  - All
  - Hard Goods
  - Housing
  - Opportunities
  - Community
- City filter dropdown
- Clear filters option
- Uses: `shadcn/badge` styled as chips, `shadcn/popover`

#### Task 6.3: Item Card
**File:** `components/marketplace/ItemCard.tsx`
- Variable aspect ratio image
- Price tag overlay
- Distance badge ("800m away")
- Seller avatar (optional)
- Click to view detail
- Uses: `next/image`, `shadcn/card`

#### Task 6.4: Text Card
**File:** `components/marketplace/TextCard.tsx`
- Solid background color (randomized)
- Question or Review text
- Author avatar + name
- Like/comment count
- Category tag
- Uses: `shadcn/card`

#### Task 6.5: Banner Card
**File:** `components/marketplace/BannerCard.tsx`
- Full-width card
- Event/Job image
- Title + date
- "Apply" or "Register" CTA
- Organization logo/info

#### Task 6.6: Masonry Grid
**File:** `components/marketplace/MasonryGrid.tsx`
- Pinterest-style layout
- Mixed card types
- Responsive columns
- Infinite scroll loading
- Uses: `react-masonry-css`

#### Task 6.7: Create Listing Page
**File:** `app/(main)/marketplace/create/page.tsx`
- Listing type selection:
  1. Sell/Rent Item → Image upload + Form
  2. Post Opportunity → Event/Job form
  3. Community Post → Text/Poll form
- Image upload with preview
- Price input
- Description textarea
- Category selection
- Location (auto-detect or manual)
- "Post" button

#### Task 6.8: Item Detail Page
**File:** `app/(main)/marketplace/[id]/page.tsx`
- Image gallery
- Title + Price
- Description
- Seller info + rating
- Distance/Location
- "Contact Seller" button
- Share button
- Report option

### Database Tables Used
- `marketplace_listings`
- `marketplace_categories`
- `marketplace_images`
- `marketplace_favorites`
- `marketplace_messages`

---

## Batch 7: Profile & Settings (15 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U86 | Hero Section | Top area with avatar, name, university | Core |
| U87 | Stats Card | Wallet Balance + Total Projects Completed | Core |
| U88 | Wallet Balance Display | Large text + "Available Credits" + History link | Core |
| U89 | Personal Details Edit | Edit Name, Phone, Email | Core |
| U90 | College & Course Info | University, Course, Year, City | Core |
| U91 | Payment Methods | Manage Saved Cards / UPI IDs | Core |
| U92 | Help & Support | WhatsApp link + "Raise a Ticket" | Core |
| U93 | How It Works | Re-launch onboarding tutorial | Important |
| U94 | Referral Code | "Share Code: EXPERT20" + tap-to-copy | Core |
| U95 | Log Out Button | Footer action | Core |
| U96 | App Version | Display current version | Important |
| U97 | Trust Badges | "Your data is encrypted" on input screens | Important |
| U98 | Transaction History | Detailed wallet transactions | Core |
| U99 | Top-Up Wallet | Add money to wallet | Core |
| U100 | Profile Picture | User image or initials avatar | Important |

### Implementation Tasks

#### Task 7.1: Profile Page
**File:** `app/(main)/profile/page.tsx`
- Hero section with avatar and info
- Stats card (floating)
- Settings list
- Log out button
- Version info footer

#### Task 7.2: Profile Hero
**File:** `components/profile/ProfileHero.tsx`
- Gradient/colored background
- Avatar with edit button
- Name (editable)
- University + Course subtext
- Semester/Year

#### Task 7.3: Stats Card
**File:** `components/profile/StatsCard.tsx`
- Floating card design
- Two stat items:
  1. Wallet Balance (click for history)
  2. Projects Completed
- "Top Up" button
- Uses: `shadcn/card`

#### Task 7.4: Wallet Page
**File:** `app/(main)/profile/wallet/page.tsx`
- Current balance (large display)
- "Top Up" button → Razorpay
- Transaction history list:
  - Credits (green +)
  - Debits (red -)
  - Date, Amount, Description
- Date range filter
- Uses: `shadcn/table`, Razorpay JS SDK

#### Task 7.5: Edit Profile Page
**File:** `app/(main)/profile/edit/page.tsx`
- Profile picture upload
- Personal Details:
  - Name
  - Phone (with verification)
  - Email
- College Info:
  - University
  - Course
  - Year
  - City
- Save button

#### Task 7.6: Payment Methods Page
**File:** `app/(main)/profile/settings/page.tsx` (section)
- Saved Cards list
- Add new card button
- Saved UPI IDs
- Add UPI button
- Delete payment method
- Set default option

#### Task 7.7: Help & Support
**File:** `components/profile/HelpSupport.tsx`
- WhatsApp Support button (opens WhatsApp Business)
- "Raise a Ticket" form:
  - Issue category dropdown
  - Description textarea
  - Attachment option
  - Submit button
- FAQ accordion
- Contact info

#### Task 7.8: Referral Section
**File:** `components/profile/ReferralSection.tsx`
- Referral code display
- Copy to clipboard functionality
- Share button (Web Share API)
- Referral benefits info
- Referral stats (count, earnings)

#### Task 7.9: Settings List
**File:** `components/profile/SettingsList.tsx`
- List items with icons:
  - Personal Details
  - College Info
  - Payment Methods
  - Help & Support
  - How It Works
  - Referral Code
- Chevron indicators
- Click to navigate

### Database Tables Used
- `profiles`
- `users`
- `wallets`
- `wallet_transactions`
- `payment_methods`
- `referrals`
- `support_tickets`

---

## Cross-Platform Features

### Chat System (Supabase Realtime)

**File:** `services/chat.service.ts` + `hooks/useChat.ts`
```typescript
// Features:
// - Real-time message subscription
// - Send/receive messages
// - File attachments
// - Project context awareness
// - Unread count tracking
// - Message read receipts
// Uses: Supabase Realtime channels
```

### Push Notifications

**File:** `services/notification.service.ts`
```typescript
// Features:
// - Browser notifications (Web Push API)
// - Service Worker registration
// - Notification click handling
// - Topic subscriptions
// - Permission request flow
```

### Payment Integration (Razorpay)

**File:** `services/payment.service.ts`
```typescript
// Features:
// - Razorpay JS SDK integration
// - Order creation (server action)
// - Checkout modal
// - Payment verification
// - Wallet top-up flow
// - Project payment flow
```

### Real-time Updates

```typescript
// Supabase Realtime subscriptions for:
// - Project status changes
// - New quotes
// - Chat messages
// - Notifications
// - Marketplace listings
```

---

## Database Tables Required (User Context)

> **Full Schema:** See `docs/DATABASE.md` for complete table definitions.

### Core Tables (4)
1. `profiles` - Base user info
2. `users` - User-specific data (role, university, course)
3. `universities` - University master
4. `courses` - Course master

### Project Tables (10)
5. `projects` - Main projects
6. `project_files` - Reference files
7. `project_deliverables` - Completed files
8. `project_status_history` - Status audit
9. `project_revisions` - Revision requests
10. `project_quotes` - Price quotes
11. `project_payments` - Payment records
12. `quality_reports` - AI/plagiarism reports
13. `project_timeline` - Milestones
14. `project_grades` - Optional grade entry

### Financial Tables (5)
15. `wallets` - User wallet
16. `wallet_transactions` - Transaction history
17. `payment_methods` - Saved cards/UPI
18. `invoices` - Generated invoices
19. `referrals` - Referral tracking

### Communication Tables (4)
20. `chat_rooms` - Chat rooms
21. `chat_messages` - Messages
22. `chat_participants` - Participants
23. `notifications` - Notifications

### Marketplace Tables (6)
24. `marketplace_listings` - Items/Posts
25. `marketplace_categories` - Categories
26. `marketplace_images` - Listing images
27. `marketplace_favorites` - User favorites
28. `marketplace_messages` - Buyer-seller chat
29. `marketplace_reports` - Reported listings

### Support Tables (3)
30. `support_tickets` - Support tickets
31. `ticket_messages` - Ticket messages
32. `faqs` - FAQs

### Configuration Tables (3)
33. `subjects` - Subject master
34. `reference_styles` - Citation styles
35. `promotional_banners` - Home banners

---

## Implementation Order Summary

| Batch | Features | Est. Pages | Est. Components | Priority |
|-------|----------|------------|-----------------|----------|
| 0 | Setup | - | - | Prerequisite |
| 1 | Onboarding (11) | 7 | 10 | Core |
| 2 | Dashboard (12) | 1 | 12 | Core |
| 3 | My Projects (18) | 2 | 10 | Core |
| 4 | Project Detail (14) | 2 | 10 | Core |
| 5 | Add Project (17) | 2 | 8 | Core |
| 6 | Marketplace (13) | 4 | 10 | Core |
| 7 | Profile (15) | 5 | 12 | Core |

**Total: 100 Features | 23 Pages | 72 Components | 35 Database Tables**

---

## Additional Notes

### Design Guidelines
- **Primary Color:** Professional Blue (#2563EB)
- **Accent:** Bright Blue (#3B82F6)
- **Background:** Light Grey (#F8FAFC) / Dark (#0F172A)
- **Visual Theme:** Professionalism, Security, Efficiency
- **Font Family:** Inter (Google Fonts)
- **Spacing:** 8px grid system
- **Border Radius:** 12-16px for cards, 8-12px for buttons

### Status Color Coding
| Color | Status | Hex Code |
|-------|--------|----------|
| Yellow | Analyzing | #EAB308 |
| Orange | Payment Pending | #F59E0B |
| Blue | In Progress | #3B82F6 |
| Green | For Review / Completed | #22C55E |
| Grey | Archived | #6B7280 |
| Red | Urgent / Revision | #EF4444 |

### Responsive Breakpoints
| Breakpoint | Width | Target |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Wide screens |

### Performance Considerations
- Server Components for static content
- Client Components only where needed
- Image optimization with next/image
- Code splitting by route
- Lazy loading for below-fold content
- Virtual scrolling for long lists
- Supabase query optimization

### Security Considerations
- Server-side authentication checks
- CSRF protection
- Input sanitization
- Content Security Policy headers
- Rate limiting on API routes
- Secure cookie handling

### SEO Considerations
- Dynamic metadata per page
- Open Graph tags
- Structured data where applicable
- Sitemap generation
- robots.txt configuration

### Safe Language Compliance
- Always use "Project" instead of "Assignment"
- Use "Project Brief" instead of "Assignment Brief"
- "Upload Project" not "Upload Assignment"
- This is critical for platform positioning

---

*Document Version: 1.0*
*Created: December 2025*
*Project: AssignX - User Website*
