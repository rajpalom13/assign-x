import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/project_provider.dart';
import '../../chat/widgets/floating_chat_button.dart';
import '../widgets/deadline_badge.dart';
import '../widgets/deliverables_section.dart';
import '../widgets/live_draft_section.dart';
import '../widgets/project_brief_accordion.dart';
import '../widgets/quality_badges.dart';
import '../widgets/review_actions.dart';
import '../widgets/status_banner.dart';

/// Project detail screen with all project information.
class ProjectDetailScreen extends ConsumerWidget {
  final String projectId;

  const ProjectDetailScreen({
    super.key,
    required this.projectId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectStreamProvider(projectId));

    return projectAsync.when(
      data: (project) {
        if (project == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Project')),
            body: const Center(child: Text('Project not found')),
          );
        }
        return _ProjectDetailContent(project: project);
      },
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Loading...')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(child: Text('Error: $error')),
      ),
    );
  }
}

class _ProjectDetailContent extends ConsumerStatefulWidget {
  final Project project;

  const _ProjectDetailContent({required this.project});

  @override
  ConsumerState<_ProjectDetailContent> createState() =>
      _ProjectDetailContentState();
}

class _ProjectDetailContentState extends ConsumerState<_ProjectDetailContent> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final project = widget.project;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                expandedHeight: 120,
                pinned: true,
                backgroundColor: AppColors.surface,
                foregroundColor: AppColors.textPrimary,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    project.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  titlePadding: const EdgeInsets.only(
                    left: 56,
                    right: 56,
                    bottom: 16,
                  ),
                ),
                actions: [
                  PopupMenuButton<String>(
                    icon: const Icon(Icons.more_vert),
                    onSelected: (value) => _handleMenuAction(value),
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'timeline',
                        child: ListTile(
                          leading: Icon(Icons.timeline),
                          title: Text('View Timeline'),
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                      // Invoice option - only show for invoiceable statuses
                      if (_isInvoiceAvailable(project.status))
                        const PopupMenuItem(
                          value: 'invoice',
                          child: ListTile(
                            leading: Icon(Icons.receipt_long),
                            title: Text('Download Invoice'),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      const PopupMenuItem(
                        value: 'support',
                        child: ListTile(
                          leading: Icon(Icons.support_agent),
                          title: Text('Contact Support'),
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                      if (project.status != ProjectStatus.completed &&
                          project.status != ProjectStatus.cancelled)
                        const PopupMenuItem(
                          value: 'cancel',
                          child: ListTile(
                            leading: Icon(Icons.cancel_outlined, color: Colors.red),
                            title: Text('Cancel Project',
                                style: TextStyle(color: Colors.red)),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              // Status Banner
              SliverToBoxAdapter(
                child: StatusBanner(status: project.status),
              ),

              // Content
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Project ID and Deadline
                    _ProjectHeader(project: project),

                    const SizedBox(height: 16),

                    // Review Actions (if delivered)
                    if (project.status == ProjectStatus.delivered) ...[
                      ReviewActions(
                        project: project,
                        isLoading: _isLoading,
                        onApprove: () => _handleApprove(),
                        onRequestChanges: () => _handleRequestChanges(),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Payment section (if pending)
                    if (project.status == ProjectStatus.paymentPending) ...[
                      _PaymentSection(project: project),
                      const SizedBox(height: 16),
                    ],

                    // Live Draft Section
                    LiveDraftSection(project: project),

                    const SizedBox(height: 16),

                    // Project Brief
                    ProjectBriefAccordion(project: project),

                    const SizedBox(height: 16),

                    // Deliverables
                    DeliverablesSection(project: project),

                    const SizedBox(height: 16),

                    // Quality Badges
                    QualityBadgesSection(project: project),

                    // Bottom padding for FAB
                    const SizedBox(height: 80),
                  ]),
                ),
              ),
            ],
          ),

          // Floating Chat Button
          Positioned(
            right: 16,
            bottom: MediaQuery.of(context).padding.bottom + 16,
            child: AnimatedFloatingChatButton(
              unreadCount: 0,
              onTap: () => context.push('/projects/${project.id}/chat'),
            ),
          ),
        ],
      ),
    );
  }

  /// Check if invoice is available for the given status.
  bool _isInvoiceAvailable(ProjectStatus status) {
    return status == ProjectStatus.completed ||
        status == ProjectStatus.delivered ||
        status == ProjectStatus.qcApproved ||
        status == ProjectStatus.autoApproved;
  }

  void _handleMenuAction(String action) {
    switch (action) {
      case 'timeline':
        context.push('/projects/${widget.project.id}/timeline');
        break;
      case 'invoice':
        _downloadInvoice();
        break;
      case 'support':
        context.push('/profile/help');
        break;
      case 'cancel':
        _showCancelDialog();
        break;
    }
  }

  Future<void> _downloadInvoice() async {
    // Get the web app base URL from environment or use default
    const baseUrl = String.fromEnvironment(
      'WEB_APP_URL',
      defaultValue: 'https://assignx.in',
    );

    final invoiceUrl = '$baseUrl/invoice/${widget.project.id}';

    try {
      final uri = Uri.parse(invoiceUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Invoice opened in browser'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        throw Exception('Could not launch invoice URL');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to open invoice: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _handleApprove() async {
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
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
            child: const Text('Approve'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() => _isLoading = true);
      await ref
          .read(projectNotifierProvider.notifier)
          .approveProject(widget.project.id);
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleRequestChanges() async {
    final controller = TextEditingController();

    try {
      final feedback = await showDialog<String>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Request Changes'),
          content: TextField(
            controller: controller,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Describe the changes you need...',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Submit'),
            ),
          ],
        ),
      );

      if (feedback != null && feedback.trim().isNotEmpty) {
        setState(() => _isLoading = true);
        await ref
            .read(projectNotifierProvider.notifier)
            .requestChanges(widget.project.id, feedback);
        setState(() => _isLoading = false);
      }
    } finally {
      controller.dispose();
    }
  }

  Future<void> _showCancelDialog() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Project'),
        content: const Text(
          'Are you sure you want to cancel this project? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No, Keep It'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref
          .read(projectNotifierProvider.notifier)
          .cancelProject(widget.project.id);
      if (mounted) {
        context.pop();
      }
    }
  }
}

class _ProjectHeader extends StatelessWidget {
  final Project project;

  const _ProjectHeader({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusMd,
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Service type icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(25),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              project.serviceType.icon,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),

          // Project info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      project.displayId,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.textSecondary,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (project.subjectName != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(20),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          project.subjectName!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.schedule,
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Due: ',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    DeadlineTimer(
                      deadline: project.deadline,
                      style: AppTextStyles.labelMedium,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentSection extends StatelessWidget {
  final Project project;

  const _PaymentSection({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.warning.withAlpha(15),
        borderRadius: AppSpacing.borderRadiusMd,
        border: Border.all(color: AppColors.warning.withAlpha(50)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.warning.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.payment,
                  color: AppColors.warning,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Payment Required',
                      style: AppTextStyles.labelLarge,
                    ),
                    Text(
                      'Complete payment to start work',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                project.formattedQuote,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => context.push('/projects/${project.id}/pay'),
              icon: const Icon(Icons.payment),
              label: const Text('Pay Now'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warning,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
