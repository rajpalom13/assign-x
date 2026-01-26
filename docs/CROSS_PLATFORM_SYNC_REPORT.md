# Cross-Platform Sync Report: user_app (Flutter) vs user-web (Next.js)

**Generated:** 2026-01-25
**Purpose:** Comprehensive feature parity and UI/UX consistency analysis

---

## Executive Summary

This report analyzes feature parity between the Flutter mobile app (`user_app`) and the Next.js web application (`user-web`). Both platforms share a common Coffee Bean design system (#765341) and connect to the same Supabase backend. This analysis identifies gaps, inconsistencies, and recommendations for achieving full sync.

### Key Findings
- **Overall Sync Level:** ~85% feature parity
- **UI Consistency:** Good alignment on core design tokens
- **Data Models:** Minor field naming differences (camelCase vs snake_case handled)
- **Critical Gaps:** Expert consultation feature incomplete on mobile

---

## 1. Feature Comparison Matrix

### Core Features

| Feature | user-web | user_app | Status | Notes |
|---------|----------|----------|--------|-------|
| **Authentication** |
| Google Sign-In | Yes | Yes | SYNCED | Both use Supabase OAuth |
| Magic Link Login | Yes | No | GAP | Web has email magic link |
| College Email Verification | Yes | No | GAP | Web verifies .edu emails |
| Onboarding Flow | Yes | Yes | SYNCED | Both have role selection |
| Student Profile Setup | Yes | Yes | SYNCED | University, course, year |
| Professional Profile Setup | Yes | Yes | SYNCED | Industry, company |
| **Dashboard/Home** |
| Personalized Greeting | Yes | Yes | SYNCED | Time-based greeting |
| Quick Actions Grid | Yes | Yes | SYNCED | Bento-style layout |
| Needs Attention Cards | Yes | Yes | SYNCED | Projects requiring action |
| Promo Banner Carousel | Yes | Yes | SYNCED | Promotional content |
| **Projects** |
| Project List (Tabs) | Yes | Yes | SYNCED | In Review, In Progress, For Review, History |
| Project Detail | Yes | Yes | SYNCED | Full project info |
| Project Timeline | Yes | Yes | SYNCED | Status history |
| Live Draft Tracker | Yes | Yes | SYNCED | Google Docs integration |
| Deliverables Section | Yes | Yes | SYNCED | File downloads |
| Project Chat | Yes | Yes | SYNCED | Real-time messaging |
| Invoice Download | Yes | Yes | SYNCED | PDF generation |
| Auto-Approval Timer | Yes | Yes | SYNCED | 48-hour countdown |
| Grade Entry | Yes | Yes | SYNCED | User grade tracking |
| **Add Project** |
| New Project Form | Yes | Yes | SYNCED | Multi-step wizard |
| Proofreading Form | Yes | Yes | SYNCED | Document upload |
| Expert Opinion Form | Yes | Yes | SYNCED | Consultation request |
| Report Request Form | Yes | Yes | SYNCED | Report generation |
| Service Selection Sheet | Yes | Yes | SYNCED | Service type picker |
| Subject Selector | Yes | Yes | SYNCED | Subject dropdown |
| Deadline Picker | Yes | Yes | SYNCED | Date/time selection |
| File Attachment | Yes | Yes | SYNCED | Cloudinary upload |
| Price Estimate | Yes | Yes | SYNCED | Dynamic pricing |
| **Wallet** |
| Balance Display | Yes | Yes | SYNCED | Current balance |
| Transaction History | Yes | Yes | SYNCED | Credits/debits |
| Add Money (Razorpay) | Yes | Yes | SYNCED | Payment gateway |
| Cashback Offers | Yes | Yes | SYNCED | Promotional offers |
| **Profile** |
| Profile Header | Yes | Yes | SYNCED | Avatar, name, email |
| Avatar Upload | Yes | Yes | SYNCED | Cloudinary storage |
| Edit Profile | Yes | Yes | SYNCED | Form editing |
| Academic Info | Yes | Yes | SYNCED | University details |
| Referral Section | Yes | Yes | SYNCED | Referral code sharing |
| **Settings** |
| Theme Toggle | Yes | Yes | SYNCED | Light/Dark mode |
| Notifications Settings | Yes | Yes | SYNCED | Push preferences |
| Security Settings | Yes | No | GAP | Web has 2FA, sessions |
| Active Sessions | Yes | No | GAP | Session management |
| Password Change | Yes | No | GAP | Password update |
| Danger Zone (Delete) | Yes | Yes | SYNCED | Account deletion |
| **Campus Connect** |
| Post Feed | Yes | Yes | SYNCED | Pinterest-style grid |
| Category Filters | Yes | Yes | SYNCED | 12 categories |
| Post Detail | Yes | Yes | SYNCED | Full post view |
| Create Post | Yes | Yes | SYNCED | Multi-category |
| Like/Save Posts | Yes | Yes | SYNCED | Engagement |
| Comments | Yes | Yes | SYNCED | Nested comments |
| Search | Yes | Yes | SYNCED | Text search |
| **Marketplace** |
| Listings Grid | Yes | Yes | SYNCED | Product cards |
| Category Filters | Yes | Yes | SYNCED | Hard goods, housing, etc. |
| Item Detail | Yes | Yes | SYNCED | Full listing view |
| Create Listing | Yes | Yes | SYNCED | Sell/rent items |
| Favorites | Yes | Yes | SYNCED | Save listings |
| Q&A Section | Yes | Yes | SYNCED | Questions/answers |
| **Experts (NEW)** |
| Expert List | Yes | No | CRITICAL GAP | Expert directory |
| Expert Profile | Yes | No | CRITICAL GAP | Expert details |
| Booking System | Yes | No | CRITICAL GAP | Session booking |
| Expert Reviews | Yes | No | CRITICAL GAP | Rating system |
| **Support** |
| Help Center | Yes | Yes | SYNCED | FAQ section |
| Contact Form | Yes | Yes | SYNCED | Support tickets |
| Ticket History | Yes | Yes | SYNCED | Past tickets |
| WhatsApp Support | Yes | Yes | SYNCED | Direct chat link |
| **Notifications** |
| Notification List | Yes | Yes | SYNCED | In-app notifications |
| Push Notifications | Yes | Yes | SYNCED | FCM integration |
| Real-time Updates | Yes | Yes | SYNCED | Supabase realtime |

### Summary Statistics
- **Total Features:** 58
- **Synced:** 49 (84.5%)
- **Gaps:** 9 (15.5%)
- **Critical Gaps:** 4 (Experts module)

---

## 2. UI/UX Consistency Check

### Color Palette

| Token | user-web (CSS) | user_app (Dart) | Status |
|-------|----------------|-----------------|--------|
| Primary | `oklch(0.44 0.06 35)` ~#765341 | `Color(0xFF765341)` | SYNCED |
| Primary Light | `oklch(0.57 0.055 40)` ~#A07A65 | `Color(0xFF8D6A58)` | CLOSE |
| Accent | `oklch(0.9 0.03 90)` ~#E4E1C7 | `Color(0xFF9D7B65)` | DIFFERENT |
| Background | `oklch(0.985 0.002 60)` ~#FEFDFB | `Color(0xFFFEFDFB)` | SYNCED |
| Surface | `oklch(1 0 0)` #FFFFFF | `Color(0xFFFAF9F7)` | CLOSE |
| Text Primary | `oklch(0.145 0.01 30)` ~#14110F | `Color(0xFF14110F)` | SYNCED |
| Text Secondary | `oklch(0.5 0.02 30)` ~#6B5D4D | `Color(0xFF6B5D4D)` | SYNCED |
| Success | `oklch(0.6 0.2 145)` ~#259369 | `Color(0xFF259369)` | SYNCED |
| Warning | `oklch(0.75 0.18 60)` ~#F59E0B | `Color(0xFFF59E0B)` | SYNCED |
| Error | `oklch(0.577 0.245 27.325)` ~#DC352F | `Color(0xFFDC352F)` | SYNCED |

**Recommendation:** Standardize accent color - web uses vanilla cream (#E4E1C7) while app uses warm brown (#9D7B65).

### Typography

| Style | user-web | user_app | Status |
|-------|----------|----------|--------|
| Font Family | Inter (var) | Inter | SYNCED |
| Display Large | 57px | 57px | SYNCED |
| Headline Large | 32px, w600 | 32px, w600 | SYNCED |
| Title Large | 22px, w600 | 22px, w600 | SYNCED |
| Body Large | 16px, w400 | 16px, w400 | SYNCED |
| Body Medium | 14px, w400 | 14px, w400 | SYNCED |
| Label Large | 14px, w600 | 14px, w600 | SYNCED |

**Status:** Typography is well-synced across platforms.

### Spacing & Border Radius

| Token | user-web | user_app | Status |
|-------|----------|----------|--------|
| Radius SM | 6px | 6px | SYNCED |
| Radius MD | 8px | 8px | SYNCED |
| Radius LG | 10px (0.625rem) | 12px | MINOR DIFF |
| Radius XL | 14px | 16px | MINOR DIFF |
| Button Height | 52px | 52px | SYNCED |
| Card Padding | 16-20px | 16-20px | SYNCED |
| Page Padding | 20-24px | 20px | SYNCED |

**Recommendation:** Align border radius values exactly.

### Component Styling

| Component | user-web | user_app | Status |
|-----------|----------|----------|--------|
| Buttons | Gradient support, hover lift | Solid colors, ripple | DIFFERENT |
| Cards | Glass morphism, hover effects | Elevation shadows | DIFFERENT |
| Inputs | Rounded with border focus | Rounded with border focus | SYNCED |
| Bottom Nav | Dock-style floating | Material NavigationBar | DIFFERENT |
| Loading States | Shimmer animation | Shimmer animation | SYNCED |
| Empty States | Illustrated placeholders | Illustrated placeholders | SYNCED |

**Recommendation:** Consider adding glass morphism to Flutter cards for visual parity.

### Animation Patterns

| Animation | user-web | user_app | Status |
|-----------|----------|----------|--------|
| Page Transitions | Framer Motion | GoRouter | SYNCED |
| Card Hover | translateY(-4px) | None (tap ripple) | N/A |
| Skeleton Loading | shimmer CSS | shimmer animation | SYNCED |
| Floating Effects | float animation | TweenAnimationBuilder | SYNCED |
| Mesh Gradient BG | Animated radials | Static gradient | DIFFERENT |

---

## 3. Data Models Comparison

### Project Model

| Field | TypeScript (user-web) | Dart (user_app) | Status |
|-------|----------------------|-----------------|--------|
| id | `string` | `String` | SYNCED |
| projectNumber | `projectNumber? / project_number?` | `projectNumber` | SYNCED |
| title | `string` | `String` | SYNCED |
| status | `ProjectStatus` | `ProjectStatus` | SYNCED |
| subjectId | `subjectId? / subject_id?` | `String?` | SYNCED |
| deadline | `string? / deadline?` | `DateTime` | TYPE DIFF |
| wordCount | `wordCount? / word_count?` | `int?` | SYNCED |
| progress | `progress? / progress_percentage?` | `progressPercentage` | SYNCED |
| userQuote | `quoteAmount? / final_quote?` | `userQuote` | SYNCED |
| deliveredAt | `deliveredAt? / delivered_at?` | `DateTime?` | SYNCED |
| createdAt | `createdAt? / created_at?` | `DateTime` | SYNCED |
| deliverables | `Deliverable[]` | `List<ProjectDeliverable>` | SYNCED |
| timeline | `TimelineMilestone[]` | `List<ProjectTimelineEvent>` | SYNCED |

**Note:** TypeScript model supports both camelCase and snake_case for database compatibility. Dart model uses camelCase internally with fromJson/toJson conversion.

### Project Status Enum

| Status | user-web | user_app | Status |
|--------|----------|----------|--------|
| draft | Yes | Yes | SYNCED |
| submitted | Yes | Yes | SYNCED |
| analyzing | Yes | Yes | SYNCED |
| quoted | Yes | Yes | SYNCED |
| payment_pending | Yes | Yes | SYNCED |
| paid | Yes | Yes | SYNCED |
| assigning | Yes | Yes | SYNCED |
| assigned | Yes | Yes | SYNCED |
| in_progress | Yes | Yes | SYNCED |
| submitted_for_qc | Yes | Yes | SYNCED |
| qc_in_progress | Yes | Yes | SYNCED |
| qc_approved | Yes | Yes | SYNCED |
| qc_rejected | Yes | Yes | SYNCED |
| delivered | Yes | Yes | SYNCED |
| revision_requested | Yes | Yes | SYNCED |
| in_revision | Yes | Yes | SYNCED |
| completed | Yes | Yes | SYNCED |
| auto_approved | Yes | Yes | SYNCED |
| cancelled | Yes | Yes | SYNCED |
| refunded | Yes | Yes | SYNCED |

**Status:** All 20 project statuses are aligned.

### Service Type Enum

| Service | user-web | user_app | Status |
|---------|----------|----------|--------|
| new_project | Yes | Yes | SYNCED |
| proofreading | Yes | Yes | SYNCED |
| plagiarism_check | Yes | Yes | SYNCED |
| ai_detection | Yes | Yes | SYNCED |
| expert_opinion | Yes | Yes | SYNCED |

### User Profile Model

| Field | TypeScript (user-web) | Dart (user_app) | Status |
|-------|----------------------|-----------------|--------|
| id | `string` | `String` | SYNCED |
| email | `string` | `String` | SYNCED |
| fullName/firstName+lastName | `firstName + lastName` | `fullName` | DIFFERENT |
| phone | `string?` | `String?` | SYNCED |
| phoneVerified | `boolean` | `bool` | SYNCED |
| avatar/avatarUrl | `avatar?` | `avatarUrl` | FIELD NAME |
| userType | `"student" / "professional"` | `UserType enum` | SYNCED |
| onboardingCompleted | Not in type | `bool` | GAP |
| referralCode | Not in type | `String?` | GAP |
| isBlocked | Not in type | `bool` | GAP |

**Recommendation:** Add missing fields to TypeScript UserProfile type.

### Marketplace Model

| Field | TypeScript | Dart | Status |
|-------|-----------|------|--------|
| id | `string` | `String` | SYNCED |
| type | `ListingType` | `ListingType` | SYNCED |
| title | `string` | `String` | SYNCED |
| description | `string?` | `String?` | SYNCED |
| price | `number?` | `double?` | SYNCED |
| isNegotiable | `boolean?` | `bool` | SYNCED |
| images | `string[]` | `List<String>` | SYNCED |
| status | `ListingStatus` | `ListingStatus` | SYNCED |
| likeCount | `likes` | `likeCount` | FIELD NAME |
| viewCount | `views` | `viewCount` | FIELD NAME |

**Note:** Field naming conventions differ slightly but map to same data.

### Campus Connect Types

| Element | user-web | user_app | Status |
|---------|----------|----------|--------|
| Categories | 12 types defined | Limited implementation | GAP |
| Post Model | Full DBCampusConnectPost | Simplified model | PARTIAL |
| Comment Model | DBCampusConnectComment | Basic support | PARTIAL |

---

## 4. API Integration Comparison

### Supabase Queries

| Query | user-web | user_app | Status |
|-------|----------|----------|--------|
| Projects List | `supabase.from('projects').select()` | Same | SYNCED |
| Project Detail | Joins with subjects, reference_styles | Same joins | SYNCED |
| Profile Fetch | `profiles` table | Same | SYNCED |
| Wallet Balance | `wallets` table | Same | SYNCED |
| Notifications | `notifications` with realtime | Same | SYNCED |
| Marketplace | `marketplace_listings` | Same | SYNCED |
| Campus Connect | `campus_posts` | Same | SYNCED |

### Real-time Subscriptions

| Subscription | user-web | user_app | Status |
|--------------|----------|----------|--------|
| Project Updates | Yes (Realtime) | Yes (Realtime) | SYNCED |
| Chat Messages | Yes | Yes | SYNCED |
| Notifications | Yes | Yes | SYNCED |
| Wallet Balance | Yes | Yes | SYNCED |

### Error Handling

| Pattern | user-web | user_app | Status |
|---------|----------|----------|--------|
| Try-Catch | Yes | Yes | SYNCED |
| Error Toast | Sonner toast | SnackBar | SYNCED |
| Retry Logic | retry utility | retry utility | SYNCED |
| Loading States | Skeleton loaders | Skeleton loaders | SYNCED |
| Empty States | EmptyState component | EmptyStateVariants | SYNCED |

---

## 5. Missing Features Analysis

### Critical Gaps (Must Fix)

#### 1. Expert Consultation Module (user_app)

**Missing in Mobile:**
- `D:/assign-x/user-web/app/(dashboard)/experts/page.tsx` - Expert listing
- `D:/assign-x/user-web/app/(dashboard)/experts/[expertId]/page.tsx` - Expert profile
- `D:/assign-x/user-web/app/(dashboard)/experts/booking/[expertId]/page.tsx` - Booking flow
- `D:/assign-x/user-web/types/expert.ts` - Expert types

**Required Implementation:**
```dart
// New files needed in user_app:
lib/features/experts/screens/experts_screen.dart
lib/features/experts/screens/expert_detail_screen.dart
lib/features/experts/screens/booking_screen.dart
lib/features/experts/widgets/expert_card.dart
lib/features/experts/widgets/booking_calendar.dart
lib/data/models/expert_model.dart
lib/data/repositories/expert_repository.dart
lib/providers/expert_provider.dart
```

**Priority:** HIGH - Revenue feature

#### 2. Security Settings (user_app)

**Missing:**
- Two-factor authentication setup
- Active sessions management
- Password change functionality
- Session revocation

**Files to reference:**
- `D:/assign-x/user-web/components/profile/security/`

#### 3. Magic Link Login (user_app)

**Missing:** Email-based passwordless login option

#### 4. College Email Verification (user_app)

**Missing:** `.edu` email verification flow

### Medium Priority Gaps

| Gap | Platform Missing | Effort |
|-----|------------------|--------|
| Animated mesh backgrounds | user_app | Medium |
| Glass morphism cards | user_app | Low |
| Dock-style navigation | user_app (has bottom nav) | Medium |
| 2FA Setup | user_app | Medium |
| Session Management | user_app | Medium |

### Low Priority Gaps

| Gap | Platform Missing | Effort |
|-----|------------------|--------|
| Gradient hover effects | user_app (N/A mobile) | N/A |
| Spotlight effect | user_app | Low |
| Border gradient | user_app | Low |

---

## 6. Recommended Fixes

### Priority 1: Implement Expert Module (Mobile)

```
Estimated Effort: 3-4 days
Files: 8-10 new files
Dependencies: None
```

**Steps:**
1. Create Expert model matching `types/expert.ts`
2. Create ExpertRepository with Supabase queries
3. Create ExpertProvider for state management
4. Build ExpertsScreen with grid layout
5. Build ExpertDetailScreen with profile info
6. Build BookingScreen with calendar picker
7. Add route to GoRouter
8. Add navigation from dashboard

### Priority 2: Align Color Palette

```
Estimated Effort: 2 hours
Files: 1 file (app_colors.dart)
```

**Changes:**
- Update `accent` color to match web's vanilla cream
- Verify all status colors match exactly

### Priority 3: Security Settings (Mobile)

```
Estimated Effort: 2 days
Files: 4-5 new files
```

**Steps:**
1. Create SecuritySettingsScreen
2. Add TwoFactorSetupDialog
3. Add ActiveSessionsSection
4. Add PasswordChangeDialog
5. Wire up to Supabase Auth

### Priority 4: Profile Type Alignment

```
Estimated Effort: 1 hour
Files: types/profile.ts
```

**Add missing fields:**
- `onboardingCompleted: boolean`
- `referralCode?: string`
- `referredBy?: string`
- `isBlocked: boolean`
- `blockReason?: string`

### Priority 5: Glass Morphism Styling (Mobile)

```
Estimated Effort: 4 hours
Files: shared/widgets/glass_container.dart
```

**Enhancement:**
- Add backdrop blur effects where supported
- Match web's `glass-card` styling
- Update card widgets to use glass styling

---

## 7. Screen-by-Screen Comparison

### Home/Dashboard

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Greeting section | Time-based | Time-based | Yes |
| Action cards | 2x2 bento grid | 2x2 asymmetric grid | Yes |
| Needs attention | Horizontal scroll | Horizontal scroll | Yes |
| Background | Mesh gradient animated | Subtle gradient | Partial |

### Projects

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Tab navigation | 4 tabs (pill style) | 4 tabs (material) | Partial |
| Project cards | Glass morphism | Elevated cards | Partial |
| Status badges | Color-coded | Color-coded | Yes |
| Progress bar | Animated | Standard | Partial |
| Empty state | Illustrated | Illustrated | Yes |

### Profile

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Header with avatar | Yes | Yes | Yes |
| Stats cards | 3 stats | 3 stats | Yes |
| Edit form | Multi-section | Multi-section | Yes |
| Settings tabs | Yes | Separate screen | Different |

### Wallet

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Balance card | Glass with gradient | Card with gradient | Yes |
| Add money CTA | Primary button | Primary button | Yes |
| Transactions | List with icons | List with icons | Yes |
| Cashback pills | Horizontal scroll | Horizontal scroll | Yes |

### Campus Connect

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Hero banner | Gradient with search | Gradient with search | Yes |
| Category pills | Horizontal scroll | Filter tabs | Partial |
| Post grid | Masonry layout | Standard grid | Partial |
| Post cards | Image + content | Image + content | Yes |

### Marketplace

| Element | user-web | user_app | Aligned |
|---------|----------|----------|---------|
| Filter tabs | Category pills | Category chips | Yes |
| Item cards | Product card style | Product card style | Yes |
| Detail sheet | Bottom sheet | Screen navigation | Different |

---

## 8. Testing Recommendations

### Cross-Platform Test Cases

1. **Authentication Flow**
   - [ ] Google Sign-In works on both
   - [ ] Onboarding completes correctly
   - [ ] Profile data syncs between platforms

2. **Project Lifecycle**
   - [ ] Create project on web, view on mobile
   - [ ] Payment on mobile reflects on web
   - [ ] Status updates sync in real-time

3. **Wallet Operations**
   - [ ] Add money on one platform
   - [ ] Balance reflects on other platform
   - [ ] Transaction history consistent

4. **Campus Connect**
   - [ ] Post on web, view on mobile
   - [ ] Like/save syncs across platforms
   - [ ] Comments appear in real-time

5. **Notifications**
   - [ ] Push notification received on mobile
   - [ ] In-app notification on web
   - [ ] Mark as read syncs

---

## 9. Conclusion

The user_app (Flutter) and user-web (Next.js) platforms are approximately 85% aligned in feature parity. The most significant gap is the **Expert Consultation module** which exists only on web.

### Immediate Actions:
1. Implement Expert module in Flutter (HIGH priority)
2. Add Security Settings to mobile (MEDIUM priority)
3. Align color palette exactly (LOW effort, immediate)
4. Update TypeScript types for missing fields (LOW effort)

### Long-term Improvements:
1. Consider design system documentation
2. Create shared constants repository
3. Implement automated cross-platform testing
4. Add feature flags for gradual rollouts

---

**Report Generated By:** Code Review Agent
**Last Updated:** 2026-01-25
