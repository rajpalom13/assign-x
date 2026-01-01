# Supervisor Implementation Plan - Web & Mobile App

> **Project:** AssignX Supervisor Panel (AdminX)
> **Version:** 1.0 | **Date:** December 2025
> **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)

---

## Quick Navigation

| Platform | Technology | Detailed Plan |
|----------|------------|---------------|
| **Web** | Next.js 16 + React 19 + shadcn/ui (New York) | [superviser-web/IMPLEMENTATION_PLAN.md](../superviser-web/IMPLEMENTATION_PLAN.md) |
| **Mobile App** | Flutter 3.10+ + Riverpod + GoRouter | [superviser_app/IMPLEMENTATION_PLAN.md](../superviser_app/IMPLEMENTATION_PLAN.md) |

---

## 1. Platform Comparison

| Aspect | Web | Mobile App |
|--------|-----|------------|
| **Framework** | Next.js 16 + React 19 | Flutter 3.10+ |
| **Language** | TypeScript | Dart |
| **UI Library** | shadcn/ui (New York style) | Custom Flutter widgets |
| **State Management** | Zustand + React Query | Riverpod |
| **Navigation** | Next.js App Router | GoRouter |
| **Styling** | Tailwind CSS 4 | Flutter ThemeData |
| **Charts** | Recharts | fl_chart |
| **Forms** | react-hook-form + zod | reactive_forms |
| **Push Notifications** | Web Push API | Firebase Cloud Messaging |

---

## 2. Shared Components (Backend)

Both platforms share the **exact same Supabase backend**:

### Database Statistics
| Metric | Count |
|--------|-------|
| Total Tables | 58 |
| ENUM Types | 12 |
| Functions | 8 |
| Triggers | 30+ |
| Indexes | 150+ |

### Shared Tables by Category

| Category | Tables | Count |
|----------|--------|-------|
| Core/Auth | profiles, supervisors, supervisor_expertise, supervisor_activation, supervisor_reviews, admins | 6 |
| Project & Workflow | projects, project_files, project_deliverables, project_status_history, project_revisions, project_quotes, project_assignments, quality_reports, project_timeline | 9 |
| Financial | wallets, wallet_transactions, payments, payment_methods, payouts, payout_requests, invoices | 7 |
| Chat & Communication | chat_rooms, chat_participants, chat_messages, notifications | 4 |
| Training & Activation | training_modules, training_progress, quiz_questions, quiz_attempts, doer_activation, supervisor_activation | 6 |
| Configuration | subjects, skills, universities, courses, industries, reference_styles, pricing_guides, app_settings, faqs, banners, referral_codes, referral_usage | 12 |
| Doer Management | doers, doer_skills, doer_subjects, doer_reviews | 4 |
| Support & Audit | support_tickets, ticket_messages, activity_logs, error_logs | 4 |

### Shared ENUM Types

```sql
-- Project lifecycle (20 states)
project_status: draft, submitted, analyzing, quoted, payment_pending, paid,
                assigning, assigned, in_progress, submitted_for_qc, qc_in_progress,
                qc_approved, qc_rejected, delivered, revision_requested, in_revision,
                completed, auto_approved, cancelled, refunded

-- Other ENUMs
service_type, transaction_type, payment_status, payout_status,
chat_room_type, message_type, notification_type, ticket_status, ticket_priority
```

### Shared Database Functions

| Function | Purpose |
|----------|---------|
| `update_updated_at_column()` | Auto-updates timestamps |
| `generate_project_number()` | Creates project numbers (AX-00001) |
| `generate_ticket_number()` | Creates ticket numbers (TKT-YYYY-XXXXX) |
| `log_project_status_change()` | Logs status changes to history |
| `update_wallet_balance()` | Updates wallet on transactions |
| `update_doer_stats()` | Updates doer stats on completion |
| `create_wallet_for_profile()` | Auto-creates wallets |
| `detect_contact_info()` | Detects contact info in chat |

---

## 3. Feature Summary (Both Platforms)

