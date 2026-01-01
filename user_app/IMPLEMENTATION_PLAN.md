# User App - Flutter Mobile Implementation Plan

> **Technology Stack:** Flutter 3.x + Dart 3.x + Riverpod + Supabase
> **Database:** Supabase (PostgreSQL 15+) - See `docs/DATABASE.md` for complete schema
> **Total Features:** 100 Features (U01-U100)
> **Platforms:** iOS, Android
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

### 0.1 Update pubspec.yaml Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Backend & Auth
  supabase_flutter: ^2.3.0

  # Navigation
  go_router: ^13.0.0

  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  flutter_animate: ^4.3.0
  lottie: ^3.0.0
  smooth_page_indicator: ^1.1.0
  flutter_staggered_grid_view: ^0.7.0

  # Forms & Validation
  flutter_form_builder: ^9.2.1
  form_builder_validators: ^9.1.0

  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # Utilities
  intl: ^0.19.0
  url_launcher: ^6.2.2
  permission_handler: ^11.1.0
  image_picker: ^1.0.7
  file_picker: ^6.1.1
  path_provider: ^2.1.2
  share_plus: ^7.2.1
  confetti: ^0.7.0

  # Payments
  razorpay_flutter: ^1.3.7

  # Icons
  cupertino_icons: ^1.0.8
  phosphor_flutter: ^2.0.1

  # Real-time & Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # WebView
  webview_flutter: ^4.4.4

  # Connectivity
  connectivity_plus: ^5.0.2

  # MCP Integration
  flutter_mcp: ^1.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  riverpod_generator: ^2.3.9
  build_runner: ^2.4.8
  json_serializable: ^6.7.1
  freezed: ^2.4.6
  freezed_annotation: ^2.4.1
```

### 0.2 Folder Structure

```
user_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_text_styles.dart
│   │   │   ├── app_spacing.dart
│   │   │   └── api_constants.dart
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   └── dark_theme.dart
│   │   ├── router/
│   │   │   ├── app_router.dart
│   │   │   └── route_names.dart
│   │   ├── utils/
│   │   │   ├── extensions.dart
│   │   │   ├── validators.dart
│   │   │   └── helpers.dart
│   │   └── errors/
│   │       ├── exceptions.dart
│   │       └── failures.dart
│   │
│   ├── data/
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── project_model.dart
│   │   │   ├── chat_model.dart
│   │   │   ├── wallet_model.dart
│   │   │   ├── marketplace_item_model.dart
│   │   │   └── ...
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── user_repository.dart
│   │   │   ├── project_repository.dart
│   │   │   ├── chat_repository.dart
│   │   │   ├── wallet_repository.dart
│   │   │   ├── marketplace_repository.dart
│   │   │   └── ...
│   │   └── datasources/
│   │       ├── supabase_datasource.dart
│   │       └── local_datasource.dart
│   │
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── project_provider.dart
│   │   ├── chat_provider.dart
│   │   ├── wallet_provider.dart
│   │   ├── marketplace_provider.dart
│   │   └── ...
│   │
│   ├── features/
│   │   ├── splash/
│   │   │   └── splash_screen.dart
│   │   ├── onboarding/
│   │   │   ├── screens/
│   │   │   │   ├── onboarding_screen.dart
│   │   │   │   ├── role_selection_screen.dart
│   │   │   │   ├── student_signup_screen.dart
│   │   │   │   └── professional_signup_screen.dart
│   │   │   └── widgets/
│   │   │       ├── onboarding_page.dart
│   │   │       └── ...
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── otp_verification_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   ├── home/
│   │   │   ├── screens/
│   │   │   │   └── home_screen.dart
│   │   │   └── widgets/
│   │   │       ├── promo_banner_carousel.dart
│   │   │       ├── services_grid.dart
│   │   │       ├── campus_pulse_section.dart
│   │   │       └── ...
│   │   ├── projects/
│   │   │   ├── screens/
│   │   │   │   ├── my_projects_screen.dart
│   │   │   │   ├── project_detail_screen.dart
│   │   │   │   └── add_project_screen.dart
│   │   │   └── widgets/
│   │   │       ├── project_card.dart
│   │   │       ├── status_badge.dart
│   │   │       └── ...
│   │   ├── marketplace/
│   │   │   ├── screens/
│   │   │   │   ├── marketplace_screen.dart
│   │   │   │   ├── item_detail_screen.dart
│   │   │   │   └── create_listing_screen.dart
│   │   │   └── widgets/
│   │   │       ├── item_card.dart
│   │   │       └── ...
│   │   ├── profile/
│   │   │   ├── screens/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   ├── edit_profile_screen.dart
│   │   │   │   ├── wallet_screen.dart
│   │   │   │   └── settings_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   └── chat/
│   │       ├── screens/
│   │       │   └── chat_screen.dart
│   │       └── widgets/
│   │           ├── message_bubble.dart
│   │           └── chat_input.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── app_button.dart
│       │   ├── app_text_field.dart
│       │   ├── app_card.dart
│       │   ├── app_badge.dart
│       │   ├── app_avatar.dart
│       │   ├── bottom_nav_bar.dart
│       │   ├── fab_menu.dart
│       │   ├── loading_indicator.dart
│       │   ├── error_widget.dart
│       │   ├── empty_state.dart
│       │   └── ...
│       └── dialogs/
│           ├── confirm_dialog.dart
│           ├── payment_dialog.dart
│           └── loading_dialog.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── animations/  # Lottie files
│   └── fonts/
│
└── test/
```

### 0.3 Supabase Configuration

Create `lib/core/config/supabase_config.dart`:
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
```

