import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
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

/// Project detail screen with modern UI and animations.
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
            body: _buildGradientBackground(
              child: const Center(
                child: Text(
                  'Project not found',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
          );
        }
        return _ProjectDetailContent(project: project);
      },
      loading: () => Scaffold(
        body: _buildGradientBackground(
          child: const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      ),
      error: (error, _) => Scaffold(
        body: _buildGradientBackground(
          child: Center(
            child: Text(
              'Error: $error',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }

  static Widget _buildGradientBackground({required Widget child}) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1A1A2E),
            Color(0xFF16213E),
            Color(0xFF0F3460),
          ],
        ),
      ),
      child: child,
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

class _ProjectDetailContentState extends ConsumerState<_ProjectDetailContent>
    with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final project = widget.project;

    return Scaffold(
      backgroundColor: Colors.transparent,
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF16213E),
              Color(0xFF0F3460),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Animated content
            FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: CustomScrollView(
                  slivers: [
                    // Modern App Bar
                    _buildSliverAppBar(context, project),

                    // Content
                    SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          // Status Banner
                          _buildAnimatedCard(
                            delay: 100,
                            child: StatusBanner(status: project.status),
                          ),

                          const SizedBox(height: 16),

                          // Project Header
                          _buildAnimatedCard(
                            delay: 200,
                            child: _ProjectHeader(project: project),
                          ),

                          const SizedBox(height: 16),

                          // Review Actions (if delivered)
                          if (project.status == ProjectStatus.delivered) ...[
                            _buildAnimatedCard(
                              delay: 300,
                              child: ReviewActions(
                                project: project,
                                isLoading: _isLoading,
                                onApprove: () => _handleApprove(),
                                onRequestChanges: () => _handleRequestChanges(),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Payment section (if pending)
                          if (project.status == ProjectStatus.paymentPending) ...[
                            _buildAnimatedCard(
                              delay: 300,
                              child: _PaymentSection(project: project),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Live Draft Section
                          _buildAnimatedCard(
                            delay: 400,
                            child: LiveDraftSection(project: project),
                          ),

                          const SizedBox(height: 16),

                          // Project Brief
                          _buildAnimatedCard(
                            delay: 500,
                            child: ProjectBriefAccordion(project: project),
                          ),

                          const SizedBox(height: 16),

                          // Deliverables
                          _buildAnimatedCard(
                            delay: 600,
                            child: DeliverablesSection(project: project),
                          ),

                          const SizedBox(height: 16),

                          // Quality Badges
                          _buildAnimatedCard(
                            delay: 700,
                            child: QualityBadgesSection(project: project),
                          ),

                          // Bottom padding for FAB
                          const SizedBox(height: 100),
                        ]),
                      ),
                    ),
                  ],
                ),
              ),
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
      ),
    );
  }

  /// Build modern sliver app bar with glass morphism.
  Widget _buildSliverAppBar(BuildContext context, Project project) {
    return SliverAppBar(
      expandedHeight: 120,
      pinned: true,
      backgroundColor: Colors.transparent,
      flexibleSpace: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withValues(alpha: 0.1),
                  Colors.white.withValues(alpha: 0.05),
                ],
              ),
              border: Border(
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: 0.2),
                  width: 1,
                ),
              ),
            ),
            child: FlexibleSpaceBar(
              title: Text(
                project.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
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
          ),
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => context.pop(),
      ),
      actions: [
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
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
    );
  }

  /// Build animated card with staggered animation.
  Widget _buildAnimatedCard({
    required int delay,
    required Widget child,
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 600 + delay),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - value)),
            child: child,
          ),
        );
      },
      child: child,
    );
  }

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

/// Modern project header with glass morphism.
class _ProjectHeader extends StatelessWidget {
  final Project project;

  const _ProjectHeader({required this.project});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withValues(alpha: 0.15),
                Colors.white.withValues(alpha: 0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              // Service type icon with gradient
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primary.withValues(alpha: 0.3),
                      AppColors.accent.withValues(alpha: 0.3),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Icon(
                  project.serviceType.icon,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),

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
                            color: Colors.white.withValues(alpha: 0.7),
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (project.subjectName != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.primary.withValues(alpha: 0.6),
                                  AppColors.accent.withValues(alpha: 0.6),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              project.subjectName!,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(
                          Icons.schedule,
                          size: 16,
                          color: Colors.white.withValues(alpha: 0.6),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Due: ',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Colors.white.withValues(alpha: 0.6),
                          ),
                        ),
                        DeadlineTimer(
                          deadline: project.deadline,
                          style: AppTextStyles.labelMedium.copyWith(
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Modern payment section with glass morphism.
class _PaymentSection extends StatelessWidget {
  final Project project;

  const _PaymentSection({required this.project});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.warning.withValues(alpha: 0.2),
                AppColors.warning.withValues(alpha: 0.1),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.warning.withValues(alpha: 0.4),
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.warning.withValues(alpha: 0.4),
                          AppColors.warning.withValues(alpha: 0.2),
                        ],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.payment,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Payment Required',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Complete payment to start work',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Colors.white.withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    project.formattedQuote,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/projects/${project.id}/pay'),
                  icon: const Icon(Icons.payment, color: Colors.white),
                  label: const Text(
                    'Pay Now',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.warning,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 8,
                    shadowColor: AppColors.warning.withValues(alpha: 0.5),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