| Category | Features | Priority |
|----------|----------|----------|
| Onboarding & Registration | 11 | Core |
| Activation Phase | 6 | Core |
| Main Dashboard / Requests | 12 | Core |
| Active Projects Management | 10 | Core |
| Training & Resources | 5 | Core |
| Profile & Statistics | 10 | Core |
| Doer & User Management + Support | 7 | Core |
| **Total Features** | **61** | - |

---

## 4. Implementation Batches (Unified)

### BATCH 1: Foundation & Authentication
**Priority: Critical**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| SETUP-01 | Project Setup | Next.js + shadcn/ui New York | Flutter Clean Architecture |
| SETUP-02 | Supabase Setup | @supabase/auth-helpers-nextjs | supabase_flutter |
| SETUP-03 | Theme System | CSS variables + Tailwind | ThemeData + ColorScheme |
| S01 | Splash Screen | Page with animation | Animated splash |
| S05 | Credentials Form | react-hook-form | ReactiveForm |
| AUTH-01 | Login Page | Server Actions | Supabase Auth |
| AUTH-02 | Session Management | Middleware | GoRouter redirect |
| LAYOUT-01 | App Shell | Sidebar component | Scaffold + Drawer |

---

### BATCH 2: Registration & Onboarding
**Priority: High**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S02-S04 | Onboarding Slides | Carousel component | PageView |
| S06 | Professional Profile | Multi-step form | Multi-step form |
| S07 | Banking Setup | Form with validation | Form with IFSC validation |
| S08 | Submit Application | API route | API call |
| S09-S11 | Verification Status | Status cards | Status indicators |

---

### BATCH 3: Activation Flow
**Priority: High**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S12 | Activation Lock | Full-screen overlay | Full-screen overlay |
| S13 | Training Module | video.js + PDF viewer | video_player + flutter_pdfview |
| S14-S16 | Quiz System | Custom quiz component | Quiz widgets |
| S17 | Welcome Message | Success animation | Animated success |

---

### BATCH 4: Main Dashboard & Requests
**Priority: Core**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S18-S21 | Dashboard Header | Header + Drawer | AppBar + Drawer |
| S22 | Field Filter | Select/Tabs | FilterChip |
| S23-S24 | New Requests | Card list + Modal | ListView + BottomSheet |
| S25-S27 | Ready to Assign | Card list + Modal | ListView + BottomSheet |
| S28-S29 | Pricing & Doer Reviews | Forms + Cards | Forms + Cards |

---

### BATCH 5: Active Projects Management
**Priority: Core**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S30-S35 | Project Tabs | Tabs component | TabBar + TabBarView |
| S36-S39 | Chat System | Supabase Realtime | Supabase Realtime |

---

### BATCH 6: Training & Resources
**Priority: Important**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S40-S41 | QC Tools | API integration | WebView/API |
| S42-S44 | Resources | Grid layout | GridView |

---

### BATCH 7: Profile & Earnings
**Priority: Important**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S45 | Stats Dashboard | Recharts | fl_chart |
| S46-S54 | Profile & Earnings | Forms + Tables | Forms + Lists |

---

### BATCH 8: Management + Support
**Priority: Important**

| Feature ID | Feature Name | Web | App |
|------------|--------------|-----|-----|
| S55-S56 | Doer/User Management | Data tables | ListViews |
| S57 | Notifications | Web Push | Firebase Messaging |
| S59-S61 | Support System | Forms + Accordion | Forms + Accordion |

---

### BATCH 9: Polish & Optimization
**Priority: Enhancement**

| Task | Web | App |
|------|-----|-----|
| Performance | Code splitting, lazy loading | Widget optimization, lazy loading |
| Accessibility | WCAG compliance | Semantics |
| Error Handling | Error boundaries | Error widget |
| Loading States | Skeleton components | Shimmer effects |
| Testing | Jest + RTL | Widget tests |

---

## 5. Tech Stack Details

### Web (superviser-web)

```bash
# UI Framework
npx shadcn@latest init  # Select: New York style, Slate color

# Core Dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install recharts lucide-react sonner framer-motion
```

### Mobile App (superviser_app)

```yaml
# Core Dependencies (pubspec.yaml)
dependencies:
  flutter_riverpod: ^2.4.9
  go_router: ^13.0.0
  supabase_flutter: ^2.3.0
  reactive_forms: ^16.1.1
  fl_chart: ^0.66.0
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
```

