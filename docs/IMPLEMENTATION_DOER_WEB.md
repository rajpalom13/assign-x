# Doer Web - Comprehensive Implementation Plan

> **Technology Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Shadcn/ui (New York Style)
> **Database:** Supabase (PostgreSQL 15+) - See `DATABASE.md` for complete schema
> **Total Features:** 57 Features (D01-D57)
> **App Name:** "Talent Connect" / "DOER"

---

## Database Reference

The complete database schema is documented in `DATABASE.md`. Key statistics:

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
2. [Batch 1: Onboarding & Registration](#batch-1-onboarding--registration-12-features)
3. [Batch 2: Activation Flow / Gatekeeper](#batch-2-activation-flow--gatekeeper-8-features)
4. [Batch 3: Main Dashboard](#batch-3-main-dashboard-12-features)
5. [Batch 4: Active Projects](#batch-4-active-projects-9-features)
6. [Batch 5: Resources & Tools](#batch-5-resources--tools-5-features)
7. [Batch 6: Profile & Earnings](#batch-6-profile--earnings-11-features)
8. [Cross-Platform Features](#cross-platform-features)
9. [Database Tables Required](#database-tables-required)

---

## Batch 0: Project Setup & Configuration

### 0.1 Install Dependencies

```bash
# Shadcn/ui with New York style
npx shadcn@latest init

# Select: New York style, CSS Variables, Base Color

# Required packages
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install lucide-react
npm install zustand # State management
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install recharts # For statistics/graphs
npm install framer-motion # Animations
npm install next-themes # Dark/Light mode
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
```

### 0.3 Folder Structure

```
doer-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (onboarding)/
│   │   ├── welcome/
│   │   │   └── page.tsx
│   │   ├── profile-setup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (activation)/
│   │   ├── training/
│   │   │   └── page.tsx
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   ├── bank-details/
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
│   │   └── MainLayout.tsx
│   ├── onboarding/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingCarousel.tsx
│   │   └── RegistrationForm.tsx
│   ├── activation/
│   │   ├── ActivationGate.tsx
│   │   ├── TrainingModule.tsx
│   │   ├── QuizComponent.tsx
│   │   └── BankDetailsForm.tsx
│   ├── dashboard/
│   │   ├── ProjectCard.tsx
│   │   ├── TaskPoolList.tsx
│   │   └── AssignedTaskList.tsx
│   ├── projects/
│   │   ├── ProjectDetail.tsx
│   │   ├── WorkspaceView.tsx
│   │   ├── FileUpload.tsx
│   │   └── ChatPanel.tsx
│   ├── profile/
│   │   ├── Scorecard.tsx
│   │   ├── EditProfile.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── BankSettings.tsx
│   └── shared/
│       ├── Logo.tsx
│       ├── LoadingSpinner.tsx
│       ├── NotificationBell.tsx
│       └── AvailabilityToggle.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useDoer.ts
│   ├── useProjects.ts
│   ├── useActivation.ts
│   └── useChat.ts
├── stores/
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── uiStore.ts
├── types/
│   └── database.ts            # Auto-generated from Supabase
└── services/
    ├── auth.service.ts
    ├── doer.service.ts
    ├── project.service.ts
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

### 0.5 Theme Configuration

- **Primary Color:** Dark Blue (#1E3A5F)
- **Accent:** Professional Blue (#3B82F6)
- **Background:** Slate Grey (#F8FAFC) / Dark (#0F172A)
- **Visual Theme:** Professional, Sharp, Authority-driven

---

## Batch 1: Onboarding & Registration (12 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D01 | Splash Screen | Clean white/dark blue background with App Logo, optional "Powered by" footer | Core |
| D02 | Onboarding Carousel | 4 slides: Opportunity, Rewards, Support, Action with Skip + Next + Dots | Core |
| D03 | Slide 1 - Opportunity | "Countless opportunities in your field" - Digital globe/network illustration | Core |
| D04 | Slide 2 - Rewards | "Small Tasks, Big Rewards" - Wallet/coin growth chart | Core |
| D05 | Slide 3 - Support | "Supervisor Support (24x7)" - Headset/shield icon | Core |
| D06 | Slide 4 - Action | "Practical Learning with Part-Time Earning" - CTA button | Core |
| D07 | Registration Form | Full Name, Email, Phone (OTP verify), Password, Confirm Password | Core |
| D08 | Terms Agreement | "By signing up, I agree to Terms of Service & Privacy Policy" | Core |
| D09 | Create Account CTA | Primary registration button | Core |
| D10 | Profile Setup - Qualification | Dropdown: High School, Undergrad, Post-Grad, PhD | Core |
| D11 | Profile Setup - Skills | University Name, Areas of Interest (multi-select chips), Specific Skills | Core |
| D12 | Profile Setup - Experience | Slider or options: Beginner, Intermediate, Pro | Core |

### Implementation Tasks

#### Task 1.1: Splash Screen Component
**File:** `components/onboarding/SplashScreen.tsx`
- Logo animation (fade-in + scale)
- App name "DOER" / "Talent Connect"
- Tagline: "Your Skills, Your Earnings"
- "Powered by AssignX" footer
- 2-second auto-transition
- Uses: `framer-motion` for animations

#### Task 1.2: Onboarding Carousel
**File:** `components/onboarding/OnboardingCarousel.tsx`
- 4 slides with illustrations
- Skip button (top-right)
- Next button / Get Started (final slide)
- Dot indicators
- Swipe gesture support
- Uses: `shadcn/carousel`, `framer-motion`

#### Task 1.3: Registration Form
**File:** `components/onboarding/RegistrationForm.tsx`
- Multi-step form with progress indicator
- Step 1: Basic Info (Name, Email, Phone, Password)
- Phone OTP verification flow
- Password strength indicator
- Terms checkbox
- Uses: `react-hook-form`, `zod`, `shadcn/form`

#### Task 1.4: Profile Setup Form
**File:** `components/onboarding/ProfileSetupForm.tsx`
- Step 2: Qualification dropdown
- Step 3: University + Skills selection (chips/tags)
- Step 4: Experience level selector
- Progress bar (25%, 50%, 75%, 100%)
- Uses: `shadcn/select`, `shadcn/checkbox`, custom chip component

#### Task 1.5: Auth Pages
**Files:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(onboarding)/welcome/page.tsx`
- `app/(onboarding)/profile-setup/page.tsx`

### Database Tables Used
- `profiles`
- `doers`
- `doer_skills`
- `doer_subjects`
- `skills`
- `subjects`
- `universities`

---

## Batch 2: Activation Flow / Gatekeeper (8 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D13 | Activation Gate UI | Dashboard LOCKED until 3 steps complete, Visual stepper (1-2-3) | Core |
| D14 | Step 1: Training Module | Video/PDF carousel - Quality Standards, No Plagiarism, Deadlines, Tools | Core |
| D15 | Mark as Complete | Button to confirm training completion | Core |
| D16 | Step 2: Interview Quiz | 5-10 MCQs based on Training Module content | Core |
| D17 | Quiz Pass/Fail Logic | Success/Fail messaging with retry option | Core |
| D18 | Step 3: Bank Details | Account Holder Name, Account Number, IFSC Code, UPI ID | Core |
| D19 | Finish Setup CTA | Completes activation, redirects to Dashboard | Core |
| D20 | Re-attempt Quiz | Allow retry after reviewing training on failure | Important |

### Implementation Tasks

#### Task 2.1: Activation Gate Layout
**File:** `app/(activation)/layout.tsx`
- Visual stepper (1-2-3) showing progress
- Lock icon for incomplete steps
- Check icon for completed steps
- Redirects to dashboard once all complete

#### Task 2.2: Activation Gate Component
**File:** `components/activation/ActivationGate.tsx`
- Full-page overlay when dashboard access attempted
- "Unlock Your Doer Dashboard" header
- Three step cards with status
- Progress percentage
- Uses: `shadcn/card`, `shadcn/progress`

#### Task 2.3: Training Module Page
**File:** `app/(activation)/training/page.tsx`
**Component:** `components/activation/TrainingModule.tsx`
- Video player component (YouTube embed or custom)
- PDF viewer for documents
- Module progress tracker
- "Mark as Complete" button per module
- Overall completion status
- Uses: Custom video player, `shadcn/progress`, `shadcn/accordion`

#### Task 2.4: Quiz Component
**File:** `app/(activation)/quiz/page.tsx`
**Component:** `components/activation/QuizComponent.tsx`
- 5-10 MCQ questions
- Timer display (optional)
- Question navigation
- Answer selection with radio buttons
- Submit quiz button
- Results screen (Pass/Fail)
- Retry button on failure
- Uses: `shadcn/radio-group`, `shadcn/button`, `shadcn/alert`

#### Task 2.5: Bank Details Form
**File:** `app/(activation)/bank-details/page.tsx`
**Component:** `components/activation/BankDetailsForm.tsx`
- Account Holder Name input
- Account Number input (with confirmation)
- IFSC Code input (with validation)
- Bank Name (auto-populated from IFSC)
- UPI ID input (recommended)
- Form validation
- Submit button
- Uses: `react-hook-form`, `zod`, `shadcn/form`

### Database Tables Used
- `doer_activation`
- `training_modules`
- `training_progress`
- `quiz_questions`
- `quiz_attempts`
- `doers` (bank details fields)

---

## Batch 3: Main Dashboard (12 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D21 | Top Header | App Logo/Name (left), Notification Bell + Hamburger Menu (right) | Core |
| D22 | Menu Drawer / Sidebar | User Info, Availability Switch, Menu Items | Core |
| D23 | Availability Toggle | Available / Busy switch with descriptive text | Core |
| D24 | Sidebar Menu Items | My Profile, Reviews, Statistics, Help & Support, Settings | Core |
| D25 | Dashboard Tabs | "Assigned to Me" (priority) + "Open Pool" (grab tasks) | Core |
| D26 | Assigned to Me Tab | Tasks specifically given by Supervisor | Core |
| D27 | Open Pool Tab | General tasks available for anyone to grab | Core |
| D28 | Project Card in List | Title, Urgency Badge, Price, Deadline | Core |
| D29 | Accept Task Button | Primary action on project cards | Core |
| D30 | Urgency Badge | Fire icon or Red color for tasks due in <6 hours | Important |
| D31 | Statistics Page | Detailed graphs of performance metrics | Important |
| D32 | Reviews Page | Feedback score and rating history | Important |

### Implementation Tasks

#### Task 3.1: Main Layout
**File:** `app/(main)/layout.tsx`
- Header component
- Sidebar/Drawer component
- Main content area
- Bottom navigation (mobile)
- Protected route (auth check)

#### Task 3.2: Header Component
**File:** `components/layout/Header.tsx`
- App logo/name (left)
- Search bar (optional)
- Notification bell with badge
- Profile avatar / Menu trigger
- Uses: `shadcn/button`, `lucide-react` icons

#### Task 3.3: Sidebar / Drawer
**File:** `components/layout/Sidebar.tsx`
- User info section (avatar, name, rating)
- Availability toggle switch
- Navigation menu items:
  - Dashboard
  - My Projects
  - Resources
  - My Profile
  - Reviews
  - Statistics
  - Help & Support
  - Settings
  - Logout
- Uses: `shadcn/sheet`, `shadcn/switch`, `shadcn/separator`

#### Task 3.4: Availability Toggle
**File:** `components/shared/AvailabilityToggle.tsx`
- Green dot when available
- Grey dot when busy
- Toggle switch
- "Show me as available for urgent tasks" text
- Real-time update to Supabase

#### Task 3.5: Dashboard Page
**File:** `app/(main)/dashboard/page.tsx`
- Tab navigation: "Assigned to Me" | "Open Pool"
- Task list for each tab
- Empty state for no tasks
- Pull-to-refresh (mobile)
- Real-time updates via Supabase Realtime

#### Task 3.6: Project Card Component
**File:** `components/dashboard/ProjectCard.tsx`
- Project title
- Subject icon/badge
- Urgency badge (Fire icon for <6h)
- Price display (INR)
- Deadline countdown
- Accept Task button
- Uses: `shadcn/card`, `shadcn/badge`, `shadcn/button`

#### Task 3.7: Task Pool List
**File:** `components/dashboard/TaskPoolList.tsx`
- List of available tasks (Open Pool)
- Filter by skill/subject
- Sort by deadline/price
- Pull-to-refresh

#### Task 3.8: Assigned Task List
**File:** `components/dashboard/AssignedTaskList.tsx`
- List of assigned tasks
- Status indicators
- Quick action buttons

#### Task 3.9: Statistics Page
**File:** `app/(main)/statistics/page.tsx`
- Performance graphs (line chart, bar chart)
- Total projects completed
- Earnings over time
- Success rate
- Average rating
- On-time delivery rate
- Uses: `recharts`

#### Task 3.10: Reviews Page
**File:** `app/(main)/reviews/page.tsx`
- Overall rating display (4.8/5 stars)
- Rating breakdown (quality, timeliness, communication)
- Individual review cards
- Filter by project

### Database Tables Used
- `projects`
- `project_assignments`
- `doers`
- `doer_reviews`
- `notifications`

---

## Batch 4: Active Projects (9 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D33 | Active Projects Tabs | Active, Under Review (QC), Completed | Core |
| D34 | Active Tab | Work in Progress with "Open Workspace" button | Core |
| D35 | Workspace View | Project details, chat with supervisor, file upload | Core |
| D36 | Under Review Tab | Submitted work, "QC in Progress" status | Core |
| D37 | Completed Tab | History with "Paid" or "Approved" status | Core |
| D38 | Revision Requested Flag | Red highlight when Supervisor rejects - "Revision Requested" | Core |
| D39 | File Upload | Submit completed work for QC | Core |
| D40 | Chat with Supervisor | In-context communication during active work | Core |
| D41 | Deadline Display | Clear deadline countdown on active projects | Core |

### Implementation Tasks

#### Task 4.1: Projects Page
**File:** `app/(main)/projects/page.tsx`
- Three tab navigation: Active | Under Review | Completed
- Project list for each tab
- Filter and sort options
- Search functionality

#### Task 4.2: Active Projects Tab
**File:** `components/projects/ActiveProjectsTab.tsx`
- List of in-progress projects
- Progress indicator
- "Open Workspace" button
- Deadline countdown
- Urgency indicators

#### Task 4.3: Under Review Tab
**File:** `components/projects/UnderReviewTab.tsx`
- Submitted projects awaiting QC
- "QC in Progress" status badge
- Supervisor name
- Submission timestamp

#### Task 4.4: Completed Tab
**File:** `components/projects/CompletedTab.tsx`
- Historical completed projects
- "Paid" or "Approved" status
- Earnings amount
- Rating received
- Download invoice button

#### Task 4.5: Project Detail Page
**File:** `app/(main)/projects/[id]/page.tsx`
- Full project details view
- Status banner
- Project brief accordion
- Deliverables section
- Chat panel
- File upload area
- Timeline view

#### Task 4.6: Workspace View Component
**File:** `components/projects/WorkspaceView.tsx`
- Split view: Details | Chat
- Project requirements section
- Reference files viewer
- Live document link (Google Docs)
- Upload deliverable button
- Deadline timer (prominent)

#### Task 4.7: File Upload Component
**File:** `components/projects/FileUpload.tsx`
- Drag and drop zone
- File type validation (PDF, DOC, DOCX)
- File size limit display
- Upload progress
- Multiple file support
- Version tracking
- Uses: `shadcn/form`, custom dropzone

#### Task 4.8: Chat Panel Component
**File:** `components/projects/ChatPanel.tsx`
- Real-time chat with Supervisor
- Message bubbles (sent/received)
- File attachment in chat
- Timestamp display
- Read receipts
- Auto-scroll to new messages
- Uses: Supabase Realtime

#### Task 4.9: Revision Requested Component
**File:** `components/projects/RevisionBanner.tsx`
- Red alert banner
- "Revision Requested" text
- Supervisor feedback display
- "View Feedback" button
- Quick action to start revision

### Database Tables Used
- `projects`
- `project_files`
- `project_deliverables`
- `project_status_history`
- `project_revisions`
- `chat_rooms`
- `chat_messages`
- `chat_participants`

---

## Batch 5: Resources & Tools (5 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D42 | Training Center | Re-watch training videos | Core |
| D43 | AI Report Generator | Internal tool to check AI percentage in work | Core |
| D44 | Citation Builder | Input URL → Get APA/Harvard reference | Core |
| D45 | Format Templates | Download standard Word/PPT templates | Core |
| D46 | Resources Grid Layout | Clean grid display of all tools | Important |

### Implementation Tasks

#### Task 5.1: Resources Page
**File:** `app/(main)/resources/page.tsx`
- Grid layout of resource cards
- Categories: Training, Tools, Templates
- Search functionality
- Quick access to frequently used

#### Task 5.2: Training Center Component
**File:** `components/resources/TrainingCenter.tsx`
- List of all training modules
- Video player
- PDF viewer
- Progress tracking (optional rewatch)
- Bookmarking

#### Task 5.3: AI Report Generator Tool
**File:** `components/resources/AIReportGenerator.tsx`
- Text input area or file upload
- "Check AI Content" button
- Results display (percentage)
- Detailed breakdown
- Export report option

#### Task 5.4: Citation Builder Tool
**File:** `components/resources/CitationBuilder.tsx`
- URL input field
- Reference style selector (APA, Harvard, MLA, Chicago)
- "Generate Citation" button
- Copy to clipboard functionality
- History of generated citations
- Manual entry option

#### Task 5.5: Format Templates Section
**File:** `components/resources/FormatTemplates.tsx`
- Template cards with preview
- Categories: Documents, Presentations, Spreadsheets
- Download button for each
- Template descriptions
- File type icons

#### Task 5.6: Resources Grid Component
**File:** `components/resources/ResourcesGrid.tsx`
- Card-based grid layout
- Icon + Title + Description
- Hover effects
- Quick access links
- Uses: `shadcn/card`, CSS Grid

### Database Tables Used
- `training_modules`
- `training_progress`
- `reference_styles`

---

## Batch 6: Profile & Earnings (11 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D47 | Scorecard Section | Active Assignments, Completed, Total Earnings, Rating | Core |
| D48 | Edit Profile | Update qualifications, add new skills/interests | Core |
| D49 | Payment History | Detailed list of past withdrawals and pending payments | Core |
| D50 | Bank Details Management | Edit/Update saved account info | Core |
| D51 | Contact Support | Direct WhatsApp link or Ticket system | Core |
| D52 | Log Out | Profile footer action | Core |
| D53 | Request Payout Button | Manual withdrawal request | Core |
| D54 | Pending Payments Display | Show earnings awaiting clearance | Important |
| D55 | Earnings Graph | Visual representation of earnings over time | Optional |
| D56 | Rating Breakdown | Detailed view of rating components | Optional |
| D57 | Skill Verification Status | Show which skills have been verified | Optional |

### Implementation Tasks

#### Task 6.1: Profile Page
**File:** `app/(main)/profile/page.tsx`
- Hero section with avatar, name, rating
- Scorecard section
- Quick stats cards
- Action buttons (Edit, Payout, Support)
- Logout button

#### Task 6.2: Scorecard Component
**File:** `components/profile/Scorecard.tsx`
- Grid of stat cards:
  - Active Assignments (count)
  - Completed Projects (count)
  - Total Earnings (amount)
  - Average Rating (stars)
  - Success Rate (percentage)
  - On-time Delivery (percentage)
- Uses: `shadcn/card`

#### Task 6.3: Edit Profile Component
**File:** `components/profile/EditProfile.tsx`
- Personal info section
- Qualification update
- Skills management (add/remove chips)
- University info
- Experience level
- Bio/About section
- Profile picture upload
- Uses: `react-hook-form`, `shadcn/form`

#### Task 6.4: Payment History Component
**File:** `components/profile/PaymentHistory.tsx`
- Tabbed view: All | Completed | Pending
- Transaction list with:
  - Date
  - Amount
  - Type (Project Earning, Payout, Bonus)
  - Status
  - Project reference
- Filter by date range
- Export functionality
- Uses: `shadcn/table`, `shadcn/tabs`

#### Task 6.5: Bank Settings Component
**File:** `components/profile/BankSettings.tsx`
- Current bank details display (masked)
- Edit button to update
- UPI ID display
- Primary payment method selector
- Verification status badge

#### Task 6.6: Request Payout Component
**File:** `components/profile/RequestPayout.tsx`
- Available balance display
- Payout amount input
- Minimum payout threshold
- Bank account confirmation
- Request button
- Processing time info
- Uses: `shadcn/dialog`, `shadcn/form`

#### Task 6.7: Earnings Graph Component
**File:** `components/profile/EarningsGraph.tsx`
- Line chart of earnings over time
- Time period selector (Week, Month, Year)
- Total earnings summary
- Comparison with previous period
- Uses: `recharts`

#### Task 6.8: Rating Breakdown Component
**File:** `components/profile/RatingBreakdown.tsx`
- Overall rating (large display)
- Breakdown bars:
  - Quality Rating
  - Timeliness Rating
  - Communication Rating
- Number of reviews
- Recent reviews preview

#### Task 6.9: Skill Verification Component
**File:** `components/profile/SkillVerification.tsx`
- List of skills with status
- Verified badge (green check)
- Pending verification (yellow)
- Not verified (grey)
- Request verification button

#### Task 6.10: Support Section
**File:** `components/profile/SupportSection.tsx`
- WhatsApp support link (primary)
- "Raise a Ticket" button
- FAQ quick links
- Email support option

### Database Tables Used
- `doers`
- `profiles`
- `doer_skills`
- `wallets`
- `wallet_transactions`
- `payouts`
- `payout_requests`
- `doer_reviews`
- `support_tickets`

---

## Cross-Platform Features

### Chat System (Using Supabase Realtime)

#### Implementation Files
- `hooks/useChat.ts` - Chat logic hook
- `services/chat.service.ts` - Chat API functions
- `components/chat/ChatWindow.tsx` - Full chat UI
- `components/chat/MessageBubble.tsx` - Individual message
- `components/chat/ChatInput.tsx` - Message input with file attach

#### Database Tables
- `chat_rooms`
- `chat_messages`
- `chat_participants`

### Notification System

#### Implementation Files
- `hooks/useNotifications.ts`
- `services/notification.service.ts`
- `components/shared/NotificationBell.tsx`
- `components/shared/NotificationDropdown.tsx`

#### Database Tables
- `notifications`

### File Management

#### Implementation Files
- `services/storage.service.ts` - Supabase Storage integration
- `components/shared/FileUploader.tsx`
- `components/shared/FileViewer.tsx`

#### Database Tables
- `project_files`
- `project_deliverables`

---

## Database Tables Required (Doer Context)

> **Full Schema:** See `DATABASE.md` for complete table definitions with all columns, indexes, and constraints.

### Core Tables (4)
1. `profiles` - Base user info (linked to Supabase Auth)
2. `doers` - Doer-specific data (qualification, experience, bank details, stats)
3. `doer_skills` - Doer skill mappings (with proficiency level)
4. `doer_subjects` - Doer subject expertise areas

### Project Tables (8)
5. `projects` - Main projects (20 status states, quotes, assignments)
6. `project_files` - User uploaded reference files
7. `project_deliverables` - Doer submissions with QC status
8. `project_status_history` - Status change audit trail
9. `project_revisions` - Revision requests and responses
10. `project_assignments` - Assignment history tracking
11. `project_timeline` - Milestone tracking
12. `quality_reports` - AI detection & plagiarism reports

### Financial Tables (5)
13. `wallets` - Doer wallet (balance, locked amounts)
14. `wallet_transactions` - Transaction history with 11 types
15. `payouts` - Payout records to bank/UPI
16. `payout_requests` - Withdrawal request workflow
17. `invoices` - Generated invoices

### Communication Tables (4)
18. `chat_rooms` - Chat rooms (5 room types)
19. `chat_messages` - Messages (with contact info detection)
20. `chat_participants` - Room participants with read status
21. `notifications` - Push/in-app notifications (16 types)

### Training Tables (5)
22. `training_modules` - Training content (video/pdf/article)
23. `training_progress` - User progress tracking
24. `quiz_questions` - Quiz questions (MCQ, true/false, scenario)
25. `quiz_attempts` - Quiz attempt records
26. `doer_activation` - 3-step activation status

### Review Tables (2)
27. `doer_reviews` - Reviews for doers (quality, timeliness, communication)
28. `supervisor_reviews` - Reviews for supervisors (for doer context)

### Configuration Tables (5)
29. `skills` - Skills master with categories
30. `subjects` - Subjects master with hierarchy
31. `universities` - Universities master with email domains
32. `courses` - Course master
33. `reference_styles` - Citation styles (APA, Harvard, MLA, Chicago)

### Support Tables (3)
34. `support_tickets` - Support tickets with priority/status
35. `ticket_messages` - Ticket conversation messages
36. `faqs` - FAQs filtered by role

### App Configuration (1)
37. `app_settings` - Global app settings (key-value)

### Key ENUM Types (Doer Context)

| ENUM | Values | Usage |
|------|--------|-------|
| `project_status` | 20 states | Project lifecycle tracking |
| `transaction_type` | 11 types | Wallet transaction categorization |
| `payout_status` | 5 states | Payout workflow status |
| `chat_room_type` | 5 types | Chat room categorization |
| `message_type` | 5 types | Chat message types |
| `notification_type` | 16 types | Notification categories |

---

## Implementation Order Summary

| Batch | Features | Est. Components | Priority |
|-------|----------|-----------------|----------|
| 0 | Setup | 15+ configs | Prerequisite |
| 1 | Onboarding (12) | 8 components | Core |
| 2 | Activation (8) | 6 components | Core |
| 3 | Dashboard (12) | 12 components | Core |
| 4 | Projects (9) | 10 components | Core |
| 5 | Resources (5) | 6 components | Core |
| 6 | Profile (11) | 11 components | Core |

**Total: 57 Features | 53+ Components | 37 Database Tables (Doer Context)**

---

## Additional Notes

### Styling Guidelines (Shadcn New York)
- Use New York style variant (sharper corners, bolder typography)
- Primary color: Dark Blue (#1E3A5F)
- Accent: Professional Blue (#3B82F6)
- Consistent spacing using Tailwind utilities
- Responsive design (mobile-first)
- Dark mode support via `next-themes`

### Performance Considerations
- Use React Server Components where possible
- Implement skeleton loaders for data fetching
- Use Supabase Realtime for live updates
- Optimize images with Next.js Image component
- Lazy load non-critical components

### Security Considerations
- Validate all inputs with Zod
- Protect routes with middleware
- Handle auth tokens securely
- Never expose sensitive bank details
- Rate limit API calls

---

*Document Version: 1.0*
*Created: December 2025*
*Project: AssignX - Doer Web*
