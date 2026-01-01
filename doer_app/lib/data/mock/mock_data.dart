/// Barrel file for mock data used in development and testing.
///
/// This module provides centralized access to all mock data classes used
/// throughout the DOER application during development, testing, and when
/// the backend API is unavailable.
///
/// ## Purpose
///
/// Mock data serves several important purposes:
/// - **Development**: Allows UI development without backend dependency
/// - **Testing**: Provides consistent test fixtures for unit and widget tests
/// - **Demos**: Enables product demonstrations without live data
/// - **Offline Mode**: Supports graceful degradation when offline
///
/// ## Available Mock Data Classes
///
/// - [MockActivationData] - Training modules and quiz questions for onboarding
/// - [MockDashboardData] - Projects, statistics, and reviews for dashboard
/// - [MockProfileData] - User profiles, payments, and notifications
/// - [MockResourcesData] - Training content and AI check simulations
///
/// ## Usage
///
/// Import this barrel file to access all mock data:
/// ```dart
/// import 'package:doer_app/data/mock/mock_data.dart';
///
/// // Use in development/testing
/// final projects = MockDashboardData.getAssignedProjects();
/// final profile = MockProfileData.getProfile();
/// final quizQuestions = MockActivationData.getQuizQuestions();
/// ```
///
/// ## Production Warning
///
/// **Important**: Mock data should only be used in development and testing.
/// Production builds must use the corresponding repository classes:
/// - [AuthRepository] for authentication
/// - DashboardRepository for dashboard data (planned)
/// - ProfileRepository for profile data (planned)
/// - ResourcesRepository for resources data (planned)
///
/// ## Best Practices
///
/// 1. Use environment checks to prevent mock data in production
/// 2. Keep mock data realistic and representative
/// 3. Update mock data when models change
/// 4. Use mock data for edge case testing
///
/// See also:
/// - `lib/data/repositories/` for production data access
/// - `lib/data/models/` for data model definitions
library;

export 'mock_activation_data.dart';
export 'mock_dashboard_data.dart';
export 'mock_profile_data.dart';
export 'mock_resources_data.dart';