---

## 6. App Identity

| Element | Value |
|---------|-------|
| App Name | AdminX |
| Visual Theme | Professional, Sharp, Authority-driven |
| Primary Color | Dark Blue (#1E3A5F) |
| Secondary Color | Slate Grey (#64748B) |
| Tagline | "Quality. Integrity. Supervision." |

---

## 7. Status Color Coding (Both Platforms)

| Color | Status | Hex Code |
|-------|--------|----------|
| Yellow | Analyzing | #FBBF24 |
| Orange | Payment Pending | #F97316 |
| Blue | In Progress | #3B82F6 |
| Green | For Review | #22C55E |
| Grey | Completed | #6B7280 |
| Red | Urgent/Revision | #EF4444 |

---

## 8. Pricing Configuration

From `pricing_guides` table:

| Multiplier | Value |
|------------|-------|
| Urgency 24h | 1.5x |
| Urgency 48h | 1.3x |
| Urgency 72h | 1.15x |
| Complexity Easy | 1.0x |
| Complexity Medium | 1.2x |
| Complexity Hard | 1.5x |
| Supervisor Commission | 15% |
| Platform Fee | 20% |

---

## 9. Real-time Features (Supabase Realtime)

Both platforms implement real-time updates for:

1. **Chat Messages** - Instant message delivery
2. **Project Status** - Status change notifications
3. **Availability Toggle** - Online/busy status sync
4. **Notifications** - Push to both web and app
5. **New Requests** - Alert when new projects arrive

---

## 10. Security Considerations

| Concern | Implementation |
|---------|----------------|
| Authentication | Supabase Auth with JWT |
| Authorization | Row Level Security (RLS) |
| Data Validation | Server-side validation |
| Contact Detection | `detect_contact_info()` function |
| File Upload | Private Supabase Storage buckets |
| Rate Limiting | Supabase built-in + API routes |

---

## 11. Folder Structure Reference

### Web
```
superviser-web/
├── app/
│   ├── (auth)/         # Login, Register, Onboarding
│   ├── (dashboard)/    # Main dashboard routes
│   ├── (activation)/   # Training, Quiz
│   └── api/            # API routes
├── components/         # React components
├── lib/               # Utilities, Supabase client
├── hooks/             # Custom hooks
└── store/             # Zustand stores
```

### Mobile App
```
superviser_app/lib/
├── core/
│   ├── config/        # Environment, constants
│   ├── theme/         # Colors, typography
│   ├── router/        # GoRouter config
│   └── network/       # Supabase client
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── chat/
│   └── ...            # Feature modules
└── shared/
    ├── widgets/       # Reusable widgets
    └── extensions/    # Dart extensions
```

---

## 12. Development Workflow

### Parallel Development Strategy

```
Week 1-2:   Web BATCH 1-2  |  App BATCH 1-2
Week 3-4:   Web BATCH 3-4  |  App BATCH 3-4
Week 5-7:   Web BATCH 5-6  |  App BATCH 5-6
Week 8-9:   Web BATCH 7-8  |  App BATCH 7-8
Week 10-11: Web BATCH 9    |  App BATCH 9
```

### Shared Work
- Database migrations (Supabase)
- API logic (Supabase Edge Functions if needed)
- Storage bucket configuration
- RLS policies

---

## 13. Environment Variables

### Web (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Mobile App (dart-define)
```bash
flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
```

---

## Quick Links

- **Database Schema:** [DATABASE.md](./DATABASE.md)
- **Web Plan (Full):** [superviser-web/IMPLEMENTATION_PLAN.md](../superviser-web/IMPLEMENTATION_PLAN.md)
- **App Plan (Full):** [superviser_app/IMPLEMENTATION_PLAN.md](../superviser_app/IMPLEMENTATION_PLAN.md)
- **Features Document:** [plan/AssignX_Complete_Features.md](../plan/AssignX_Complete_Features.md)

---

*Document Generated: December 2025*
*Project: AssignX Supervisor (AdminX) v1.0*
