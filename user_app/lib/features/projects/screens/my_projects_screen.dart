import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/router/route_names.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/project_provider.dart';
import '../widgets/payment_prompt_modal.dart';
import '../widgets/project_card.dart';
import '../widgets/review_actions.dart';

/// My Projects screen with tab navigation.
class MyProjectsScreen extends ConsumerStatefulWidget {
  const MyProjectsScreen({super.key});

  @override
  ConsumerState<MyProjectsScreen> createState() => _MyProjectsScreenState();
}

class _MyProjectsScreenState extends ConsumerState<MyProjectsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final _tabs = const [
    _TabInfo('In Review', Icons.hourglass_empty),
    _TabInfo('In Progress', Icons.engineering_outlined),
    _TabInfo('For Review', Icons.rate_review_outlined),
    _TabInfo('History', Icons.history),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        ref.read(selectedProjectTabProvider.notifier).state = _tabController.index;
      }
    });

    // Check for pending payments on first load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkPendingPayments();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _checkPendingPayments() async {
    final pendingProjects = await ref.read(pendingPaymentProjectsProvider.future);
    if (pendingProjects.isNotEmpty && mounted) {
      final project = pendingProjects.first;
      PaymentPromptModal.show(
        context,
        project: project,
        onPayNow: () => _handlePayNow(project),
        onRemindLater: () => _handleRemindLater(project),
      );
    }
  }

  /// Navigates to the payment screen for the given project.
  void _handlePayNow(Project project) {
    if (!mounted) return;
    // Navigate to project payment screen
    context.push(RouteNames.projectPayPath(project.id));
  }

  /// Handles the "Remind Later" action by showing feedback
  /// and storing the reminder preference.
  void _handleRemindLater(Project project) {
    if (!mounted) return;
    // Show feedback to user
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('We\'ll remind you about payment for "${project.title}"'),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'Pay Now',
          onPressed: () => _handlePayNow(project),
        ),
      ),
    );
    // TODO: Store reminder preference in local storage
    // This allows showing the reminder again after some time
  }

  @override
  Widget build(BuildContext context) {
    final projectCounts = ref.watch(projectCountsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Projects'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primary,
            indicatorWeight: 3,
            labelStyle: AppTextStyles.labelMedium,
            tabs: _tabs.asMap().entries.map((entry) {
              final index = entry.key;
              final tab = entry.value;
              return Tab(
                child: Row(
                  children: [
                    Icon(tab.icon, size: 16),
                    const SizedBox(width: 6),
                    Text(tab.label),
                    projectCounts.when(
                      data: (counts) {
                        final count = counts[index] ?? 0;
                        if (count == 0) return const SizedBox.shrink();
                        return Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(25),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            count.toString(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        );
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (_, _) => const SizedBox.shrink(),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _ProjectTabContent(tabIndex: 0),
          _ProjectTabContent(tabIndex: 1),
          _ProjectTabContent(tabIndex: 2),
          _ProjectTabContent(tabIndex: 3),
        ],
      ),
    );
  }
}

class _TabInfo {
  final String label;
  final IconData icon;

  const _TabInfo(this.label, this.icon);
}

class _ProjectTabContent extends ConsumerWidget {
  final int tabIndex;

  const _ProjectTabContent({required this.tabIndex});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsAsync = ref.watch(projectsByTabProvider(tabIndex));

    return projectsAsync.when(
      data: (projects) {
        if (projects.isEmpty) {
          return _EmptyState(tabIndex: tabIndex);
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(projectsProvider);
            ref.invalidate(projectCountsProvider);
          },
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: projects.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final project = projects[index];
              return ProjectCard(
                project: project,
                onApprove: () => _handleApprove(context, ref, project),
                onRequestChanges: () => _handleRequestChanges(context, ref, project),
              );
            },
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(),
      ),
      error: (error, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load projects',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => ref.invalidate(projectsByTabProvider(tabIndex)),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleApprove(
    BuildContext context,
    WidgetRef ref,
    Project project,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Approve Delivery'),
        content: const Text(
          'Are you sure you want to approve this delivery? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.success,
            ),
            child: const Text('Approve'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(projectNotifierProvider.notifier).approveProject(project.id);
    }
  }

  Future<void> _handleRequestChanges(
    BuildContext context,
    WidgetRef ref,
    Project project,
  ) async {
    FeedbackInputModal.show(
      context,
      onSubmit: (feedback) async {
        await ref
            .read(projectNotifierProvider.notifier)
            .requestChanges(project.id, feedback);
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  final int tabIndex;

  const _EmptyState({required this.tabIndex});

  @override
  Widget build(BuildContext context) {
    final (icon, title, subtitle) = _getEmptyStateContent();

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 40,
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  (IconData, String, String) _getEmptyStateContent() {
    switch (tabIndex) {
      case 0:
        return (
          Icons.hourglass_empty,
          'No Projects in Review',
          'Projects waiting for quotes will appear here',
        );
      case 1:
        return (
          Icons.engineering_outlined,
          'No Projects in Progress',
          'Projects being worked on will appear here',
        );
      case 2:
        return (
          Icons.rate_review_outlined,
          'Nothing to Review',
          'Completed projects awaiting your approval will appear here',
        );
      case 3:
        return (
          Icons.history,
          'No History Yet',
          'Your completed projects will appear here',
        );
      default:
        return (
          Icons.folder_outlined,
          'No Projects',
          'Your projects will appear here',
        );
    }
  }
}
