# AssignX: Web vs App Feature Parity Gap Report

**Generated**: January 25, 2026
**Web App**: `user-web/` (Next.js + TypeScript)
**Mobile App**: `user_app/` (Flutter + Dart)

---

## Executive Summary

The web app has **27 routes** across auth, dashboard, projects, experts, marketplace, campus connect, wallet, profile, settings, and support. The Flutter app covers most of these but has **12 critical gaps** where web features are missing or incomplete in the app.

---

## 1. ROUTES COMPARISON

### Web App Routes (27 total)

| # | Route | Purpose | App Equivalent | Status |
|---|-------|---------|----------------|--------|
| 1 | `/` | Landing page | `splash_screen.dart` | PARTIAL - App has splash, not full landing |
| 2 | `/login` | Login (Google OAuth + Magic Link) | `login_screen.dart` | IMPLEMENTED |
| 3 | `/signup` | Signup with role selection | `signin_screen.dart` | IMPLEMENTED |
| 4 | `/signup/student` | Student signup form | `onboarding_screen.dart` | IMPLEMENTED (via onboarding) |
| 5 | `/signup/professional` | Professional signup form | `onboarding_screen.dart` | IMPLEMENTED (via onboarding) |
| 6 | `/onboarding` | Carousel + role selection | `onboarding_screen.dart` | IMPLEMENTED |
| 7 | `/verify-college` | College email verification | **NONE** | **MISSING** |
| 8 | `/home` | Dashboard home | `dashboard_screen.dart` | IMPLEMENTED |
| 9 | `/profile` | Profile management | `profile_screen.dart` | PARTIAL |
| 10 | `/settings` | App settings | `settings_screen.dart` | IMPLEMENTED |
| 11 | `/projects` | My Projects list | `my_projects_screen.dart` | IMPLEMENTED |
| 12 | `/projects/new` | Create project (4 service types) | `new_project_form.dart` + 3 other forms | IMPLEMENTED |
| 13 | `/experts` | Browse experts | `experts_screen.dart` | IMPLEMENTED |
| 14 | `/experts/[id]` | Expert detail | `expert_detail_screen.dart` | IMPLEMENTED |
| 15 | `/experts/booking/[id]` | Book consultation | `booking_screen.dart` | IMPLEMENTED |
| 16 | `/marketplace/[id]` | Listing detail | `item_detail_screen.dart` | IMPLEMENTED |
| 17 | `/wallet` | Wallet & transactions | `wallet_screen.dart` | IMPLEMENTED |
| 18 | `/campus-connect` | Campus community feed | `campus_connect_screen.dart` | IMPLEMENTED |
| 19 | `/campus-connect/create` | Create campus post | `create_post_screen.dart` | IMPLEMENTED |
| 20 | `/campus-connect/[postId]` | Post detail + comments | `post_detail_screen.dart` | IMPLEMENTED |
| 21 | `/support` | Help & support center | `help_support_screen.dart` | PARTIAL |
| 22 | `/connect` | Peer connections (tutors, resources, Q&A) | **NONE** | **MISSING** |
| 23 | `/connect/create` | Create marketplace listing | `create_listing_screen.dart` | IMPLEMENTED |
| 24 | `/project/[id]` | Project detail | `project_detail_screen.dart` | IMPLEMENTED |
| 25 | `/project/[id]/timeline` | Project timeline | `project_timeline_screen.dart` | IMPLEMENTED |
| 26 | `/services/report` | Direct report service | `report_request_form.dart` | IMPLEMENTED (via add-project) |
| 27 | `/dashboard` | Legacy dashboard | N/A | NOT NEEDED |

### App-Only Routes (not on web)

| Route | Purpose | Notes |
|-------|---------|-------|
| `/projects/:id/draft` | Live draft WebView | App-specific (WebView) |
| `/projects/:id/pay` | Project payment | App-specific payment flow |
| `/profile/edit` | Edit profile | Web handles inline |
| `/profile/payment-methods` | Payment methods | Web handles in wallet |
| `/profile/upgrade` | Account upgrade | App has dedicated screen |
| `/campus-connect/saved` | Saved listings | App has dedicated screen |
| `/experts/my-bookings` | My bookings | App has dedicated screen |

---

## 2. FEATURE-BY-FEATURE COMPARISON

