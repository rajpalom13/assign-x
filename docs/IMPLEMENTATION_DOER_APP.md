# Doer App - Flutter Mobile Implementation Plan

> **Technology Stack:** Flutter 3.x + Dart 3.x + Riverpod + Supabase
> **Database:** Supabase (PostgreSQL 15+) - See `DATABASE.md` for complete schema
> **Total Features:** 57 Features (D01-D57)
> **Platforms:** iOS, Android
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

  # Charts
  fl_chart: ^0.66.0

  # Icons
  cupertino_icons: ^1.0.8
  phosphor_flutter: ^2.0.1

  # PDF & Documents
  flutter_pdfview: ^1.3.2
  open_file: ^3.3.2

  # Video Player
  video_player: ^2.8.2
  chewie: ^1.7.4

  # Real-time & Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # Connectivity
  connectivity_plus: ^5.0.2

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
doer_app/
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
│   │   │   ├── doer_model.dart
│   │   │   ├── project_model.dart
│   │   │   ├── chat_model.dart
│   │   │   └── ...
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── doer_repository.dart
│   │   │   ├── project_repository.dart
│   │   │   ├── chat_repository.dart
│   │   │   └── ...
│   │   └── datasources/
│   │       ├── supabase_datasource.dart
│   │       └── local_datasource.dart
│   │
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── doer_provider.dart
│   │   ├── project_provider.dart
│   │   ├── chat_provider.dart
│   │   ├── activation_provider.dart
│   │   └── ...
│   │
│   ├── features/
│   │   ├── splash/
│   │   │   └── splash_screen.dart
│   │   ├── onboarding/
│   │   │   ├── screens/
│   │   │   │   ├── onboarding_screen.dart
│   │   │   │   └── profile_setup_screen.dart
│   │   │   └── widgets/
│   │   │       ├── onboarding_page.dart
│   │   │       └── ...
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── register_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   ├── activation/
│   │   │   ├── screens/
│   │   │   │   ├── activation_gate_screen.dart
│   │   │   │   ├── training_screen.dart
│   │   │   │   ├── quiz_screen.dart
│   │   │   │   └── bank_details_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   ├── dashboard/
│   │   │   ├── screens/
│   │   │   │   ├── dashboard_screen.dart
│   │   │   │   └── statistics_screen.dart
│   │   │   └── widgets/
│   │   │       ├── project_card.dart
│   │   │       ├── task_pool_list.dart
│   │   │       └── ...
│   │   ├── projects/
│   │   │   ├── screens/
│   │   │   │   ├── projects_screen.dart
│   │   │   │   ├── project_detail_screen.dart
│   │   │   │   └── workspace_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   ├── resources/
│   │   │   ├── screens/
│   │   │   │   └── resources_screen.dart
│   │   │   └── widgets/
│   │   │       └── ...
│   │   ├── profile/
│   │   │   ├── screens/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   ├── edit_profile_screen.dart
│   │   │   │   ├── payment_history_screen.dart
│   │   │   │   └── reviews_screen.dart
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
│       │   ├── loading_indicator.dart
│       │   ├── error_widget.dart
│       │   ├── empty_state.dart
│       │   └── ...
│       └── dialogs/
│           ├── confirm_dialog.dart
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
  // Colors - Professional, Sharp, Authority-driven
  static const Color primaryColor = Color(0xFF1E3A5F);      // Dark Blue
  static const Color accentColor = Color(0xFF3B82F6);       // Professional Blue
  static const Color backgroundColor = Color(0xFFF8FAFC);   // Slate Grey
  static const Color surfaceColor = Colors.white;
  static const Color errorColor = Color(0xFFEF4444);
  static const Color successColor = Color(0xFF22C55E);
  static const Color warningColor = Color(0xFFF59E0B);

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
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
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

## Batch 1: Onboarding & Registration (12 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D01 | Splash Screen | App logo with animation, "Powered by" footer | Core |
| D02 | Onboarding Carousel | 4 slides with Skip + Next + Dots | Core |
| D03 | Slide 1 - Opportunity | "Countless opportunities in your field" | Core |
| D04 | Slide 2 - Rewards | "Small Tasks, Big Rewards" | Core |
| D05 | Slide 3 - Support | "Supervisor Support (24x7)" | Core |
| D06 | Slide 4 - Action | "Practical Learning with Part-Time Earning" | Core |
| D07 | Registration Form | Full Name, Email, Phone (OTP), Password | Core |
| D08 | Terms Agreement | Terms of Service & Privacy Policy checkbox | Core |
| D09 | Create Account CTA | Primary registration button | Core |
| D10 | Profile Setup - Qualification | Dropdown selection | Core |
| D11 | Profile Setup - Skills | University, Areas of Interest, Skills | Core |
| D12 | Profile Setup - Experience | Beginner, Intermediate, Pro slider | Core |