### 0.4 Theme Configuration

Create `lib/core/theme/app_theme.dart`:
```dart
import 'package:flutter/material.dart';

class AppTheme {
  // Colors - Professionalism, Security, Efficiency
  static const Color primaryColor = Color(0xFF2563EB);      // Professional Blue
  static const Color accentColor = Color(0xFF3B82F6);       // Bright Blue
  static const Color backgroundColor = Color(0xFFF8FAFC);   // Light Grey
  static const Color surfaceColor = Colors.white;
  static const Color errorColor = Color(0xFFEF4444);        // Red
  static const Color successColor = Color(0xFF22C55E);      // Green
  static const Color warningColor = Color(0xFFF59E0B);      // Orange
  static const Color inProgressColor = Color(0xFF3B82F6);   // Blue
  static const Color analyzingColor = Color(0xFFEAB308);    // Yellow

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
      secondary: accentColor,
      background: backgroundColor,
      surface: surfaceColor,
      error: errorColor,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceColor,
      foregroundColor: primaryColor,
      elevation: 0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceColor,
      selectedItemColor: primaryColor,
      unselectedItemColor: Colors.grey,
      type: BottomNavigationBarType.fixed,
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.dark,
      primary: accentColor,
      secondary: primaryColor,
      background: const Color(0xFF0F172A),
      surface: const Color(0xFF1E293B),
    ),
    fontFamily: 'Inter',
  );
}
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
| U10 | Smart Keyboard | Context-aware: @ for email, number pad for mobile/OTP | Important |
| U11 | Error States | Red outlines for invalid inputs | Important |

### Implementation Tasks

#### Task 1.1: Splash Screen
**File:** `lib/features/splash/splash_screen.dart`
```dart
// Features:
// - Logo fade-in + scale animation
// - Tagline: "Your Task, Our Expertise"
// - Brand color background
// - 2-second auto-transition
// - Check auth state → route accordingly
// Uses: flutter_animate, Lottie (optional)
```

#### Task 1.2: Onboarding Carousel
**File:** `lib/features/onboarding/screens/onboarding_screen.dart`
```dart
// Features:
// - PageView with 3 slides:
//   1. Concept: "Get expert help for your projects"
//   2. Versatility: "Academic, Professional, Creative"
//   3. Trust: "Quality assured, deadline guaranteed"
// - Skip button (top-right)
// - Next button / Get Started (final slide)
// - SmoothPageIndicator for dots
// - Swipe gesture support
// Uses: smooth_page_indicator, flutter_animate
```

#### Task 1.3: Role Selection Screen
**File:** `lib/features/onboarding/screens/role_selection_screen.dart`
```dart
// Features:
// - 3 premium styled cards:
//   1. Student: "Currently pursuing education" (icon: graduation cap)
//   2. Job Seeker: "Looking for opportunities" (icon: briefcase)
//   3. Business/Creator: "Building something amazing" (icon: rocket)
// - Card selection animation
// - Continue button (enabled on selection)
// Uses: flutter_animate for card interactions
```

#### Task 1.4: Student Sign-up Flow
**Files:**
- `lib/features/onboarding/screens/student_signup_screen.dart`
- `lib/features/onboarding/widgets/step_progress_bar.dart`
- `lib/features/onboarding/widgets/university_dropdown.dart`

```dart
// Features:
// - Multi-step form:
//   Step 1: Full Name, Date of Birth
//   Step 2: University dropdown, Course, Semester, Student ID
//   Step 3: College Email (.edu/.ac) + Mobile OTP verification
// - Progress bar (33%, 66%, 100%)
// - Back navigation between steps
// - Input validation per step
// - Student ID format validation
// - College email domain validation
```

#### Task 1.5: Professional Sign-up Flow
**File:** `lib/features/onboarding/screens/professional_signup_screen.dart`
```dart
// Features:
// - Social login options: Google, LinkedIn
// - Quick form: Industry dropdown, Mobile number
// - OTP verification
// - Progress bar (50%, 100%)
```

#### Task 1.6: OTP Verification Screen
**File:** `lib/features/auth/screens/otp_verification_screen.dart`
```dart
// Features:
// - 6-digit OTP input (separate boxes)
// - Auto-focus next box
// - Timer for resend (60 seconds)
// - Resend OTP button
// - Verify button
// - Error state for invalid OTP
```

#### Task 1.7: Success Animation Screen
**File:** `lib/features/onboarding/screens/signup_success_screen.dart`
```dart
// Features:
// - Confetti animation
// - Checkmark animation
// - "Welcome, [Name]!" message
// - "Your account is ready" subtext
// - "Go to Dashboard" CTA
// Uses: confetti, lottie
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `OnboardingPage` | `onboarding_page.dart` | Single slide with image, title, subtitle |
| `RoleCard` | `role_card.dart` | Premium styled role selection card |
| `OtpInputField` | `otp_input_field.dart` | 6-digit OTP input |
| `StepProgressBar` | `step_progress_bar.dart` | Progress indicator (33/66/100%) |
| `UniversityDropdown` | `university_dropdown.dart` | Searchable university list |
| `SupportFAB` | `support_fab.dart` | Floating "Get Support" button |
| `ErrorTextField` | `error_text_field.dart` | Text field with error state |

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

