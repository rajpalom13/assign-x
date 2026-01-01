import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/add_project/screens/expert_opinion_form.dart';
import '../../features/add_project/screens/new_project_form.dart';
import '../../features/add_project/screens/proofreading_form.dart';
import '../../features/add_project/screens/report_request_form.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/chat/screens/project_chat_screen.dart';
import '../../features/home/screens/main_shell.dart';
import '../../features/marketplace/screens/create_listing_screen.dart';
import '../../features/marketplace/screens/item_detail_screen.dart';
import '../../features/marketplace/screens/marketplace_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/onboarding/screens/professional_profile_screen.dart';
import '../../features/onboarding/screens/role_selection_screen.dart';
import '../../features/onboarding/screens/signup_success_screen.dart';
import '../../features/onboarding/screens/student_profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/profile/screens/help_support_screen.dart';
import '../../features/profile/screens/payment_methods_screen.dart';
import '../../features/profile/screens/wallet_screen.dart';
import '../../features/projects/screens/live_draft_webview.dart';
import '../../features/projects/screens/project_detail_screen.dart';
import '../../features/projects/screens/project_timeline_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../providers/auth_provider.dart';
import 'route_names.dart';

/// Global navigator key for navigation without context.
final rootNavigatorKey = GlobalKey<NavigatorState>();

/// App router provider with auth-based redirects.
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: RouteNames.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoading = authState.isLoading;
      final isAuthenticated = authState.valueOrNull?.isAuthenticated ?? false;
      final hasProfile = authState.valueOrNull?.hasProfile ?? false;
      final currentPath = state.matchedLocation;

      // Don't redirect while loading or on splash screen
      if (isLoading || currentPath == RouteNames.splash) {
        return null;
      }

      // Public routes that don't require auth
      final publicRoutes = [
        RouteNames.onboarding,
        RouteNames.login,
      ];

      // Profile completion routes
      final profileRoutes = [
        RouteNames.roleSelection,
        RouteNames.studentProfile,
        RouteNames.professionalProfile,
        RouteNames.signupSuccess,
      ];

      // If not authenticated and not on public route, go to onboarding
      if (!isAuthenticated) {
        if (!publicRoutes.contains(currentPath)) {
          return RouteNames.onboarding;
        }
        return null;
      }

      // If authenticated but no profile, go to role selection
      if (isAuthenticated && !hasProfile) {
        if (!profileRoutes.contains(currentPath)) {
          return RouteNames.roleSelection;
        }
        return null;
      }

      // If authenticated with profile and on auth routes, go to home
      if (isAuthenticated && hasProfile) {
        if (publicRoutes.contains(currentPath) || profileRoutes.contains(currentPath)) {
          return RouteNames.home;
        }
        return null;
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: RouteNames.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Onboarding
      GoRoute(
        path: RouteNames.onboarding,
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Auth
      GoRoute(
        path: RouteNames.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Role Selection
      GoRoute(
        path: RouteNames.roleSelection,
        name: 'roleSelection',
        builder: (context, state) => const RoleSelectionScreen(),
      ),

      // Student Profile
      GoRoute(
        path: RouteNames.studentProfile,
        name: 'studentProfile',
        builder: (context, state) => const StudentProfileScreen(),
      ),

      // Professional Profile
      GoRoute(
        path: RouteNames.professionalProfile,
        name: 'professionalProfile',
        builder: (context, state) => const ProfessionalProfileScreen(),
      ),

      // Signup Success
      GoRoute(
        path: RouteNames.signupSuccess,
        name: 'signupSuccess',
        builder: (context, state) => const SignupSuccessScreen(),
      ),

      // Main App Shell (Home with bottom nav)
      GoRoute(
        path: RouteNames.home,
        name: 'home',
        builder: (context, state) => const MainShell(),
      ),

      // Add Project routes
      GoRoute(
        path: '/add-project/new',
        name: 'addProjectNew',
        builder: (context, state) => const NewProjectForm(),
      ),
      GoRoute(
        path: '/add-project/proofread',
        name: 'addProjectProofread',
        builder: (context, state) => const ProofreadingForm(),
      ),
      GoRoute(
        path: '/add-project/report',
        name: 'addProjectReport',
        builder: (context, state) => const ReportRequestForm(),
      ),
      GoRoute(
        path: '/add-project/expert',
        name: 'addProjectExpert',
        builder: (context, state) => const ExpertOpinionForm(),
      ),

      // Marketplace
      GoRoute(
        path: '/marketplace',
        name: 'marketplace',
        builder: (context, state) => const MarketplaceScreen(),
        routes: [
          GoRoute(
            path: 'create',
            name: 'createListing',
            builder: (context, state) => const CreateListingScreen(),
          ),
          GoRoute(
            path: ':id',
            name: 'listingDetail',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ItemDetailScreen(listingId: id);
            },
          ),
        ],
      ),

      // Notifications
      GoRoute(
        path: '/notifications',
        name: 'notifications',
        builder: (context, state) => const Scaffold(
          appBar: null,
          body: Center(child: Text('Notifications - Coming in Batch 2')),
        ),
      ),

      // Wallet
      GoRoute(
        path: '/wallet',
        name: 'wallet',
        builder: (context, state) => const WalletScreen(),
      ),

      // Profile routes
      GoRoute(
        path: '/profile/edit',
        name: 'editProfile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/help',
        name: 'helpSupport',
        builder: (context, state) => const HelpSupportScreen(),
      ),
      GoRoute(
        path: '/profile/payment-methods',
        name: 'paymentMethods',
        builder: (context, state) => const PaymentMethodsScreen(),
      ),

      // Projects
      GoRoute(
        path: '/projects/:id',
        name: 'projectDetail',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ProjectDetailScreen(projectId: id);
        },
        routes: [
          GoRoute(
            path: 'pay',
            name: 'projectPay',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return Scaffold(
                appBar: AppBar(title: const Text('Payment')),
                body: Center(child: Text('Pay for Project $id - Coming soon')),
              );
            },
          ),
          GoRoute(
            path: 'timeline',
            name: 'projectTimeline',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ProjectTimelineScreen(projectId: id);
            },
          ),
          GoRoute(
            path: 'chat',
            name: 'projectChat',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ProjectChatScreen(projectId: id);
            },
          ),
          GoRoute(
            path: 'draft',
            name: 'projectDraft',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              // Get draft URL from query params or fetch from project
              final draftUrl = state.uri.queryParameters['url'];
              return LiveDraftWebview(projectId: id, draftUrl: draftUrl);
            },
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Route not found: ${state.matchedLocation}'),
      ),
    ),
  );
});
