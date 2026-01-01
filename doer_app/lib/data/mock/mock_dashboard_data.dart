import '../models/project_model.dart';

/// Mock data for dashboard development and testing.
///
/// Provides realistic sample data for the dashboard feature when the backend
/// is unavailable or during development. This class contains static methods
/// that return pre-configured mock objects representing various dashboard
/// entities.
///
/// ## Data Categories
///
/// The dashboard mock data includes:
/// - **Assigned Projects**: Projects currently assigned to the doer
/// - **Open Pool Projects**: Available projects in the marketplace
/// - **Doer Statistics**: Performance metrics and earnings
/// - **Reviews**: Feedback received from completed projects
///
/// ## Usage
///
/// ```dart
/// import 'package:doer_app/data/mock/mock_data.dart';
///
/// // Get assigned projects for dashboard
/// final assignedProjects = MockDashboardData.getAssignedProjects();
///
/// // Get projects available in the pool
/// final poolProjects = MockDashboardData.getOpenPoolProjects();
///
/// // Get doer performance statistics
/// final stats = MockDashboardData.getStats();
///
/// // Get review history
/// final reviews = MockDashboardData.getReviews();
/// ```
///
/// ## Data Characteristics
///
/// The mock data is designed to demonstrate various UI states:
/// - Projects with different urgency levels (normal, high, urgent)
/// - Projects with varying statuses (open, assigned, in progress)
/// - Deadlines ranging from hours to days
/// - Different subject areas and price points
///
/// ## Note
///
/// This data should only be used in development and testing environments.
/// For production, use the DashboardRepository (planned) with actual API calls.
///
/// See also:
/// - [ProjectModel] for project data structure
/// - [DoerStats] for statistics structure
/// - [ReviewModel] for review data structure
class MockDashboardData {
  /// Private constructor to prevent instantiation.
  ///
  /// This class only contains static methods and should not be instantiated.
  MockDashboardData._();

  /// Generates a list of projects currently assigned to the doer.
  ///
  /// Returns a list of [ProjectModel] objects representing projects that have
  /// been accepted by the doer and are either in progress or recently assigned.
  ///
  /// The mock data includes:
  /// - 2 assigned projects with different characteristics
  /// - Various urgency levels (normal, high)
  /// - Different subject areas (Computer Science, Business)
  /// - Deadlines ranging from 12 to 48 hours
  ///
  /// Returns a [List<ProjectModel>] containing 2 mock assigned projects.
  ///
  /// Example:
  /// ```dart
  /// final projects = MockDashboardData.getAssignedProjects();
  /// for (final project in projects) {
  ///   print('${project.title} - Due: ${project.deadline}');
  /// }
  /// ```
  static List<ProjectModel> getAssignedProjects() {
    final now = DateTime.now();
    return [
      ProjectModel(
        id: '1',
        title: 'Research Paper on Machine Learning',
        description: 'Write a comprehensive research paper on ML algorithms',
        subject: 'Computer Science',
        status: ProjectStatus.inProgress,
        urgency: ProjectUrgency.normal,
        price: 1500,
        deadline: now.add(const Duration(hours: 48)),
        createdAt: now.subtract(const Duration(days: 2)),
        acceptedAt: now.subtract(const Duration(days: 1)),
        supervisorName: 'John Smith',
        wordCount: 3000,
        referenceStyle: 'APA',
        requirements: [
          'Original content',
          'Include 10 references',
          'Plagiarism free'
        ],
      ),
      ProjectModel(
        id: '2',
        title: 'Business Case Study Analysis',
        description:
            'Analyze the given business case and provide recommendations',
        subject: 'Business',
        status: ProjectStatus.assigned,
        urgency: ProjectUrgency.high,
        price: 800,
        deadline: now.add(const Duration(hours: 12)),
        createdAt: now.subtract(const Duration(hours: 6)),
        acceptedAt: now.subtract(const Duration(hours: 2)),
        supervisorName: 'Sarah Johnson',
        wordCount: 1500,
      ),
    ];
  }

