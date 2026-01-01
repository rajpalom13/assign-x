# AssignX - User App (Flutter) Implementation Plan

> **Version:** 1.0 | **Date:** December 2025
> **Platform:** Flutter (iOS & Android)
> **State Management:** Riverpod
> **Total Features:** 100 | **Target:** Students, Job Seekers, Business Owners

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database & Backend](#4-database--backend)
5. [Batch 1: Project Setup & Infrastructure](#batch-1-project-setup--infrastructure)
6. [Batch 2: Authentication & Onboarding](#batch-2-authentication--onboarding)
7. [Batch 3: Home Dashboard](#batch-3-home-dashboard)
8. [Batch 4: My Projects Module](#batch-4-my-projects-module)
9. [Batch 5: Project Detail Page](#batch-5-project-detail-page)
10. [Batch 6: Add Project Module](#batch-6-add-project-module)
11. [Batch 7: Student Connect / Marketplace](#batch-7-student-connect--marketplace)
12. [Batch 8: Profile & Settings](#batch-8-profile--settings)
13. [Batch 9: Cross-Platform Features](#batch-9-cross-platform-features)
14. [Batch 10: Testing & Polish](#batch-10-testing--polish)

---

## 1. Overview

The User App is a cross-platform mobile application built with Flutter, serving students, job seekers, and business owners who need task/project completion services.

### Target Platforms
| Platform | Min Version |
|----------|-------------|
| iOS | 13.0+ |
| Android | API 21+ (Android 5.0) |

### Core User Journey
```
Splash → Onboarding → Sign Up → Dashboard → Submit Project → Track Progress → Review & Approve → Download
```

### Design Theme
- **Primary Colors:** Dark Blue (#1E3A5F), Slate Grey (#64748B)
- **Accent:** White, Success Green, Warning Orange
- **Style:** Professional, Clean, Gen-Z friendly
- **Typography:** Inter / SF Pro

---

## 2. Technology Stack

### Core
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Flutter | 3.x |
| Language | Dart | 3.x |
| State Management | Riverpod | 2.x |
| Navigation | GoRouter | 13.x |

### Backend Integration
| Component | Technology |
|-----------|------------|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google Sign-In |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |

### Key Packages
```yaml
dependencies:
  # Core
  flutter_riverpod: ^2.4.0
  go_router: ^13.0.0

  # Supabase
  supabase_flutter: ^2.0.0

  # UI
  flutter_screenutil: ^5.9.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0
  rive: ^0.12.0

  # Forms
  flutter_form_builder: ^9.1.0
  form_builder_validators: ^9.1.0

  # Utilities
  intl: ^0.18.0
  url_launcher: ^6.2.0
  share_plus: ^7.2.0
  image_picker: ^1.0.0
  file_picker: ^6.1.0

  # Storage
  flutter_secure_storage: ^9.0.0
  hive_flutter: ^1.1.0

  # Payments
  razorpay_flutter: ^1.3.0

  # Notifications
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.2.0

  # Analytics & Monitoring
  sentry_flutter: ^7.14.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.0
  integration_test:
    sdk: flutter
```

---

## 3. Project Structure

```
user_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_typography.dart
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
│   │       ├── failures.dart
│   │       └── exceptions.dart
│   │
│   ├── data/
│   │   ├── datasources/
│   │   │   ├── auth_datasource.dart
│   │   │   ├── project_datasource.dart
│   │   │   ├── chat_datasource.dart
│   │   │   └── marketplace_datasource.dart
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── project_model.dart
│   │   │   ├── quote_model.dart
│   │   │   ├── chat_model.dart
│   │   │   └── listing_model.dart
│   │   └── repositories/
│   │       ├── auth_repository.dart
│   │       ├── project_repository.dart
│   │       ├── payment_repository.dart
│   │       └── chat_repository.dart
│   │
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── project_provider.dart
│   │   ├── wallet_provider.dart
│   │   ├── chat_provider.dart
│   │   └── notification_provider.dart
│   │
│   ├── features/
│   │   ├── splash/
│   │   │   └── splash_screen.dart
│   │   ├── onboarding/
│   │   │   ├── onboarding_screen.dart
│   │   │   └── widgets/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── role_selection_screen.dart
│   │   │   │   ├── student_signup_screen.dart
│   │   │   │   ├── professional_signup_screen.dart
│   │   │   │   └── otp_verification_screen.dart
│   │   │   └── widgets/
│   │   ├── dashboard/
│   │   │   ├── screens/
│   │   │   │   └── dashboard_screen.dart
│   │   │   └── widgets/
│   │   ├── projects/
│   │   │   ├── screens/
│   │   │   │   ├── my_projects_screen.dart
│   │   │   │   └── project_detail_screen.dart
│   │   │   └── widgets/
│   │   ├── add_project/
│   │   │   ├── screens/
│   │   │   └── widgets/
│   │   ├── marketplace/
│   │   │   ├── screens/
│   │   │   └── widgets/
│   │   ├── profile/
│   │   │   ├── screens/
│   │   │   └── widgets/
│   │   └── chat/
│   │       ├── screens/
│   │       └── widgets/
│   │
│   └── shared/
│       └── widgets/
│           ├── buttons/
│           │   ├── primary_button.dart
│           │   ├── secondary_button.dart
│           │   └── icon_button.dart
│           ├── inputs/
│           │   ├── custom_text_field.dart
│           │   ├── otp_input.dart
│           │   └── dropdown_field.dart
│           ├── cards/
│           │   ├── project_card.dart
│           │   ├── service_card.dart
│           │   └── stat_card.dart
│           ├── dialogs/
│           │   ├── loading_dialog.dart
│           │   ├── success_dialog.dart
│           │   └── confirm_dialog.dart
│           ├── loaders/
│           │   ├── shimmer_loader.dart
│           │   └── skeleton_loader.dart
│           └── common/
│               ├── app_bar.dart
│               ├── bottom_nav.dart
│               ├── status_badge.dart
│               └── avatar.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── animations/ (Lottie/Rive)
│   └── fonts/
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
└── pubspec.yaml
```

---

## 4. Database & Backend

Same database schema as Web (34 tables). The Supabase client handles all backend operations.

### Supabase Client Setup
```dart
// lib/core/services/supabase_service.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: 'YOUR_SUPABASE_URL',
      anonKey: 'YOUR_ANON_KEY',
    );
  }
}
```

---

## Batch 1: Project Setup & Infrastructure

### Priority: Critical | Complexity: Medium

### 1.1 Flutter Project Setup
| # | Task | Description |
|---|------|-------------|
| 1.1.1 | Create project | `flutter create user_app` (if not exists) |
| 1.1.2 | Setup folder structure | Create feature-based architecture |
| 1.1.3 | Add dependencies | Add all packages to pubspec.yaml |
| 1.1.4 | Configure flavors | Development, Staging, Production |

### 1.2 Theme Configuration
```dart
// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const primaryColor = Color(0xFF1E3A5F);
  static const secondaryColor = Color(0xFF64748B);
  static const accentColor = Color(0xFF3B82F6);
  static const successColor = Color(0xFF22C55E);
  static const warningColor = Color(0xFFF59E0B);
  static const errorColor = Color(0xFFEF4444);
  static const backgroundColor = Color(0xFFF8FAFC);
  static const surfaceColor = Colors.white;

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      surface: surfaceColor,
      background: backgroundColor,
      error: errorColor,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: primaryColor,
      elevation: 0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey[100],
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: errorColor, width: 2),
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
  );
}
```

### 1.3 Router Configuration
```dart
// lib/core/router/app_router.dart
import 'package:go_router/go_router.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/auth/role-selection',
      builder: (context, state) => const RoleSelectionScreen(),
    ),
    GoRoute(
      path: '/auth/signup/student',
      builder: (context, state) => const StudentSignupScreen(),
    ),
    GoRoute(
      path: '/auth/signup/professional',
      builder: (context, state) => const ProfessionalSignupScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/projects',
          builder: (context, state) => const MyProjectsScreen(),
        ),
        GoRoute(
          path: '/connect',
          builder: (context, state) => const MarketplaceScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/project/:id',
      builder: (context, state) => ProjectDetailScreen(
        projectId: state.pathParameters['id']!,
      ),
    ),
  ],
);
```

### 1.4 Riverpod Setup
```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SupabaseService.initialize();
  await Firebase.initializeApp();

  runApp(
    const ProviderScope(
      child: UserApp(),
    ),
  );
}

// lib/app.dart
class UserApp extends ConsumerWidget {
  const UserApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'AssignX',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

---

## Batch 2: Authentication & Onboarding

### Priority: Critical | Features: U01-U11 (11 features)

### 2.1 Splash Screen (U01)
```dart
// lib/features/splash/splash_screen.dart
class SplashScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateAfterDelay();
  }

  Future<void> _navigateAfterDelay() async {
    await Future.delayed(const Duration(seconds: 2));

    final session = ref.read(authProvider);
    if (session != null) {
      context.go('/dashboard');
    } else {
      final hasSeenOnboarding = await _checkOnboardingStatus();
      context.go(hasSeenOnboarding ? '/auth/role-selection' : '/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Rive or Lottie animation
            RiveAnimation.asset(
              'assets/animations/logo_animation.riv',
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 24),
            Text(
              'Your Task, Our Expertise',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2.2 Onboarding Carousel (U02)
```dart
// lib/features/onboarding/onboarding_screen.dart
class OnboardingScreen extends StatefulWidget {
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<OnboardingSlide> _slides = [
    OnboardingSlide(
      title: 'Expert Help, Anytime',
      description: 'Get professional assistance for your projects from verified experts',
      image: 'assets/images/onboarding_1.png',
    ),
    OnboardingSlide(
      title: 'Wide Range of Services',
      description: 'From academic projects to professional documents, we\'ve got you covered',
      image: 'assets/images/onboarding_2.png',
    ),
    OnboardingSlide(
      title: 'Quality Guaranteed',
      description: 'AI-checked, plagiarism-free work with complete confidentiality',
      image: 'assets/images/onboarding_3.png',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip Button
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: () => context.go('/auth/role-selection'),
                child: const Text('Skip'),
              ),
            ),

            // Page View
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (index) => setState(() => _currentPage = index),
                itemCount: _slides.length,
                itemBuilder: (context, index) => OnboardingSlideWidget(
                  slide: _slides[index],
                ),
              ),
            ),

            // Dots Indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _slides.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentPage == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index
                        ? AppTheme.primaryColor
                        : Colors.grey[300],
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Action Button
            Padding(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage < _slides.length - 1) {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      context.go('/auth/role-selection');
                    }
                  },
                  child: Text(
                    _currentPage < _slides.length - 1 ? 'Next' : 'Get Started',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2.3 Role Selection (U03)
```dart
// lib/features/auth/screens/role_selection_screen.dart
class RoleSelectionScreen extends StatelessWidget {
  final List<UserRole> _roles = [
    UserRole(
      title: 'Student',
      subtitle: 'Get expert help with your academic projects',
      icon: Icons.school_outlined,
      route: '/auth/signup/student',
    ),
    UserRole(
      title: 'Job Seeker',
      subtitle: 'Professional assistance for career growth',
      icon: Icons.work_outline,
      route: '/auth/signup/professional',
    ),
    UserRole(
      title: 'Business / Creator',
      subtitle: 'Scale your business with expert support',
      icon: Icons.business_outlined,
      route: '/auth/signup/professional',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose Your Role')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How will you use AssignX?',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Select the option that best describes you',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            Expanded(
              child: ListView.separated(
                itemCount: _roles.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) => RoleCard(
                  role: _roles[index],
                  onTap: () => context.push(_roles[index].route),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Role Card Widget
class RoleCard extends StatelessWidget {
  final UserRole role;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[200]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(role.icon, color: AppTheme.primaryColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    role.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    role.subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
```

### 2.4 Student Signup (U04) - Multi-Step Form
```dart
// lib/features/auth/screens/student_signup_screen.dart
class StudentSignupScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<StudentSignupScreen> createState() => _StudentSignupScreenState();
}

class _StudentSignupScreenState extends ConsumerState<StudentSignupScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Form data
  final _formKey = GlobalKey<FormBuilderState>();
  String? _fullName;
  DateTime? _dob;
  String? _universityId;
  String? _courseId;
  int? _semester;
  String? _studentId;
  String? _collegeEmail;
  String? _phone;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Sign Up'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_currentStep + 1) / 3,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation(AppTheme.primaryColor),
          ),
        ),
      ),
      body: FormBuilder(
        key: _formKey,
        child: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            // Step 1: Basic Info
            _buildStep1(),
            // Step 2: Academic Info
            _buildStep2(),
            // Step 3: Verification
            _buildStep3(),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Basic Information', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),

          FormBuilderTextField(
            name: 'full_name',
            decoration: const InputDecoration(
              labelText: 'Full Name',
              hintText: 'Enter your full name',
            ),
            validator: FormBuilderValidators.required(),
            onChanged: (value) => _fullName = value,
          ),
          const SizedBox(height: 16),

          FormBuilderDateTimePicker(
            name: 'dob',
            inputType: InputType.date,
            decoration: const InputDecoration(
              labelText: 'Date of Birth',
              suffixIcon: Icon(Icons.calendar_today),
            ),
            validator: FormBuilderValidators.required(),
            onChanged: (value) => _dob = value,
          ),
          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _goToStep2,
              child: const Text('Continue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    final universities = ref.watch(universitiesProvider);
    final courses = ref.watch(coursesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Academic Information', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),

          // University Dropdown
          universities.when(
            data: (data) => FormBuilderDropdown<String>(
              name: 'university',
              decoration: const InputDecoration(labelText: 'University'),
              items: data.map((u) => DropdownMenuItem(
                value: u.id,
                child: Text(u.name),
              )).toList(),
              validator: FormBuilderValidators.required(),
              onChanged: (value) => _universityId = value,
            ),
            loading: () => const ShimmerLoader(),
            error: (_, __) => const Text('Error loading universities'),
          ),
          const SizedBox(height: 16),

          // Course Dropdown
          courses.when(
            data: (data) => FormBuilderDropdown<String>(
              name: 'course',
              decoration: const InputDecoration(labelText: 'Course'),
              items: data.map((c) => DropdownMenuItem(
                value: c.id,
                child: Text(c.name),
              )).toList(),
              validator: FormBuilderValidators.required(),
              onChanged: (value) => _courseId = value,
            ),
            loading: () => const ShimmerLoader(),
            error: (_, __) => const Text('Error loading courses'),
          ),
          const SizedBox(height: 16),

          // Semester
          FormBuilderDropdown<int>(
            name: 'semester',
            decoration: const InputDecoration(labelText: 'Semester'),
            items: List.generate(12, (i) => DropdownMenuItem(
              value: i + 1,
              child: Text('Semester ${i + 1}'),
            )),
            validator: FormBuilderValidators.required(),
            onChanged: (value) => _semester = value,
          ),
          const SizedBox(height: 16),

          // Student ID
          FormBuilderTextField(
            name: 'student_id',
            decoration: const InputDecoration(
              labelText: 'Student ID (Optional)',
              hintText: 'Your university roll number',
            ),
            onChanged: (value) => _studentId = value,
          ),
          const SizedBox(height: 32),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  ),
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: _goToStep3,
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Verification', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),

          // College Email
          FormBuilderTextField(
            name: 'college_email',
            decoration: const InputDecoration(
              labelText: 'College Email',
              hintText: 'yourname@college.edu',
            ),
            keyboardType: TextInputType.emailAddress,
            validator: FormBuilderValidators.compose([
              FormBuilderValidators.required(),
              FormBuilderValidators.email(),
              (value) {
                if (value != null && !value.contains('.edu') && !value.contains('.ac')) {
                  return 'Please enter a valid college email (.edu or .ac)';
                }
                return null;
              },
            ]),
            onChanged: (value) => _collegeEmail = value,
          ),
          const SizedBox(height: 16),

          // Phone
          FormBuilderTextField(
            name: 'phone',
            decoration: const InputDecoration(
              labelText: 'Mobile Number',
              hintText: '9876543210',
              prefixText: '+91 ',
            ),
            keyboardType: TextInputType.phone,
            validator: FormBuilderValidators.compose([
              FormBuilderValidators.required(),
              FormBuilderValidators.numeric(),
              FormBuilderValidators.minLength(10),
              FormBuilderValidators.maxLength(10),
            ]),
            onChanged: (value) => _phone = value,
          ),
          const SizedBox(height: 16),

          // Terms
          FormBuilderCheckbox(
            name: 'terms',
            title: RichText(
              text: TextSpan(
                style: Theme.of(context).textTheme.bodySmall,
                children: [
                  const TextSpan(text: 'I agree to the '),
                  TextSpan(
                    text: 'Terms of Service',
                    style: TextStyle(color: AppTheme.primaryColor),
                  ),
                  const TextSpan(text: ' and '),
                  TextSpan(
                    text: 'Privacy Policy',
                    style: TextStyle(color: AppTheme.primaryColor),
                  ),
                ],
              ),
            ),
            validator: FormBuilderValidators.equal(
              true,
              errorText: 'You must accept the terms',
            ),
          ),
          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _sendOTP,
              child: const Text('Send OTP'),
            ),
          ),
        ],
      ),
    );
  }

  void _goToStep2() {
    if (_formKey.currentState?.fields['full_name']?.validate() ?? false) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep = 1);
    }
  }

  void _goToStep3() {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
    setState(() => _currentStep = 2);
  }

  Future<void> _sendOTP() async {
    if (_formKey.currentState?.saveAndValidate() ?? false) {
      // Send OTP and navigate to verification screen
      context.push('/auth/otp-verification', extra: {
        'phone': _phone,
        'formData': _formKey.currentState?.value,
      });
    }
  }
}
```

### 2.5 OTP Verification Screen
```dart
// lib/features/auth/screens/otp_verification_screen.dart
class OTPVerificationScreen extends ConsumerStatefulWidget {
  final String phone;
  final Map<String, dynamic> formData;

  @override
  ConsumerState<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends ConsumerState<OTPVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  int _resendTimer = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter verification code',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'We sent a 6-digit code to +91 ${widget.phone}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // OTP Input Fields
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (index) => SizedBox(
                width: 48,
                child: TextField(
                  controller: _controllers[index],
                  focusNode: _focusNodes[index],
                  textAlign: TextAlign.center,
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  decoration: InputDecoration(
                    counterText: '',
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty && index < 5) {
                      _focusNodes[index + 1].requestFocus();
                    }
                    if (value.isEmpty && index > 0) {
                      _focusNodes[index - 1].requestFocus();
                    }
                    _checkOTP();
                  },
                ),
              )),
            ),
            const SizedBox(height: 24),

            // Resend
            Center(
              child: _resendTimer > 0
                  ? Text('Resend code in ${_resendTimer}s')
                  : TextButton(
                      onPressed: _resendOTP,
                      child: const Text('Resend Code'),
                    ),
            ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _verifyOTP,
                child: const Text('Verify & Continue'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String get _otp => _controllers.map((c) => c.text).join();

  void _checkOTP() {
    if (_otp.length == 6) {
      _verifyOTP();
    }
  }

  Future<void> _verifyOTP() async {
    if (_otp.length != 6) return;

    try {
      // Verify with Supabase
      await ref.read(authProvider.notifier).verifyOTP(
        phone: widget.phone,
        otp: _otp,
      );

      // Create user profile
      await ref.read(authProvider.notifier).createUserProfile(widget.formData);

      // Navigate to success/dashboard
      _showSuccessAnimation();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP: $e')),
      );
    }
  }

  void _showSuccessAnimation() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => SuccessDialog(
        title: 'Welcome to AssignX!',
        message: 'Your account has been created successfully',
        onComplete: () => context.go('/dashboard'),
      ),
    );
  }
}
```

### Widgets to Create for Batch 2
```
lib/features/
├── splash/
│   └── splash_screen.dart
├── onboarding/
│   ├── onboarding_screen.dart
│   └── widgets/
│       └── onboarding_slide.dart
├── auth/
│   ├── screens/
│   │   ├── role_selection_screen.dart
│   │   ├── student_signup_screen.dart
│   │   ├── professional_signup_screen.dart
│   │   └── otp_verification_screen.dart
│   └── widgets/
│       ├── role_card.dart
│       ├── social_login_buttons.dart
│       └── otp_input.dart

lib/shared/widgets/
├── dialogs/
│   └── success_dialog.dart
├── loaders/
│   └── shimmer_loader.dart
```

---

## Batch 3: Home Dashboard

### Priority: Critical | Features: U12-U23 (12 features)

### 3.1 Dashboard Screen
```dart
// lib/features/dashboard/screens/dashboard_screen.dart
class DashboardScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final banners = ref.watch(bannersProvider);

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header with greeting and wallet
            SliverToBoxAdapter(
              child: DashboardHeader(user: user),
            ),

            // Banner Carousel
            SliverToBoxAdapter(
              child: banners.when(
                data: (data) => BannerCarousel(banners: data),
                loading: () => const BannerShimmer(),
                error: (_, __) => const SizedBox(),
              ),
            ),

            // Services Grid
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ServicesGrid(),
              ),
            ),

            // Campus Pulse
            SliverToBoxAdapter(
              child: CampusPulseSection(),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 3.2 Dashboard Header (U12-U14)
```dart
// lib/features/dashboard/widgets/dashboard_header.dart
class DashboardHeader extends StatelessWidget {
  final UserModel? user;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Greeting
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hi, ${user?.fullName?.split(' ').first ?? 'there'} 👋',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (user?.universityName != null)
                  Text(
                    '${user!.universityName} • Sem ${user!.semester}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
              ],
            ),
          ),

          // Wallet Pill
          WalletPill(balance: user?.walletBalance ?? 0),

          const SizedBox(width: 12),

          // Notification Bell
          NotificationBell(),
        ],
      ),
    );
  }
}
```

### 3.3 Wallet Pill (U13)
```dart
// lib/features/dashboard/widgets/wallet_pill.dart
class WalletPill extends StatelessWidget {
  final double balance;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showTopUpSheet(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.account_balance_wallet_outlined, size: 18),
            const SizedBox(width: 6),
            Text(
              '₹${balance.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  void _showTopUpSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const TopUpSheet(),
    );
  }
}
```

### 3.4 Services Grid (U16)
```dart
// lib/features/dashboard/widgets/services_grid.dart
class ServicesGrid extends StatelessWidget {
  final List<ServiceItem> _services = [
    ServiceItem(
      title: 'Project Support',
      icon: Icons.edit_document,
      color: Colors.blue,
      route: '/add-project/new',
    ),
    ServiceItem(
      title: 'AI/Plag Report',
      icon: Icons.search,
      color: Colors.purple,
      route: '/add-project/report',
    ),
    ServiceItem(
      title: 'Consult Doctor',
      icon: Icons.medical_services_outlined,
      color: Colors.green,
      route: null, // Placeholder
      isDisabled: true,
    ),
    ServiceItem(
      title: 'Ref. Generator',
      icon: Icons.library_books_outlined,
      color: Colors.orange,
      route: '/tools/reference-generator',
      badge: 'FREE',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Services',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
          ),
          itemCount: _services.length,
          itemBuilder: (context, index) => ServiceCard(
            service: _services[index],
          ),
        ),
      ],
    );
  }
}
```

### 3.5 Bottom Navigation (U18)
```dart
// lib/shared/widgets/common/bottom_nav.dart
class MainBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'Home',
                isActive: currentIndex == 0,
                onTap: () => onTap(0),
              ),
              _NavItem(
                icon: Icons.folder_outlined,
                activeIcon: Icons.folder,
                label: 'Projects',
                isActive: currentIndex == 1,
                onTap: () => onTap(1),
              ),

              // Central FAB
              GestureDetector(
                onTap: () => _showUploadSheet(context),
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.4),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.add, color: Colors.white, size: 28),
                ),
              ),

              _NavItem(
                icon: Icons.people_outline,
                activeIcon: Icons.people,
                label: 'Connect',
                isActive: currentIndex == 2,
                onTap: () => onTap(2),
              ),
              _NavItem(
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: 'Profile',
                isActive: currentIndex == 3,
                onTap: () => onTap(3),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUploadSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const UploadSheet(),
    );
  }
}
```

### Widgets to Create for Batch 3
```
lib/features/dashboard/
├── screens/
│   └── dashboard_screen.dart
└── widgets/
    ├── dashboard_header.dart
    ├── wallet_pill.dart
    ├── notification_bell.dart
    ├── banner_carousel.dart
    ├── services_grid.dart
    ├── service_card.dart
    ├── campus_pulse_section.dart
    ├── campus_pulse_card.dart
    └── upload_sheet.dart

lib/shared/widgets/common/
├── bottom_nav.dart
└── main_shell.dart
```

---

## Batch 4-10: Summary

Due to document length, here's a summary of remaining batches. Each follows the same detailed pattern as above.

### Batch 4: My Projects Module (U24-U41)
**Key Widgets:**
- `MyProjectsScreen` with TabBar
- `ProjectCard` with status badge
- `PaymentPromptModal`
- `AutoApprovalTimer`
- `RevisionRequestSheet`
- `ProjectTimeline`

### Batch 5: Project Detail Page (U42-U55)
**Key Widgets:**
- `ProjectDetailScreen`
- `DeadlineCountdown`
- `LiveDraftViewer` (WebView)
- `ProjectBriefAccordion`
- `DeliverablesSection`
- `QualityReportBadge`
- `FloatingChatButton`

### Batch 6: Add Project Module (U56-U72)
**Key Widgets:**
- `ServiceSelectionSheet`
- `NewProjectForm` (multi-step)
- `ProofreadingForm`
- `ReportRequestForm`
- `ExpertOpinionForm`
- `FilePickerWidget`
- `DeadlinePicker`

### Batch 7: Student Connect / Marketplace (U73-U85)
**Key Widgets:**
- `MarketplaceScreen` with MasonryGrid
- `ItemCard`, `TextCard`, `BannerCard`
- `FilterBar`
- `CreateListingSheet`
- `SellItemForm`, `OpportunityForm`

### Batch 8: Profile & Settings (U86-U100)
**Key Widgets:**
- `ProfileScreen` with hero section
- `WalletSection`
- `TransactionHistory`
- `PersonalDetailsForm`
- `PaymentMethodsManager`
- `HelpSupportSection`
- `ReferralCodeCard`

### Batch 9: Cross-Platform Features
**Key Implementations:**
- Chat with Supabase Realtime
- Razorpay payment integration
- FCM push notifications
- File upload with Supabase Storage

### Batch 10: Testing & Polish
- Unit tests with mocktail
- Widget tests
- Integration tests
- Performance optimization

---

## Implementation Checklist

### Batch 1: Setup ⬜
- [ ] Create folder structure
- [ ] Add all dependencies
- [ ] Configure theme
- [ ] Setup GoRouter
- [ ] Setup Riverpod
- [ ] Configure Supabase

### Batch 2: Auth ⬜
- [ ] Splash screen with Rive animation
- [ ] Onboarding carousel
- [ ] Role selection screen
- [ ] Student signup (3 steps)
- [ ] Professional signup
- [ ] OTP verification
- [ ] Success animation

### Batch 3: Dashboard ⬜
- [ ] Dashboard header
- [ ] Wallet pill
- [ ] Notification bell
- [ ] Banner carousel
- [ ] Services grid
- [ ] Campus pulse section
- [ ] Bottom navigation with FAB
- [ ] Upload sheet

### Batch 4: Projects ⬜
- [ ] My Projects screen with tabs
- [ ] Project cards
- [ ] Status badge system
- [ ] Payment prompt modal
- [ ] Auto-approval timer
- [ ] Revision request
- [ ] Timeline view

### Batch 5: Project Detail ⬜
- [ ] Project detail screen
- [ ] Deadline countdown
- [ ] Live draft viewer
- [ ] Brief accordion
- [ ] Deliverables section
- [ ] Quality badges
- [ ] Chat integration

### Batch 6: Add Project ⬜
- [ ] Service selection
- [ ] New project form
- [ ] Proofreading form
- [ ] Report request form
- [ ] Expert opinion form
- [ ] File picker
- [ ] Success dialog

### Batch 7: Marketplace ⬜
- [ ] Masonry grid layout
- [ ] Item/Text/Banner cards
- [ ] Filter bar
- [ ] Create listing flow

### Batch 8: Profile ⬜
- [ ] Profile hero section
- [ ] Wallet & transactions
- [ ] Personal details
- [ ] Payment methods
- [ ] Help & support
- [ ] Referral code

### Batch 9: Cross-Platform ⬜
- [ ] Real-time chat
- [ ] Razorpay integration
- [ ] Push notifications
- [ ] File management

### Batch 10: Testing ⬜
- [ ] Unit tests
- [ ] Widget tests
- [ ] Integration tests
- [ ] Performance optimization

---

*Document Generated: December 2025*
*Project: AssignX User App (Flutter)*
*State Management: Riverpod*
