import 'package:flutter/material.dart';
import '../../../data/models/project_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../providers/dashboard_provider.dart';
import '../../../shared/widgets/loading_overlay.dart';
import '../widgets/app_header.dart';
import '../widgets/stat_card.dart';

/// Statistics screen showing detailed doer statistics.
///
/// Displays comprehensive performance metrics and earnings data
/// for the authenticated doer user.
///
/// ## Navigation
/// - Entry: From [AppDrawer] or dashboard stats tap
/// - Back: Returns to previous screen
///
/// ## Features
/// - Overview grid: Active projects, completed, earnings, rating
/// - Performance section: Success rate, on-time delivery, satisfaction
/// - Earnings section: Total, monthly, weekly, average per project
/// - Rating breakdown: Distribution chart with review count
///
/// ## Sections
/// 1. **Overview**: 2x2 grid of key metrics
/// 2. **Performance**: Progress bars for rate metrics
/// 3. **Earnings**: Detailed earnings breakdown
/// 4. **Rating Breakdown**: Star distribution visualization
///
/// ## Data Sources
/// Uses [doerStatsProvider] for statistics data.
/// Some earnings calculations use mock formulas (TODO: real data).
///
/// See also:
/// - [DashboardProvider] for stats data
/// - [StatCard] for overview grid cards
/// - [StatRow] for earnings table rows
class StatisticsScreen extends ConsumerWidget {
  const StatisticsScreen({super.key});