### Implementation Tasks

#### Task 1.1: Splash Screen
**File:** `lib/features/splash/splash_screen.dart`
```dart
// Features:
// - Logo fade-in + scale animation
// - App name "DOER" / "Talent Connect"
// - Tagline: "Your Skills, Your Earnings"
// - "Powered by AssignX" footer
// - 2-second auto-transition
// Uses: flutter_animate, Lottie (optional)
```

#### Task 1.2: Onboarding Carousel
**File:** `lib/features/onboarding/screens/onboarding_screen.dart`
```dart
// Features:
// - PageView with 4 slides
// - Skip button (top-right)
// - Next button / Get Started (final slide)
// - SmoothPageIndicator for dots
// - Swipe gesture support
// Uses: smooth_page_indicator, flutter_animate
```

#### Task 1.3: Registration Form
**File:** `lib/features/auth/screens/register_screen.dart`
```dart
// Features:
// - Multi-step form with progress indicator
// - Step 1: Basic Info (Name, Email, Phone, Password)
// - Phone OTP verification flow
// - Password strength indicator
// - Terms checkbox
// Uses: flutter_form_builder, form_builder_validators
```

#### Task 1.4: Profile Setup Flow
**Files:**
- `lib/features/onboarding/screens/profile_setup_screen.dart`
- `lib/features/onboarding/widgets/qualification_selector.dart`
- `lib/features/onboarding/widgets/skills_selector.dart`
- `lib/features/onboarding/widgets/experience_slider.dart`

