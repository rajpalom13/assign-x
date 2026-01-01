import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/dashboard_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/loading_overlay.dart';
import '../widgets/app_drawer.dart';
import '../widgets/app_header.dart';
import '../widgets/project_card.dart';

/// Main dashboard screen with tabs for My Projects and Open Pool.
///
/// The primary screen for activated users, displaying assigned projects
/// and available work opportunities in a tabbed interface.
///
/// ## Navigation
/// - Entry: From [SplashScreen] or [ActivationGateScreen] (fully activated)
/// - Drawer: Opens [AppDrawer] for main navigation
/// - Notifications: Navigates to [NotificationsScreen]
/// - Project Tap: Navigates to [ProjectDetailScreen]
///
/// ## Features
/// - Stats bar showing active/completed projects, earnings, rating
/// - Two-tab layout: My Projects and Open Pool
/// - Pull-to-refresh on both tabs
/// - Project cards with urgency highlighting
/// - Accept project confirmation dialog
/// - Real-time project counts on tabs
///
/// ## Tabs
/// - **My Projects**: Assigned projects, grouped by urgency
/// - **Open Pool**: Available projects to accept, sorted by urgency/deadline
///
/// ## State Management
/// Uses [DashboardProvider] for project lists and stats.
/// Individual providers: [assignedProjectsProvider], [openPoolProjectsProvider]
///
/// See also:
/// - [DashboardProvider] for dashboard state
/// - [AppDrawer] for navigation drawer
/// - [ProjectCard] for project display
/// - [ProjectDetailScreen] for full project view
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

/// State class for [DashboardScreen].
///
/// Manages tab controller and scaffold key for drawer access.
class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with SingleTickerProviderStateMixin {
  /// Controller for the two-tab layout.
  late TabController _tabController;

