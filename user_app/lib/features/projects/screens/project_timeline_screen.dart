import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/project_provider.dart';

/// Screen showing project progress timeline.
class ProjectTimelineScreen extends ConsumerWidget {
  final String projectId;

  const ProjectTimelineScreen({
    super.key,
    required this.projectId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectProvider(projectId));
    final timelineAsync = ref.watch(projectTimelineProvider(projectId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Project Timeline'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: projectAsync.when(
        data: (project) {
          if (project == null) {
            return const Center(child: Text('Project not found'));
          }

          return timelineAsync.when(
            data: (timeline) => _buildTimeline(context, project, timeline),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildTimeline(
    BuildContext context,
    Project project,
    List<ProjectTimelineEvent> events,
  ) {
    // Add default events if timeline is empty
    final displayEvents = events.isEmpty ? _getDefaultEvents(project) : events;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Project header
          _ProjectHeader(project: project),

          const SizedBox(height: 24),

          // Timeline
          ...displayEvents.asMap().entries.map((entry) {
            final index = entry.key;
            final event = entry.value;
            final isLast = index == displayEvents.length - 1;

            return _TimelineNode(
              event: event,
              isLast: isLast,
              isCurrent: !event.isCompleted &&
                  (index == 0 || displayEvents[index - 1].isCompleted),
            );
          }),

          const SizedBox(height: 24),

          // Expected completion
          if (project.status != ProjectStatus.completed &&
              project.status != ProjectStatus.cancelled)
            _ExpectedCompletion(deadline: project.deadline),
        ],
      ),
    );
  }

  List<ProjectTimelineEvent> _getDefaultEvents(Project project) {
    final now = DateTime.now();
    final events = <ProjectTimelineEvent>[];
    int order = 0;

    // Project Created
    events.add(ProjectTimelineEvent(
      id: '1',
      projectId: project.id,
      milestoneType: 'created',
      milestoneTitle: 'Project Created',
      description: 'Your project was submitted successfully',
      createdAt: project.createdAt,
      sequenceOrder: order++,
      isCompleted: true,
      completedAt: project.createdAt,
    ));

    // Requirements Analysis
    events.add(ProjectTimelineEvent(
      id: '2',
      projectId: project.id,
      milestoneType: 'analyzing',
      milestoneTitle: 'Requirements Analysis',
      description: 'Our team is analyzing your requirements',
      createdAt: project.createdAt.add(const Duration(hours: 1)),
      sequenceOrder: order++,
      isCompleted: project.status != ProjectStatus.analyzing &&
          project.status != ProjectStatus.submitted &&
          project.status != ProjectStatus.draft,
    ));

    // Quote Ready
    final hasQuote = project.status != ProjectStatus.draft &&
        project.status != ProjectStatus.submitted &&
        project.status != ProjectStatus.analyzing;
    if (hasQuote) {
      events.add(ProjectTimelineEvent(
        id: '3',
        projectId: project.id,
        milestoneType: 'quoted',
        milestoneTitle: 'Quote Ready',
        description: project.userQuote != null
            ? 'Quote: ${project.formattedQuote}'
            : 'Quote provided',
        createdAt: project.createdAt.add(const Duration(hours: 2)),
        sequenceOrder: order++,
        isCompleted: project.status != ProjectStatus.quoted &&
            project.status != ProjectStatus.paymentPending,
      ));
    }

    // Payment Received
    if (project.isPaid) {
      events.add(ProjectTimelineEvent(
        id: '4',
        projectId: project.id,
        milestoneType: 'paid',
        milestoneTitle: 'Payment Received',
        description: 'Thank you for your payment',
        createdAt: project.paidAt ?? project.createdAt.add(const Duration(hours: 3)),
        sequenceOrder: order++,
        isCompleted: true,
        completedAt: project.paidAt,
      ));
    }

    // Expert Assigned
    if (project.doerId != null) {
      events.add(ProjectTimelineEvent(
        id: '5',
        projectId: project.id,
        milestoneType: 'assigned',
        milestoneTitle: 'Expert Assigned',
        description: 'A specialist has been assigned to your project',
        createdAt: project.doerAssignedAt ?? project.createdAt.add(const Duration(hours: 4)),
        sequenceOrder: order++,
        isCompleted: true,
        completedAt: project.doerAssignedAt,
      ));
    }

    // Work in Progress
    if (project.status == ProjectStatus.inProgress ||
        project.status == ProjectStatus.submittedForQc ||
        project.status == ProjectStatus.qcInProgress) {
      events.add(ProjectTimelineEvent(
        id: '6',
        projectId: project.id,
        milestoneType: 'in_progress',
        milestoneTitle: 'Work in Progress',
        description: '${project.progressPercentage}% completed',
        createdAt: now,
        sequenceOrder: order++,
        isCompleted: false,
      ));
    }

    // Delivery
    if (project.status == ProjectStatus.delivered ||
        project.status == ProjectStatus.completed ||
        project.status == ProjectStatus.autoApproved) {
      events.add(ProjectTimelineEvent(
        id: '7',
        projectId: project.id,
        milestoneType: 'delivered',
        milestoneTitle: 'Delivery Uploaded',
        description: 'Files are ready for your review',
        createdAt: project.deliveredAt ?? project.updatedAt ?? now,
        sequenceOrder: order++,
        isCompleted: project.status == ProjectStatus.completed ||
            project.status == ProjectStatus.autoApproved,
        completedAt: project.deliveredAt,
      ));
    }

    // Completed
    if (project.status == ProjectStatus.completed ||
        project.status == ProjectStatus.autoApproved) {
      events.add(ProjectTimelineEvent(
        id: '8',
        projectId: project.id,
        milestoneType: 'completed',
        milestoneTitle: project.status == ProjectStatus.autoApproved
            ? 'Auto-Approved'
            : 'Project Completed',
        description: 'Successfully delivered',
        createdAt: project.completedAt ?? project.updatedAt ?? now,
        sequenceOrder: order++,
        isCompleted: true,
        completedAt: project.completedAt,
      ));
    }

    return events;
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
                Text(
                  project.title,
                  style: AppTextStyles.labelLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      project.displayId,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: project.status.color.withAlpha(20),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        project.status.displayName,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: project.status.color,
                        ),
                      ),
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

class _TimelineNode extends StatelessWidget {
  final ProjectTimelineEvent event;
  final bool isLast;
  final bool isCurrent;

  const _TimelineNode({
    required this.event,
    required this.isLast,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    final color = event.isCompleted
        ? AppColors.success
        : isCurrent
            ? AppColors.primary
            : AppColors.textTertiary;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Timeline line and dot
        SizedBox(
          width: 40,
          child: Column(
            children: [
              // Dot
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: event.isCompleted || isCurrent
                      ? color
                      : AppColors.surfaceVariant,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: color,
                    width: 2,
                  ),
                ),
                child: event.isCompleted
                    ? const Icon(
                        Icons.check,
                        size: 14,
                        color: Colors.white,
                      )
                    : isCurrent
                        ? Container(
                            margin: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          )
                        : null,
              ),

              // Line
              if (!isLast)
                Container(
                  width: 2,
                  height: 60,
                  color: event.isCompleted
                      ? AppColors.success.withAlpha(50)
                      : AppColors.border,
                ),
            ],
          ),
        ),

        const SizedBox(width: 12),

        // Content
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 36),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        event.milestoneTitle,
                        style: AppTextStyles.labelLarge.copyWith(
                          color: event.isCompleted || isCurrent
                              ? AppColors.textPrimary
                              : AppColors.textTertiary,
                        ),
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(20),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'CURRENT',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                if (event.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    event.description!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  DateFormat('MMM d, y \u2022 h:mm a').format(event.createdAt),
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ExpectedCompletion extends StatelessWidget {
  final DateTime deadline;

  const _ExpectedCompletion({required this.deadline});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: AppSpacing.borderRadiusMd,
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.event_available,
            color: AppColors.primary,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Expected Completion',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  DateFormat('EEEE, MMM d, y').format(deadline),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