```dart
// Features:
// - Step 2: Qualification dropdown
// - Step 3: University + Skills selection (chips)
// - Step 4: Experience level slider
// - Progress bar (25%, 50%, 75%, 100%)
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `OnboardingPage` | `onboarding_page.dart` | Single slide with image, title, subtitle |
| `OtpInputField` | `otp_input_field.dart` | 6-digit OTP input |
| `PasswordStrengthIndicator` | `password_strength.dart` | Visual password strength |
| `ChipSelector` | `chip_selector.dart` | Multi-select chips for skills |
| `StepProgressBar` | `step_progress_bar.dart` | Progress indicator |

---

## Batch 2: Activation Flow / Gatekeeper (8 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D13 | Activation Gate UI | Dashboard LOCKED until 3 steps complete | Core |
| D14 | Step 1: Training Module | Video/PDF carousel | Core |
| D15 | Mark as Complete | Button to confirm training completion | Core |
| D16 | Step 2: Interview Quiz | 5-10 MCQs based on Training | Core |
| D17 | Quiz Pass/Fail Logic | Success/Fail messaging with retry | Core |
| D18 | Step 3: Bank Details | Account details form | Core |
| D19 | Finish Setup CTA | Completes activation | Core |
| D20 | Re-attempt Quiz | Retry after reviewing training | Important |

### Implementation Tasks

#### Task 2.1: Activation Gate Screen
**File:** `lib/features/activation/screens/activation_gate_screen.dart`
```dart
// Features:
// - Full-screen overlay when dashboard access attempted
// - "Unlock Your Doer Dashboard" header
// - Stepper widget (1-2-3) with lock/check icons
// - Progress percentage
// - Navigation to each step
```

#### Task 2.2: Training Module Screen
**File:** `lib/features/activation/screens/training_screen.dart`
```dart
// Features:
// - Video player (chewie)
// - PDF viewer (flutter_pdfview)
// - Module progress tracker
// - "Mark as Complete" button per module
// - Overall completion status
// Uses: chewie, video_player, flutter_pdfview
```

#### Task 2.3: Quiz Screen
**File:** `lib/features/activation/screens/quiz_screen.dart`
```dart
// Features:
// - 5-10 MCQ questions
// - Timer display (optional)
// - Question navigation (dots/numbers)
// - Radio button answer selection
// - Submit quiz button
// - Results screen (Pass/Fail)
// - Retry button on failure
```

#### Task 2.4: Bank Details Screen
**File:** `lib/features/activation/screens/bank_details_screen.dart`
```dart
// Features:
// - Account Holder Name input
// - Account Number input (with confirmation)
// - IFSC Code input (with validation + auto bank name)
// - UPI ID input (optional)
// - Form validation
// - Submit button
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ActivationStepper` | `activation_stepper.dart` | 3-step visual stepper |
| `TrainingModuleCard` | `training_module_card.dart` | Module item with progress |
| `QuizQuestion` | `quiz_question.dart` | MCQ question with options |
| `QuizResult` | `quiz_result.dart` | Pass/Fail result display |
| `BankVerificationBadge` | `bank_verification_badge.dart` | Verified status badge |

---

## Batch 3: Main Dashboard (12 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D21 | Top Header | App Logo, Notification Bell, Menu | Core |
| D22 | Menu Drawer / Sidebar | User Info, Availability, Menu Items | Core |
| D23 | Availability Toggle | Available / Busy switch | Core |
| D24 | Sidebar Menu Items | Profile, Reviews, Statistics, Help, Settings | Core |
| D25 | Dashboard Tabs | "Assigned to Me" + "Open Pool" | Core |
| D26 | Assigned to Me Tab | Tasks from Supervisor | Core |
| D27 | Open Pool Tab | General tasks to grab | Core |
| D28 | Project Card in List | Title, Urgency, Price, Deadline | Core |
| D29 | Accept Task Button | Primary action on cards | Core |
| D30 | Urgency Badge | Fire icon for <6 hours | Important |
| D31 | Statistics Page | Performance graphs | Important |
| D32 | Reviews Page | Rating history | Important |

### Implementation Tasks

#### Task 3.1: Main Shell with Navigation
**File:** `lib/features/dashboard/screens/dashboard_screen.dart`
```dart
// Features:
// - Scaffold with AppBar
// - Drawer for navigation
// - TabBar: "Assigned to Me" | "Open Pool"
// - TabBarView for content
// - FloatingActionButton (optional)
// - Bottom navigation (alternative)
```

#### Task 3.2: App Drawer
**File:** `lib/shared/widgets/app_drawer.dart`
```dart
// Features:
// - User header (avatar, name, rating)
// - Availability toggle switch
// - Navigation items with icons
// - Logout button at bottom
// - Version info
```

#### Task 3.3: Project Card
**File:** `lib/features/dashboard/widgets/project_card.dart`
```dart
// Features:
// - Project title
// - Subject badge
// - Urgency badge (fire icon for <6h)
// - Price display (₹)
// - Deadline countdown
// - Accept Task button
// Uses: phosphor_flutter for icons
```

#### Task 3.4: Statistics Screen
**File:** `lib/features/dashboard/screens/statistics_screen.dart`
```dart
// Features:
// - Performance line chart
// - Earnings bar chart
// - Stats cards (Total, Completed, Rating, On-time %)
// - Time period selector (Week, Month, Year)
// Uses: fl_chart
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `AppHeader` | `app_header.dart` | Logo + Bell + Menu |
| `AvailabilitySwitch` | `availability_switch.dart` | Toggle with status text |
| `UrgencyBadge` | `urgency_badge.dart` | Fire icon badge |
| `DeadlineCountdown` | `deadline_countdown.dart` | Time remaining display |
| `StatCard` | `stat_card.dart` | Individual stat card |
| `PerformanceChart` | `performance_chart.dart` | Line/bar chart wrapper |

---

## Batch 4: Active Projects (9 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D33 | Active Projects Tabs | Active, Under Review, Completed | Core |
| D34 | Active Tab | Work in Progress + "Open Workspace" | Core |
| D35 | Workspace View | Details, Chat, File upload | Core |
| D36 | Under Review Tab | Submitted, "QC in Progress" | Core |
| D37 | Completed Tab | History with "Paid"/"Approved" | Core |
| D38 | Revision Requested Flag | Red highlight | Core |
| D39 | File Upload | Submit work for QC | Core |
| D40 | Chat with Supervisor | In-context communication | Core |
| D41 | Deadline Display | Clear countdown | Core |

### Implementation Tasks

#### Task 4.1: Projects Screen
**File:** `lib/features/projects/screens/projects_screen.dart`
```dart
// Features:
// - TabBar: Active | Under Review | Completed
// - ListView for each tab
// - Pull-to-refresh
// - Empty states
// - Filter/sort options
```

#### Task 4.2: Workspace Screen
**File:** `lib/features/projects/screens/workspace_screen.dart`
```dart
// Features:
// - Project details accordion
// - Deadline timer (prominent)
// - Reference files viewer
// - Live document link button
// - File upload section
// - Chat panel (embedded or separate)
// - Revision banner (if applicable)
```

#### Task 4.3: Chat Screen
**File:** `lib/features/chat/screens/chat_screen.dart`
```dart
// Features:
// - Real-time messaging (Supabase Realtime)
// - Message bubbles (sent/received)
// - File attachment support
// - Read receipts
// - Auto-scroll to new messages
// - Typing indicator
```