#### Task 2.1: Home Screen Shell
**File:** `lib/features/home/screens/home_screen.dart`
```dart
// Features:
// - Custom AppBar with greeting + wallet + notification
// - ScrollView body with sections
// - Bottom navigation bar (5 items)
// - Central FAB with bottom sheet
// - Pull-to-refresh
```

#### Task 2.2: Home App Bar
**File:** `lib/features/home/widgets/home_app_bar.dart`
```dart
// Features:
// - "Hi, [Name]" greeting (left)
// - University & Semester subtext
// - Wallet balance pill (right)
// - Notification bell with badge
```

#### Task 2.3: Promotional Banner Carousel
**File:** `lib/features/home/widgets/promo_banner_carousel.dart`
```dart
// Features:
// - PageView with auto-scroll (4 seconds)
// - High-quality graphics
// - CTA buttons on banners
// - Page indicator dots
// - Tap to navigate
// Uses: smooth_page_indicator
```

#### Task 2.4: Services Grid
**File:** `lib/features/home/widgets/services_grid.dart`
```dart
// Features:
// - 2x2 GridView
// - Service cards:
//   1. Project Support (main service)
//   2. AI/Plagiarism Report
//   3. Consult Doctor (placeholder/coming soon)
//   4. Reference Generator (FREE badge)
// - Thin-line icons
// - Tap to navigate to service
```

