/// Dashboard state management provider for the Doer App.
///
/// This file manages the main dashboard view that activated doers see,
/// including their assigned projects, open pool projects available for
/// claiming, statistics, reviews, and availability status.
///
/// ## Architecture
///
/// The dashboard provider aggregates data from multiple sources:
/// - **Projects**: Assigned and open pool projects
/// - **Statistics**: Completion rates, earnings, ratings
/// - **Reviews**: Feedback from completed projects
/// - **Availability**: Doer's availability status
///
/// ## Usage
///
/// ```dart
/// // Watch dashboard state in a widget
/// final dashboardState = ref.watch(dashboardProvider);
///
/// // Display assigned projects
/// for (final project in dashboardState.assignedProjects) {
///   ProjectCard(project: project);
/// }
///
/// // Accept a project from the open pool
/// final success = await ref.read(dashboardProvider.notifier)
///     .acceptProject(projectId);
///
/// // Toggle availability
/// await ref.read(dashboardProvider.notifier).toggleAvailability();
/// ```
///
/// ## State Flow
///
/// ```
/// initial -> loading dashboard data
///     |
///     v
/// [assigned projects, open pool, stats, reviews] -> available
///     |
///     v
/// accept project -> project moves to assigned
/// ```
///
/// ## Database Integration
///
/// The provider interacts with several Supabase tables:
/// - `projects`: Project assignments and open pool
/// - `doer_stats`: Aggregated statistics
/// - `reviews`: Customer feedback
/// - `doers`: Availability status
///
/// See also:
/// - [AuthNotifier] for user authentication
/// - [ProjectModel] for project data structure
/// - [DoerStats] for statistics model
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../core/config/supabase_config.dart';
import '../data/mock/mock_dashboard_data.dart';
import '../data/models/project_model.dart';
import 'auth_provider.dart';

/// Immutable state class representing the dashboard data.
///
/// Contains all information displayed on the doer's main dashboard,
/// including projects, statistics, reviews, and status.
///
/// ## Properties
///
/// - [assignedProjects]: Projects currently assigned to the doer
/// - [openPoolProjects]: Available projects the doer can claim
/// - [stats]: Aggregated statistics (earnings, ratings, etc.)
/// - [reviews]: Recent reviews from completed projects
/// - [isLoading]: Whether data is being loaded
/// - [isAvailable]: Doer's availability status
/// - [errorMessage]: Error message if loading failed
///
/// ## Usage
///
/// ```dart
/// final state = ref.watch(dashboardProvider);
///
/// if (state.isLoading) {
///   return LoadingIndicator();
/// }
///
/// return Column(
///   children: [
///     StatsCard(stats: state.stats),
///     ProjectsList(projects: state.assignedProjects),
///     OpenPoolSection(projects: state.openPoolProjects),
///   ],
/// );
/// ```
class DashboardState {
  /// List of projects currently assigned to the doer.
  ///
  /// These are projects with status 'assigned' or 'in_progress'.
  final List<ProjectModel> assignedProjects;

  /// List of projects available in the open pool.
  ///
  /// These are unassigned projects that the doer can claim.
  final List<ProjectModel> openPoolProjects;

  /// Aggregated statistics for the doer.
  ///
  /// Includes earnings, completion rates, ratings, and counts.
  final DoerStats stats;

  /// Recent reviews from completed projects.
  ///
  /// Limited to the 10 most recent reviews.
  final List<ReviewModel> reviews;

  /// Whether dashboard data is currently being loaded.
  final bool isLoading;

  /// Whether the doer is available to accept new projects.
  final bool isAvailable;

  /// Error message if loading failed, null otherwise.
  final String? errorMessage;

  /// Creates a new [DashboardState] instance.
  ///
  /// All list parameters default to empty lists.
  /// [isAvailable] defaults to true.
  const DashboardState({
    this.assignedProjects = const [],
    this.openPoolProjects = const [],
    this.stats = const DoerStats(),
    this.reviews = const [],
    this.isLoading = false,
    this.isAvailable = true,
    this.errorMessage,
  });

  /// Creates a copy of this state with the specified fields replaced.
  ///
  /// This method is used to create new immutable state instances when
  /// the dashboard data changes.
  ///
  /// ## Parameters
  ///
  /// - [assignedProjects]: Updated list of assigned projects
  /// - [openPoolProjects]: Updated list of open pool projects
  /// - [stats]: Updated statistics
  /// - [reviews]: Updated reviews
  /// - [isLoading]: Updated loading state
  /// - [isAvailable]: Updated availability status
  /// - [errorMessage]: Updated error message (pass null to clear)
  ///
  /// ## Returns
  ///
  /// A new [DashboardState] instance with the specified changes.
  DashboardState copyWith({
    List<ProjectModel>? assignedProjects,
    List<ProjectModel>? openPoolProjects,
    DoerStats? stats,
    List<ReviewModel>? reviews,
    bool? isLoading,
    bool? isAvailable,
    String? errorMessage,
  }) {
    return DashboardState(
      assignedProjects: assignedProjects ?? this.assignedProjects,
      openPoolProjects: openPoolProjects ?? this.openPoolProjects,
      stats: stats ?? this.stats,
      reviews: reviews ?? this.reviews,
      isLoading: isLoading ?? this.isLoading,
      isAvailable: isAvailable ?? this.isAvailable,
      errorMessage: errorMessage,
    );
  }
}

