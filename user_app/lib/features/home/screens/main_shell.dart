import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/home_provider.dart';
import '../../../shared/widgets/subtle_gradient_scaffold.dart';
import '../../campus_connect/screens/campus_connect_screen.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import '../../dashboard/widgets/bottom_nav_bar.dart';
import '../../profile/screens/profile_screen.dart';
import '../../projects/screens/my_projects_screen.dart';
import '../../settings/screens/settings_screen.dart';

/// Main app shell with bottom navigation.
///
/// Provides a floating pill-shaped navigation bar at the bottom
/// with 6 items: Home, Projects, Community, Orders, Profile, Settings.
/// Features subtle gradient background patches for elegant visual design.
class MainShell extends ConsumerWidget {
  const MainShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navigationIndexProvider);

    return SubtleGradientScaffold.standard(
      body: Stack(
        children: [
          // Main content with IndexedStack for state preservation
          IndexedStack(
            index: currentIndex,
            children: const [
              DashboardScreen(),
              MyProjectsScreen(),
              CampusConnectScreen(), // Community/People
              MyProjectsScreen(), // Orders - reuse projects for now
              ProfileScreen(),
              SettingsScreen(), // Settings
            ],
          ),
          // Bottom navigation bar per design spec
          BottomNavBar(
            currentIndex: currentIndex,
            onTap: (index) => _handleNavigation(ref, index),
          ),
        ],
      ),
    );
  }

  /// Handles navigation by updating the provider state.
  void _handleNavigation(WidgetRef ref, int index) {
    ref.read(navigationIndexProvider.notifier).state = index;
  }
}
