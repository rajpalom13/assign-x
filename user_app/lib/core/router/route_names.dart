/// Route path constants for the app.
///
/// Centralized route definitions for type-safe navigation.
class RouteNames {
  RouteNames._();

  // Splash & Onboarding
  static const String splash = '/';
  static const String onboarding = '/onboarding';

  // Auth
  static const String login = '/login';
  static const String signin = '/signin';
  static const String roleSelection = '/role-selection';
  static const String studentProfile = '/student-profile';
  static const String professionalProfile = '/professional-profile';
  static const String signupSuccess = '/signup-success';

  // Main App
  static const String home = '/home';
  static const String myProjects = '/my-projects';
  static const String projectDetail = '/projects/:id';
  static const String addProject = '/add-project';
  static const String marketplace = '/marketplace';
  static const String profile = '/profile';

  // Profile Sub-routes (aligned with actual router paths)
  static const String editProfile = '/profile/edit';
  static const String wallet = '/wallet';
  static const String paymentMethods = '/profile/payment-methods';
  static const String helpSupport = '/profile/help';

  // Notifications
  static const String notifications = '/notifications';

  /// Get project detail route with ID.
  static String projectDetailPath(String id) => '/projects/$id';

  /// Get project timeline route with ID.
  static String projectTimelinePath(String id) => '/projects/$id/timeline';

  /// Get project chat route with ID.
  static String projectChatPath(String id) => '/projects/$id/chat';

  /// Get project draft route with ID.
  static String projectDraftPath(String id) => '/projects/$id/draft';

  /// Get project payment route with ID.
  static String projectPayPath(String id) => '/projects/$id/pay';

  /// Get marketplace item detail route with ID.
  static String listingDetailPath(String id) => '/marketplace/$id';
}