### 2.1 Authentication & Onboarding

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Google OAuth | Yes | Yes | No |
| Magic Link login | Yes | No (password-based) | **YES** |
| Email/Password login | Yes | Yes | No |
| Role selection (Student/Professional) | Yes | Yes | No |
| Student signup form | Yes | Yes | No |
| Professional signup form | Yes | Yes | No |
| Onboarding carousel | Yes (3 slides, auto-advance) | Yes | No |
| College email verification | Yes (`/verify-college`) | **NO** | **CRITICAL GAP** |
| Educational email domain validation | Yes (.edu, .ac.in, etc.) | **NO** | **CRITICAL GAP** |

### 2.2 Dashboard / Home

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Personalized greeting | Yes (time-based) | Yes | No |
| Quick stats (active, pending, wallet) | Yes | Yes | No |
| Services grid | Yes | Yes | No |
| Recent projects section | Yes | Yes | No |
| Campus pulse section | Yes | Yes | No |
| Promotional banners | Yes (carousel) | Yes | No |
| Notification bell with count | Yes | Yes | No |
| Wallet balance pill | Yes | Yes | No |
| Floating action button | Yes (central FAB) | Yes | No |
| Onboarding tour system | Yes (guided tour with overlay) | **NO** | **GAP** |

### 2.3 Projects

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Project list with tabs | Yes (In Review, In Progress, For Review, History) | Yes (same tabs) | No |
| Project card with status badge | Yes | Yes | No |
| Deadline display with countdown | Yes | Yes | No |
| Progress bar | Yes | Yes | No |
| Auto-approval timer | Yes | Yes | No |
| Project detail page | Yes | Yes | No |
| Project brief accordion | Yes | Yes | No |
| Attached files section | Yes | Yes | No |
| Deliverables section | Yes | Yes | No |
| Live draft tracker | Yes | Yes | No |
| Quality report badges (AI/Plagiarism) | Yes | Yes | No |
| Status banner with actions | Yes | Yes | No |
| Review actions (approve/revision) | Yes | Yes | No |
| Invoice download | Yes | Yes | No |
| Grade entry dialog | Yes | Yes | No |
| Payment prompt modal | Yes | Yes | No |
| Project timeline | Yes | Yes | No |
| Razorpay payment integration | Yes (working) | **Placeholder** | **CRITICAL GAP** |

### 2.4 Add Project / Service Forms

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| New project form (multi-step) | Yes | Yes | No |
| Proofreading form | Yes | Yes | No |
| AI/Plagiarism report form | Yes | Yes | No |
| Expert consultation form | Yes | Yes | No |
| Service type selection | Yes (URL param ?type=) | Yes (bottom sheet) | No |
| File upload with drag-drop | Yes | Yes (file picker) | No |
| Subject selector | Yes | Yes | No |
| Deadline picker | Yes | Yes | No |
| Price estimation | Yes | Yes | No |
| Step progress indicator | Yes | Yes | No |
| Success confirmation | Yes | Yes | No |

### 2.5 Chat System

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Real-time messaging | Yes | Yes | No |
| Floating chat button | Yes | Yes | No |
| Message history with pagination | Yes | Yes | No |
| Typing indicator | Yes | Yes | No |
| Attachment upload | Yes | Yes | No |
| Read status tracking | Yes | Yes | No |
| Message approval (supervisor) | Yes | Yes | No |
| Violation/moderation dialog | Yes | Yes | No |
| Presence indicators (online users) | Yes | Yes | No |

### 2.6 Experts / Consultations

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Browse experts with filters | Yes | Yes | No |
| Expert hero section with search | Yes | Yes | No |
| Specialization filter | Yes | Yes | No |
| Featured experts carousel | Yes | Yes | No |
| Expert profile detail | Yes | Yes | No |
| Booking calendar | Yes | Yes | No |
| Price breakdown | Yes | **NO** | **GAP** |
| My bookings list | Yes | Yes | No |
| Session cards | Yes | Yes | No |
| Expert review form | Yes (`review-form.tsx`) | **NO** | **GAP** |
| Doctors carousel | Yes | **NO** | **GAP** |