#### Task 2.5: Campus Pulse Section
**File:** `lib/features/home/widgets/campus_pulse_section.dart`
```dart
// Features:
// - "Trending at [University]" header
// - Horizontal ListView
// - Marketplace item cards (image, price, distance)
// - "View All" button
// - Dynamic content based on user's university
```

#### Task 2.6: Bottom Navigation Bar
**File:** `lib/shared/widgets/bottom_nav_bar.dart`
```dart
// Features:
// - 5 items: Home, My Projects, [FAB], The Quad/Connect, Profile
// - Central FAB notch
// - Active/inactive states
// - Badge for notifications
```

#### Task 2.7: FAB Bottom Sheet
**File:** `lib/features/home/widgets/fab_bottom_sheet.dart`
```dart
// Features:
// - Slide-up modal (50% screen height)
// - Options:
//   1. Upload New Project
//   2. Quick Proofread
//   3. Get AI/Plag Report
//   4. Ask Expert (FREE)
// - Close button
// - Tap to navigate to respective form
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `GreetingHeader` | `greeting_header.dart` | Name + university display |
| `WalletPill` | `wallet_pill.dart` | Balance with tap action |
| `NotificationBell` | `notification_bell.dart` | Bell icon with badge |
| `PromoBanner` | `promo_banner.dart` | Single banner card |
| `ServiceCard` | `service_card.dart` | Grid item for services |
| `CampusPulseCard` | `campus_pulse_card.dart` | Marketplace teaser item |
| `QuickActionSheet` | `quick_action_sheet.dart` | FAB action options |

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
| U30 | Payment Prompt Modal | Bottom sheet on app open for pending payments | Core |
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

#### Task 3.1: My Projects Screen
**File:** `lib/features/projects/screens/my_projects_screen.dart`
```dart
// Features:
// - TabBar: In Review | In Progress | For Review | History
// - TabBarView with ListView for each tab
// - Pull-to-refresh
// - Empty states per tab
// - Search/filter option
```

#### Task 3.2: Project Card Widget
**File:** `lib/features/projects/widgets/project_card.dart`
```dart
// Features:
// - Header: Title + Subject icon
// - Body:
//   - Project ID (#AE-2940)
//   - Deadline with color coding (red if <24h)
//   - Progress bar (for In Progress)
// - Footer:
//   - Status badge (pill shape, color-coded)
//   - Action button (context-aware)
// - Tap to open detail
```

#### Task 3.3: Status Badge Widget
**File:** `lib/features/projects/widgets/status_badge.dart`
```dart
// Features:
// - Color-coded pill shapes:
//   - Analyzing: Yellow
//   - Payment Pending: Orange
//   - In Progress: Blue
//   - For Review: Green
//   - Completed: Grey/Green
//   - Revision: Red
// - Icon + text
```

#### Task 3.4: Payment Prompt Modal
**File:** `lib/features/projects/widgets/payment_prompt_modal.dart`
```dart
// Features:
// - Shows on app open if payment pending
// - Project name display
// - Amount due
// - "Pay Now" CTA
// - "Remind Later" dismiss
// - Razorpay integration trigger
```

#### Task 3.5: Review Actions Widget
**File:** `lib/features/projects/widgets/review_actions.dart`
```dart
// Features:
// - For "For Review" status
// - "Approve" primary button
// - "Request Changes" secondary button
// - Auto-approval countdown timer
// - Feedback text box (on request changes)
```

#### Task 3.6: Project Timeline Screen
**File:** `lib/features/projects/screens/project_timeline_screen.dart`
```dart
// Features:
// - Vertical timeline
// - Milestone nodes with dates
// - Current status highlight
// - Expected completion date
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ProjectCard` | `project_card.dart` | Full project card |
| `StatusBadge` | `status_badge.dart` | Color-coded status pill |
| `DeadlineBadge` | `deadline_badge.dart` | Deadline with color |
| `ProgressIndicator` | `progress_indicator.dart` | Percentage bar |
| `PaymentPrompt` | `payment_prompt.dart` | Payment modal |
| `ReviewActions` | `review_actions.dart` | Approve/Request buttons |
| `AutoApprovalTimer` | `auto_approval_timer.dart` | 48h countdown |
| `TimelineNode` | `timeline_node.dart` | Timeline milestone |
| `FeedbackInput` | `feedback_input.dart` | Request changes text |

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
| U54 | Chat with Supervisor | Overlay chat window | Core |
| U55 | Attached Reference Files | View uploaded files in accordion | Important |

### Implementation Tasks

#### Task 4.1: Project Detail Screen
**File:** `lib/features/projects/screens/project_detail_screen.dart`
```dart
// Features:
// - SliverAppBar with project name
// - Status banner strip
// - Scrollable content:
//   - Deadline timer
//   - Live draft section
//   - Project brief accordion
//   - Deliverables section
//   - Quality badges
//   - Reference files
// - Floating chat button
// - Kebab menu (Cancel Project, Support)
```

#### Task 4.2: Status Banner
**File:** `lib/features/projects/widgets/status_banner.dart`
```dart
// Features:
// - Thin strip at top
// - Color matches status
// - Status text (e.g., "In Progress - On Track")
// - Optional icon
```

#### Task 4.3: Deadline Timer Widget
**File:** `lib/features/projects/widgets/deadline_timer.dart`
```dart
// Features:
// - Real-time countdown
// - Format: "Due in: 3 Days, 4 Hours, 12 Minutes"
// - Color changes as deadline approaches
// - Red when <24 hours
```

#### Task 4.4: Live Draft Section
**File:** `lib/features/projects/widgets/live_draft_section.dart`
```dart
// Features:
// - "Track Progress Live" card
// - Progress percentage (if available)
// - "Open Live Draft" button
// - Opens WebView in read-only mode
```

#### Task 4.5: Read-Only WebView
**File:** `lib/features/projects/screens/live_draft_webview.dart`
```dart
// Features:
// - WebView for Google Docs/Sheets/Figma
// - Read-only mode (no editing)
// - Loading indicator
// - Error handling
// Uses: webview_flutter
```

#### Task 4.6: Project Brief Accordion
**File:** `lib/features/projects/widgets/project_brief_accordion.dart`
```dart
// Features:
// - Collapsed: "Original Requirements" + Budget
// - Expanded:
//   - Subject
//   - Word Count
//   - Reference Style
//   - Instructions
//   - Attached files
// - Smooth expand/collapse animation
```

#### Task 4.7: Deliverables Section
**File:** `lib/features/projects/widgets/deliverables_section.dart`
```dart
// Features:
// - List of uploaded files
// - File type icons
// - File size
// - "Download" button per file
// - "Download All" option
```

#### Task 4.8: Quality Badges Section
**File:** `lib/features/projects/widgets/quality_badges.dart`
```dart
// Features:
// - AI Probability Badge:
//   - Green check: "Human Written"
//   - Link: "Download Report"
// - Plagiarism Badge:
//   - Green check: "Unique Content"
//   - Link: "Download Turnitin Report"
// - Locked/grayed state until For Review
```

#### Task 4.9: Chat Integration
**File:** `lib/features/chat/widgets/floating_chat_button.dart`
```dart
// Features:
// - Fixed position (bottom-right)
// - Chat bubble icon
// - Unread message badge
// - Opens chat overlay/screen
// - Project context passed
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `StatusBanner` | `status_banner.dart` | Colored status strip |
| `DeadlineTimer` | `deadline_timer.dart` | Countdown display |
| `LiveDraftCard` | `live_draft_card.dart` | Progress tracking |
| `BriefAccordion` | `brief_accordion.dart` | Expandable brief |
| `DeliverableItem` | `deliverable_item.dart` | Single file item |
| `QualityBadge` | `quality_badge.dart` | AI/Plag badge |
| `FloatingChatButton` | `floating_chat_button.dart` | Chat trigger |
| `ReferenceFileItem` | `reference_file_item.dart` | Attached file |

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

