import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/router/route_names.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/project_provider.dart';
import '../../../shared/widgets/glass_container.dart';
import '../../../shared/widgets/mesh_gradient_background.dart';
import '../widgets/payment_prompt_modal.dart';
import '../widgets/progress_indicator.dart';
import '../widgets/review_actions.dart';

/// My Projects screen with tab navigation and new glass design system.
class MyProjectsScreen extends ConsumerStatefulWidget {
  const MyProjectsScreen({super.key});

  @override
  ConsumerState<MyProjectsScreen> createState() => _MyProjectsScreenState();
}

class _MyProjectsScreenState extends ConsumerState<MyProjectsScreen> {
  int _selectedTabIndex = 0;

  final _tabs = const [
    _TabInfo('All', Icons.folder_outlined),
    _TabInfo('Active', Icons.play_circle_outline),
    _TabInfo('Completed', Icons.check_circle_outline),
  ];

  @override
  void initState() {
    super.initState();
    // Check for pending payments on first load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkPendingPayments();
    });
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
    context.push(RouteNames.projectPayPath(project.id));
  }

  /// Handles the "Remind Later" action by showing feedback.
  void _handleRemindLater(Project project) {
    if (!mounted) return;
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: MeshGradientBackground(
        position: MeshPosition.topRight,
        colors: [MeshColors.meshPeach, MeshColors.meshOrange, MeshColors.meshYellow],
        opacity: 0.5,
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              _buildHeader(),

              const SizedBox(height: 16),

              // Glass Tab Bar
              _buildGlassTabBar(),

              const SizedBox(height: 16),

              // Projects List
              Expanded(
                child: _ProjectTabContent(
                  tabIndex: _selectedTabIndex,
                  onApprove: _handleApprove,
                  onRequestChanges: _handleRequestChanges,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'My Projects',
            style: AppTextStyles.headingLarge.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Track and manage your assignments',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassTabBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassContainer(
        blur: 12,
        opacity: 0.6,
        borderRadius: BorderRadius.circular(20),
        padding: const EdgeInsets.all(6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(_tabs.length, (index) {
            final tab = _tabs[index];
            final isSelected = _selectedTabIndex == index;
            return _buildTab(tab.label, index, isSelected);
          }),
        ),
      ),
    );
  }

  Widget _buildTab(String label, int index, bool isSelected) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedTabIndex = index;
        });
        ref.read(selectedProjectTabProvider.notifier).state = index;
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(13),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Future<void> _handleApprove(Project project) async {
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

  Future<void> _handleRequestChanges(Project project) async {
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

class _TabInfo {
  final String label;
  final IconData icon;

  const _TabInfo(this.label, this.icon);
}

class _ProjectTabContent extends ConsumerWidget {
  final int tabIndex;
  final Future<void> Function(Project) onApprove;
  final Future<void> Function(Project) onRequestChanges;

  const _ProjectTabContent({
    required this.tabIndex,
    required this.onApprove,
    required this.onRequestChanges,
  });

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
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
            itemCount: projects.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final project = projects[index];
              return _GlassProjectCard(
                project: project,
                onTap: () => context.push('/projects/${project.id}'),
                onApprove: () => onApprove(project),
                onRequestChanges: () => onRequestChanges(project),
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
}

/// Glass-styled project card with status dot and progress indicator.
class _GlassProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;
  final VoidCallback? onApprove;
  final VoidCallback? onRequestChanges;

  const _GlassProjectCard({
    required this.project,
    required this.onTap,
    this.onApprove,
    this.onRequestChanges,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      blur: 15,
      opacity: 0.75,
      elevation: 2,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: Title, service type, status badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Service type icon
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary.withAlpha(30),
                      AppColors.accent.withAlpha(15),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  project.serviceType.icon,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),

              // Title and service type
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title,
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      project.serviceType.displayName,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              // Status badge with colored dot
              _StatusBadgeWithDot(status: project.status),
            ],
          ),

          const SizedBox(height: 16),

          // Progress indicator (only for in_progress)
          if (project.status == ProjectStatus.inProgress) ...[
            ProjectProgressIndicator(
              percent: project.progressPercentage,
              showLabel: true,
            ),
            const SizedBox(height: 16),
          ],

          // Bottom row: Last updated and action
          Row(
            children: [
              // Last updated with clock icon
              Icon(
                Icons.access_time_outlined,
                size: 14,
                color: AppColors.textTertiary,
              ),
              const SizedBox(width: 4),
              Text(
                _formatLastUpdated(project.updatedAt ?? project.createdAt),
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),

              const Spacer(),

              // Action buttons based on status
              _buildActionButtons(context),
            ],
          ),

          // Owner avatar section (if applicable)
          if (project.doerId != null) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.divider),
            const SizedBox(height: 12),
            Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppColors.primary.withAlpha(30),
                  child: Icon(
                    Icons.person_outline,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Expert assigned',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatLastUpdated(DateTime updatedAt) {
    final now = DateTime.now();
    final difference = now.difference(updatedAt);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d').format(updatedAt);
    }
  }

  Widget _buildActionButtons(BuildContext context) {
    switch (project.status) {
      case ProjectStatus.quoted:
      case ProjectStatus.paymentPending:
        return _ActionChip(
          label: 'Pay Now',
          icon: Icons.payment,
          color: AppColors.warning,
          onTap: () => context.push('/projects/${project.id}/pay'),
        );

      case ProjectStatus.delivered:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ActionChip(
              label: 'Changes',
              icon: Icons.edit_note,
              color: AppColors.textSecondary,
              outlined: true,
              onTap: onRequestChanges,
            ),
            const SizedBox(width: 8),
            _ActionChip(
              label: 'Approve',
              icon: Icons.check,
              color: AppColors.success,
              onTap: onApprove,
            ),
          ],
        );

      default:
        return _ActionChip(
          label: 'View',
          icon: Icons.arrow_forward,
          color: AppColors.primary,
          outlined: true,
          onTap: onTap,
        );
    }
  }
}

