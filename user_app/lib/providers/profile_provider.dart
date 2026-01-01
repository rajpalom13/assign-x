import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/wallet_model.dart';
import '../data/repositories/profile_repository.dart';

/// Provider for profile repository.
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository();
});

/// Provider for user profile.
final userProfileProvider = FutureProvider.autoDispose<UserProfile>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getProfile();
});

/// Provider for wallet.
final walletProvider = FutureProvider.autoDispose<Wallet>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getWallet();
});

/// Provider for wallet transactions.
final walletTransactionsProvider =
    FutureProvider.autoDispose<List<WalletTransaction>>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getTransactions();
});

/// Provider for payment methods.
final paymentMethodsProvider =
    FutureProvider.autoDispose<List<PaymentMethod>>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getPaymentMethods();
});

/// Provider for referral.
final referralProvider = FutureProvider.autoDispose<Referral>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getReferral();
});

/// Provider for completed projects count.
final completedProjectsCountProvider =
    FutureProvider.autoDispose<int>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getCompletedProjectsCount();
});

/// Provider for app version.
final appVersionProvider = FutureProvider<String>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.getAppVersion();
});

/// Notifier for profile updates.
class ProfileNotifier extends StateNotifier<AsyncValue<UserProfile>> {
  final ProfileRepository _repository;

  ProfileNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    state = const AsyncValue.loading();
    try {
      final profile = await _repository.getProfile();
      state = AsyncValue.data(profile);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateProfile({
    String? fullName,
    String? phone,
    String? avatarUrl,
    String? city,
    String? state_,
    UserType? userType,
  }) async {
    try {
      final updated = await _repository.updateProfile(
        fullName: fullName,
        phone: phone,
        avatarUrl: avatarUrl,
        city: city,
        state: state_,
        userType: userType,
      );
      state = AsyncValue.data(updated);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await _loadProfile();
  }
}

/// Provider for profile notifier.
final profileNotifierProvider =
    StateNotifierProvider.autoDispose<ProfileNotifier, AsyncValue<UserProfile>>(
        (ref) {
  final repository = ref.watch(profileRepositoryProvider);
  return ProfileNotifier(repository);
});

/// Notifier for wallet operations.
class WalletNotifier extends StateNotifier<AsyncValue<Wallet>> {
  final ProfileRepository _repository;

  WalletNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadWallet();
  }

  Future<void> _loadWallet() async {
    state = const AsyncValue.loading();
    try {
      final wallet = await _repository.getWallet();
      state = AsyncValue.data(wallet);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> topUp(double amount) async {
    try {
      final updated = await _repository.topUpWallet(amount);
      state = AsyncValue.data(updated);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await _loadWallet();
  }
}

/// Provider for wallet notifier.
final walletNotifierProvider =
    StateNotifierProvider.autoDispose<WalletNotifier, AsyncValue<Wallet>>(
        (ref) {
  final repository = ref.watch(profileRepositoryProvider);
  return WalletNotifier(repository);
});
