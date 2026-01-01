/// Earnings Graph widget for visualizing doer earnings over time.
///
/// Displays a line chart showing earnings trends with period selection
/// (daily, weekly, monthly views).
///
/// ## Features
/// - Line chart visualization
/// - Period selector (7 days, 30 days, 90 days)
/// - Total earnings for selected period
/// - Interactive data points
/// - Trend indicators
///
/// ## Usage
/// ```dart
/// EarningsGraph(
///   earningsData: earningsData,
///   totalEarnings: 45000,
/// )
/// ```
///
/// See also:
/// - [ProfileScreen] for profile display
/// - [PaymentHistoryScreen] for payment details
library;

import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Earnings data point model.
class EarningsDataPoint {
  /// Date of the earnings.
  final DateTime date;

  /// Amount earned on this date.
  final double amount;

  const EarningsDataPoint({
    required this.date,
    required this.amount,
  });
}

/// Time period for earnings display.
enum EarningsPeriod {
  week('7 Days', 7),
  month('30 Days', 30),
  quarter('90 Days', 90);

  final String label;
  final int days;

  const EarningsPeriod(this.label, this.days);
}

/// Earnings Graph widget.
class EarningsGraph extends StatefulWidget {
  /// List of earnings data points.
  final List<EarningsDataPoint>? earningsData;

  /// Total earnings to display.
  final double? totalEarnings;

  /// Callback when period changes.
  final ValueChanged<EarningsPeriod>? onPeriodChanged;

  const EarningsGraph({
    super.key,
    this.earningsData,
    this.totalEarnings,
    this.onPeriodChanged,
  });

  @override
  State<EarningsGraph> createState() => _EarningsGraphState();
}

class _EarningsGraphState extends State<EarningsGraph> {
  EarningsPeriod _selectedPeriod = EarningsPeriod.month;

  /// Mock earnings data for demonstration.
  List<EarningsDataPoint> get _data {
    if (widget.earningsData != null) {
      return widget.earningsData!;
    }

    // Generate mock data
    final now = DateTime.now();
    return List.generate(_selectedPeriod.days, (index) {
      final date = now.subtract(Duration(days: _selectedPeriod.days - index - 1));
      // Generate somewhat realistic earnings pattern
      final baseAmount = 500.0 + (index * 50);
      final variation = (index % 7 == 0 || index % 7 == 6) ? 0.3 : 1.0;
      final weeklyBonus = (index % 7 == 5) ? 800.0 : 0.0;
      return EarningsDataPoint(
        date: date,
        amount: (baseAmount * variation + weeklyBonus) * (0.5 + (index / _selectedPeriod.days)),
      );
    });
  }

  /// Calculates total for the selected period.
  double get _periodTotal {
    if (widget.totalEarnings != null) {
      return widget.totalEarnings!;
    }
    return _data.fold(0.0, (sum, point) => sum + point.amount);
  }

  /// Calculates average daily earnings.
  double get _dailyAverage {
    if (_data.isEmpty) return 0;
    return _periodTotal / _data.length;
  }

  /// Calculates trend percentage.
  double get _trendPercentage {
    if (_data.length < 2) return 0;

    final halfLength = _data.length ~/ 2;
    final firstHalf = _data.sublist(0, halfLength);
    final secondHalf = _data.sublist(halfLength);

    final firstSum = firstHalf.fold(0.0, (sum, p) => sum + p.amount);
    final secondSum = secondHalf.fold(0.0, (sum, p) => sum + p.amount);

    if (firstSum == 0) return 100;
    return ((secondSum - firstSum) / firstSum) * 100;
  }