  /// Builds the statistics screen UI.
  ///
  /// Displays all stat sections in a scrollable column.
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(doerStatsProvider);
    final isLoading = ref.watch(dashboardLoadingProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: LoadingOverlay(
        isLoading: isLoading,
        child: Column(
          children: [
            InnerHeader(
              title: 'Statistics',
              onBack: () => Navigator.pop(context),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: AppSpacing.paddingMd,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Overview section
                    _buildSectionTitle('Overview'),
                    const SizedBox(height: AppSpacing.sm),
                    _buildOverviewCards(stats),

                  const SizedBox(height: AppSpacing.xl),

                  // Performance section
                  _buildSectionTitle('Performance'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildPerformanceSection(stats),

                  const SizedBox(height: AppSpacing.xl),

                  // Earnings section
                  _buildSectionTitle('Earnings'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildEarningsSection(stats),

                  const SizedBox(height: AppSpacing.xl),

                  // Rating breakdown
                  _buildSectionTitle('Rating Breakdown'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildRatingBreakdown(stats),

                    const SizedBox(height: AppSpacing.lg),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a section title widget.
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  /// Builds the 2x2 overview grid with key metrics.
  Widget _buildOverviewCards(DoerStats stats) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.3,
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      children: [
        StatCard(
          title: 'Active Projects',
          value: stats.activeProjects.toString(),
          icon: Icons.assignment,
          color: AppColors.info,
        ),
        StatCard(
          title: 'Completed',
          value: stats.completedProjects.toString(),
          icon: Icons.check_circle,
          color: AppColors.success,
        ),
        StatCard(
          title: 'Total Earnings',
          value: _formatCurrency(stats.totalEarnings),
          icon: Icons.currency_rupee,
          color: AppColors.accent,
        ),
        StatCard(
          title: 'Rating',
          value: stats.rating.toStringAsFixed(1),
          icon: Icons.star,
          color: AppColors.warning,
          subtitle: 'out of 5.0',
        ),
      ],
    );
  }

  /// Builds the performance metrics section with progress bars.
  Widget _buildPerformanceSection(DoerStats stats) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          children: [
            _PerformanceBar(
              label: 'Success Rate',
              value: stats.successRate,
              color: AppColors.success,
              icon: Icons.trending_up,
            ),
            const Divider(height: AppSpacing.lg),
            _PerformanceBar(
              label: 'On-Time Delivery',
              value: stats.onTimeDeliveryRate,
              color: AppColors.primary,
              icon: Icons.schedule,
            ),
            const Divider(height: AppSpacing.lg),
            _PerformanceBar(
              label: 'Client Satisfaction',
              value: (stats.rating / 5) * 100,
              color: AppColors.warning,
              icon: Icons.sentiment_satisfied,
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the earnings breakdown section.
  ///
  /// Note: Monthly and weekly figures are currently mock estimates.
  Widget _buildEarningsSection(DoerStats stats) {
    // Mock earnings data
    final monthlyEarnings = stats.totalEarnings * 0.15; // Last month estimate
    final weeklyEarnings = stats.totalEarnings * 0.04; // Last week estimate
    final avgPerProject = stats.completedProjects > 0
        ? stats.totalEarnings / stats.completedProjects
        : 0.0;

    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          children: [
            StatRow(
              label: 'Total Earnings',
              value: _formatCurrency(stats.totalEarnings),
              icon: Icons.account_balance_wallet,
              valueColor: AppColors.success,
            ),
            const Divider(height: AppSpacing.lg),
            StatRow(
              label: 'This Month',
              value: _formatCurrency(monthlyEarnings),
              icon: Icons.calendar_month,
            ),
            const Divider(height: AppSpacing.lg),
            StatRow(
              label: 'This Week',
              value: _formatCurrency(weeklyEarnings),
              icon: Icons.date_range,
            ),
            const Divider(height: AppSpacing.lg),
            StatRow(
              label: 'Avg per Project',
              value: _formatCurrency(avgPerProject),
              icon: Icons.analytics,
              valueColor: AppColors.accent,
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the rating distribution breakdown.
  ///
  /// Shows overall rating with star visualization and
  /// bar chart of rating distribution.
  Widget _buildRatingBreakdown(DoerStats stats) {
    // Mock rating distribution
    final ratingDistribution = {
      5: 35,
      4: 8,
      3: 3,
      2: 1,
      1: 0,
    };
    final totalReviews = ratingDistribution.values.fold(0, (a, b) => a + b);

    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          children: [
            // Overall rating
            Row(
              children: [
                Container(
                  padding: AppSpacing.paddingMd,
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: AppSpacing.borderRadiusMd,
                  ),
                  child: Column(
                    children: [
                      Text(
                        stats.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: AppColors.warning,
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(5, (index) {
                          return Icon(
                            index < stats.rating.floor()
                                ? Icons.star
                                : (index < stats.rating.ceil() &&
                                        stats.rating % 1 != 0)
                                    ? Icons.star_half
                                    : Icons.star_border,
                            color: AppColors.warning,
                            size: 16,
                          );
                        }),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$totalReviews reviews',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    children: [5, 4, 3, 2, 1].map((rating) {
                      final count = ratingDistribution[rating] ?? 0;
                      final percentage =
                          totalReviews > 0 ? (count / totalReviews) * 100 : 0.0;
                      return _RatingBar(
                        rating: rating,
                        count: count,
                        percentage: percentage,
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Formats currency with K/L suffix for large amounts.
  String _formatCurrency(double amount) {
    if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(1)}L';
    } else if (amount >= 1000) {
      return '₹${(amount / 1000).toStringAsFixed(1)}K';
    }
    return '₹${amount.toStringAsFixed(0)}';
  }
}

/// Performance metric bar widget with progress indicator.
///
/// Displays a labeled progress bar with percentage value.
class _PerformanceBar extends StatelessWidget {
  /// Label for the metric.
  final String label;

  /// Value as a percentage (0-100).
  final double value;

  /// Color for the bar and label.
  final Color color;

  /// Icon representing the metric.
  final IconData icon;

  const _PerformanceBar({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            Text(
              '${value.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: AppSpacing.borderRadiusSm,
          child: LinearProgressIndicator(
            value: value / 100,
            backgroundColor: color.withValues(alpha: 0.1),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ),
      ],
    );
  }
}

/// Rating distribution bar for the breakdown chart.
///
/// Shows a single row with star rating, progress bar, and count.
class _RatingBar extends StatelessWidget {
  /// Star rating (1-5).
  final int rating;

  /// Number of reviews with this rating.
  final int count;

  /// Percentage of total reviews.
  final double percentage;

  const _RatingBar({
    required this.rating,
    required this.count,
    required this.percentage,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(
            '$rating',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const Icon(Icons.star, size: 12, color: AppColors.warning),
          const SizedBox(width: 8),
          Expanded(
            child: ClipRRect(
              borderRadius: AppSpacing.borderRadiusSm,
              child: LinearProgressIndicator(
                value: percentage / 100,
                backgroundColor: AppColors.border,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.warning),
                minHeight: 6,
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 24,
            child: Text(
              count.toString(),
              textAlign: TextAlign.end,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
