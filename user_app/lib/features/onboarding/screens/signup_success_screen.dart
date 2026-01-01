import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/router/route_names.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';

/// Success screen shown after profile completion.
///
/// Displays confetti animation and welcome message.
class SignupSuccessScreen extends ConsumerStatefulWidget {
  const SignupSuccessScreen({super.key});

  @override
  ConsumerState<SignupSuccessScreen> createState() =>
      _SignupSuccessScreenState();
}

class _SignupSuccessScreenState extends ConsumerState<SignupSuccessScreen> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(
      duration: const Duration(seconds: 3),
    );
    // Start confetti after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _confettiController.play();
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(currentProfileProvider);
    final displayName = profile?.fullName?.split(' ').first ?? 'there';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Main content
          SafeArea(
            child: Padding(
              padding: AppSpacing.screenPadding,
              child: Column(
                children: [
                  const Spacer(),

                  // Success icon
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: AppColors.success.withAlpha(25), // 0.1 opacity
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle,
                      size: 80,
                      color: AppColors.success,
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .scale(
                        begin: const Offset(0.5, 0.5),
                        end: const Offset(1, 1),
                        duration: 500.ms,
                        curve: Curves.elasticOut,
                      ),

                  const SizedBox(height: 32),

                  // Welcome message
                  Text(
                    'Welcome, $displayName!',
                    style: AppTextStyles.displaySmall.copyWith(
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ).animate(delay: 300.ms).fadeIn(duration: 400.ms),

                  const SizedBox(height: 12),

                  Text(
                    'Your account is ready',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ).animate(delay: 400.ms).fadeIn(duration: 400.ms),

                  const SizedBox(height: 8),

                  Text(
                    "You're all set to get expert help for your projects.",
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textTertiary,
                    ),
                    textAlign: TextAlign.center,
                  ).animate(delay: 500.ms).fadeIn(duration: 400.ms),

                  const Spacer(),

                  // Features preview
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppSpacing.borderRadiusLg,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _buildFeatureRow(
                          Icons.upload_file_outlined,
                          'Upload projects easily',
                        ),
                        const SizedBox(height: 16),
                        _buildFeatureRow(
                          Icons.visibility_outlined,
                          'Track progress in real-time',
                        ),
                        const SizedBox(height: 16),
                        _buildFeatureRow(
                          Icons.verified_outlined,
                          'Get quality-assured work',
                        ),
                      ],
                    ),
                  ).animate(delay: 600.ms).fadeIn(duration: 400.ms).slideY(
                        begin: 0.2,
                        end: 0,
                        duration: 400.ms,
                      ),

                  const SizedBox(height: 32),

                  // Go to dashboard button
                  AppButton(
                    label: 'Go to Dashboard',
                    onPressed: () => context.go(RouteNames.home),
                    icon: Icons.arrow_forward,
                  ).animate(delay: 700.ms).fadeIn(duration: 400.ms),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [
                AppColors.primary,
                AppColors.success,
                AppColors.warning,
                AppColors.primaryLight,
              ],
              numberOfParticles: 30,
              maxBlastForce: 20,
              minBlastForce: 5,
              emissionFrequency: 0.05,
              gravity: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, String text) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(25), // 0.1 opacity
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const Icon(
          Icons.check,
          color: AppColors.success,
          size: 20,
        ),
      ],
    );
  }
}