  /// Generates a list of projects available in the open pool.
  ///
  /// Returns a list of [ProjectModel] objects representing projects that are
  /// available for doers to accept from the project marketplace.
  ///
  /// The mock data includes:
  /// - 4 open projects demonstrating variety
  /// - All urgency levels (normal, high, urgent)
  /// - Various subject areas (Environmental Science, Programming, Psychology, Marketing)
  /// - Deadlines ranging from 4 hours to 5 days
  /// - Price range from 600 to 2000
  ///
  /// Returns a [List<ProjectModel>] containing 4 mock open projects.
  ///
  /// Example:
  /// ```dart
  /// final openProjects = MockDashboardData.getOpenPoolProjects();
  /// final urgentProjects = openProjects.where(
  ///   (p) => p.urgency == ProjectUrgency.urgent,
  /// );
  /// ```
  static List<ProjectModel> getOpenPoolProjects() {
    final now = DateTime.now();
    return [
      ProjectModel(
        id: '3',
        title: 'Essay on Climate Change',
        description: 'Write an argumentative essay on climate change policies',
        subject: 'Environmental Science',
        status: ProjectStatus.open,
        urgency: ProjectUrgency.urgent,
        price: 600,
        deadline: now.add(const Duration(hours: 4)),
        createdAt: now.subtract(const Duration(hours: 2)),
        wordCount: 1000,
        referenceStyle: 'Harvard',
      ),
      ProjectModel(
        id: '4',
        title: 'Python Programming Assignment',
        description: 'Complete the given Python coding exercises',
        subject: 'Programming',
        status: ProjectStatus.open,
        urgency: ProjectUrgency.normal,
        price: 1200,
        deadline: now.add(const Duration(days: 3)),
        createdAt: now.subtract(const Duration(hours: 12)),
      ),
      ProjectModel(
        id: '5',
        title: 'Literature Review - Psychology',
        description:
            'Write a literature review on cognitive behavioral therapy',
        subject: 'Psychology',
        status: ProjectStatus.open,
        urgency: ProjectUrgency.normal,
        price: 2000,
        deadline: now.add(const Duration(days: 5)),
        createdAt: now.subtract(const Duration(days: 1)),
        wordCount: 4000,
        referenceStyle: 'APA',
      ),
      ProjectModel(
        id: '6',
        title: 'Marketing Plan Presentation',
        description: 'Create a comprehensive marketing plan presentation',
        subject: 'Marketing',
        status: ProjectStatus.open,
        urgency: ProjectUrgency.high,
        price: 900,
        deadline: now.add(const Duration(hours: 18)),
        createdAt: now.subtract(const Duration(hours: 4)),
      ),
    ];
  }

  /// Generates mock performance statistics for the doer.
  ///
  /// Returns a [DoerStats] object containing aggregate performance metrics
  /// that would typically be displayed on the dashboard.
  ///
  /// The mock statistics include:
  /// - **activeProjects**: 2 (currently working on)
  /// - **completedProjects**: 47 (historical count)
  /// - **totalEarnings**: 58,500.0 (cumulative earnings)
  /// - **rating**: 4.7 (out of 5.0)
  /// - **successRate**: 96.5% (completed vs accepted)
  /// - **onTimeDeliveryRate**: 94.2% (on-time vs total)
  ///
  /// Returns a [DoerStats] object with mock performance data.
  ///
  /// Example:
  /// ```dart
  /// final stats = MockDashboardData.getStats();
  /// print('Rating: ${stats.rating}/5.0');
  /// print('Earnings: Rs. ${stats.totalEarnings}');
  /// ```
  static DoerStats getStats() {
    return const DoerStats(
      activeProjects: 2,
      completedProjects: 47,
      totalEarnings: 58500.0,
      rating: 4.7,
      successRate: 96.5,
      onTimeDeliveryRate: 94.2,
    );
  }

  /// Generates a list of mock reviews received by the doer.
  ///
  /// Returns a list of [ReviewModel] objects representing feedback from
  /// supervisors on completed projects. Reviews demonstrate various ratings
  /// and comment styles.
  ///
  /// The mock data includes:
  /// - 4 reviews spanning the past 15 days
  /// - Ratings ranging from 4.0 to 5.0
  /// - Various project types (Data Analysis, Essay, Research, Case Study)
  /// - Different comment lengths and tones
  ///
  /// Returns a [List<ReviewModel>] containing 4 mock reviews.
  ///
  /// Example:
  /// ```dart
  /// final reviews = MockDashboardData.getReviews();
  /// final avgRating = reviews.map((r) => r.rating).reduce((a, b) => a + b) / reviews.length;
  /// print('Average rating: $avgRating');
  /// ```
  static List<ReviewModel> getReviews() {
    final now = DateTime.now();
    return [
      ReviewModel(
        id: '1',
        projectId: '101',
        projectTitle: 'Data Analysis Project',
        reviewerName: 'Admin',
        rating: 5.0,
        comment: 'Excellent work! Delivered on time with great quality.',
        createdAt: now.subtract(const Duration(days: 2)),
      ),
      ReviewModel(
        id: '2',
        projectId: '102',
        projectTitle: 'Essay Writing',
        reviewerName: 'Admin',
        rating: 4.5,
        comment: 'Good quality work. Minor improvements needed.',
        createdAt: now.subtract(const Duration(days: 5)),
      ),
      ReviewModel(
        id: '3',
        projectId: '103',
        projectTitle: 'Research Paper',
        reviewerName: 'Admin',
        rating: 5.0,
        comment: 'Outstanding research and well-structured content.',
        createdAt: now.subtract(const Duration(days: 10)),
      ),
      ReviewModel(
        id: '4',
        projectId: '104',
        projectTitle: 'Case Study',
        reviewerName: 'Admin',
        rating: 4.0,
        comment: 'Good analysis. References could be more recent.',
        createdAt: now.subtract(const Duration(days: 15)),
      ),
    ];
  }
}
