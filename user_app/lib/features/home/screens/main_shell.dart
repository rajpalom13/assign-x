import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/home_provider.dart';
import '../../../shared/widgets/bottom_nav_bar.dart';
import '../../marketplace/screens/marketplace_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../projects/screens/my_projects_screen.dart';
import '../widgets/fab_bottom_sheet.dart';
import 'home_screen.dart';

/// Main app shell with bottom navigation and FAB.
class MainShell extends ConsumerWidget {
  const MainShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navigationIndexProvider);

    return Scaffold(
      body: IndexedStack(
        index: currentIndex,
        children: const [
          HomeScreen(),
          MyProjectsScreen(),
          SizedBox(), // FAB placeholder
          MarketplaceScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: currentIndex,
        onTap: (index) {
          ref.read(navigationIndexProvider.notifier).state = index;
          _navigateToTab(context, index);
        },
        onFabTap: () => FabBottomSheet.show(context),
      ),
      floatingActionButton: CentralFAB(
        onTap: () => FabBottomSheet.show(context),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  void _navigateToTab(BuildContext context, int index) {
    switch (index) {
      case 0:
        // Home
        break;
      case 1:
        // Projects
        break;
      case 3:
        // Connect/Marketplace
        break;
      case 4:
        // Profile
        break;
    }
  }
}
