import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/earnings_model.dart';
import '../../data/models/transaction_model.dart';
import '../providers/earnings_provider.dart';
import '../widgets/earnings_chart.dart';
import '../widgets/stats_widgets.dart';
import '../widgets/transaction_widgets.dart';

/// Main earnings screen with tabs for overview, transactions, and commission.
class EarningsScreen extends ConsumerStatefulWidget {
  const EarningsScreen({super.key});

  @override
  ConsumerState<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends ConsumerState<EarningsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final earningsState = ref.watch(earningsProvider);
    final transactionsState = ref.watch(transactionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Earnings'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Transactions'),
            Tab(text: 'Commission'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(earningsProvider.notifier).refresh();
              ref.read(transactionsProvider.notifier).refresh();
            },
          ),
        ],
      ),
      body: earningsState.isLoading && earningsState.summary == null
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                // Overview Tab
                _OverviewTab(
                  state: earningsState,
                  onPeriodChanged: (period) {
                    ref.read(earningsProvider.notifier).changePeriod(period);
                  },
                  onWithdraw: () => _showWithdrawDialog(context),
                  onRefresh: () async {
                    await ref.read(earningsProvider.notifier).refresh();
                  },
                ),
                // Transactions Tab
                _TransactionsTab(
                  state: transactionsState,
                  onTransactionTap: (tx) => _showTransactionDetail(context, tx),
                  onLoadMore: () =>
                      ref.read(transactionsProvider.notifier).loadMore(),
                  onFilterChanged: (filter) {
                    ref.read(transactionsProvider.notifier).updateFilter(filter);
                  },
                ),
                // Commission Tab
                _CommissionTab(
                  breakdown: earningsState.commissionBreakdown,
                  period: earningsState.selectedPeriod,
                  onPeriodChanged: (period) {
                    ref.read(earningsProvider.notifier).changePeriod(period);
                  },
                ),
              ],
            ),
    );
  }

  void _showWithdrawDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const _WithdrawDialog(),
    );
  }

  void _showTransactionDetail(BuildContext context, TransactionModel tx) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => TransactionDetailSheet(transaction: tx),
    );
  }
}

/// Overview tab showing balance, metrics, and charts.
class _OverviewTab extends StatelessWidget {
  const _OverviewTab({
    required this.state,
    required this.onPeriodChanged,
    this.onWithdraw,
    this.onRefresh,
  });

  final EarningsState state;
  final void Function(EarningsPeriod) onPeriodChanged;
  final VoidCallback? onWithdraw;
  final Future<void> Function()? onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh ?? () async {},
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Balance Card
            if (state.summary != null)
              BalanceCard(
                totalEarnings: state.summary!.totalEarnings,
                availableBalance: state.summary!.availableBalance,
                pendingEarnings: state.summary!.pendingEarnings,
                onWithdraw: onWithdraw,
              ),

            // Period Selector
            PeriodSelector(
              selectedPeriod: state.selectedPeriod,
              onPeriodChanged: onPeriodChanged,
            ),

            const SizedBox(height: 8),

