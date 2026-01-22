import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/models/project_model.dart';
import '../../../shared/animations/common_animations.dart';
import '../../../shared/widgets/glass_container.dart';

/// Card widget for projects that need attention.
///
/// Displays project title, status badge, and chevron indicator.
/// Used in horizontal scrolling lists for quick access to actionable projects.
///
/// Example:
/// ```dart
/// NeedsAttentionCard(
///   project: myProject,
///   onTap: () => context.push('/projects/${project.id}'),
///   animationDelay: Duration(milliseconds: 100),
/// )
/// ```
class NeedsAttentionCard extends StatelessWidget {
  /// Project data to display.
  final Project project;

  /// Callback when card is tapped.
  final VoidCallback? onTap;

  /// Card width. Defaults to 260.
  final double width;

  /// Card height. Defaults to 90.
  final double height;

  /// Animation delay for staggered entrance.
  final Duration? animationDelay;

  const NeedsAttentionCard({
    super.key,
    required this.project,
    this.onTap,
    this.width = 260,
    this.height = 90,
    this.animationDelay,
  });

  @override
  Widget build(BuildContext context) {
    Widget card = GlassCard(
      width: width,
      height: height,
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Row(
        children: [
          // Status icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: project.status.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              project.status.icon,
              color: project.status.color,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Project title
                Text(
                  project.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: project.status.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    project.status.displayName,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: project.status.color,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Chevron indicator
          Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textTertiary,
            size: 20,
          ),
        ],
      ),
    );

    // Apply animation if delay is provided
    if (animationDelay != null) {
      card = card.fadeInSlideUp(
        delay: animationDelay!,
        duration: const Duration(milliseconds: 300),
      );
    }

    return card;
  }
}

/// Needs attention section widget.
///
/// Displays a header with count and horizontal scrollable list of attention cards.
///
/// Example:
/// ```dart
/// NeedsAttentionSection(
///   projects: needsAttentionProjects,
///   onProjectTap: (project) => handleProjectTap(project),
/// )
/// ```
class NeedsAttentionSection extends StatelessWidget {
  /// List of projects requiring attention.
  final List<Project> projects;

  /// Callback when a project card is tapped.
  final void Function(Project project)? onProjectTap;

  const NeedsAttentionSection({
    super.key,
    required this.projects,
    this.onProjectTap,
  });

  @override
  Widget build(BuildContext context) {
    if (projects.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with count
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.warning,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Needs Attention',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Text(
                '${projects.length} item${projects.length > 1 ? 's' : ''}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Horizontal scrolling list
        SizedBox(
          height: 90,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            scrollDirection: Axis.horizontal,
            itemCount: projects.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final project = projects[index];
              return NeedsAttentionCard(
                project: project,
                onTap: () => onProjectTap?.call(project),
                animationDelay: Duration(milliseconds: 50 * index),
              );
            },
          ),
        ),
      ],
    );
  }
}