  /// Key for accessing scaffold to open drawer.
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  /// Initializes tab controller.
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  /// Disposes tab controller to prevent memory leaks.
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  /// Builds the dashboard screen UI with stats, tabs, and content.
  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);
    final stats = ref.watch(doerStatsProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(),
      body: Column(
        children: [
          // App header
          AppHeader(
            onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
            onNotificationTap: () => context.push('/notifications'),
            notificationCount: 3, // TODO: Get from notifications provider
          ),

          // Stats summary
          _buildStatsBar(stats),

          // Tab bar
          _buildTabBar(),

          // Tab content
          Expanded(
            child: LoadingOverlay(
              isLoading: dashboardState.isLoading,
              child: TabBarView(
                controller: _tabController,
                children: [
                  // My Projects tab
                  _MyProjectsTab(
                    projects: dashboardState.assignedProjects,
                    onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
                  ),

                  // Open Pool tab
                  _OpenPoolTab(
                    projects: dashboardState.openPoolProjects,
                    onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
                    onAccept: (projectId) async {
                      final success = await ref
                          .read(dashboardProvider.notifier)
                          .acceptProject(projectId);
                      if (success && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Project accepted successfully!'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the statistics summary bar at the top.
  ///
  /// Shows active projects, completed count, total earnings, and rating.
  Widget _buildStatsBar(DoerStats stats) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      color: AppColors.surface,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(
            icon: Icons.assignment,
            value: stats.activeProjects.toString(),
            label: 'Active',
            color: AppColors.info,
          ),
          _StatItem(
            icon: Icons.check_circle,
            value: stats.completedProjects.toString(),
            label: 'Completed',
            color: AppColors.success,
          ),
          _StatItem(
            icon: Icons.currency_rupee,
            value: _formatEarnings(stats.totalEarnings),
            label: 'Earnings',
            color: AppColors.accent,
          ),
          _StatItem(
            icon: Icons.star,
            value: stats.rating.toStringAsFixed(1),
            label: 'Rating',
            color: AppColors.warning,
          ),
        ],
      ),
    );
  }

  /// Formats earnings with K suffix for thousands.
  String _formatEarnings(double earnings) {
    if (earnings >= 100000) {
      return '${(earnings / 1000).toStringAsFixed(0)}K';
    } else if (earnings >= 1000) {
      return '${(earnings / 1000).toStringAsFixed(1)}K';
    }
    return earnings.toStringAsFixed(0);
  }

  /// Builds the tab bar with project counts.
  Widget _buildTabBar() {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: TabBar(
        controller: _tabController,
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
        indicatorWeight: 3,
        labelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        tabs: [
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.assignment, size: 18),
                const SizedBox(width: 6),
                const Text('My Projects'),
                Consumer(
                  builder: (context, ref, _) {
                    final count = ref.watch(assignedProjectsProvider).length;
                    if (count == 0) return const SizedBox.shrink();
                    return Container(
                      margin: const EdgeInsets.only(left: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        count.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.explore, size: 18),
                const SizedBox(width: 6),
                const Text('Open Pool'),
                Consumer(
                  builder: (context, ref, _) {
                    final count = ref.watch(openPoolProjectsProvider).length;
                    if (count == 0) return const SizedBox.shrink();
                    return Container(
                      margin: const EdgeInsets.only(left: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        count.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Individual statistic display item for the stats bar.
///
/// Shows an icon, value, and label in a compact vertical layout.
class _StatItem extends StatelessWidget {
  /// Icon representing the stat type.
  final IconData icon;

  /// The stat value to display.
  final String value;

  /// Label describing the stat.
  final String label;

  /// Color for the icon and value.
  final Color color;

  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

/// My Projects tab content.
///
/// Displays assigned projects grouped into "Needs Attention" (urgent/revision)
/// and "In Progress" sections with pull-to-refresh.
class _MyProjectsTab extends StatelessWidget {
  /// List of assigned projects.
  final List<ProjectModel> projects;

  /// Callback to refresh project list.
  final VoidCallback onRefresh;

  const _MyProjectsTab({
    required this.projects,
    required this.onRefresh,
  });

  /// Builds the My Projects tab content.
  ///
  /// Shows empty state if no projects, otherwise displays
  /// grouped project lists with section headers.
  @override
  Widget build(BuildContext context) {
    if (projects.isEmpty) {
      return EmptyState(
        icon: Icons.assignment_outlined,
        title: 'No Active Projects',
        description: 'You don\'t have any active projects.\nCheck the Open Pool for new opportunities!',
        actionText: 'Browse Open Pool',
        onAction: () {
          // Switch to Open Pool tab
        },
      );
    }

    // Separate urgent and regular projects
    final urgentProjects = projects
        .where((p) => p.isUrgent || p.hasRevision)
        .toList();
    final regularProjects = projects
        .where((p) => !p.isUrgent && !p.hasRevision)
        .toList();

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView(
        padding: AppSpacing.paddingMd,
        children: [
          // Urgent section
          if (urgentProjects.isNotEmpty) ...[
            _buildSectionHeader(
              'Needs Attention',
              Icons.priority_high,
              AppColors.urgent,
              urgentProjects.length,
            ),
            const SizedBox(height: AppSpacing.sm),
            ...urgentProjects.map((project) => Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: ProjectCard(
                    project: project,
                    onTap: () => context.push('/project/${project.id}'),
                  ),
                )),
            const SizedBox(height: AppSpacing.md),
          ],

          // Regular projects section
          if (regularProjects.isNotEmpty) ...[
            _buildSectionHeader(
              'In Progress',
              Icons.pending_actions,
              AppColors.info,
              regularProjects.length,
            ),
            const SizedBox(height: AppSpacing.sm),
            ...regularProjects.map((project) => Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: ProjectCard(
                    project: project,
                    onTap: () => context.push('/project/${project.id}'),
                  ),
                )),
          ],
        ],
      ),
    );
  }

  /// Builds a section header with icon, title, and count badge.
  Widget _buildSectionHeader(
    String title,
    IconData icon,
    Color color,
    int count,
  ) {
    return Row(
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 2,
          ),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: AppSpacing.borderRadiusSm,
          ),
          child: Text(
            count.toString(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}

/// Open Pool tab content.
///
/// Displays available projects sorted by urgency and deadline,
/// with accept buttons and confirmation dialogs.
class _OpenPoolTab extends StatelessWidget {
  /// List of available projects in the pool.
  final List<ProjectModel> projects;

  /// Callback to refresh project list.
  final VoidCallback onRefresh;

  /// Callback when project is accepted.
  final Function(String) onAccept;

  const _OpenPoolTab({
    required this.projects,
    required this.onRefresh,
    required this.onAccept,
  });

  /// Builds the Open Pool tab content.
  ///
  /// Shows empty state if no projects, otherwise displays
  /// sorted project list with accept buttons.
  @override
  Widget build(BuildContext context) {
    if (projects.isEmpty) {
      return const EmptyState(
        icon: Icons.explore_outlined,
        title: 'No Projects Available',
        description: 'There are no open projects at the moment.\nCheck back later for new opportunities!',
      );
    }

    // Sort by urgency and deadline
    final sortedProjects = List<ProjectModel>.from(projects)
      ..sort((a, b) {
        // Urgent projects first
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        // Then by deadline
        return a.deadline.compareTo(b.deadline);
      });

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.builder(
        padding: AppSpacing.paddingMd,
        itemCount: sortedProjects.length,
        itemBuilder: (context, index) {
          final project = sortedProjects[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: ProjectCard(
              project: project,
              showAcceptButton: true,
              onTap: () => context.push('/project/${project.id}'),
              onAccept: () => _confirmAccept(context, project),
            ),
          );
        },
      ),
    );
  }

  /// Shows confirmation dialog before accepting a project.
  void _confirmAccept(BuildContext context, ProjectModel project) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Accept Project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you sure you want to accept this project?',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 12),
            Container(
              padding: AppSpacing.paddingSm,
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: AppSpacing.borderRadiusSm,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    project.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.currency_rupee,
                        size: 14,
                        color: AppColors.success,
                      ),
                      Text(
                        project.price.toStringAsFixed(0),
                        style: const TextStyle(
                          color: AppColors.success,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(
                        Icons.access_time,
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatDeadline(project.deadline),
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              onAccept(project.id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }

  /// Formats deadline as relative time remaining.
  String _formatDeadline(DateTime deadline) {
    final remaining = deadline.difference(DateTime.now());
    if (remaining.inDays > 0) {
      return '${remaining.inDays}d ${remaining.inHours % 24}h left';
    } else if (remaining.inHours > 0) {
      return '${remaining.inHours}h ${remaining.inMinutes % 60}m left';
    } else if (remaining.inMinutes > 0) {
      return '${remaining.inMinutes}m left';
    } else {
      return 'Due soon';
    }
  }
}