### 2.7 Campus Connect / Marketplace

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Community feed (staggered grid) | Yes | Yes | No |
| Category filter tabs | Yes | Yes | No |
| Search bar | Yes | Yes | No |
| Post card display | Yes | Yes | No |
| Create post form | Yes | Yes | No |
| Post detail view | Yes | Yes | No |
| Like/favorite button | Yes | Yes | No |
| Save/bookmark button | Yes | Yes | No |
| Report button + dialog | Yes | Yes | No |
| Comment section | Yes | Yes | No |
| Housing-specific filters | Yes | Yes | No |
| Event-specific filters | Yes | Yes | No |
| Resource-specific filters | Yes | Yes | No |
| Students-only housing restriction | Yes | Yes | No |
| Saved listings page | Yes | Yes | No |
| College-specific filter | Yes | **NO** | **GAP** |
| Masonry/Pinterest layout | Yes | Yes (staggered grid) | No |

### 2.8 Connect (Peer-to-Peer) Module

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Featured tutors carousel | Yes | **Via marketplace** | PARTIAL |
| Tutor profile card | Yes | Yes (tutor_card.dart) | No |
| Tutor profile detail sheet | Yes | Yes (tutor_profile_sheet.dart) | No |
| Resource sharing cards | Yes | **NO** | **GAP** |
| Study group cards | Yes | **NO** | **GAP** |
| Q&A section | Yes | Yes (qa_section.dart) | No |
| Question cards with voting | Yes | Yes | No |
| Ask question sheet | Yes | Yes | No |
| Book session sheet | Yes | Yes | No |
| Connect search bar | Yes | **NO** | **GAP** |
| Category filter | Yes | **Via marketplace filter** | PARTIAL |
| Advanced filter sheet | Yes | **NO** | **GAP** |

### 2.9 Wallet & Payments

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Wallet balance display | Yes (glassmorphic card) | Yes | No |
| Transaction history | Yes | Yes | No |
| Top-up functionality | Yes (Razorpay) | **Placeholder** | **CRITICAL GAP** |
| Quick actions (top-up, send) | Yes | Yes | No |
| Offers carousel | Yes | **NO** | **GAP** |
| Monthly spend tracking | Yes | **NO** | **GAP** |
| Reward points display | Yes | **NO** | **GAP** |
| Razorpay integration | Yes (working) | **NOT WIRED** | **CRITICAL GAP** |
| Pay from wallet | Yes | **Placeholder** | **CRITICAL GAP** |
| Payment verification with retry | Yes (exponential backoff) | **NO** | **GAP** |

### 2.10 Profile & Account

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Personal info form | Yes | Yes | No |
| Academic info section | Yes | Yes | No |
| Avatar upload | Yes | Yes | No |
| Account badge display | Yes | Yes | No |
| Account upgrade section | Yes | Yes | No |
| Referral section | Yes | Yes | No |
| Danger zone (delete account) | Yes | Yes | No |
| App info footer | Yes | Yes | No |
| Preferences section | Yes | **NO** | **GAP** |
| Subscription card | Yes | **NO** | **GAP** |
| **Security: Password change** | Yes | **NO** | **CRITICAL GAP** |
| **Security: 2FA setup** | Yes | **NO** | **CRITICAL GAP** |
| **Security: Active sessions** | Yes | **NO** | **CRITICAL GAP** |
| **Security: Revoke all sessions** | Yes | **NO** | **CRITICAL GAP** |

### 2.11 Settings

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| App info section | Yes | Yes | No |
| Data management section | Yes | Yes | No |
| Feedback section | Yes | Yes | No |
| Theme toggle (dark/light) | Yes | **NO** | **GAP** |

### 2.12 Notifications

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Notification list | Yes | Yes | No |
| Unread count | Yes | Yes | No |
| Mark as read | Yes | Yes | No |
| Mark all as read | Yes | Yes | No |
| Web Push notifications | Yes (service worker) | **NO** (native push planned) | PARTIAL |
| Real-time notification stream | Yes | Yes | No |
| Unavailability message | Yes | Yes | No |

### 2.13 Support / Help

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| FAQ section | Yes | Yes | No |
| FAQ search | Yes | Yes | No |
| FAQ by category | Yes | Yes | No |
| Contact/ticket form | Yes | Yes | No |
| Ticket history | Yes | Yes | No |
| WhatsApp support | No | Yes (app-only) | App ahead |

### 2.14 Landing Page

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Hero section | Yes (full featured) | Splash screen only | DIFFERENT PURPOSE |
| Feature showcase | Yes | N/A | N/A (web-only) |
| How it works | Yes | N/A | N/A (web-only) |
| Pain points section | Yes | N/A | N/A (web-only) |
| Testimonials | Yes | N/A | N/A (web-only) |
| Trust stats | Yes | N/A | N/A (web-only) |
| Supervisor section | Yes | N/A | N/A (web-only) |
| Platform preview | Yes | N/A | N/A (web-only) |
| CTA section | Yes | N/A | N/A (web-only) |
| Footer | Yes | N/A | N/A (web-only) |