  /// Gets the maximum value for chart scaling.
  double get _maxValue {
    if (_data.isEmpty) return 1000;
    return _data.map((p) => p.amount).reduce((a, b) => a > b ? a : b) * 1.2;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with title and period selector
            _buildHeader(),

            const SizedBox(height: AppSpacing.md),

            // Stats row
            _buildStatsRow(),

            const SizedBox(height: AppSpacing.lg),

            // Chart
            _buildChart(),

            const SizedBox(height: AppSpacing.md),

            // Legend
            _buildLegend(),
          ],
        ),
      ),
    );
  }

  /// Builds the header with title and period selector.
  Widget _buildHeader() {
    return Row(
      children: [
        const Icon(
          Icons.trending_up,
          size: 20,
          color: AppColors.primary,
        ),
        const SizedBox(width: 8),
        const Text(
          'Earnings Overview',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: EarningsPeriod.values.map((period) {
              final isSelected = period == _selectedPeriod;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedPeriod = period;
                  });
                  widget.onPeriodChanged?.call(period);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    period.label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  /// Builds the statistics row.
  Widget _buildStatsRow() {
    final trend = _trendPercentage;
    final isPositive = trend >= 0;

    return Row(
      children: [
        // Total earnings
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Total Earnings',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    '₹',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.success,
                    ),
                  ),
                  Text(
                    _formatAmount(_periodTotal),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Trend indicator
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 10,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: (isPositive ? AppColors.success : AppColors.error)
                .withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPositive ? Icons.trending_up : Icons.trending_down,
                size: 16,
                color: isPositive ? AppColors.success : AppColors.error,
              ),
              const SizedBox(width: 4),
              Text(
                '${isPositive ? '+' : ''}${trend.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isPositive ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.md),

        // Daily average
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            const Text(
              'Daily Avg',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '₹${_formatAmount(_dailyAverage)}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Builds the chart visualization.
  Widget _buildChart() {
    return SizedBox(
      height: 180,
      child: CustomPaint(
        size: Size.infinite,
        painter: _EarningsChartPainter(
          data: _data,
          maxValue: _maxValue,
          lineColor: AppColors.primary,
          fillColor: AppColors.primary.withValues(alpha: 0.1),
          gridColor: AppColors.border,
        ),
      ),
    );
  }

  /// Builds the chart legend.
  Widget _buildLegend() {
    if (_data.isEmpty) return const SizedBox.shrink();

    final firstDate = _data.first.date;
    final lastDate = _data.last.date;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          _formatDate(firstDate),
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textTertiary,
          ),
        ),
        Text(
          _formatDate(lastDate),
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  /// Formats amount for display.
  String _formatAmount(double amount) {
    if (amount >= 100000) {
      return '${(amount / 100000).toStringAsFixed(1)}L';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K';
    }
    return amount.toStringAsFixed(0);
  }

  /// Formats date for display.
  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]}';
  }
}

/// Custom painter for the earnings chart.
class _EarningsChartPainter extends CustomPainter {
  final List<EarningsDataPoint> data;
  final double maxValue;
  final Color lineColor;
  final Color fillColor;
  final Color gridColor;

  _EarningsChartPainter({
    required this.data,
    required this.maxValue,
    required this.lineColor,
    required this.fillColor,
    required this.gridColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final width = size.width;
    final height = size.height;

    // Draw grid lines
    final gridPaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = height * (i / 4);
      canvas.drawLine(
        Offset(0, y),
        Offset(width, y),
        gridPaint,
      );
    }

    // Calculate points
    final points = <Offset>[];
    for (int i = 0; i < data.length; i++) {
      final x = width * (i / (data.length - 1));
      final y = height - (height * (data[i].amount / maxValue));
      points.add(Offset(x, y));
    }

    // Draw fill
    final fillPath = Path();
    fillPath.moveTo(0, height);
    for (final point in points) {
      fillPath.lineTo(point.dx, point.dy);
    }
    fillPath.lineTo(width, height);
    fillPath.close();

    final fillPaint = Paint()
      ..color = fillColor
      ..style = PaintingStyle.fill;
    canvas.drawPath(fillPath, fillPaint);

    // Draw line
    final linePath = Path();
    linePath.moveTo(points.first.dx, points.first.dy);
    for (int i = 1; i < points.length; i++) {
      linePath.lineTo(points[i].dx, points[i].dy);
    }

    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(linePath, linePaint);

    // Draw data points
    final pointPaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.fill;

    final pointBorderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    // Only draw a subset of points to avoid clutter
    final step = (data.length / 7).ceil();
    for (int i = 0; i < points.length; i += step) {
      canvas.drawCircle(points[i], 5, pointBorderPaint);
      canvas.drawCircle(points[i], 3, pointPaint);
    }

    // Always draw last point
    if (points.isNotEmpty) {
      canvas.drawCircle(points.last, 5, pointBorderPaint);
      canvas.drawCircle(points.last, 3, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _EarningsChartPainter oldDelegate) {
    return data != oldDelegate.data ||
        maxValue != oldDelegate.maxValue ||
        lineColor != oldDelegate.lineColor;
  }
}
