import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/banner_model.dart';
import '../data/models/notification_model.dart';
import '../data/repositories/home_repository.dart';
import 'auth_provider.dart';

// Note: walletProvider is defined in profile_provider.dart to avoid duplication

/// Home repository provider.
final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository();
});

/// Promotional banners provider.
final bannersProvider = FutureProvider<List<AppBanner>>((ref) async {
  final repository = ref.read(homeRepositoryProvider);
  return repository.getBanners();
});

/// User notifications provider.
final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];

  final repository = ref.read(homeRepositoryProvider);
  return repository.getNotifications(user.id);
});

/// Unread notification count provider.
final unreadCountProvider = FutureProvider<int>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return 0;

  final repository = ref.read(homeRepositoryProvider);
  return repository.getUnreadCount(user.id);
});

/// Navigation index provider for bottom navigation.
/// Note: This is the canonical provider - do not duplicate elsewhere.
final navigationIndexProvider = StateProvider<int>((ref) => 0);

/// Navigation items for bottom bar.
enum NavItem {
  home,
  projects,
  add,
  connect,
  profile,
}

extension NavItemExtension on NavItem {
  String get label {
    switch (this) {
      case NavItem.home:
        return 'Home';
      case NavItem.projects:
        return 'Projects';
      case NavItem.add:
        return '';
      case NavItem.connect:
        return 'Connect';
      case NavItem.profile:
        return 'Profile';
    }
  }

  String get route {
    switch (this) {
      case NavItem.home:
        return '/home';
      case NavItem.projects:
        return '/my-projects';
      case NavItem.add:
        return '';
      case NavItem.connect:
        return '/marketplace';
      case NavItem.profile:
        return '/profile';
    }
  }
}