/// Status badge with colored dot indicator.
class _StatusBadgeWithDot extends StatelessWidget {
  final ProjectStatus status;

  const _StatusBadgeWithDot({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: _getDotColor().withAlpha(20),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getDotColor().withAlpha(40),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Colored dot
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: _getDotColor(),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          // Status text
          Text(
            status.displayName,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: _getDotColor(),
            ),
          ),
        ],
      ),
    );
  }

  /// Get dot color based on status.
  ///
  /// Status dot colors:
  /// - submitted: gray
  /// - quoted: primary (coffee bean)
  /// - payment_pending: primary
  /// - paid: foreground
  /// - in_progress: primary
  /// - completed: foreground/success
  /// - revision_requested: warning
  /// - cancelled: error
  Color _getDotColor() {
    switch (status) {
      case ProjectStatus.draft:
      case ProjectStatus.submitted:
        return AppColors.textTertiary;
      case ProjectStatus.quoted:
      case ProjectStatus.paymentPending:
      case ProjectStatus.inProgress:
      case ProjectStatus.assigned:
      case ProjectStatus.assigning:
        return AppColors.primary;
      case ProjectStatus.paid:
      case ProjectStatus.analyzing:
        return AppColors.textPrimary;
      case ProjectStatus.completed:
      case ProjectStatus.autoApproved:
      case ProjectStatus.delivered:
      case ProjectStatus.qcApproved:
        return AppColors.success;
      case ProjectStatus.revisionRequested:
      case ProjectStatus.inRevision:
      case ProjectStatus.submittedForQc:
      case ProjectStatus.qcInProgress:
        return AppColors.warning;
      case ProjectStatus.cancelled:
      case ProjectStatus.refunded:
      case ProjectStatus.qcRejected:
        return AppColors.error;
    }
  }
}

/// Compact action chip button.
class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool outlined;
  final VoidCallback? onTap;

  const _ActionChip({
    required this.label,
    required this.icon,
    required this.color,
    this.outlined = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: outlined ? Colors.transparent : color,
          borderRadius: BorderRadius.circular(8),
          border: outlined ? Border.all(color: color.withAlpha(100)) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: outlined ? color : Colors.white,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: outlined ? color : Colors.white,
              ),
            ),
          ],
        ),
      ),
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
            GlassContainer(
              blur: 15,
              opacity: 0.6,
              borderRadius: BorderRadius.circular(40),
              padding: const EdgeInsets.all(20),
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
          Icons.folder_outlined,
          'No Projects Yet',
          'Your projects will appear here once you create them',
        );
      case 1:
        return (
          Icons.play_circle_outline,
          'No Active Projects',
          'Projects being worked on will appear here',
        );
      case 2:
        return (
          Icons.check_circle_outline,
          'No Completed Projects',
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
