# Supervisor Mobile App - Comprehensive Implementation Plan

> **Project:** AssignX Supervisor App (AdminX Mobile)
> **Technology:** Flutter 3.10+ + Dart + Riverpod + GoRouter
> **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
> **Platforms:** iOS & Android
> **Version:** 1.0 | **Date:** December 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Feature Summary](#3-feature-summary)
4. [Implementation Batches](#4-implementation-batches)
5. [Folder Structure (Clean Architecture)](#5-folder-structure-clean-architecture)
6. [Detailed Feature Specifications](#6-detailed-feature-specifications)
7. [Database Integration](#7-database-integration)
8. [UI/UX Guidelines](#8-uiux-guidelines)
9. [Platform-Specific Considerations](#9-platform-specific-considerations)

---

## 1. Project Overview

The Supervisor Mobile App (AdminX) is the mobile counterpart to the web application, designed for supervisors who need to manage projects on-the-go. It shares the same Supabase backend and provides all core functionality optimized for mobile devices.

### App Identity
- **App Name:** AdminX
- **Visual Theme:** Professional, Sharp, Authority-driven
- **Color Scheme:** Dark Blue/Slate Grey & White
- **Tagline:** "Quality. Integrity. Supervision."

### Shared with Web
- Same Supabase database (58 tables)
- Same authentication system
- Same business logic and workflows
- Same real-time features
- Same 20-state project lifecycle

---

## 2. Tech Stack & Dependencies

### Core Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Navigation
  go_router: ^13.0.0

  # Supabase
  supabase_flutter: ^2.3.0

  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  flutter_animate: ^4.3.0

  # Forms & Validation
  reactive_forms: ^16.1.1

  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # File Handling
  file_picker: ^6.1.1
  open_filex: ^4.3.4
  path_provider: ^2.1.1

  # Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # Utilities
  intl: ^0.18.1
  timeago: ^3.6.1
  url_launcher: ^6.2.2
  connectivity_plus: ^5.0.2

  # PDF & Documents
  flutter_pdfview: ^1.3.2
  video_player: ^2.8.2
  chewie: ^1.7.4

  # Charts
  fl_chart: ^0.66.0

  # Icons
  iconsax: ^0.0.8
  cupertino_icons: ^1.0.8

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

### Environment Setup

```dart
// lib/core/config/env.dart
abstract class Env {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
}
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

*Same features as Web - shared business logic*

---

## 4. Implementation Batches

### BATCH 1: Foundation & Authentication (Week 1)
**Priority: Critical - Must complete before other batches**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | SETUP-01 | Project Setup | Clean Architecture structure, Riverpod, GoRouter |
| 2 | SETUP-02 | Supabase Setup | supabase_flutter initialization, auth state |
| 3 | SETUP-03 | Theme System | ThemeData for light/dark, custom ColorScheme |
| 4 | S01 | Splash Screen | Animated splash with logo, auto-navigation |
| 5 | S05 | Basic Credentials Form | ReactiveForm with validation |
| 6 | AUTH-01 | Login Page | Email/Password with Supabase Auth |
| 7 | AUTH-02 | Session Management | GoRouter redirect, auth state listener |
| 8 | LAYOUT-01 | App Shell | Scaffold with BottomNavigationBar/Drawer |

**Deliverables:**
- Clean architecture folder structure
- Authentication flow with Supabase
- Theme switching (system/light/dark)
- Protected route navigation

**Key Files:**
```
lib/
├── main.dart
├── core/
│   ├── config/
│   ├── theme/
│   └── router/
├── features/
│   └── auth/
└── shared/
```

---

### BATCH 2: Registration & Onboarding (Week 2)
**Priority: High - Required for new supervisor signup**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S02-S04 | Onboarding Slides | PageView with indicators, shared_preferences for first launch |
| 2 | S06 | Professional Profile | Multi-step form with file_picker for CV |
| 3 | S07 | Banking Setup | Form with IFSC validation |
| 4 | S08 | Submit Application | API call + loading state |
| 5 | S09 | Application Pending | Polling/Realtime for status updates |
| 6 | S10-S11 | Verification Status | Status indicators with animations |

**Deliverables:**
- Onboarding carousel with skip functionality
- Multi-step registration wizard
- CV upload with Supabase Storage
- Application status polling

**Key Widgets:**
```dart
// Custom widgets to create
OnboardingPage
StepProgressIndicator
FileUploadCard
BankDetailsForm
ApplicationStatusCard
```

---

### BATCH 3: Activation Flow (Week 3)
**Priority: High - Gate to access dashboard**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S12 | Activation Lock Screen | Full-screen overlay with progress |
| 2 | S13 | Training Module | video_player + flutter_pdfview |
| 3 | S14 | Mark Complete Button | Progress tracking in Supabase |
| 4 | S15 | Supervisor Test | Quiz UI with timer |
| 5 | S16 | Test Pass/Fail Logic | Score calculation, retry logic |
| 6 | S17 | Welcome Message | Animated success screen |

**Deliverables:**
- Video player for training content
- PDF viewer for documents
- Quiz system with scoring
- Progress persistence

**Key Widgets:**
```dart
TrainingVideoPlayer
PDFDocumentViewer
QuizQuestion
QuizTimer
ScoreResultCard
```

---

### BATCH 4: Main Dashboard & Requests (Week 4-5)
**Priority: Core - Primary supervisor workflow**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S18 | Top Bar Greeting | AppBar with greeting + notification badge |
| 2 | S19 | Menu Drawer | Drawer with profile card |
| 3 | S20 | Availability Toggle | Switch with Supabase Realtime sync |
| 4 | S21 | Drawer Menu Items | ListTile navigation |
| 5 | S22 | Field Filter | FilterChip/ChoiceChip for subjects |
| 6 | S23 | Section A: New Requests | ListView with RequestCard |
| 7 | S24 | Analyze & Quote Action | BottomSheet/Modal for quote form |
| 8 | S25 | Section B: Ready to Assign | ListView with "PAID" badge |
| 9 | S26 | Assign Doer Action | BottomSheet with doer list |
| 10 | S27 | Doer Selection List | Searchable list with filters |
| 11 | S28 | Project Pricing | Quote form with breakdown |
| 12 | S29 | Doer Reviews Access | Review cards with ratings |

**Deliverables:**
- Dashboard with sectioned lists
- Pull-to-refresh functionality
- Quote creation modal
- Doer assignment flow
- Real-time updates via Supabase Realtime

**Key Widgets:**
```dart
DashboardHeader
AvailabilityToggle
RequestCard
QuoteFormSheet
DoerSelectionSheet
DoerCard
PricingBreakdown
```

---

### BATCH 5: Active Projects Management (Week 6-7)
**Priority: Core - Project lifecycle management**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S30 | Active Projects Tabs | TabBar + TabBarView |
| 2 | S31 | On Going Tab | ProjectCard with timer |
| 3 | S32 | For Review (QC) Tab | QC cards with file preview |
| 4 | S33 | Approve & Deliver Action | Confirmation dialog + API |
| 5 | S34 | Reject/Revision Action | Feedback form in BottomSheet |
| 6 | S35 | Completed Tab | Historical project list |
| 7 | S36 | Unified Chat Interface | Chat UI with Supabase Realtime |
| 8 | S37 | Chat Monitoring | Message list with sender info |
| 9 | S38 | Chat Suspension | Admin action button |
| 10 | S39 | Contact Sharing Prevention | Message filtering (server-side) |

**Deliverables:**
- Tabbed project view
- Real-time chat with message bubbles
- File preview (images, PDFs)
- QC approval/rejection flow

**Key Widgets:**
```dart
ProjectTabs
ProjectCard
DeadlineTimer
QCReviewCard
ChatScreen
MessageBubble
FilePreviewCard
RevisionFeedbackForm
```

---

### BATCH 6: Training & Resources (Week 8)
**Priority: Important - Tools for supervisors**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S40 | Plagiarism Checker | WebView or API integration |
| 2 | S41 | AI Detector | WebView or API integration |
| 3 | S42 | Pricing Guide | Static/dynamic pricing table |
| 4 | S43 | Advanced Training | Video library grid |
| 5 | S44 | Resources Grid | GridView with tool cards |

**Deliverables:**
- Resource center screen
- Tool launcher cards
- Training video library
- Pricing reference table

**Key Widgets:**
```dart
ResourceGrid
ToolCard
PricingGuideTable
TrainingLibrary
VideoThumbnailCard
```

---

### BATCH 7: Profile, Statistics & Earnings (Week 9)
**Priority: Important - Performance tracking**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S45 | Stats Dashboard | fl_chart for visualizations |
| 2 | S46 | Edit Profile | Profile form with image picker |
| 3 | S47 | Payment Ledger | Transaction list with filters |
| 4 | S48 | Contact Support | Support ticket form |
| 5 | S49 | Log Out | Auth sign out + navigation |
| 6 | S50 | My Reviews | Review list with ratings |
| 7 | S51 | Doer Blacklist | Flagged doers management |
| 8 | S52 | Commission Tracking | Earnings breakdown |
| 9 | S53 | Performance Metrics | Stats cards with charts |
| 10 | S54 | Earnings Graph | LineChart/BarChart |

**Deliverables:**
- Statistics dashboard with charts
- Profile editing with image upload
- Transaction history
- Review management

**Key Widgets:**
```dart
StatsCard
EarningsChart
PerformanceMetrics
TransactionList
TransactionCard
ReviewCard
ProfileForm
```

---

### BATCH 8: Doer & User Management + Support (Week 10)
**Priority: Important - Management capabilities**

| # | Feature ID | Feature Name | Flutter Implementation |
|---|-----------|--------------|------------------------|
| 1 | S55 | Doer Management | Searchable doer list |
| 2 | S56 | User Management | Client list with history |
| 3 | S57 | Notification System | firebase_messaging + local notifications |
| 4 | S58 | Earnings Overview | Commission breakdown view |
| 5 | S59 | Support Ticket System | Ticket list + create form |
| 6 | S60 | Ticket Messages | Chat-like interface |
| 7 | S61 | FAQ Access | Expandable FAQ list |

**Deliverables:**
- Push notification setup
- Notification center screen
- Support ticket system
- FAQ accordion

**Key Widgets:**
```dart
DoerListView
UserListView
NotificationCenter
NotificationCard
SupportTicketForm
TicketMessageList
FAQAccordion
```

---

### BATCH 9: Polish & Optimization (Week 11)
**Priority: Enhancement - Quality improvements**

| # | Task | Flutter Implementation |
|---|------|------------------------|
| 1 | Performance | Lazy loading, image caching, widget optimization |
| 2 | Accessibility | Semantics, screen reader support |
| 3 | Error Handling | Global error boundary, snackbar notifications |
| 4 | Loading States | Shimmer effects, skeleton loaders |
| 5 | Offline Support | connectivity_plus, cached data |
| 6 | App Icons | flutter_launcher_icons |
| 7 | Splash Screen | flutter_native_splash |
| 8 | Testing | Widget tests, integration tests |

---

## 5. Folder Structure (Clean Architecture)

```
lib/
├── main.dart
├── app.dart
│
├── core/
│   ├── config/
│   │   ├── env.dart
│   │   └── constants.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── theme_provider.dart
│   ├── router/
│   │   ├── app_router.dart
│   │   ├── routes.dart
│   │   └── guards/
│   │       ├── auth_guard.dart
│   │       └── activation_guard.dart
│   ├── network/
│   │   ├── supabase_client.dart
│   │   └── api_exceptions.dart
│   ├── utils/
│   │   ├── extensions.dart
│   │   ├── validators.dart
│   │   └── formatters.dart
│   └── providers/
│       └── core_providers.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── datasources/
│   │   │       └── auth_remote_datasource.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       └── register_usecase.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   ├── register_screen.dart
│   │       │   └── splash_screen.dart
│   │       └── widgets/
│   │           ├── login_form.dart
│   │           └── otp_input.dart
│   │
│   ├── onboarding/
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── onboarding_screen.dart
│   │       └── widgets/
│   │           ├── onboarding_page.dart
│   │           └── page_indicator.dart
│   │
│   ├── activation/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── activation_screen.dart
│   │       │   ├── training_screen.dart
│   │       │   └── quiz_screen.dart
│   │       └── widgets/
│   │           ├── training_video_player.dart
│   │           ├── quiz_question.dart
│   │           └── quiz_timer.dart
│   │
│   ├── dashboard/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── project_model.dart
│   │   │   │   └── request_model.dart
│   │   │   └── repositories/
│   │   │       └── dashboard_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── dashboard_provider.dart
│   │       ├── screens/
│   │       │   └── dashboard_screen.dart
│   │       └── widgets/
│   │           ├── request_card.dart
│   │           ├── availability_toggle.dart
│   │           └── stats_summary.dart
│   │
│   ├── projects/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── project_model.dart
│   │   │   │   ├── quote_model.dart
│   │   │   │   └── deliverable_model.dart
│   │   │   └── repositories/
│   │   │       └── project_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── projects_provider.dart
│   │       ├── screens/
│   │       │   ├── projects_screen.dart
│   │       │   ├── project_detail_screen.dart
│   │       │   └── qc_review_screen.dart
│   │       └── widgets/
│   │           ├── project_card.dart
│   │           ├── project_tabs.dart
│   │           ├── quote_form.dart
│   │           └── qc_actions.dart
│   │
│   ├── doers/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── doer_model.dart
│   │   │   └── repositories/
│   │   │       └── doer_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── doers_provider.dart
│   │       ├── screens/
│   │       │   ├── doers_screen.dart
│   │       │   └── doer_detail_screen.dart
│   │       └── widgets/
│   │           ├── doer_card.dart
│   │           ├── doer_filters.dart
│   │           └── assign_doer_sheet.dart
│   │
│   ├── chat/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── chat_room_model.dart
│   │   │   │   └── message_model.dart
│   │   │   └── repositories/
│   │   │       └── chat_repository.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── chat_provider.dart
│   │       ├── screens/
│   │       │   ├── chat_list_screen.dart
│   │       │   └── chat_screen.dart
│   │       └── widgets/
│   │           ├── message_bubble.dart
│   │           ├── message_input.dart
│   │           └── chat_room_tile.dart
│   │
│   ├── earnings/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── transaction_model.dart
│   │   │   └── repositories/
│   │   │       └── earnings_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── earnings_screen.dart
│   │       └── widgets/
│   │           ├── earnings_chart.dart
│   │           ├── transaction_card.dart
│   │           └── commission_breakdown.dart
│   │
│   ├── profile/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── supervisor_model.dart
│   │   │   └── repositories/
│   │   │       └── profile_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── profile_screen.dart
│   │       │   └── edit_profile_screen.dart
│   │       └── widgets/
│   │           ├── profile_header.dart
│   │           ├── stats_card.dart
│   │           └── review_card.dart
│   │
│   ├── resources/
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── resources_screen.dart
│   │       │   └── training_library_screen.dart
│   │       └── widgets/
│   │           ├── resource_card.dart
│   │           └── pricing_guide_table.dart
│   │
│   ├── support/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── ticket_model.dart
│   │   │   └── repositories/
│   │   │       └── support_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── support_screen.dart
│   │       │   ├── ticket_detail_screen.dart
│   │       │   └── faq_screen.dart
│   │       └── widgets/
│   │           ├── ticket_card.dart
│   │           ├── ticket_form.dart
│   │           └── faq_accordion.dart
│   │
│   └── notifications/
│       ├── data/
│       │   ├── models/
│       │   │   └── notification_model.dart
│       │   └── repositories/
│       │       └── notification_repository.dart
│       └── presentation/
│           ├── providers/
│           │   └── notifications_provider.dart
│           ├── screens/
│           │   └── notifications_screen.dart
│           └── widgets/
│               └── notification_card.dart
│
└── shared/
    ├── widgets/
    │   ├── buttons/
    │   │   ├── primary_button.dart
    │   │   ├── secondary_button.dart
    │   │   └── icon_button.dart
    │   ├── inputs/
    │   │   ├── text_field.dart
    │   │   ├── dropdown_field.dart
    │   │   └── file_picker_field.dart
    │   ├── cards/
    │   │   ├── info_card.dart
    │   │   └── stat_card.dart
    │   ├── feedback/
    │   │   ├── loading_overlay.dart
    │   │   ├── shimmer_loading.dart
    │   │   ├── empty_state.dart
    │   │   └── error_state.dart
    │   ├── dialogs/
    │   │   ├── confirm_dialog.dart
    │   │   └── loading_dialog.dart
    │   └── misc/
    │       ├── status_badge.dart
    │       ├── rating_stars.dart
    │       ├── avatar.dart
    │       └── deadline_timer.dart
    ├── models/
    │   └── base_model.dart
    └── extensions/
        ├── context_extensions.dart
        ├── string_extensions.dart
        └── datetime_extensions.dart
```

---

## 6. Detailed Feature Specifications

### 6.1 Authentication Flow

```dart
// GoRouter configuration
final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = ref.read(authProvider).isLoggedIn;
    final isActivated = ref.read(authProvider).isActivated;

    if (!isLoggedIn) return '/login';
    if (!isActivated) return '/activation';
    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (_, __) => SplashScreen()),
    GoRoute(path: '/login', builder: (_, __) => LoginScreen()),
    GoRoute(path: '/register', builder: (_, __) => RegisterScreen()),
    GoRoute(path: '/onboarding', builder: (_, __) => OnboardingScreen()),
    GoRoute(path: '/activation', builder: (_, __) => ActivationScreen()),
    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => DashboardScreen()),
        GoRoute(path: '/projects', builder: (_, __) => ProjectsScreen()),
        // ... more routes
      ],
    ),
  ],
);
```

### 6.2 Supabase Realtime Integration

```dart
// Real-time project updates
class ProjectRepository {
  final SupabaseClient _client;

  Stream<List<Project>> watchProjects(String supervisorId) {
    return _client
        .from('projects')
        .stream(primaryKey: ['id'])
        .eq('supervisor_id', supervisorId)
        .order('created_at', ascending: false)
        .map((data) => data.map(Project.fromJson).toList());
  }
}

// Real-time chat messages
class ChatRepository {
  Stream<List<Message>> watchMessages(String roomId) {
    return _client
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('chat_room_id', roomId)
        .order('created_at')
        .map((data) => data.map(Message.fromJson).toList());
  }
}
```

### 6.3 Push Notifications

```dart
// Firebase Cloud Messaging setup
Future<void> initializeNotifications() async {
  await Firebase.initializeApp();

  final messaging = FirebaseMessaging.instance;
  await messaging.requestPermission();

  final token = await messaging.getToken();
  await saveDeviceToken(token);

  FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
  FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
}
```

---

## 7. Database Integration

### Same Database Schema as Web
The mobile app uses the **exact same Supabase database** as the web application:

- **58 Tables** (profiles, supervisors, projects, etc.)
- **12 ENUM Types** (project_status, chat_room_type, etc.)
- **8 Functions** (generate_project_number, detect_contact_info, etc.)
- **30+ Triggers** (auto-update timestamps, wallet balance, etc.)

### Key Supabase Queries

```dart
// Fetch new requests for supervisor
Future<List<Project>> getNewRequests(String supervisorId) async {
  final response = await supabase
      .from('projects')
      .select('''
        *,
        user:profiles!user_id(*),
        subject:subjects(*)
      ''')
      .eq('supervisor_id', supervisorId)
      .eq('status', 'submitted')
      .order('created_at', ascending: false);

  return response.map((e) => Project.fromJson(e)).toList();
}

// Submit quote
Future<void> submitQuote(String projectId, QuoteData quote) async {
  await supabase.from('project_quotes').insert({
    'project_id': projectId,
    'user_amount': quote.userAmount,
    'doer_amount': quote.doerAmount,
    'supervisor_amount': quote.supervisorAmount,
    'platform_amount': quote.platformAmount,
    'quoted_by': supabase.auth.currentUser!.id,
    'status': 'sent',
  });

  await supabase.from('projects').update({
    'status': 'quoted',
    'user_quote': quote.userAmount,
  }).eq('id', projectId);
}
```

---

## 8. UI/UX Guidelines

### Color Scheme

```dart
// lib/core/theme/app_colors.dart
abstract class AppColors {
  // Primary - Dark Blue
  static const primary = Color(0xFF1E3A5F);
  static const primaryLight = Color(0xFF2E5077);
  static const primaryDark = Color(0xFF0F2744);

  // Secondary - Slate Grey
  static const secondary = Color(0xFF64748B);
  static const secondaryLight = Color(0xFF94A3B8);
  static const secondaryDark = Color(0xFF475569);

  // Status Colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);

  // Project Status Colors
  static const statusAnalyzing = Color(0xFFFBBF24);    // Yellow
  static const statusPending = Color(0xFFF97316);      // Orange
  static const statusInProgress = Color(0xFF3B82F6);   // Blue
  static const statusForReview = Color(0xFF22C55E);    // Green
  static const statusCompleted = Color(0xFF6B7280);    // Grey
  static const statusUrgent = Color(0xFFEF4444);       // Red

  // Background
  static const background = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceVariant = Color(0xFFF1F5F9);
}
```

### Typography

```dart
// lib/core/theme/app_typography.dart
abstract class AppTypography {
  static const fontFamily = 'Inter';

  static const headlineLarge = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
  );

  static const headlineMedium = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
  );

  static const titleLarge = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
  );

  static const bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );

  static const labelMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );
}
```

### Component Patterns

```dart
// Standard card pattern
class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  StatusBadge(status: project.status),
                  Spacer(),
                  DeadlineTimer(deadline: project.deadline),
                ],
              ),
              SizedBox(height: 12),
              Text(project.title, style: AppTypography.titleLarge),
              SizedBox(height: 8),
              Text(project.subject.name, style: AppTypography.bodyLarge),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 9. Platform-Specific Considerations

