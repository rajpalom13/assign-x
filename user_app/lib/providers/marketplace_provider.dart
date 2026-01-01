import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/marketplace_model.dart';
import '../data/repositories/marketplace_repository.dart';

/// Provider for marketplace repository.
final marketplaceRepositoryProvider = Provider<MarketplaceRepository>((ref) {
  return MarketplaceRepository();
});

/// State for marketplace filters.
class MarketplaceFilterState {
  final MarketplaceCategory? category;
  final String? city;
  final String? searchQuery;

  const MarketplaceFilterState({
    this.category,
    this.city,
    this.searchQuery,
  });

  MarketplaceFilterState copyWith({
    MarketplaceCategory? category,
    String? city,
    String? searchQuery,
    bool clearCategory = false,
    bool clearCity = false,
    bool clearSearch = false,
  }) {
    return MarketplaceFilterState(
      category: clearCategory ? null : (category ?? this.category),
      city: clearCity ? null : (city ?? this.city),
      searchQuery: clearSearch ? null : (searchQuery ?? this.searchQuery),
    );
  }

  bool get hasFilters => category != null || city != null || searchQuery != null;
}

/// Provider for marketplace filters.
final marketplaceFilterProvider =
    StateNotifierProvider<MarketplaceFilterNotifier, MarketplaceFilterState>(
        (ref) {
  return MarketplaceFilterNotifier();
});

/// Notifier for marketplace filters.
class MarketplaceFilterNotifier extends StateNotifier<MarketplaceFilterState> {
  MarketplaceFilterNotifier() : super(const MarketplaceFilterState());

  void setCategory(MarketplaceCategory? category) {
    state = state.copyWith(
      category: category,
      clearCategory: category == null,
    );
  }

  void setCity(String? city) {
    state = state.copyWith(
      city: city,
      clearCity: city == null,
    );
  }

  void setSearchQuery(String? query) {
    state = state.copyWith(
      searchQuery: query,
      clearSearch: query == null || query.isEmpty,
    );
  }

  void clearFilters() {
    state = const MarketplaceFilterState();
  }
}

/// Provider for marketplace listings.
final marketplaceListingsProvider =
    FutureProvider.autoDispose<List<MarketplaceListing>>((ref) async {
  final repository = ref.watch(marketplaceRepositoryProvider);
  final filters = ref.watch(marketplaceFilterProvider);

  return repository.getListings(
    category: filters.category,
    city: filters.city,
    searchQuery: filters.searchQuery,
  );
});

/// Provider for a single listing.
final listingDetailProvider =
    FutureProvider.autoDispose.family<MarketplaceListing?, String>(
        (ref, listingId) async {
  final repository = ref.watch(marketplaceRepositoryProvider);
  return repository.getListingById(listingId);
});

/// Provider for user's own listings.
final userListingsProvider =
    FutureProvider.autoDispose<List<MarketplaceListing>>((ref) async {
  final repository = ref.watch(marketplaceRepositoryProvider);
  return repository.getUserListings();
});

/// Provider to toggle like.
final toggleLikeProvider =
    FutureProvider.autoDispose.family<bool, String>((ref, listingId) async {
  final repository = ref.watch(marketplaceRepositoryProvider);
  return repository.toggleLike(listingId);
});