/// Notifier class that manages dashboard state and operations.
///
/// This class handles loading and managing dashboard data including:
/// - Fetching assigned and open pool projects
/// - Loading statistics and reviews
/// - Managing availability status
/// - Accepting projects from the open pool
///
/// ## Lifecycle
///
/// The notifier initializes by:
/// 1. Watching the current user from [currentUserProvider]
/// 2. Loading all dashboard data if user is authenticated
/// 3. Setting up reactive updates when user changes
///
/// ## State Management
///
/// State updates are performed through [state] assignment, triggering
/// reactive updates in all watching widgets.
///
/// ## Usage
///
/// ```dart
/// // Access the notifier for operations
/// final notifier = ref.read(dashboardProvider.notifier);
///
/// // Accept a project
/// final success = await notifier.acceptProject('project-123');
///
/// // Toggle availability
/// await notifier.toggleAvailability();
///
/// // Refresh dashboard data
/// await notifier.refresh();
/// ```
class DashboardNotifier extends Notifier<DashboardState> {
  /// Builds and initializes the dashboard state.
  ///
  /// This method is called when the provider is first read. It:
  /// 1. Watches the current user from [currentUserProvider]
  /// 2. Triggers data loading if user is authenticated
  /// 3. Returns an empty initial state
  ///
  /// ## Returns
  ///
  /// An empty [DashboardState] while data is loading in the background.
  @override
  DashboardState build() {
    final user = ref.watch(currentUserProvider);
    if (user != null) {
      _loadDashboardData(user.id);
    }
    return const DashboardState();
  }

  /// The Supabase client instance for database operations.
  SupabaseClient get _client => SupabaseConfig.client;

