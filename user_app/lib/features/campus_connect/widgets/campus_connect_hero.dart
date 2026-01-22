import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../core/constants/app_text_styles.dart';

/// Hero section for Campus Connect with gradient background and centered chat icon.
///
/// Features a peachy/orangish to greenish/turquoise gradient with
/// a large centered chat icon and "Campus Connect" title.
class CampusConnectHero extends StatelessWidget {
  const CampusConnectHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFFFB6A3), // Peachy/orangish
            const Color(0xFFFF9F8A), // Mid peachy
            const Color(0xFF7FD8BE), // Greenish/turquoise
            const Color(0xFF5BC9A8), // Deeper turquoise
          ],
          stops: const [0.0, 0.3, 0.7, 1.0],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Large centered chat icon with glass effect
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(51),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withAlpha(77),
                    width: 2,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(40),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: const Icon(
                      Icons.chat_bubble_rounded,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Campus Connect title
              Text(
                'Campus Connect',
                style: AppTextStyles.headingLarge.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 28,
                ),
              ),
              const SizedBox(height: 4),

              // Subtitle
              Text(
                'Connect with your campus community',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white.withAlpha(230),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