### 2.15 UI/UX & Skeleton Loaders

| Feature | Web | App | Gap? |
|---------|-----|-----|------|
| Dashboard skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Projects skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Marketplace skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Profile skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Wallet skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Settings skeleton | Yes | Shared skeleton_loader | PARTIAL |
| Glassmorphic design | Yes | Yes | No |
| Mesh gradient backgrounds | Yes | Yes | No |
| Framer Motion animations | Yes | Page transitions | No |
| Reduced motion support | Yes (hook) | **NO** | **GAP** |

---

## 3. CRITICAL GAPS SUMMARY (Priority Order)

### P0 - Must Fix (Blocking Production)

| # | Gap | Web Feature | App Status | Impact |
|---|-----|-------------|------------|--------|
| 1 | **Payment Integration** | Razorpay checkout with retry logic | Placeholder payment route | Users CANNOT pay for projects |
| 2 | **Security Section** | Password change, 2FA, active sessions | Not implemented | Security vulnerability |
| 3 | **College Email Verification** | `/verify-college` with domain validation | Not implemented | Campus Connect access control broken |

### P1 - High Priority

| # | Gap | Web Feature | App Status | Impact |
|---|-----|-------------|------------|--------|
| 4 | **Expert Review Form** | Post-session review form | Missing | Users can't leave reviews |
| 5 | **Price Breakdown (Expert Booking)** | Session cost breakdown component | Missing | Users can't see pricing details |
| 6 | **Connect Module (Peer Features)** | Study groups, resource sharing, advanced filters | Only tutors + Q&A via marketplace | Reduced peer networking |
| 7 | **Broken Navigation Routes** | All routes work | `/new-project`, `/my-projects`, `/help`, `/verify-student` broken | Runtime crashes |

### P2 - Medium Priority

| # | Gap | Web Feature | App Status | Impact |
|---|-----|-------------|------------|--------|
| 8 | **Preferences Section** | Notification/display preferences | Missing in profile | User preferences not configurable |
| 9 | **Subscription Card** | Plan display in profile | Missing | Users can't see subscription |
| 10 | **Theme Toggle** | Dark/light mode switch | Missing | No theme customization |
| 11 | **Wallet Offers/Rewards** | Offers carousel + reward points | Missing | No loyalty incentive |
| 12 | **Monthly Spend Tracking** | Wallet analytics | Missing | No spending visibility |

### P3 - Low Priority (Nice to Have)

| # | Gap | Web Feature | App Status |
|---|-----|-------------|------------|
| 13 | Guided onboarding tour | Step-by-step overlay tour | Missing |
| 14 | College-specific filter (Campus Connect) | Filter posts by college | Missing |
| 15 | Reduced motion support | Accessibility hook | Missing |
| 16 | Page-specific skeleton loaders | 6+ distinct skeletons | Single shared skeleton |
| 17 | Doctors carousel (Experts) | Medical experts showcase | Missing |
| 18 | Magic Link login | Passwordless auth option | Missing |

---

## 4. STALE/BROKEN CODE IN APP

| Issue | Location | Description |
|-------|----------|-------------|
| NavItem enum stale | `home_provider.dart:44-50` | Only 5 items (home, projects, add, connect, profile) vs 7 in actual nav |
| Broken route: `/new-project` | `dashboard_screen.dart` | Should be `/add-project/new` |
| Broken route: `/my-projects` | `dashboard_screen.dart` | No matching GoRouter route |
| Broken route: `/help` | `settings_screen.dart` | Should be `/profile/help` |
| Broken route: `/verify-student` | Various | No matching GoRouter route |
| Placeholder payment | `app_router.dart:410-424` | ProjectPaymentScreen exists but payment not wired |
| 15+ TODO/Coming Soon markers | Various screens | Placeholder implementations |

---

## 5. APP-AHEAD FEATURES (Web is Missing)