#### Task 4.4: File Upload Widget
**File:** `lib/features/projects/widgets/file_upload_widget.dart`
```dart
// Features:
// - File picker button
// - Drag area (web)
// - File type validation
// - Upload progress indicator
// - Multiple file support
// - File preview
// Uses: file_picker
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ProjectStatusCard` | `project_status_card.dart` | Card with status badge |
| `RevisionBanner` | `revision_banner.dart` | Red alert banner |
| `FileUploadButton` | `file_upload_button.dart` | Upload trigger |
| `UploadProgressTile` | `upload_progress_tile.dart` | File with progress |
| `MessageBubble` | `message_bubble.dart` | Chat message |
| `ChatInput` | `chat_input.dart` | Message input + attach |
| `DeadlineTimer` | `deadline_timer.dart` | Large countdown |

---

## Batch 5: Resources & Tools (5 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D42 | Training Center | Re-watch training videos | Core |
| D43 | AI Report Generator | Check AI percentage | Core |
| D44 | Citation Builder | URL → APA/Harvard reference | Core |
| D45 | Format Templates | Download Word/PPT templates | Core |
| D46 | Resources Grid Layout | Clean grid display | Important |

### Implementation Tasks

#### Task 5.1: Resources Screen
**File:** `lib/features/resources/screens/resources_screen.dart`
```dart
// Features:
// - GridView of resource cards
// - Categories: Training, Tools, Templates
// - Search functionality
// - Quick access to frequently used
```

#### Task 5.2: Training Center
**File:** `lib/features/resources/screens/training_center_screen.dart`
```dart
// Features:
// - List of training modules
// - Video player
// - PDF viewer
// - Completion tracking
```

#### Task 5.3: AI Report Generator
**File:** `lib/features/resources/screens/ai_checker_screen.dart`
```dart
// Features:
// - Text input OR file upload
// - "Check AI Content" button
// - Results display (percentage)
// - Detailed breakdown
// - Export report option
```

#### Task 5.4: Citation Builder
**File:** `lib/features/resources/screens/citation_builder_screen.dart`
```dart
// Features:
// - URL input field
// - Reference style dropdown (APA, Harvard, MLA, Chicago)
// - "Generate Citation" button
// - Copy to clipboard
// - History of generated citations
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ResourceCard` | `resource_card.dart` | Icon + Title + Description |
| `ToolCard` | `tool_card.dart` | Tool action card |
| `TemplateDownloadTile` | `template_download_tile.dart` | Download item |
| `CitationResult` | `citation_result.dart` | Generated citation display |

---

## Batch 6: Profile & Earnings (11 Features)

### Features List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| D47 | Scorecard Section | Active, Completed, Earnings, Rating | Core |
| D48 | Edit Profile | Update qualifications, skills | Core |
| D49 | Payment History | Past withdrawals, pending | Core |
| D50 | Bank Details Management | Edit account info | Core |
| D51 | Contact Support | WhatsApp/Ticket system | Core |
| D52 | Log Out | Profile footer action | Core |
| D53 | Request Payout Button | Manual withdrawal | Core |
| D54 | Pending Payments Display | Earnings awaiting clearance | Important |
| D55 | Earnings Graph | Visual over time | Optional |
| D56 | Rating Breakdown | Detailed view | Optional |
| D57 | Skill Verification Status | Verified badges | Optional |

### Implementation Tasks

#### Task 6.1: Profile Screen
**File:** `lib/features/profile/screens/profile_screen.dart`
```dart
// Features:
// - Hero section (avatar, name, rating)
// - Scorecard section
// - Quick stats cards
// - Action buttons (Edit, Payout, Support)
// - Settings section
// - Logout button
```

#### Task 6.2: Scorecard Widget
**File:** `lib/features/profile/widgets/scorecard.dart`
```dart
// Features:
// - Grid of stat cards:
//   - Active Assignments
//   - Completed Projects
//   - Total Earnings (₹)
//   - Average Rating (stars)
//   - Success Rate (%)
//   - On-time Delivery (%)
```

#### Task 6.3: Edit Profile Screen
**File:** `lib/features/profile/screens/edit_profile_screen.dart`
```dart
// Features:
// - Profile picture upload
// - Personal info section
// - Qualification dropdown
// - Skills chip editor
// - University info
// - Bio/About text area
// - Save button
```

#### Task 6.4: Payment History Screen
**File:** `lib/features/profile/screens/payment_history_screen.dart`
```dart
// Features:
// - Tab: All | Completed | Pending
// - Transaction list tiles
// - Filter by date range
// - Transaction details bottom sheet
// - Export option
```

