import 'package:logger/logger.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/marketplace_model.dart';

/// Repository for marketplace operations.
class MarketplaceRepository {
  final SupabaseClient _supabase;
  final Logger _logger = Logger(printer: PrettyPrinter(methodCount: 0));

  MarketplaceRepository({SupabaseClient? supabase})
      : _supabase = supabase ?? Supabase.instance.client;

  /// Get current user ID.
  String? get _currentUserId => _supabase.auth.currentUser?.id;

  /// Map database listing type to model enum.
  static ListingType _mapListingType(String? dbType) {
    switch (dbType?.toLowerCase()) {
      case 'product':
        return ListingType.product;
      case 'housing':
        return ListingType.housing;
      case 'opportunity':
        return ListingType.opportunity;
      case 'community_post':
        return ListingType.communityPost;
      case 'event':
        return ListingType.event;
      case 'poll':
        return ListingType.poll;
      default:
        return ListingType.product;
    }
  }

  /// Map database category to model enum.
  static MarketplaceCategory _mapCategory(String? categoryName) {
    switch (categoryName?.toLowerCase()) {
      case 'hard_goods':
      case 'hardgoods':
        return MarketplaceCategory.hardGoods;
      case 'housing':
        return MarketplaceCategory.housing;
      case 'opportunities':
        return MarketplaceCategory.opportunities;
      case 'community':
        return MarketplaceCategory.community;
      default:
        return MarketplaceCategory.hardGoods;
    }
  }

  /// Convert database row to MarketplaceListing.
  MarketplaceListing _fromDbRow(Map<String, dynamic> row) {
    // Extract seller profile info if joined
    final seller = row['seller'] as Map<String, dynamic>?;
    final category = row['category'] as Map<String, dynamic>?;

    return MarketplaceListing(
      id: row['id'] as String,
      userId: row['seller_id'] as String,
      userName: seller?['full_name'] as String? ?? 'Anonymous',
      userAvatar: seller?['avatar_url'] as String?,
      userUniversity: null, // Would need to join with students table
      category: _mapCategory(category?['name'] as String?),
      type: _mapListingType(row['listing_type'] as String?),
      title: row['title'] as String,
      description: row['description'] as String?,
      price: (row['price'] as num?)?.toDouble(),
      isNegotiable: row['price_negotiable'] as bool? ?? false,
      images: [], // Images stored in separate table
      location: row['location_text'] as String?,
      distanceKm: (row['distance_km'] as num?)?.toDouble(),
      status: _mapStatus(row['status'] as String?),
      createdAt: DateTime.parse(row['created_at'] as String),
      expiresAt: row['expires_at'] != null
          ? DateTime.parse(row['expires_at'] as String)
          : null,
      viewCount: row['view_count'] as int? ?? 0,
      likeCount: row['favorites_count'] as int? ?? 0,
      commentCount: row['inquiry_count'] as int? ?? 0,
      metadata: row['poll_options'] != null
          ? {'pollOptions': row['poll_options'], 'totalVotes': row['total_votes']}
          : null,
    );
  }