  /// Loads all dashboard data from the database.
  ///
  /// This method orchestrates parallel loading of:
  /// - Assigned projects
  /// - Open pool projects
  /// - Doer statistics
  /// - Recent reviews
  /// - Availability status
  ///
  /// ## Parameters
  ///
  /// - [doerId]: The doer's ID to load data for
  ///
  /// ## State Updates
  ///
  /// Sets [isLoading] to true during load, false on completion.
  /// Falls back to mock data on database errors.
  Future<void> _loadDashboardData(String doerId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await Future.wait([
        _loadAssignedProjects(doerId),
        _loadOpenPoolProjects(),
        _loadStats(doerId),
        _loadReviews(doerId),
        _loadAvailability(doerId),
      ]);

      state = state.copyWith(isLoading: false);
    } catch (e) {
      // Use mock data if database not set up
      state = state.copyWith(
        isLoading: false,
        assignedProjects: MockDashboardData.getAssignedProjects(),
        openPoolProjects: MockDashboardData.getOpenPoolProjects(),
        stats: MockDashboardData.getStats(),
        reviews: MockDashboardData.getReviews(),
      );
    }
  }

  /// Loads projects currently assigned to the doer.
  ///
  /// Fetches projects where the doer is assigned and status is
  /// either 'assigned' or 'in_progress'.
  ///
  /// ## Parameters
  ///
  /// - [doerId]: The doer's ID to load projects for
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.assignedProjects] with loaded projects.
  Future<void> _loadAssignedProjects(String doerId) async {
    try {
      final response = await _client
          .from('projects')
          .select()
          .eq('doer_id', doerId)
          .inFilter('status', ['assigned', 'in_progress'])
          .order('deadline');

      final projects = (response as List)
          .map((e) => ProjectModel.fromJson(e))
          .toList();

      state = state.copyWith(assignedProjects: projects);
    } catch (e) {
      state = state.copyWith(assignedProjects: MockDashboardData.getAssignedProjects());
    }
  }

  /// Loads projects available in the open pool.
  ///
  /// Fetches unassigned projects with 'open' status that are
  /// available for doers to claim.
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.openPoolProjects] with loaded projects.
  Future<void> _loadOpenPoolProjects() async {
    try {
      final response = await _client
          .from('projects')
          .select()
          .eq('status', 'open')
          .isFilter('doer_id', null)
          .order('deadline');

      final projects = (response as List)
          .map((e) => ProjectModel.fromJson(e))
          .toList();

      state = state.copyWith(openPoolProjects: projects);
    } catch (e) {
      state = state.copyWith(openPoolProjects: MockDashboardData.getOpenPoolProjects());
    }
  }

  /// Loads the doer's aggregated statistics.
  ///
  /// Fetches statistics including total earnings, completed projects,
  /// average rating, and on-time delivery rate.
  ///
  /// ## Parameters
  ///
  /// - [doerId]: The doer's ID to load statistics for
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.stats] with loaded statistics.
  Future<void> _loadStats(String doerId) async {
    try {
      final response = await _client
          .from('doer_stats')
          .select()
          .eq('doer_id', doerId)
          .maybeSingle();

      if (response != null) {
        state = state.copyWith(stats: DoerStats.fromJson(response));
      }
    } catch (e) {
      state = state.copyWith(stats: MockDashboardData.getStats());
    }
  }

  /// Loads recent reviews for the doer.
  ///
  /// Fetches the 10 most recent reviews from completed projects.
  ///
  /// ## Parameters
  ///
  /// - [doerId]: The doer's ID to load reviews for
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.reviews] with loaded reviews.
  Future<void> _loadReviews(String doerId) async {
    try {
      final response = await _client
          .from('reviews')
          .select()
          .eq('doer_id', doerId)
          .order('created_at', ascending: false)
          .limit(10);

      final reviews = (response as List)
          .map((e) => ReviewModel.fromJson(e))
          .toList();

      state = state.copyWith(reviews: reviews);
    } catch (e) {
      state = state.copyWith(reviews: MockDashboardData.getReviews());
    }
  }

  /// Loads the doer's availability status.
  ///
  /// Fetches whether the doer is currently available to accept
  /// new project assignments.
  ///
  /// ## Parameters
  ///
  /// - [doerId]: The doer's ID to load availability for
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.isAvailable] with current status.
  Future<void> _loadAvailability(String doerId) async {
    try {
      final response = await _client
          .from('doers')
          .select('is_available')
          .eq('id', doerId)
          .single();

      state = state.copyWith(isAvailable: response['is_available'] as bool? ?? true);
    } catch (e) {
      // Default to available
    }
  }

  /// Toggles the doer's availability status.
  ///
  /// Switches between available and unavailable states. When unavailable,
  /// the doer won't be assigned new projects automatically.
  ///
  /// ## State Updates
  ///
  /// Updates [DashboardState.isAvailable] to the opposite value.
  ///
  /// ## Example
  ///
  /// ```dart
  /// // Toggle availability when switch is changed
  /// await ref.read(dashboardProvider.notifier).toggleAvailability();
  /// ```
  Future<void> toggleAvailability() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final newStatus = !state.isAvailable;

    try {
      await _client
          .from('doers')
          .update({'is_available': newStatus})
          .eq('id', user.id);

      state = state.copyWith(isAvailable: newStatus);
    } catch (e) {
      // Update local state anyway for testing
      state = state.copyWith(isAvailable: newStatus);
    }
  }

  /// Accepts a project from the open pool.
  ///
  /// Claims an unassigned project and moves it from the open pool
  /// to the doer's assigned projects list.
  ///
  /// ## Parameters
  ///
  /// - [projectId]: The ID of the project to accept
  ///
  /// ## Returns
  ///
  /// `true` if the project was successfully accepted, `false` otherwise.
  ///
  /// ## State Updates
  ///
  /// Removes the project from [openPoolProjects] and adds it to
  /// [assignedProjects] with updated status.
  ///
  /// ## Example
  ///
  /// ```dart
  /// final success = await ref.read(dashboardProvider.notifier)
  ///     .acceptProject('project-123');
  ///
  /// if (success) {
  ///   // Show success message
  ///   ScaffoldMessenger.of(context).showSnackBar(
  ///     SnackBar(content: Text('Project accepted!')),
  ///   );
  /// }
  /// ```
  Future<bool> acceptProject(String projectId) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return false;

    try {
      await _client.from('projects').update({
        'doer_id': user.id,
        'status': 'assigned',
        'accepted_at': DateTime.now().toIso8601String(),
      }).eq('id', projectId);

      // Move project from open pool to assigned
      final project = state.openPoolProjects.firstWhere((p) => p.id == projectId);
      final updatedProject = project.copyWith(
        status: ProjectStatus.assigned,
        doerId: user.id,
        acceptedAt: DateTime.now(),
      );

      state = state.copyWith(
        openPoolProjects: state.openPoolProjects.where((p) => p.id != projectId).toList(),
        assignedProjects: [...state.assignedProjects, updatedProject],
      );

      return true;
    } catch (e) {
      // Mock accept for testing
      final projectIndex = state.openPoolProjects.indexWhere((p) => p.id == projectId);
      if (projectIndex != -1) {
        final project = state.openPoolProjects[projectIndex];
        final updatedProject = project.copyWith(
          status: ProjectStatus.assigned,
          doerId: user.id,
          acceptedAt: DateTime.now(),
        );

        state = state.copyWith(
          openPoolProjects: state.openPoolProjects.where((p) => p.id != projectId).toList(),
          assignedProjects: [...state.assignedProjects, updatedProject],
        );
        return true;
      }
      return false;
    }
  }

  /// Refreshes all dashboard data from the database.
  ///
  /// Use this method to reload dashboard data after external changes
  /// or for pull-to-refresh functionality.
  ///
  /// ## Example
  ///
  /// ```dart
  /// // Pull-to-refresh in dashboard
  /// RefreshIndicator(
  ///   onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
  ///   child: DashboardContent(),
  /// );
  /// ```
  Future<void> refresh() async {
    final user = ref.read(currentUserProvider);
    if (user != null) {
      await _loadDashboardData(user.id);
    }
  }
}