#### Task 5.1: Service Selection Bottom Sheet
**File:** `lib/features/projects/widgets/service_selection_sheet.dart`
```dart
// Features:
// - 2-column GridView
// - Service options:
//   1. New Project
//   2. Proofreading
//   3. Plagiarism Check
//   4. AI Detection
//   5. Expert Opinion (FREE badge)
// - Icons for each service
// - Tap to open respective form
```

#### Task 5.2: New Project Form
**File:** `lib/features/projects/screens/new_project_form.dart`
```dart
// Features:
// - Multi-step form:
//   Step 1:
//     - Subject dropdown
//     - Topic Name input
//     - Word Count (optional)
//     - Deadline date/time picker
//     - Pricing note
//   Step 2:
//     - Project Guidelines textarea
//     - File attachments (PDF/Doc/Img)
//     - Reference Style dropdown (APA, Harvard, MLA, etc.)
// - Progress indicator
// - "Submit for Quote" button
// Uses: file_picker
```

#### Task 5.3: Proofreading Form
**File:** `lib/features/projects/screens/proofreading_form.dart`
```dart
// Features:
// - Document upload
// - Focus Area chips (multi-select):
//   - Grammar
//   - Flow
//   - Formatting
//   - Citations
//   - Expert Opinion
// - Deadline picker
// - "Request Review" button
```

