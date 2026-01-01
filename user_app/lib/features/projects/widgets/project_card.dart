import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/project_model.dart';
import 'deadline_badge.dart';
import 'progress_indicator.dart';
import 'status_badge.dart';

/// Full project card for list display.
class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback? onPayNow;
  final VoidCallback? onApprove;
  final VoidCallback? onRequestChanges;

  const ProjectCard({
    super.key,
    required this.project,
    this.onPayNow,
    this.onApprove,
    this.onRequestChanges,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Project: ${project.title}, Status: ${project.status.displayName}, '
          'Type: ${project.serviceType.displayName}, Deadline: ${_getDeadlineDescription()}',
      hint: 'Double tap to view project details',
      child: GestureDetector(
        onTap: () => context.push('/projects/${project.id}'),
        child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppSpacing.borderRadiusLg,
          border: Border.all(
            color: project.canApprove
                ? project.status.color.withAlpha(100)
                : AppColors.border,
            width: project.canApprove ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context),

            const Divider(height: 1),

            // Body
            _buildBody(context),

            // Footer
            _buildFooter(context),
          ],
        ),
      ),
      ),
    );
  }

  /// Get accessible deadline description.
  String _getDeadlineDescription() {
    final now = DateTime.now();
    final difference = project.deadline.difference(now);
    if (project.deadline.isBefore(now)) {
      return 'Deadline passed';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours left';
    } else {
      return '${difference.inDays} days left';
    }
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Service type icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              project.serviceType.icon,
              color: AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),

          // Title and type
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  project.title,
                  style: AppTextStyles.labelLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  project.serviceType.displayName,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Status badge
          StatusBadge(status: project.status, compact: true),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Project ID and Deadline row
          Row(
            children: [
              // Project ID
              Row(
                children: [
                  Icon(
                    Icons.tag,
                    size: 14,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    project.displayId,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),

              const SizedBox(width: 16),

              // Deadline
              DeadlineBadge(deadline: project.deadline, compact: true),
            ],
          ),

          // Progress bar (only for In Progress)
          if (project.status == ProjectStatus.inProgress) ...[
            const SizedBox(height: 16),
            ProjectProgressIndicator(
              percent: project.progressPercentage,
              showLabel: true,
            ),
          ],

          // Payment amount (for Payment Pending)
          if (project.status == ProjectStatus.paymentPending &&
              project.userQuote != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: AppColors.warning.withAlpha(15),
                borderRadius: AppSpacing.borderRadiusSm,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.currency_rupee,
                    size: 16,
                    color: AppColors.warning,
                  ),
                  Text(
                    '${project.userQuote!.toStringAsFixed(0)} due',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Auto-approval countdown (for Delivered)
          if (project.status == ProjectStatus.delivered &&
              project.autoApproveAt != null) ...[
            const SizedBox(height: 12),
            _AutoApprovalCountdown(deadline: project.autoApproveAt!),
          ],
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant.withAlpha(50),
        borderRadius: const BorderRadius.vertical(
          bottom: Radius.circular(AppSpacing.radiusLg),
        ),
      ),
      child: Row(
        children: [
          // Status description
          Expanded(
            child: Text(
              _getStatusDescription(),
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),

          // Action button
          _buildActionButton(context),
        ],
      ),
    );
  }

  String _getStatusDescription() {
    switch (project.status) {
      case ProjectStatus.draft:
        return 'Draft - continue editing';
      case ProjectStatus.submitted:
        return 'Submitted for review';
      case ProjectStatus.analyzing:
        return 'Analyzing Requirements...';
      case ProjectStatus.quoted:
        return 'Quote ready for review';
      case ProjectStatus.paymentPending:
        return 'Quote ready - Pay to proceed';
      case ProjectStatus.paid:
        return 'Payment received';
      case ProjectStatus.assigning:
        return 'Finding an expert...';
      case ProjectStatus.assigned:
        return 'Expert assigned';
      case ProjectStatus.inProgress:
        return project.progressPercentage > 0
            ? '${project.progressPercentage}% Completed'
            : 'Expert is working on it';
      case ProjectStatus.submittedForQc:
        return 'Submitted for quality check';
      case ProjectStatus.qcInProgress:
        return 'Quality check in progress';
      case ProjectStatus.qcApproved:
        return 'Quality check passed';
      case ProjectStatus.qcRejected:
        return 'Quality check failed';
      case ProjectStatus.delivered:
        return 'Review and approve delivery';
      case ProjectStatus.revisionRequested:
        return 'Changes requested';
      case ProjectStatus.inRevision:
        return 'Making requested changes';
      case ProjectStatus.completed:
        return 'Delivered successfully';
      case ProjectStatus.autoApproved:
        return 'Auto-approved';
      case ProjectStatus.cancelled:
        return 'Project cancelled';
      case ProjectStatus.refunded:
        return 'Payment refunded';
    }
  }

  Widget _buildActionButton(BuildContext context) {
    switch (project.status) {
      case ProjectStatus.quoted:
      case ProjectStatus.paymentPending:
        return _ActionButton(
          label: 'Pay Now',
          icon: Icons.payment,
          color: AppColors.warning,
          onTap: onPayNow ?? () => context.push('/projects/${project.id}/pay'),
        );

      case ProjectStatus.delivered:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ActionButton(
              label: 'Changes',
              icon: Icons.edit_note,
              color: AppColors.textSecondary,
              outlined: true,
              compact: true,
              onTap: onRequestChanges,
            ),
            const SizedBox(width: 8),
            _ActionButton(
              label: 'Approve',
              icon: Icons.check,
              color: AppColors.success,
              compact: true,
              onTap: onApprove,
            ),
          ],
        );

      case ProjectStatus.completed:
      case ProjectStatus.autoApproved:
        return _ActionButton(
          label: 'View',
          icon: Icons.visibility,
          color: AppColors.primary,
          outlined: true,
          onTap: () => context.push('/projects/${project.id}'),
        );

      default:
        return _ActionButton(
          label: 'View',
          icon: Icons.arrow_forward,
          color: AppColors.primary,
          outlined: true,
          onTap: () => context.push('/projects/${project.id}'),
        );
    }
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool outlined;
  final bool compact;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    this.outlined = false,
    this.compact = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      hint: 'Double tap to $label',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 10 : 14,
            vertical: compact ? 6 : 8,
          ),
          decoration: BoxDecoration(
            color: outlined ? Colors.transparent : color,
            borderRadius: BorderRadius.circular(8),
            border: outlined ? Border.all(color: color) : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: compact ? 14 : 16,
                color: outlined ? color : Colors.white,
              ),
              SizedBox(width: compact ? 4 : 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: compact ? 11 : 12,
                  fontWeight: FontWeight.w600,
                  color: outlined ? color : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AutoApprovalCountdown extends StatefulWidget {
  final DateTime deadline;

  const _AutoApprovalCountdown({required this.deadline});

  @override
  State<_AutoApprovalCountdown> createState() => _AutoApprovalCountdownState();
}

class _AutoApprovalCountdownState extends State<_AutoApprovalCountdown> {
  late Duration _remaining;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remaining = widget.deadline.difference(DateTime.now());
    _startTimer();
  }

  void _startTimer() {
    // Cancel any existing timer before creating new one
    _timer?.cancel();

    // Don't start timer if already expired
    if (_remaining.isNegative) return;

    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (!mounted) {
        _timer?.cancel();
        return;
      }
      setState(() {
        _remaining = widget.deadline.difference(DateTime.now());
      });
      // Stop the timer if deadline has passed
      if (_remaining.isNegative) {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_remaining.isNegative) {
      return const SizedBox.shrink();
    }

    final hours = _remaining.inHours;
    final minutes = _remaining.inMinutes % 60;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: 14,
            color: AppColors.primary,
          ),
          const SizedBox(width: 6),
          Text(
            'Auto-approves in ${hours}h ${minutes}m',
            style: TextStyle(
              fontSize: 11,
              color: AppColors.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
