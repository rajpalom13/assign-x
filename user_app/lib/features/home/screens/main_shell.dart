import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../providers/home_provider.dart';
import '../../../shared/widgets/dock_navigation.dart';
import '../../campus_connect/screens/campus_connect_screen.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../projects/screens/my_projects_screen.dart';
import '../widgets/fab_bottom_sheet.dart';

/// Main app shell with dock navigation.
///
/// Provides a macOS-style floating dock navigation bar at the bottom
/// of the screen with glass morphism effects and smooth animations.
class MainShell extends ConsumerWidget {
  const MainShell({super.key});

  /// Maps navigation index to route path for the dock.
  static const List<String> _routes = [
    '/home',
    '/my-projects',
    '', // FAB placeholder - no route
    '/marketplace',
    '/profile',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navigationIndexProvider);

    // Get the current route based on index
    final currentRoute = _routes[currentIndex];

    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Main content with IndexedStack for state preservation
          IndexedStack(
            index: currentIndex,
            children: const [
              DashboardScreen(),
              MyProjectsScreen(),
              SizedBox(), // FAB placeholder
              CampusConnectScreen(),
              ProfileScreen(),
            ],
          ),
          // Dock navigation overlay
          DockNavigation(
            items: [
              DockItem(
                icon: PhosphorIcons.house(),
                activeIcon: PhosphorIcons.house(PhosphorIconsStyle.fill),
                label: 'Home',
                route: '/home',
              ),
              DockItem(
                icon: PhosphorIcons.folder(),
                activeIcon: PhosphorIcons.folder(PhosphorIconsStyle.fill),
                label: 'Projects',
                route: '/my-projects',
              ),
              DockItem.fab(
                icon: PhosphorIcons.plus(),
                label: 'Add',
                onTap: () => FabBottomSheet.show(context),
              ),
              DockItem(
                icon: PhosphorIcons.storefront(),
                activeIcon: PhosphorIcons.storefront(PhosphorIconsStyle.fill),
                label: 'Connect',
                route: '/marketplace',
              ),
              DockItem(
                icon: PhosphorIcons.user(),
                activeIcon: PhosphorIcons.user(PhosphorIconsStyle.fill),
                label: 'Profile',
                route: '/profile',
              ),
            ],
            currentRoute: currentRoute,
            onItemTap: (route) => _handleNavigation(ref, route),
          ),
        ],
      ),
    );
  }

  /// Handles navigation by updating the provider state.
  void _handleNavigation(WidgetRef ref, String route) {
    final newIndex = _routes.indexOf(route);
    if (newIndex != -1 && newIndex != 2) {
      // Skip FAB placeholder index
      ref.read(navigationIndexProvider.notifier).state = newIndex;
    }
  }
}