#### Task 5.4: Plag/AI Report Form
**File:** `lib/features/projects/screens/report_request_form.dart`
```dart
// Features:
// - Document upload
// - Checkboxes:
//   - Similarity Check (Turnitin)
//   - AI Content Detection
// - "Get Report" button
```

#### Task 5.5: Expert Opinion Form
**File:** `lib/features/projects/screens/expert_opinion_form.dart`
```dart
// Features:
// - Subject dropdown
// - Question textbox (large)
// - Optional file attachment
// - FREE badge displayed
// - "Ask Expert" button
```

#### Task 5.6: Project Submitted Success
**File:** `lib/features/projects/widgets/project_success_popup.dart`
```dart
// Features:
// - Success animation (checkmark)
// - "Project Received!" title
// - "Supervisor is reviewing it" subtext
// - "You'll receive a WhatsApp notification" info
// - "View My Projects" button
// - "Submit Another" button
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ServiceOption` | `service_option.dart` | Grid item for service |
| `SubjectDropdown` | `subject_dropdown.dart` | Subject selector |
| `DeadlinePicker` | `deadline_picker.dart` | Date/time picker |
| `PricingNote` | `pricing_note.dart` | Info text component |
| `FileAttachment` | `file_attachment.dart` | File picker + preview |
| `ReferenceStyleDropdown` | `reference_style.dart` | Citation style selector |
| `FocusAreaChips` | `focus_area_chips.dart` | Multi-select chips |
| `SuccessPopup` | `success_popup.dart` | Submission success |

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

#### Task 6.1: Marketplace Screen
**File:** `lib/features/marketplace/screens/marketplace_screen.dart`
```dart
// Features:
// - Staggered grid layout (Pinterest-style)
// - Filter chips (City, Category)
// - Pull-to-refresh
// - Infinite scroll
// - Secondary FAB for posting
// Uses: flutter_staggered_grid_view
```

#### Task 6.2: Marketplace Filters
**File:** `lib/features/marketplace/widgets/marketplace_filters.dart`
```dart
// Features:
// - Horizontal scroll chip bar
// - City filter (based on location)
// - Category filter:
//   - All
//   - Hard Goods
//   - Housing
//   - Opportunities
//   - Community
// - Clear filters option
```

#### Task 6.3: Item Card Widget
**File:** `lib/features/marketplace/widgets/item_card.dart`
```dart
// Features:
// - Variable aspect ratio image
// - Price tag overlay
// - Distance badge ("800m away")
// - Seller info (optional)
// - Tap to view detail
```

#### Task 6.4: Text Card Widget
**File:** `lib/features/marketplace/widgets/text_card.dart`
```dart
// Features:
// - Solid background color
// - Question or Review text
// - Author avatar + name
// - Like/comment count
// - Category tag
```

#### Task 6.5: Banner Card Widget
**File:** `lib/features/marketplace/widgets/banner_card.dart`
```dart
// Features:
// - Full-width card
// - Event/Job image
// - Title + date
// - "Apply" or "Register" CTA
// - Organization logo
```