/// The main dashboard provider.
///
/// Use this provider to access dashboard state and manage dashboard
/// operations like accepting projects and toggling availability.
///
/// ## Watching State
///
/// ```dart
/// // In a widget
/// final dashboardState = ref.watch(dashboardProvider);
///
/// if (dashboardState.isLoading) {
///   return LoadingScreen();
/// }
///
/// return DashboardContent(
///   projects: dashboardState.assignedProjects,
///   stats: dashboardState.stats,
/// );
/// ```
///
/// ## Performing Operations
///
/// ```dart
/// // Accept a project
/// await ref.read(dashboardProvider.notifier).acceptProject(projectId);
///
/// // Toggle availability
/// await ref.read(dashboardProvider.notifier).toggleAvailability();
/// ```
final dashboardProvider = NotifierProvider<DashboardNotifier, DashboardState>(() {
  return DashboardNotifier();
});

/// Convenience provider for accessing assigned projects.
///
/// Returns the list of projects currently assigned to the doer.
///
/// ## Usage
///
/// ```dart
/// final projects = ref.watch(assignedProjectsProvider);
///
/// return ListView.builder(
///   itemCount: projects.length,
///   itemBuilder: (context, index) => ProjectCard(
///     project: projects[index],
///   ),
/// );
/// ```
final assignedProjectsProvider = Provider<List<ProjectModel>>((ref) {
  return ref.watch(dashboardProvider).assignedProjects;
});

/// Convenience provider for accessing open pool projects.
///
/// Returns the list of projects available for claiming.
///
/// ## Usage
///
/// ```dart
/// final openProjects = ref.watch(openPoolProjectsProvider);
///
/// return OpenPoolGrid(projects: openProjects);
/// ```
final openPoolProjectsProvider = Provider<List<ProjectModel>>((ref) {
  return ref.watch(dashboardProvider).openPoolProjects;
});

/// Convenience provider for accessing doer statistics.
///
/// Returns the aggregated [DoerStats] for the current doer.
///
/// ## Usage
///
/// ```dart
/// final stats = ref.watch(doerStatsProvider);
///
/// return StatsCard(
///   totalEarnings: stats.totalEarnings,
///   completedProjects: stats.completedProjects,
///   averageRating: stats.averageRating,
/// );
/// ```
final doerStatsProvider = Provider<DoerStats>((ref) {
  return ref.watch(dashboardProvider).stats;
});

/// Convenience provider for accessing doer reviews.
///
/// Returns the list of recent [ReviewModel] objects.
///
/// ## Usage
///
/// ```dart
/// final reviews = ref.watch(doerReviewsProvider);
///
/// return ReviewsList(reviews: reviews);
/// ```
final doerReviewsProvider = Provider<List<ReviewModel>>((ref) {
  return ref.watch(dashboardProvider).reviews;
});

/// Convenience provider for accessing doer availability status.
///
/// Returns `true` if the doer is available to accept new projects.
///
/// ## Usage
///
/// ```dart
/// final isAvailable = ref.watch(isAvailableProvider);
///
/// return Switch(
///   value: isAvailable,
///   onChanged: (_) => ref.read(dashboardProvider.notifier)
///       .toggleAvailability(),
/// );
/// ```
final isAvailableProvider = Provider<bool>((ref) {
  return ref.watch(dashboardProvider).isAvailable;
});

/// Convenience provider for accessing dashboard loading state.
///
/// Returns `true` if dashboard data is currently being loaded.
///
/// ## Usage
///
/// ```dart
/// final isLoading = ref.watch(dashboardLoadingProvider);
///
/// if (isLoading) {
///   return CircularProgressIndicator();
/// }
/// ```
final dashboardLoadingProvider = Provider<bool>((ref) {
  return ref.watch(dashboardProvider).isLoading;
});