            // Stats Cards Row
            if (state.summary != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: StatsCard(
                        title: 'Projects',
                        value: state.summary!.projectsCompleted.toString(),
                        icon: Icons.folder_copy,
                        iconColor: Colors.blue,
                        trend: (state.summary!.growthPercentage ?? 0) > 0
                            ? '+${state.summary!.growthPercentage!.toStringAsFixed(1)}%'
                            : null,
                        trendPositive: (state.summary!.growthPercentage ?? 0) > 0,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatsCard(
                        title: 'Avg/Project',
                        value: '\$${state.summary!.averagePerProject.toStringAsFixed(0)}',
                        icon: Icons.trending_up,
                        iconColor: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 8),

            // Earnings Chart
            if (state.chartData.isNotEmpty)
              EarningsChartCard(
                dataPoints: state.chartData,
                title: 'Earnings Trend',
              ),

            // Performance Metrics
            if (state.performanceMetrics != null)
              PerformanceMetricsWidget(
                metrics: state.performanceMetrics!,
              ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

/// Transactions tab with list and filters.
class _TransactionsTab extends StatelessWidget {
  const _TransactionsTab({
    required this.state,
    required this.onTransactionTap,
    required this.onLoadMore,
    required this.onFilterChanged,
  });

  final TransactionsState state;
  final void Function(TransactionModel) onTransactionTap;
  final VoidCallback onLoadMore;
  final void Function(TransactionFilter) onFilterChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              // Quick stats
              Expanded(
                child: Row(
                  children: [
                    _QuickStat(
                      label: 'Income',
                      value: '\$${state.totalCredits.toStringAsFixed(0)}',
                      color: AppColors.success,
                    ),
                    const SizedBox(width: 16),
                    _QuickStat(
                      label: 'Outgoing',
                      value: '\$${state.totalDebits.toStringAsFixed(0)}',
                      color: AppColors.error,
                    ),
                  ],
                ),
              ),
              // Filter button
              IconButton.filledTonal(
                onPressed: () => _showFilterSheet(context),
                icon: Badge(
                  isLabelVisible: state.filter.hasFilters,
                  child: const Icon(Icons.filter_list),
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        // Transaction list
        Expanded(
          child: TransactionList(
            transactions: state.transactions,
            onTransactionTap: onTransactionTap,
            onLoadMore: onLoadMore,
            hasMore: state.hasMore,
            isLoading: state.isLoading,
          ),
        ),
      ],
    );
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => TransactionFilterSheet(
        currentFilter: state.filter,
        onApply: onFilterChanged,
      ),
    );
  }
}

class _QuickStat extends StatelessWidget {
  const _QuickStat({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondaryLight,
                    fontSize: 10,
                  ),
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Commission tab with pie chart breakdown.
class _CommissionTab extends StatelessWidget {
  const _CommissionTab({
    required this.breakdown,
    required this.period,
    required this.onPeriodChanged,
  });

  final List<CommissionBreakdown> breakdown;
  final EarningsPeriod period;
  final void Function(EarningsPeriod) onPeriodChanged;

  @override
  Widget build(BuildContext context) {
    final total = breakdown.fold(0.0, (sum, item) => sum + item.amount);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Period selector
          PeriodSelector(
            selectedPeriod: period,
            onPeriodChanged: onPeriodChanged,
          ),
          const SizedBox(height: 16),

          // Total earnings card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    'Total Commission',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: AppColors.textSecondaryLight,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${total.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${breakdown.fold(0, (sum, item) => sum + item.projectCount)} projects',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondaryLight,
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Pie chart
          Text(
            'Commission by Category',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),

          if (breakdown.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  'No commission data for this period',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondaryLight,
                      ),
                ),
              ),
            )
          else
            CommissionPieChart(
              breakdown: breakdown,
              size: 180,
            ),

          const SizedBox(height: 24),

          // Detailed breakdown list
          if (breakdown.isNotEmpty) ...[
            Text(
              'Detailed Breakdown',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            ...breakdown.map((item) => _CommissionItem(item: item)),
          ],
        ],
      ),
    );
  }
}

class _CommissionItem extends StatelessWidget {
  const _CommissionItem({required this.item});

  final CommissionBreakdown item;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: (item.color ?? AppColors.primary).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  '${item.percentage.toStringAsFixed(0)}%',
                  style: TextStyle(
                    color: item.color ?? AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.category,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  Text(
                    '${item.projectCount} projects',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondaryLight,
                        ),
                  ),
                ],
              ),
            ),
            Text(
              '\$${item.amount.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Withdrawal dialog.
class _WithdrawDialog extends ConsumerStatefulWidget {
  const _WithdrawDialog();

  @override
  ConsumerState<_WithdrawDialog> createState() => _WithdrawDialogState();
}

class _WithdrawDialogState extends ConsumerState<_WithdrawDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _selectedMethod = 'paypal';

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final transactionsState = ref.watch(transactionsProvider);

    return AlertDialog(
      title: const Text('Request Withdrawal'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Amount',
                prefixText: '\$',
                hintText: '0.00',
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter an amount';
                }
                final amount = double.tryParse(value);
                if (amount == null || amount <= 0) {
                  return 'Please enter a valid amount';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedMethod,
              decoration: const InputDecoration(
                labelText: 'Payment Method',
              ),
              items: const [
                DropdownMenuItem(value: 'paypal', child: Text('PayPal')),
                DropdownMenuItem(value: 'bank', child: Text('Bank Transfer')),
                DropdownMenuItem(value: 'wise', child: Text('Wise')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedMethod = value);
                }
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: transactionsState.isWithdrawing ? null : _submit,
          child: transactionsState.isWithdrawing
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Submit'),
        ),
      ],
    );
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final amount = double.parse(_amountController.text);
      final result = await ref.read(transactionsProvider.notifier).requestWithdrawal(
            amount: amount,
            paymentMethod: _selectedMethod,
          );

      if (mounted) {
        Navigator.pop(context);
        if (result != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Withdrawal request submitted successfully'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    }
  }
}