#### Task 6.6: Create Listing Screen
**File:** `lib/features/marketplace/screens/create_listing_screen.dart`
```dart
// Features:
// - Listing type selection:
//   1. Sell/Rent Item → Camera + Form
//   2. Post Opportunity → Form
//   3. Community Post → Text/Poll
// - Image picker
// - Price input
// - Description
// - Category selection
// - Location (auto-detect or manual)
// - "Post" button
```

#### Task 6.7: Item Detail Screen
**File:** `lib/features/marketplace/screens/item_detail_screen.dart`
```dart
// Features:
// - Image gallery
// - Title + Price
// - Description
// - Seller info + rating
// - Distance/Location
// - "Contact Seller" button
// - Share button
// - Report option
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ItemCard` | `item_card.dart` | Product listing card |
| `TextCard` | `text_card.dart` | Community post card |
| `BannerCard` | `banner_card.dart` | Event/Job banner |
| `FilterChip` | `filter_chip.dart` | Category filter |
| `DistanceBadge` | `distance_badge.dart` | Distance display |
| `PriceTag` | `price_tag.dart` | Price overlay |
| `ListingTypeSelector` | `listing_type.dart` | Type selection |
| `ImageGallery` | `image_gallery.dart` | Multi-image display |

---

## Batch 7: Profile & Settings (15 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| U86 | Hero Section | Top 30% with avatar, name, tagline | Core |
| U87 | Stats Card | Wallet Balance + Total Projects Completed | Core |
| U88 | Wallet Balance Display | Large text + "Available Credits" + Transaction History | Core |
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

#### Task 7.1: Profile Screen
**File:** `lib/features/profile/screens/profile_screen.dart`
```dart
// Features:
// - Hero section (top 30%):
//   - Background color/gradient
//   - Profile picture (editable)
//   - Name + University
// - Stats card (floating)
// - Settings list:
//   - Personal Details
//   - College Info
//   - Payment Methods
//   - Help & Support
//   - How It Works
//   - Referral Code
// - Log Out button
// - Version info footer
```

#### Task 7.2: Profile Hero Section
**File:** `lib/features/profile/widgets/profile_hero.dart`
```dart
// Features:
// - Curved background
// - Avatar with edit button
// - Name (tappable to edit)
// - University subtext
// - Semester/Year
```

#### Task 7.3: Stats Card Widget
**File:** `lib/features/profile/widgets/stats_card.dart`
```dart
// Features:
// - Floating card design
// - Two stat items:
//   1. Wallet Balance (tap for history)
//   2. Projects Completed
// - "Top Up" button for wallet
```

#### Task 7.4: Wallet Screen
**File:** `lib/features/profile/screens/wallet_screen.dart`
```dart
// Features:
// - Current balance (large display)
// - "Top Up" button → Razorpay
// - Transaction history list:
//   - Credits (green +)
//   - Debits (red -)
//   - Date, Amount, Description
// - Filter by date range
```

#### Task 7.5: Edit Profile Screen
**File:** `lib/features/profile/screens/edit_profile_screen.dart`
```dart
// Features:
// - Profile picture upload
// - Personal Details section:
//   - Name
//   - Phone (with verification)
//   - Email
// - College Info section:
//   - University
//   - Course
//   - Year
//   - City
// - Save button
```

#### Task 7.6: Payment Methods Screen
**File:** `lib/features/profile/screens/payment_methods_screen.dart`
```dart
// Features:
// - Saved Cards list
// - Add new card button
// - Saved UPI IDs
// - Add UPI button
// - Delete payment method
// - Set default option
```

#### Task 7.7: Help & Support Screen
**File:** `lib/features/profile/screens/help_support_screen.dart`
```dart
// Features:
// - WhatsApp Support button (opens WhatsApp)
// - "Raise a Ticket" form:
//   - Issue category dropdown
//   - Description textarea
//   - Attachment option
//   - Submit button
// - FAQ section
// - Contact info
```

