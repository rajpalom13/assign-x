import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/earnings_model.dart';
import '../models/transaction_model.dart';

/// Repository for earnings and transaction operations.
class EarningsRepository {
  EarningsRepository({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  final SupabaseClient _client;

  // ==================== EARNINGS ====================

  /// Get earnings summary.
  Future<EarningsSummary> getEarningsSummary({
    EarningsPeriod period = EarningsPeriod.monthly,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return _getMockEarningsSummary(period);

      final response = await _client.rpc('get_earnings_summary', params: {
        'user_id': userId,
        'period': period.id,
      });

      return EarningsSummary.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getEarningsSummary error: $e');
        return _getMockEarningsSummary(period);
      }
      rethrow;
    }
  }

  /// Get earnings chart data.
  Future<List<EarningsDataPoint>> getEarningsChartData({
    EarningsPeriod period = EarningsPeriod.monthly,
    int limit = 12,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return _getMockChartData(period, limit);

      final response = await _client.rpc('get_earnings_chart', params: {
        'user_id': userId,
        'period': period.id,
        'limit_count': limit,
      });

      return (response as List)
          .map((json) => EarningsDataPoint.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getEarningsChartData error: $e');
        return _getMockChartData(period, limit);
      }
      rethrow;
    }
  }

  /// Get commission breakdown.
  Future<List<CommissionBreakdown>> getCommissionBreakdown({
    EarningsPeriod period = EarningsPeriod.monthly,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return _getMockCommissionBreakdown();

      final response = await _client.rpc('get_commission_breakdown', params: {
        'user_id': userId,
        'period': period.id,
      });

      return (response as List)
          .map((json) => CommissionBreakdown.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getCommissionBreakdown error: $e');
        return _getMockCommissionBreakdown();
      }
      rethrow;
    }
  }

  /// Get performance metrics.
  Future<PerformanceMetrics> getPerformanceMetrics() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return _getMockPerformanceMetrics();

      final response = await _client.rpc('get_performance_metrics', params: {
        'user_id': userId,
      });

      return PerformanceMetrics.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getPerformanceMetrics error: $e');
        return _getMockPerformanceMetrics();
      }
      rethrow;
    }
  }

  // ==================== TRANSACTIONS ====================

  /// Get transactions.
  Future<List<TransactionModel>> getTransactions({
    int limit = 20,
    int offset = 0,
    TransactionFilter? filter,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return _getMockTransactions();

      var query = _client
          .from('transactions')
          .select()
          .eq('user_id', userId);

      if (filter?.types != null && filter!.types!.isNotEmpty) {
        query = query.inFilter('type', filter.types!.map((t) => t.id).toList());
      }
      if (filter?.statuses != null && filter!.statuses!.isNotEmpty) {
        query = query.inFilter(
            'status', filter.statuses!.map((s) => s.id).toList());
      }
      if (filter?.startDate != null) {
        query = query.gte('created_at', filter!.startDate!.toIso8601String());
      }
      if (filter?.endDate != null) {
        query = query.lte('created_at', filter!.endDate!.toIso8601String());
      }

      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) => TransactionModel.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getTransactions error: $e');
        return _getMockTransactions();
      }
      rethrow;
    }
  }

  /// Get transaction by ID.
  Future<TransactionModel?> getTransaction(String id) async {
    try {
      final response =
          await _client.from('transactions').select().eq('id', id).single();

      return TransactionModel.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.getTransaction error: $e');
        return _getMockTransactions().where((t) => t.id == id).firstOrNull;
      }
      rethrow;
    }
  }

  /// Request withdrawal.
  Future<TransactionModel?> requestWithdrawal({
    required double amount,
    required String paymentMethod,
    Map<String, dynamic>? paymentDetails,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return null;

      final response = await _client
          .from('transactions')
          .insert({
            'user_id': userId,
            'type': TransactionType.withdrawal.id,
            'amount': amount,
            'status': TransactionStatus.pending.id,
            'description': 'Withdrawal request',
            'metadata': {
              'payment_method': paymentMethod,
              ...?paymentDetails,
            },
          })
          .select()
          .single();

      return TransactionModel.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('EarningsRepository.requestWithdrawal error: $e');
        return TransactionModel(
          id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
          type: TransactionType.withdrawal,
          amount: amount,
          status: TransactionStatus.pending,
          createdAt: DateTime.now(),
          description: 'Withdrawal request',
        );
      }
      rethrow;
    }
  }

  // ==================== MOCK DATA ====================

  EarningsSummary _getMockEarningsSummary(EarningsPeriod period) {
    return EarningsSummary(
      totalEarnings: 4250.00,
      pendingEarnings: 380.00,
      withdrawnAmount: 3200.00,
      availableBalance: 1050.00,
      projectsCompleted: 28,
      averagePerProject: 151.79,
      period: period,
      periodStart: DateTime.now().subtract(const Duration(days: 30)),
      periodEnd: DateTime.now(),
      growthPercentage: 12.5,
      previousPeriodEarnings: 3778.00,
    );
  }

  List<EarningsDataPoint> _getMockChartData(EarningsPeriod period, int limit) {
    final now = DateTime.now();
    final data = <EarningsDataPoint>[];

    for (int i = limit - 1; i >= 0; i--) {
      final date = now.subtract(Duration(days: i * (period == EarningsPeriod.daily ? 1 : 7)));
      final amount = 300 + (i % 5) * 100 + (i * 25).toDouble();
      data.add(EarningsDataPoint(
        date: date,
        amount: amount,
        projectCount: 2 + (i % 3),
      ));
    }

    return data;
  }

  List<CommissionBreakdown> _getMockCommissionBreakdown() {
    return [
      CommissionBreakdown(
        category: 'Essays',
        amount: 1250.00,
        percentage: 29.4,
        projectCount: 12,
        color: Colors.blue,
      ),
      CommissionBreakdown(
        category: 'Research Papers',
        amount: 1580.00,
        percentage: 37.2,
        projectCount: 8,
        color: Colors.green,
      ),
      CommissionBreakdown(
        category: 'Case Studies',
        amount: 820.00,
        percentage: 19.3,
        projectCount: 5,
        color: Colors.orange,
      ),
      CommissionBreakdown(
        category: 'Dissertations',
        amount: 600.00,
        percentage: 14.1,
        projectCount: 3,
        color: Colors.purple,
      ),
    ];
  }

  PerformanceMetrics _getMockPerformanceMetrics() {
    return const PerformanceMetrics(
      totalProjects: 342,
      completedProjects: 328,
      approvalRate: 96.2,
      averageResponseTime: 2.4,
      clientSatisfaction: 4.7,
      onTimeDelivery: 94.5,
      revisionRate: 8.3,
      repeatClientRate: 42.0,
      rank: 12,
      totalRank: 156,
    );
  }

  List<TransactionModel> _getMockTransactions() {
    final now = DateTime.now();
    return [
      TransactionModel(
        id: 'tx_1',
        type: TransactionType.earning,
        amount: 125.00,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(hours: 2)),
        projectId: 'proj_1',
        projectTitle: 'Marketing Strategy Analysis',
        description: 'Project completion payment',
        balanceAfter: 1050.00,
      ),
      TransactionModel(
        id: 'tx_2',
        type: TransactionType.earning,
        amount: 85.00,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(days: 1)),
        projectId: 'proj_2',
        projectTitle: 'Business Essay',
        description: 'Project completion payment',
        balanceAfter: 925.00,
      ),
      TransactionModel(
        id: 'tx_3',
        type: TransactionType.withdrawal,
        amount: 500.00,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(days: 3)),
        description: 'Withdrawal to PayPal',
        reference: 'WD-2024-001234',
        balanceAfter: 840.00,
        processedAt: now.subtract(const Duration(days: 2)),
      ),
      TransactionModel(
        id: 'tx_4',
        type: TransactionType.bonus,
        amount: 50.00,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(days: 5)),
        description: 'Performance bonus - Top 10 supervisor',
        balanceAfter: 1340.00,
      ),
      TransactionModel(
        id: 'tx_5',
        type: TransactionType.earning,
        amount: 200.00,
        status: TransactionStatus.pending,
        createdAt: now.subtract(const Duration(days: 1)),
        projectId: 'proj_3',
        projectTitle: 'Research Methodology',
        description: 'Awaiting client confirmation',
      ),
      TransactionModel(
        id: 'tx_6',
        type: TransactionType.earning,
        amount: 150.00,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(days: 7)),
        projectId: 'proj_4',
        projectTitle: 'Case Study Analysis',
        description: 'Project completion payment',
        balanceAfter: 1290.00,
      ),
      TransactionModel(
        id: 'tx_7',
        type: TransactionType.fee,
        amount: 2.50,
        status: TransactionStatus.completed,
        createdAt: now.subtract(const Duration(days: 3)),
        description: 'Payment processing fee',
        reference: 'FEE-2024-005678',
        balanceAfter: 837.50,
      ),
      TransactionModel(
        id: 'tx_8',
        type: TransactionType.withdrawal,
        amount: 300.00,
        status: TransactionStatus.processing,
        createdAt: now.subtract(const Duration(hours: 12)),
        description: 'Withdrawal to Bank Account',
        reference: 'WD-2024-001235',
      ),
    ];
  }
}
