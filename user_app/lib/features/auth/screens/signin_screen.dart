import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/router/route_names.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/loading_overlay.dart';

/// Sign-in screen for returning users.
///
/// Features:
/// - Blue gradient background (different from signup)
/// - Game Lottie animation
/// - Google Sign-in + Magic Link options
/// - Terms acceptance
class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen>
    with TickerProviderStateMixin {
  // UI state
  bool _termsAccepted = false;
  bool _isLoading = false;
  String? _errorMessage;

  // Magic link state
  bool _showMagicLink = false;
  final _emailController = TextEditingController();
  bool _magicLinkSent = false;
  String? _magicLinkError;

  // Animation controllers
  late AnimationController _floatController;

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _floatController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _signInWithGoogle() async {
    if (!_termsAccepted) {
      setState(() {
        _errorMessage = 'Please accept the Terms & Conditions to continue';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authStateProvider.notifier).signInWithGoogle();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Sign in failed. Please try again.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _sendMagicLink() async {
    final email = _emailController.text.trim().toLowerCase();

    // Basic validation
    if (email.isEmpty) {
      setState(() {
        _magicLinkError = 'Please enter your email address';
      });
      return;
    }

    // Email format validation
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!emailRegex.hasMatch(email)) {
      setState(() {
        _magicLinkError = 'Please enter a valid email address';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _magicLinkError = null;
    });

    try {
      await ref.read(authStateProvider.notifier).signInWithMagicLink(
            email: email,
            userType: null, // For sign-in, we don't set a role
          );

      if (mounted) {
        setState(() {
          _magicLinkSent = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _magicLinkError = 'Failed to send magic link. Please try again.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _tryDifferentEmail() {
    setState(() {
      _magicLinkSent = false;
      _emailController.clear();
      _magicLinkError = null;
    });
  }

  void _goBack() {
    if (_showMagicLink) {
      setState(() {
        _showMagicLink = false;
        _emailController.clear();
        _magicLinkError = null;
        _magicLinkSent = false;
      });
    } else {
      context.go(RouteNames.onboarding);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final gradientHeight = screenHeight * 0.50;

    return Scaffold(
      backgroundColor: Colors.white,
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: _showMagicLink ? 'Sending magic link...' : 'Signing in...',
        child: Stack(
          children: [
            // Blue gradient background with doodles
            _GradientBackgroundWithDoodles(
              height: gradientHeight,
            ),

            // Lottie animation in gradient area
            Positioned(
              top: MediaQuery.of(context).padding.top + 60,
              left: 0,
              right: 0,
              child: _LottieHero(
                floatAnimation: _floatController,
              ),
            ),

            // App name at top
            Positioned(
              top: MediaQuery.of(context).padding.top + 12,
              left: 0,
              right: 0,
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.school_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'AssignX',
                      style: AppTextStyles.headingSmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 600.ms).slideY(
                      begin: -0.3,
                      duration: 600.ms,
                      curve: Curves.easeOutBack,
                    ),
              ),
            ),

            // Bottom content section - anchored to bottom
            Positioned.fill(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0, 0.1),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: _magicLinkSent
                        ? _MagicLinkSentView(
                            key: const ValueKey('sent'),
                            email: _emailController.text,
                            onTryDifferent: _tryDifferentEmail,
                            onBack: _goBack,
                          )
                        : _showMagicLink
                            ? _MagicLinkForm(
                                key: const ValueKey('form'),
                                emailController: _emailController,
                                error: _magicLinkError,
                                onSend: _sendMagicLink,
                                onBack: _goBack,
                                onEmailChanged: () {
                                  if (_magicLinkError != null) {
                                    setState(() => _magicLinkError = null);
                                  }
                                },
                              )
                            : _SignInOptionsSection(
                                key: const ValueKey('options'),
                                termsAccepted: _termsAccepted,
                                errorMessage: _errorMessage,
                                onTermsChanged: (value) {
                                  setState(() {
                                    _termsAccepted = value;
                                    if (_termsAccepted) _errorMessage = null;
                                  });
                                },
                                onGoogleSignIn: _signInWithGoogle,
                                onMagicLinkPressed: () {
                                  setState(() => _showMagicLink = true);
                                },
                                onBack: _goBack,
                              ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Lottie animation hero for sign-in screen (game animation).
class _LottieHero extends StatelessWidget {
  final AnimationController floatAnimation;

  const _LottieHero({required this.floatAnimation});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: floatAnimation,
      builder: (context, child) {
        final floatValue = floatAnimation.value;
        final yOffset = math.sin(floatValue * math.pi * 2) * 6;

        return Transform.translate(
          offset: Offset(0, yOffset),
          child: child,
        );
      },
      child: SizedBox(
        height: 200,
        child: Lottie.asset(
          'assets/animations/game.json', // Different animation from signup
          fit: BoxFit.contain,
          animate: true,
          repeat: true,
        ),
      ),
    )
        .animate()
        .fadeIn(delay: 200.ms, duration: 500.ms)
        .scale(
          begin: const Offset(0.8, 0.8),
          end: const Offset(1, 1),
          delay: 200.ms,
          duration: 500.ms,
          curve: Curves.easeOutBack,
        );
  }
}

/// Sign-in options section.
class _SignInOptionsSection extends StatelessWidget {
  final bool termsAccepted;
  final String? errorMessage;
  final ValueChanged<bool> onTermsChanged;
  final VoidCallback onGoogleSignIn;
  final VoidCallback onMagicLinkPressed;
  final VoidCallback onBack;

  const _SignInOptionsSection({
    super.key,
    required this.termsAccepted,
    this.errorMessage,
    required this.onTermsChanged,
    required this.onGoogleSignIn,
    required this.onMagicLinkPressed,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPadding + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF42A5F5).withValues(alpha: 0.15),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle indicator
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // Welcome back icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFF42A5F5).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFF42A5F5).withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: const Icon(
              Icons.waving_hand_rounded,
              color: Color(0xFF42A5F5),
              size: 28,
            ),
          ),
          const SizedBox(height: 12),

          // Title
          Text(
            'Welcome Back!',
            style: AppTextStyles.headingSmall.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 24,
            ),
          ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

          const SizedBox(height: 4),

          Text(
            'Sign in to continue your journey',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 150.ms, duration: 400.ms),

          const SizedBox(height: 16),

          // Error message
          if (errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.errorLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: AppColors.error,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      errorMessage!,
                      style: const TextStyle(
                        color: AppColors.error,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Terms checkbox
          Row(
            children: [
              GestureDetector(
                onTap: () => onTermsChanged(!termsAccepted),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: termsAccepted
                          ? const Color(0xFF42A5F5)
                          : AppColors.textSecondary.withValues(alpha: 0.4),
                      width: 2,
                    ),
                    color: termsAccepted
                        ? const Color(0xFF42A5F5)
                        : Colors.transparent,
                  ),
                  child: termsAccepted
                      ? const Icon(
                          Icons.check,
                          size: 14,
                          color: Colors.white,
                        )
                      : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => onTermsChanged(!termsAccepted),
                  child: RichText(
                    text: TextSpan(
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                      children: const [
                        TextSpan(text: 'I agree to the '),
                        TextSpan(
                          text: 'Terms',
                          style: TextStyle(
                            color: Color(0xFF42A5F5),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(
                            color: Color(0xFF42A5F5),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Google Sign-in button
          _GoogleSignInButton(
            onPressed: termsAccepted ? onGoogleSignIn : null,
            enabled: termsAccepted,
          ),

          const SizedBox(height: 12),

          // Divider
          Row(
            children: [
              Expanded(child: Divider(color: Colors.grey.shade300)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  'Or',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              Expanded(child: Divider(color: Colors.grey.shade300)),
            ],
          ),

          const SizedBox(height: 12),

          // Magic Link button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: termsAccepted ? onMagicLinkPressed : null,
              icon: const Icon(Icons.mail_outline_rounded, size: 20),
              label: const Text(
                'Sign in with Email',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                side: BorderSide(
                  color: termsAccepted
                      ? const Color(0xFF42A5F5)
                      : Colors.grey.shade300,
                ),
                foregroundColor: termsAccepted
                    ? const Color(0xFF42A5F5)
                    : AppColors.textSecondary,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Don't have account? Sign up
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "Don't have an account? ",
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              GestureDetector(
                onTap: () => context.go(RouteNames.login),
                child: Text(
                  'Sign up',
                  style: AppTextStyles.caption.copyWith(
                    color: const Color(0xFF42A5F5),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Security note
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.lock_outline_rounded,
                size: 12,
                color: AppColors.textSecondary.withValues(alpha: 0.6),
              ),
              const SizedBox(width: 4),
              Text(
                'Secure passwordless authentication',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary.withValues(alpha: 0.6),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Google sign-in button.
class _GoogleSignInButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool enabled;

  const _GoogleSignInButton({
    required this.onPressed,
    required this.enabled,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: enabled ? 1.0 : 0.5,
        child: Container(
          width: double.infinity,
          height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(
              colors: [
                Color(0xFF1A1A2E),
                Color(0xFF16213E),
              ],
            ),
            boxShadow: enabled
                ? [
                    BoxShadow(
                      color: const Color(0xFF1A1A2E).withValues(alpha: 0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Google icon
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Center(
                  child: Text(
                    'G',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      foreground: Paint()
                        ..shader = const LinearGradient(
                          colors: [
                            Color(0xFF4285F4),
                            Color(0xFF34A853),
                            Color(0xFFFBBC05),
                            Color(0xFFEA4335),
                          ],
                        ).createShader(const Rect.fromLTWH(0, 0, 22, 22)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Continue with Google',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Magic link sent success view.
class _MagicLinkSentView extends StatelessWidget {
  final String email;
  final VoidCallback onTryDifferent;
  final VoidCallback onBack;

  const _MagicLinkSentView({
    super.key,
    required this.email,
    required this.onTryDifferent,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPadding + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF42A5F5).withValues(alpha: 0.15),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle indicator
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // Success icon
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF10B981),
              size: 32,
            ),
          ),
          const SizedBox(height: 12),

          Text(
            'Check your email',
            style: AppTextStyles.headingSmall.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 8),

          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
              children: [
                const TextSpan(text: 'We sent a magic link to\n'),
                TextSpan(
                  text: email,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          Text(
            'Click the link in your email to sign in.\nThe link expires in 10 minutes.',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: onTryDifferent,
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: const Text(
                'Try a different email',
                style: TextStyle(fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Magic link email form.
class _MagicLinkForm extends StatelessWidget {
  final TextEditingController emailController;
  final String? error;
  final VoidCallback onSend;
  final VoidCallback onBack;
  final VoidCallback onEmailChanged;

  const _MagicLinkForm({
    super.key,
    required this.emailController,
    this.error,
    required this.onSend,
    required this.onBack,
    required this.onEmailChanged,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPadding + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF42A5F5).withValues(alpha: 0.15),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle indicator
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Back button
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back_rounded, size: 18),
              label: const Text(
                'Back to options',
                style: TextStyle(fontSize: 14),
              ),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.textSecondary,
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Mail icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF42A5F5).withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.mail_rounded,
              color: Color(0xFF42A5F5),
              size: 24,
            ),
          ),
          const SizedBox(height: 12),

          Text(
            'Sign in with email',
            style: AppTextStyles.headingSmall.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 4),

          Text(
            "We'll send you a magic link to sign in instantly",
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),

          // Email input
          TextField(
            controller: emailController,
            onChanged: (_) => onEmailChanged(),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => onSend(),
            style: const TextStyle(fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Enter your email address',
              hintStyle: const TextStyle(fontSize: 14),
              prefixIcon: const Icon(Icons.email_outlined, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: Color(0xFF42A5F5), width: 2),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.error),
              ),
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
          ),

          // Error message
          if (error != null) ...[
            const SizedBox(height: 6),
            Text(
              error!,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.error,
                fontSize: 12,
              ),
            ),
          ],

          const SizedBox(height: 16),

          // Send button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: onSend,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF42A5F5),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Send Magic Link',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

          const SizedBox(height: 8),

          Text(
            'We\'ll send you a secure link that expires in 10 minutes.',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
              fontSize: 11,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Blue gradient background with doodles.
class _GradientBackgroundWithDoodles extends StatelessWidget {
  final double height;

  const _GradientBackgroundWithDoodles({
    required this.height,
  });

  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: _CurvedBottomClipper(),
      child: Container(
        height: height + 50,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF42A5F5), // Blue
              Color(0xFF90CAF9), // Light blue
            ],
          ),
        ),
        child: Stack(
          children: _buildDoodleElements(),
        ),
      ),
    );
  }

  /// Build decorative doodle elements.
  List<Widget> _buildDoodleElements() {
    return [
      // Large ring - top left
      Positioned(
        top: 30,
        left: -25,
        child: _DoodleRing(size: 70, strokeWidth: 2.5),
      ),
      // Small filled circle - top right
      Positioned(
        top: 50,
        right: 35,
        child: _DoodleCircle(size: 18),
      ),
      // Medium ring - right side
      Positioned(
        top: 120,
        right: -15,
        child: _DoodleRing(size: 50, strokeWidth: 2),
      ),
      // Dots cluster - left side
      Positioned(
        top: 160,
        left: 25,
        child: _DoodleDots(),
      ),
      // Squiggly line - top center
      Positioned(
        top: 70,
        left: 90,
        child: _DoodleSquiggle(),
      ),
      // Cross/plus - right center
      Positioned(
        top: 200,
        right: 45,
        child: _DoodleCross(size: 20),
      ),
      // Small ring - bottom left
      Positioned(
        bottom: 80,
        left: 50,
        child: _DoodleRing(size: 25, strokeWidth: 2),
      ),
      // Triangle outline - right
      Positioned(
        top: 240,
        right: 100,
        child: _DoodleTriangle(size: 22),
      ),
      // Tiny dots scattered
      Positioned(
        top: 100,
        right: 100,
        child: _DoodleCircle(size: 8),
      ),
      Positioned(
        bottom: 100,
        left: 100,
        child: _DoodleCircle(size: 10),
      ),
      Positioned(
        top: 180,
        left: 80,
        child: _DoodleCircle(size: 12),
      ),
    ];
  }
}

/// Custom clipper for curved bottom edge.
class _CurvedBottomClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 50);

    // Create smooth curve
    path.quadraticBezierTo(
      size.width / 2,
      size.height,
      size.width,
      size.height - 50,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

/// Doodle ring (circle outline).
class _DoodleRing extends StatelessWidget {
  final double size;
  final double strokeWidth;

  const _DoodleRing({required this.size, required this.strokeWidth});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.3),
          width: strokeWidth,
        ),
      ),
    );
  }
}

/// Doodle filled circle.
class _DoodleCircle extends StatelessWidget {
  final double size;

  const _DoodleCircle({required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.25),
      ),
    );
  }
}

/// Doodle dots cluster.
class _DoodleDots extends StatelessWidget {
  const _DoodleDots();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 25,
      height: 25,
      child: Stack(
        children: [
          Positioned(top: 0, left: 0, child: _dot()),
          Positioned(top: 0, right: 0, child: _dot()),
          Positioned(bottom: 0, left: 0, child: _dot()),
          Positioned(bottom: 0, right: 0, child: _dot()),
          Positioned(
            top: 8,
            left: 8,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.3),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dot() => Container(
        width: 5,
        height: 5,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withValues(alpha: 0.25),
        ),
      );
}

/// Doodle squiggle/wave line.
class _DoodleSquiggle extends StatelessWidget {
  const _DoodleSquiggle();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(40, 16),
      painter: _SquigglePainter(),
    );
  }
}

class _SquigglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    path.moveTo(0, size.height / 2);
    path.quadraticBezierTo(
        size.width * 0.25, 0, size.width * 0.5, size.height / 2);
    path.quadraticBezierTo(
        size.width * 0.75, size.height, size.width, size.height / 2);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Doodle cross/plus.
class _DoodleCross extends StatelessWidget {
  final double size;

  const _DoodleCross({required this.size});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _CrossPainter(),
    );
  }
}

class _CrossPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Vertical line
    canvas.drawLine(
      Offset(size.width / 2, 0),
      Offset(size.width / 2, size.height),
      paint,
    );
    // Horizontal line
    canvas.drawLine(
      Offset(0, size.height / 2),
      Offset(size.width, size.height / 2),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Doodle triangle outline.
class _DoodleTriangle extends StatelessWidget {
  final double size;

  const _DoodleTriangle({required this.size});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _TrianglePainter(),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path();
    path.moveTo(size.width / 2, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