#### Task 7.8: Referral Section
**File:** `lib/features/profile/widgets/referral_section.dart`
```dart
// Features:
// - Referral code display
// - "Tap to Copy" functionality
// - Share button (opens share sheet)
// - Referral benefits info
// - Referral count/earnings
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ProfileHero` | `profile_hero.dart` | Top section with avatar |
| `StatsCard` | `stats_card.dart` | Wallet + projects card |
| `SettingsItem` | `settings_item.dart` | List item with icon |
| `TransactionTile` | `transaction_tile.dart` | Wallet transaction |
| `PaymentMethodCard` | `payment_method.dart` | Saved payment |
| `ReferralCode` | `referral_code.dart` | Code with copy |
| `TrustBadge` | `trust_badge.dart` | Security indicator |
| `AvatarPicker` | `avatar_picker.dart` | Profile image editor |

---

## Cross-Platform Features

### Chat System (Supabase Realtime)

```dart
// lib/data/repositories/chat_repository.dart
// - Connect to Supabase Realtime channel
// - Subscribe to new messages
// - Send messages
// - Handle file attachments
// - Project context awareness
// - Unread count tracking
```

### Push Notifications (Firebase)

```dart
// lib/core/services/notification_service.dart
// - Firebase Cloud Messaging setup
// - Local notifications (flutter_local_notifications)
// - Handle notification taps → navigate to relevant screen
// - Badge count management
// - Topic subscriptions (project updates, quotes, etc.)
```

### WhatsApp Notifications

```dart
// lib/core/services/whatsapp_service.dart
// - WhatsApp Business API integration
// - Triggered from backend on:
//   - Quote ready
//   - Payment confirmation
//   - File delivery
//   - Status updates
```

### Payment Integration (Razorpay)

```dart
// lib/core/services/payment_service.dart
// - Razorpay Flutter SDK
// - Payment flow:
//   1. Create order (backend)
//   2. Open Razorpay checkout
//   3. Handle success/failure callbacks
//   4. Update payment status
// - Wallet top-up
// - Project payment
```

### Offline Support

```dart
// lib/core/services/offline_service.dart
// - Cache critical data (shared_preferences, sqflite)
// - Sync when online
// - Offline indicator UI
// - Queue uploads for when online
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

| Batch | Features | Est. Screens | Est. Widgets | Priority |
|-------|----------|--------------|--------------|----------|
| 0 | Setup | - | - | Prerequisite |
| 1 | Onboarding (11) | 6 | 8 | Core |
| 2 | Dashboard (12) | 1 | 10 | Core |
| 3 | My Projects (18) | 3 | 12 | Core |
| 4 | Project Detail (14) | 3 | 10 | Core |
| 5 | Add Project (17) | 5 | 10 | Core |
| 6 | Marketplace (13) | 4 | 10 | Core |
| 7 | Profile (15) | 6 | 10 | Core |

**Total: 100 Features | 28 Screens | 70+ Widgets | 35 Database Tables**

---

## Additional Notes

### Design Guidelines
- **Primary Color:** Professional Blue (#2563EB)
- **Accent:** Bright Blue (#3B82F6)
- **Visual Theme:** Professionalism, Security, Efficiency
- **Font Family:** Inter (or system default)
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

### Platform-Specific
- **iOS:** Follow Human Interface Guidelines where applicable
- **Android:** Material 3 with custom theme
- **Minimum SDK:** iOS 12.0, Android API 21

### Performance Considerations
- Use `const` constructors where possible
- Implement lazy loading for lists
- Cache images with `cached_network_image`
- Use Riverpod `keepAlive` for critical providers
- Optimize Supabase queries with proper indexing
- Implement pagination for marketplace feed

### Security Considerations
- Store tokens in `flutter_secure_storage`
- Validate all inputs
- Never log sensitive data
- Mask payment details in UI
- Handle session expiry gracefully
- Implement certificate pinning (production)

### Safe Language Compliance
- Always use "Project" instead of "Assignment"
- Use "Project Brief" instead of "Assignment Brief"
- "Upload Project" not "Upload Assignment"
- This is critical for platform positioning

---

*Document Version: 1.0*
*Created: December 2025*
*Project: AssignX - User Mobile App*