| Feature | App Has | Web Missing |
|---------|---------|-------------|
| WhatsApp support integration | `whatsapp_service.dart` | No WhatsApp |
| Live Draft WebView | `live_draft_webview.dart` | Handled differently |
| Saved listings dedicated screen | `saved_listings_screen.dart` | Inline in campus connect |
| My bookings dedicated screen | `my_bookings_screen.dart` | Tab in experts page |
| Payment methods management | `payment_methods_screen.dart` | In wallet section |
| Account upgrade dedicated screen | `account_upgrade_screen.dart` | In profile section |

---

## 6. STATE MANAGEMENT COMPARISON

| Aspect | Web (Zustand) | App (Riverpod) | Parity |
|--------|---------------|----------------|--------|
| Auth store | auth-store.ts | auth_provider.dart | Matched |
| User store | user-store.ts | auth_provider.dart | Matched |
| Project store | project-store.ts | project_provider.dart | Matched |
| Wallet store | wallet-store.ts | profile_provider.dart | Matched |
| Notification store | notification-store.ts | home_provider.dart | Matched |
| Marketplace store | (services) | marketplace_provider.dart | Matched |
| Chat management | useChat hook | chat_provider.dart | Matched |
| Expert management | (components) | experts_provider.dart | Matched |
| Persistence | localStorage | N/A | **GAP** |
| Payment hook | usePayment | **None** | **GAP** |

---

## 7. SERVICES COMPARISON

| Service | Web | App | Parity |
|---------|-----|-----|--------|
| Chat | chat.service.ts | chat_repository.dart | Matched |
| Wallet | wallet.service.ts | profile_repository.dart | PARTIAL (no Razorpay) |
| Project | project.service.ts | project_repository.dart | Matched |
| Marketplace | marketplace.service.ts | marketplace_repository.dart | Matched |
| Notification | notification.service.ts | home_repository.dart | Matched |
| Moderation | moderation.service.ts | moderation_service.dart | Matched |
| Invoice | lib/actions/invoice.ts | invoice_service.dart | Matched |
| Cloudinary | N/A | cloudinary_service.dart | App ahead |
| WhatsApp | N/A | whatsapp_service.dart | App ahead |
| Payment (Razorpay) | usePayment hook | **razorpay_test_service.dart only** | **GAP** |

---

## 8. DATA MODELS COMPARISON

| Model | Web Type | App Model | Parity |
|-------|----------|-----------|--------|
| User/Profile | database.ts Profiles | UserProfile | Matched |
| Student | database.ts Students | StudentData | Matched |
| Professional | database.ts Professionals | ProfessionalData | Matched |
| Project | project.ts Project | project_model.dart Project | Matched |
| ProjectStatus | project.ts (20 statuses) | project_model.dart (20 statuses) | Matched |
| ChatMessage | project.ts ChatMessage | chat_model.dart ChatMessage | Matched |
| ChatRoom | database.ts | chat_model.dart ChatRoom | Matched |
| Expert | (component types) | expert_model.dart Expert | Matched |
| Marketplace Listing | marketplace.ts | marketplace_model.dart | Matched |
| Wallet | database.ts Wallets | (in profile models) | Matched |
| Notification | database.ts Notifications | notification_model.dart | Matched |
| SupportTicket | (component types) | support_model.dart | Matched |
| FAQ | (component types) | faq_model.dart | Matched |

---

## 9. RECOMMENDED ACTION ITEMS

### Sprint 1 (Critical - Production Blockers)
1. **Wire up Razorpay payment** in Flutter app (payment_service.dart exists but needs integration)
2. **Fix broken navigation routes** (4 broken routes identified)
3. **Update NavItem enum** to match 7-item navigation
4. **Add college email verification** screen + route

### Sprint 2 (Security & Essential Features)
5. **Implement Security section** in profile (password change, 2FA, sessions)
6. **Add Expert Review form** after consultation completion
7. **Add Price Breakdown** widget for expert booking flow
8. **Remove TODO/placeholder markers** and implement real functionality

### Sprint 3 (Feature Parity)
9. **Add Preferences section** in profile
10. **Add Subscription card** in profile
11. **Add Theme toggle** (dark/light)
12. **Expand Connect module** (study groups, resources, advanced search)

### Sprint 4 (Polish)
13. **Add guided onboarding tour** system
14. **Add page-specific skeleton loaders**
15. **Add reduced motion support**
16. **Add wallet offers/rewards display**
17. **Add monthly spend tracking** in wallet
18. **Add college-specific filter** for Campus Connect

---

*End of Gap Report*