#### Task 6.5: Payout Request Dialog
**File:** `lib/features/profile/widgets/payout_request_dialog.dart`
```dart
// Features:
// - Available balance display
// - Amount input
// - Minimum threshold info
// - Bank account preview
// - Request button
// - Processing time info
```

### Widgets to Create

| Widget | File | Description |
|--------|------|-------------|
| `ProfileHeader` | `profile_header.dart` | Avatar + name + rating |
| `ScorecardGrid` | `scorecard_grid.dart` | Stats grid |
| `TransactionTile` | `transaction_tile.dart` | Payment list item |
| `EarningsChart` | `earnings_chart.dart` | Line chart |
| `RatingBreakdown` | `rating_breakdown.dart` | Star bars |
| `SkillChip` | `skill_chip.dart` | With verified badge |
| `SupportButton` | `support_button.dart` | WhatsApp/ticket trigger |

---

## Cross-Platform Features

### Chat System (Supabase Realtime)

```dart
// lib/data/repositories/chat_repository.dart
// - Connect to Supabase Realtime channel
// - Subscribe to new messages
// - Send messages
// - Handle file attachments
// - Detect contact info (flagging)
```

### Push Notifications (Firebase)

```dart
// lib/core/services/notification_service.dart
// - Firebase Cloud Messaging setup
// - Local notifications (flutter_local_notifications)
// - Handle notification taps
// - Badge count management
```

### Offline Support

```dart
// lib/core/services/offline_service.dart
// - Cache critical data (shared_preferences, sqflite)
// - Sync when online
// - Offline indicator UI
```

---

## Database Tables Required (Doer Context)

> **Full Schema:** See `DATABASE.md` for complete table definitions.

### Core Tables (4)
1. `profiles` - Base user info
2. `doers` - Doer-specific data
3. `doer_skills` - Skill mappings
4. `doer_subjects` - Subject areas

### Project Tables (8)
5. `projects` - Main projects
6. `project_files` - Reference files
7. `project_deliverables` - Submissions
8. `project_status_history` - Status audit
9. `project_revisions` - Revision requests
10. `project_assignments` - Assignment tracking
11. `project_timeline` - Milestones
12. `quality_reports` - AI/plagiarism reports

### Financial Tables (5)
13. `wallets` - Doer wallet
14. `wallet_transactions` - Transaction history
15. `payouts` - Payout records
16. `payout_requests` - Withdrawal requests
17. `invoices` - Generated invoices

### Communication Tables (4)
18. `chat_rooms` - Chat rooms
19. `chat_messages` - Messages
20. `chat_participants` - Participants
21. `notifications` - Notifications

### Training Tables (5)
22. `training_modules` - Training content
23. `training_progress` - Progress tracking
24. `quiz_questions` - Quiz questions
25. `quiz_attempts` - Quiz attempts
26. `doer_activation` - Activation status

### Configuration Tables (5)
27. `skills` - Skills master
28. `subjects` - Subjects master
29. `universities` - Universities master
30. `courses` - Course master
31. `reference_styles` - Citation styles

### Support Tables (3)
32. `support_tickets` - Support tickets
33. `ticket_messages` - Ticket messages
34. `faqs` - FAQs

---

## Implementation Order Summary

| Batch | Features | Est. Screens | Est. Widgets | Priority |
|-------|----------|--------------|--------------|----------|
| 0 | Setup | - | - | Prerequisite |
| 1 | Onboarding (12) | 4 | 8 | Core |
| 2 | Activation (8) | 4 | 6 | Core |
| 3 | Dashboard (12) | 3 | 10 | Core |
| 4 | Projects (9) | 4 | 10 | Core |
| 5 | Resources (5) | 4 | 6 | Core |
| 6 | Profile (11) | 5 | 10 | Core |

**Total: 57 Features | 24 Screens | 50+ Widgets | 34 Database Tables**

---

## Additional Notes

### Design Guidelines
- **Primary Color:** Dark Blue (#1E3A5F)
- **Accent:** Professional Blue (#3B82F6)
- **Visual Theme:** Professional, Sharp, Authority-driven
- **Font Family:** Inter (or system default)
- **Spacing:** 8px grid system
- **Border Radius:** 8-12px for cards, 4-8px for buttons

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

### Security Considerations
- Store tokens in `flutter_secure_storage`
- Validate all inputs
- Never log sensitive data
- Mask bank account numbers in UI
- Handle session expiry gracefully

---

*Document Version: 1.0*
*Created: December 2025*
*Project: AssignX - Doer Mobile App*