  /// Map database status to model enum.
  static ListingStatus _mapStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return ListingStatus.active;
      case 'sold':
        return ListingStatus.sold;
      case 'expired':
        return ListingStatus.expired;
      case 'hidden':
        return ListingStatus.hidden;
      default:
        return ListingStatus.active;
    }
  }

  /// Get all listings with optional filters.
  Future<List<MarketplaceListing>> getListings({
    MarketplaceCategory? category,
    String? city,
    String? searchQuery,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      // Build base query with filters first, then transforms
      var query = _supabase
          .from('marketplace_listings')
          .select('''
            *,
            seller:profiles!seller_id(full_name, avatar_url),
            category:marketplace_categories!category_id(name)
          ''')
          .eq('status', 'active');

      // Apply city filter
      if (city != null && city.isNotEmpty) {
        query = query.ilike('city', '%$city%');
      }

      // Apply search filter
      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.or('title.ilike.%$searchQuery%,description.ilike.%$searchQuery%');
      }

      // Apply ordering and pagination last
      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List<dynamic>)
          .map((row) => _fromDbRow(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      _logger.e('Error fetching listings: $e');
      rethrow;
    }
  }

  /// Get a single listing by ID.
  Future<MarketplaceListing?> getListingById(String id) async {
    try {
      final response = await _supabase
          .from('marketplace_listings')
          .select('''
            *,
            seller:profiles!seller_id(full_name, avatar_url),
            category:marketplace_categories!category_id(name)
          ''')
          .eq('id', id)
          .maybeSingle();

      if (response == null) return null;

      // Increment view count
      await _supabase
          .from('marketplace_listings')
          .update({'view_count': (response['view_count'] as int? ?? 0) + 1})
          .eq('id', id);

      return _fromDbRow(response);
    } catch (e) {
      _logger.e('Error fetching listing: $e');
      rethrow;
    }
  }

  /// Create a new listing.
  Future<MarketplaceListing> createListing({
    required MarketplaceCategory category,
    required ListingType type,
    required String title,
    String? description,
    double? price,
    bool isNegotiable = false,
    List<String> images = const [],
    String? location,
  }) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // First, get the category ID
      final categoryResponse = await _supabase
          .from('marketplace_categories')
          .select('id')
          .eq('name', category.name)
          .maybeSingle();

      final categoryId = categoryResponse?['id'] as String?;

      final response = await _supabase
          .from('marketplace_listings')
          .insert({
            'seller_id': userId,
            'listing_type': type.name,
            'category_id': categoryId,
            'title': title,
            'description': description,
            'price': price,
            'price_negotiable': isNegotiable,
            'location_text': location,
            'status': 'active',
          })
          .select('''
            *,
            seller:profiles!seller_id(full_name, avatar_url),
            category:marketplace_categories!category_id(name)
          ''')
          .single();

      return _fromDbRow(response);
    } catch (e) {
      _logger.e('Error creating listing: $e');
      rethrow;
    }
  }

  /// Toggle like/favorite on a listing.
  Future<bool> toggleLike(String listingId) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      // Check if already favorited
      final existing = await _supabase
          .from('marketplace_favorites')
          .select('id')
          .eq('listing_id', listingId)
          .eq('profile_id', userId)
          .maybeSingle();

      if (existing != null) {
        // Remove favorite
        await _supabase
            .from('marketplace_favorites')
            .delete()
            .eq('listing_id', listingId)
            .eq('profile_id', userId);

        // Decrement count
        await _supabase.rpc('decrement_favorites_count', params: {
          'listing_id': listingId,
        });

        return false;
      } else {
        // Add favorite
        await _supabase.from('marketplace_favorites').insert({
          'listing_id': listingId,
          'profile_id': userId,
        });

        // Increment count
        await _supabase.rpc('increment_favorites_count', params: {
          'listing_id': listingId,
        });

        return true;
      }
    } catch (e) {
      _logger.e('Error toggling like: $e');
      rethrow;
    }
  }

  /// Get current user's listings.
  Future<List<MarketplaceListing>> getUserListings() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final response = await _supabase
          .from('marketplace_listings')
          .select('''
            *,
            seller:profiles!seller_id(full_name, avatar_url),
            category:marketplace_categories!category_id(name)
          ''')
          .eq('seller_id', userId)
          .order('created_at', ascending: false);

      return (response as List<dynamic>)
          .map((row) => _fromDbRow(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      _logger.e('Error fetching user listings: $e');
      rethrow;
    }
  }

  /// Report a listing.
  Future<void> reportListing(String listingId, String reason) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      await _supabase.from('marketplace_reports').insert({
        'listing_id': listingId,
        'reporter_id': userId,
        'reason': reason,
        'status': 'pending',
      });
    } catch (e) {
      _logger.e('Error reporting listing: $e');
      rethrow;
    }
  }
}
