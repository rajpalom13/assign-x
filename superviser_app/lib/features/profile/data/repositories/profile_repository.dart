import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/profile_model.dart';
import '../models/review_model.dart';

/// Repository for profile and review operations.
class ProfileRepository {
  ProfileRepository({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  final SupabaseClient _client;

  // ==================== PROFILE ====================

  /// Get current user's profile.
  Future<SupervisorProfile?> getProfile() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return null;

      final response = await _client
          .from('supervisor_profiles')
          .select()
          .eq('user_id', userId)
          .single();

      return SupervisorProfile.fromJson(response);
    } catch (e) {
      // Only return mock data in debug mode for development
      if (kDebugMode) {
        debugPrint('ProfileRepository.getProfile error: $e');
        return _getMockProfile();
      }
      rethrow;
    }
  }

  /// Update profile.
  Future<SupervisorProfile?> updateProfile(SupervisorProfile profile) async {
    try {
      final response = await _client
          .from('supervisor_profiles')
          .update(profile.toJson())
          .eq('id', profile.id)
          .select()
          .single();

      return SupervisorProfile.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.updateProfile error: $e');
        return profile;
      }
      rethrow;
    }
  }

  /// Upload avatar image.
  Future<String?> uploadAvatar(File imageFile) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return null;

      final fileName = 'avatar_$userId.jpg';
      final path = 'avatars/$fileName';

      await _client.storage.from('profiles').upload(
            path,
            imageFile,
            fileOptions: const FileOptions(upsert: true),
          );

      final url = _client.storage.from('profiles').getPublicUrl(path);
      return url;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.uploadAvatar error: $e');
        return null;
      }
      rethrow;
    }
  }

  /// Update availability status.
  Future<bool> updateAvailability(bool isAvailable) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return false;

      await _client
          .from('supervisor_profiles')
          .update({'is_available': isAvailable}).eq('user_id', userId);

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.updateAvailability error: $e');
        return true;
      }
      rethrow;
    }
  }

  // ==================== REVIEWS ====================

  /// Get reviews for the current user.
  Future<List<ReviewModel>> getReviews({
    int limit = 20,
    int offset = 0,
    ReviewFilter? filter,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return [];

      var query = _client
          .from('reviews')
          .select()
          .eq('supervisor_id', userId);

      if (filter?.minRating != null) {
        query = query.gte('rating', filter!.minRating!);
      }
      if (filter?.maxRating != null) {
        query = query.lte('rating', filter!.maxRating!);
      }

      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) => ReviewModel.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.getReviews error: $e');
        return _getMockReviews();
      }
      rethrow;
    }
  }

  /// Get reviews summary.
  Future<ReviewsSummary> getReviewsSummary() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) {
        return _getMockReviewsSummary();
      }

      final response = await _client.rpc('get_reviews_summary', params: {
        'supervisor_id': userId,
      });

      return ReviewsSummary.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.getReviewsSummary error: $e');
        return _getMockReviewsSummary();
      }
      rethrow;
    }
  }

  /// Respond to a review.
  Future<bool> respondToReview(String reviewId, String response) async {
    try {
      await _client.from('reviews').update({
        'response': response,
        'responded_at': DateTime.now().toIso8601String(),
      }).eq('id', reviewId);

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.respondToReview error: $e');
        return true;
      }
      rethrow;
    }
  }

  // ==================== DOER BLACKLIST ====================

  /// Get blacklisted doers.
  Future<List<DoerInfo>> getBlacklistedDoers() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return [];

      final response = await _client
          .from('doer_blacklist')
          .select('doers(*)')
          .eq('supervisor_id', userId);

      return (response as List).map((json) {
        final doerJson = json['doers'] as Map<String, dynamic>;
        return DoerInfo.fromJson({
          ...doerJson,
          'is_blacklisted': true,
          'blacklist_reason': json['reason'],
          'blacklisted_at': json['created_at'],
        });
      }).toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.getBlacklistedDoers error: $e');
        return _getMockBlacklistedDoers();
      }
      rethrow;
    }
  }

  /// Add doer to blacklist.
  Future<bool> blacklistDoer(String doerId, String reason) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return false;

      await _client.from('doer_blacklist').insert({
        'supervisor_id': userId,
        'doer_id': doerId,
        'reason': reason,
      });

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.blacklistDoer error: $e');
        return true;
      }
      rethrow;
    }
  }

  /// Remove doer from blacklist.
  Future<bool> unblacklistDoer(String doerId) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return false;

      await _client
          .from('doer_blacklist')
          .delete()
          .eq('supervisor_id', userId)
          .eq('doer_id', doerId);

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ProfileRepository.unblacklistDoer error: $e');
        return true;
      }
      rethrow;
    }
  }

  // ==================== MOCK DATA ====================

  SupervisorProfile _getMockProfile() {
    return SupervisorProfile(
      id: 'profile_1',
      userId: 'user_1',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 234 567 8900',
      avatarUrl: 'https://picsum.photos/seed/profile/200',
      bio:
          'Experienced academic supervisor with expertise in research methodology and academic writing. Specialized in business and management studies.',
      specializations: ['Business', 'Management', 'Economics', 'Marketing'],
      languages: ['English', 'Spanish'],
      timezone: 'America/New_York',
      isAvailable: true,
      maxConcurrentProjects: 8,
      preferredSubjects: ['MBA', 'Business Administration', 'Marketing'],
      qualifications: [
        const Qualification(
          degree: 'PhD',
          field: 'Business Administration',
          institution: 'Harvard Business School',
          year: 2018,
          isVerified: true,
        ),
        const Qualification(
          degree: 'MBA',
          field: 'Marketing',
          institution: 'MIT Sloan',
          year: 2014,
          isVerified: true,
        ),
      ],
      experience: 8,
      joinedAt: DateTime(2020, 3, 15),
      lastActiveAt: DateTime.now(),
      isVerified: true,
      rating: 4.8,
      totalProjects: 342,
      completedProjects: 328,
    );
  }

  List<ReviewModel> _getMockReviews() {
    return [
      ReviewModel(
        id: 'review_1',
        rating: 5.0,
        projectId: 'project_1',
        projectTitle: 'Marketing Strategy Analysis',
        clientId: 'client_1',
        clientName: 'Sarah Johnson',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        comment:
            'Excellent work! The supervisor provided detailed feedback and helped improve my paper significantly. Highly recommended!',
        tags: ['Quality', 'Communication', 'Timely'],
      ),
      ReviewModel(
        id: 'review_2',
        rating: 4.5,
        projectId: 'project_2',
        projectTitle: 'Financial Analysis Report',
        clientId: 'client_2',
        clientName: 'Michael Brown',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        comment:
            'Very thorough review with constructive feedback. Minor delays but overall satisfied.',
        response: 'Thank you for your feedback! I apologize for the delay.',
        respondedAt: DateTime.now().subtract(const Duration(days: 4)),
        tags: ['Thorough', 'Professional'],
      ),
      ReviewModel(
        id: 'review_3',
        rating: 5.0,
        projectId: 'project_3',
        projectTitle: 'Business Plan Development',
        clientId: 'client_3',
        clientName: 'Emily Davis',
        createdAt: DateTime.now().subtract(const Duration(days: 10)),
        comment: 'Outstanding support throughout the project. A++',
        tags: ['Supportive', 'Expert'],
      ),
      ReviewModel(
        id: 'review_4',
        rating: 4.0,
        projectId: 'project_4',
        projectTitle: 'Research Methodology Paper',
        clientId: 'client_4',
        clientName: 'James Wilson',
        createdAt: DateTime.now().subtract(const Duration(days: 15)),
        comment: 'Good work, met all requirements.',
      ),
      ReviewModel(
        id: 'review_5',
        rating: 4.8,
        projectId: 'project_5',
        projectTitle: 'Case Study Analysis',
        clientId: 'client_5',
        clientName: 'Lisa Anderson',
        createdAt: DateTime.now().subtract(const Duration(days: 20)),
        comment:
            'Great attention to detail and very responsive. Would definitely work with again.',
        tags: ['Responsive', 'Detail-oriented'],
      ),
    ];
  }

  ReviewsSummary _getMockReviewsSummary() {
    return ReviewsSummary(
      averageRating: 4.7,
      totalReviews: 156,
      ratingDistribution: {
        5: 98,
        4: 42,
        3: 12,
        2: 3,
        1: 1,
      },
      recentReviews: _getMockReviews().take(3).toList(),
    );
  }

  List<DoerInfo> _getMockBlacklistedDoers() {
    return [
      DoerInfo(
        id: 'doer_1',
        name: 'Alex Thompson',
        email: 'alex.t@example.com',
        rating: 2.1,
        completedProjects: 15,
        isBlacklisted: true,
        blacklistReason: 'Repeated plagiarism issues',
        blacklistedAt: DateTime.now().subtract(const Duration(days: 30)),
      ),
      DoerInfo(
        id: 'doer_2',
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        rating: 1.8,
        completedProjects: 8,
        isBlacklisted: true,
        blacklistReason: 'Missed multiple deadlines',
        blacklistedAt: DateTime.now().subtract(const Duration(days: 45)),
      ),
    ];
  }
}
