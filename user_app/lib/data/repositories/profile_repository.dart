import 'package:logger/logger.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_model.dart';
import '../models/wallet_model.dart';

// Re-export user model for backward compatibility
export '../models/user_model.dart' show UserProfile, UserType, ProfessionalType;

/// Repository for profile operations.
class ProfileRepository {
  final SupabaseClient _supabase;
  final Logger _logger = Logger(printer: PrettyPrinter(methodCount: 0));

  ProfileRepository({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client;

  /// Get current user ID.
  String? get _currentUserId => _supabase.auth.currentUser?.id;

  /// Get current user's profile.
  Future<UserProfile> getProfile() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();

      return UserProfile.fromJson(response);
    } catch (e) {
      _logger.e('Error fetching profile: $e');
      rethrow;
    }
  }

  /// Update user profile.
  Future<UserProfile> updateProfile({
    String? fullName,
    String? phone,
    String? email,
    String? avatarUrl,
    String? city,
    String? state,
    UserType? userType,
  }) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final updates = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (fullName != null) updates['full_name'] = fullName;
      if (phone != null) updates['phone'] = phone;
      if (avatarUrl != null) updates['avatar_url'] = avatarUrl;
      if (city != null) updates['city'] = city;
      if (state != null) updates['state'] = state;
      if (userType != null) updates['user_type'] = userType.toDbString();

      final response = await _supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

      return UserProfile.fromJson(response);
    } catch (e) {
      _logger.e('Error updating profile: $e');
      rethrow;
    }
  }

  /// Get user's wallet.
  Future<Wallet> getWallet() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final response = await _supabase
          .from('wallets')
          .select()
          .eq('profile_id', userId)
          .single();

      return Wallet.fromJson(response);
    } catch (e) {
      _logger.e('Error fetching wallet: $e');
      rethrow;
    }
  }

  /// Get wallet transactions.
  Future<List<WalletTransaction>> getTransactions({
    int limit = 20,
    int offset = 0,
  }) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // First get the wallet ID
      final walletResponse = await _supabase
          .from('wallets')
          .select('id')
          .eq('profile_id', userId)
          .single();

      final walletId = walletResponse['id'] as String;

      final response = await _supabase
          .from('wallet_transactions')
          .select()
          .eq('wallet_id', walletId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) => WalletTransaction.fromJson(json))
          .toList();
    } catch (e) {
      _logger.e('Error fetching transactions: $e');
      rethrow;
    }
  }

  /// Top up wallet - creates a pending transaction.
  /// Note: Actual payment processing happens via Razorpay webhook.
  Future<Wallet> topUpWallet(double amount) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // Get current wallet
      final wallet = await getWallet();

      // Create pending transaction record
      await _supabase.from('wallet_transactions').insert({
        'wallet_id': wallet.id,
        'transaction_type': 'top_up',
        'amount': amount,
        'balance_before': wallet.balance,
        'balance_after': wallet.balance + amount,
        'description': 'Wallet Top-up',
        'status': 'pending',
      });

      // Return current wallet - balance updates after payment confirmation
      return wallet;
    } catch (e) {
      _logger.e('Error initiating top-up: $e');
      rethrow;
    }
  }

  /// Get payment methods.
  Future<List<PaymentMethod>> getPaymentMethods() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final response = await _supabase
          .from('payment_methods')
          .select()
          .eq('profile_id', userId)
          .order('is_default', ascending: false)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => PaymentMethod.fromJson(json))
          .toList();
    } catch (e) {
      _logger.e('Error fetching payment methods: $e');
      rethrow;
    }
  }

  /// Add payment method.
  Future<PaymentMethod> addPaymentMethod({
    required PaymentMethodType type,
    required String displayName,
    String? lastFourDigits,
    String? upiId,
    bool setAsDefault = false,
  }) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // If setting as default, unset other defaults first
      if (setAsDefault) {
        await _supabase
            .from('payment_methods')
            .update({'is_default': false})
            .eq('profile_id', userId);
      }

      final response = await _supabase
          .from('payment_methods')
          .insert({
            'profile_id': userId,
            'method_type': type.toDbString(),
            'display_name': displayName,
            'card_last_four': lastFourDigits,
            'upi_id': upiId,
            'is_default': setAsDefault,
          })
          .select()
          .single();

      return PaymentMethod.fromJson(response);
    } catch (e) {
      _logger.e('Error adding payment method: $e');
      rethrow;
    }
  }

  /// Delete payment method.
  Future<void> deletePaymentMethod(String id) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      await _supabase
          .from('payment_methods')
          .delete()
          .eq('id', id)
          .eq('profile_id', userId);
    } catch (e) {
      _logger.e('Error deleting payment method: $e');
      rethrow;
    }
  }

  /// Get referral info.
  Future<Referral> getReferral() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // Get profile with referral code
      final profile = await getProfile();

      // Count successful referrals
      final referralsResponse = await _supabase
          .from('profiles')
          .select('id')
          .eq('referred_by', userId);

      final totalReferrals = (referralsResponse as List).length;

      // Calculate total earnings (assuming 200 per referral)
      const earningsPerReferral = 200.0;
      final totalEarnings = totalReferrals * earningsPerReferral;

      return Referral(
        id: userId,
        userId: userId,
        code: profile.referralCode ?? 'ASSIGNX${userId.substring(0, 6).toUpperCase()}',
        totalReferrals: totalReferrals,
        totalEarnings: totalEarnings,
        createdAt: profile.createdAt,
      );
    } catch (e) {
      _logger.e('Error fetching referral: $e');
      rethrow;
    }
  }

  /// Get completed projects count.
  Future<int> getCompletedProjectsCount() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final response = await _supabase
          .from('projects')
          .select('id')
          .eq('client_id', userId)
          .eq('status', 'completed');

      return (response as List).length;
    } catch (e) {
      _logger.e('Error fetching completed projects count: $e');
      return 0;
    }
  }

  /// Log out user.
  Future<void> logout() async {
    await _supabase.auth.signOut();
  }

  /// Get app version.
  Future<String> getAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      return '${packageInfo.version}+${packageInfo.buildNumber}';
    } catch (e) {
      _logger.w('Error getting app version: $e');
      return '1.0.0';
    }
  }
}