### iOS
- Use Cupertino-style components where appropriate
- Handle safe area insets
- Support iOS-specific gestures (swipe back)
- Configure Info.plist for permissions (camera, photos, notifications)

### Android
- Material 3 design compliance
- Handle back button navigation
- Configure AndroidManifest.xml for permissions
- Support edge-to-edge display

### Shared
- Responsive design for different screen sizes
- Support for tablets (adaptive layout)
- RTL language support structure
- Accessibility (semantics, screen readers)

---

## Status Color Coding Reference

| Color | Status | Description |
|-------|--------|-------------|
| Yellow | Analyzing | Supervisor reviewing requirements |
| Orange | Payment Pending | Quote ready, awaiting payment |
| Blue | In Progress | Expert actively working |
| Green | For Review | Work delivered, awaiting approval |
| Grey | Completed | Archived in history |
| Red | Urgent/Revision | <6h deadline or revision requested |

---

## Implementation Notes

### State Management with Riverpod
- Use `@riverpod` annotation for providers
- Prefer `AsyncNotifier` for async operations
- Use `StreamProvider` for real-time data
- Keep providers feature-scoped

### Navigation with GoRouter
- Use declarative routing
- Implement route guards for auth/activation
- Support deep linking
- Handle back navigation properly

### Performance Best Practices
- Use `const` constructors where possible
- Implement list virtualization with `ListView.builder`
- Cache network images with `cached_network_image`
- Lazy load heavy content (videos, PDFs)

### Error Handling
- Global error boundary with `ErrorWidget.builder`
- Show user-friendly error messages
- Log errors with context for debugging
- Implement retry mechanisms for network failures

---

*Document Generated: December 2025*
*Project: AssignX Supervisor App v1.0*
