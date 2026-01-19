import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/user_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/loading_overlay.dart';

/// College email domain patterns for student validation.
final _collegeEmailPatterns = [
  RegExp(r'\.edu$', caseSensitive: false),
  RegExp(r'\.edu\.in$', caseSensitive: false),
  RegExp(r'\.ac\.in$', caseSensitive: false),
  RegExp(r'\.ac\.uk$', caseSensitive: false),
  RegExp(r'\.edu\.au$', caseSensitive: false),
  RegExp(r'\.edu\.ca$', caseSensitive: false),
  RegExp(r'\.edu\.[a-z]{2}$', caseSensitive: false),
];

/// Validates if email is from a college domain.
bool _isCollegeEmail(String email) {
  final parts = email.toLowerCase().split('@');
  if (parts.length != 2) return false;
  final domain = parts[1];
  return _collegeEmailPatterns.any((pattern) => pattern.hasMatch(domain));
}

/// Role definition for role selection cards.
class _RoleData {
  final UserType type;
  final IconData icon;
  final String title;
  final String description;
  final Color color;
  final String? emailHint;

  const _RoleData({
    required this.type,
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
    this.emailHint,
  });
}

/// Available roles for signup.
final _roles = [
  _RoleData(
    type: UserType.student,
    icon: Icons.school_rounded,
    title: 'Student',
    description:
        'Get expert help with your academic projects. From essays to dissertations.',
    color: const Color(0xFF8B5CF6),
    emailHint: 'Use your college email (e.g., name@college.edu)',
  ),
  _RoleData(
    type: UserType.professional,
    icon: Icons.work_rounded,
    title: 'Professional / Other',
    description:
        'Working professionals, businesses, and anyone looking for expert assistance.',
    color: const Color(0xFFF59E0B),
  ),
];

/// Modern login screen with role selection and magic link authentication.
///
/// Features:
/// - Step 0: Role selection (Student, Professional, Other)
/// - Step 1: Auth options (Google OAuth + Magic Link)
/// - College email validation for students
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  // Step tracking: 0 = role selection, 1 = auth options
  int _currentStep = 0;
  UserType? _selectedRole;

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
  late AnimationController _pulseController;
  late AnimationController _sparkleController;

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: this,
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _sparkleController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _floatController.dispose();
    _pulseController.dispose();
    _sparkleController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _selectRole(UserType role) {
    setState(() {
      _selectedRole = role;
      _currentStep = 1;
      _errorMessage = null;
    });
  }

  void _goBack() {
    setState(() {
      if (_showMagicLink) {
        // Go back from magic link to auth options
        _showMagicLink = false;
        _emailController.clear();
        _magicLinkError = null;
        _magicLinkSent = false;
      } else {
        // Go back from auth options to role selection
        _currentStep = 0;
        _selectedRole = null;
        _errorMessage = null;
        _termsAccepted = false;
      }
    });
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
      // Store the selected role for use after OAuth redirect
      ref.read(authStateProvider.notifier).setPreSignInRole(_selectedRole);
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

    // For students, validate educational email
    if (_selectedRole == UserType.student && !_isCollegeEmail(email)) {
      setState(() {
        _magicLinkError =
            'Student accounts require a valid educational email (.edu, .ac.in, .ac.uk, etc.)';
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
            userType: _selectedRole,
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

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    // Gradient takes ~50% of screen, bottom content max 50%
    final gradientHeight = screenHeight * 0.50;
    final maxBottomHeight = screenHeight * 0.50;

    return Scaffold(
      backgroundColor: Colors.white,
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: _showMagicLink ? 'Sending magic link...' : 'Signing in...',
        child: Stack(
          children: [
            // Gradient background with doodles (like onboarding)
            _GradientBackgroundWithDoodles(
              height: gradientHeight,
            ),

            // Lottie animation in gradient area - centered in larger space
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

            // Bottom content section - anchored to bottom using Column alignment
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
                    child: _currentStep == 0
                        ? _RoleSelectionSection(
                            key: const ValueKey('role'),
                            onRoleSelected: _selectRole,
                          )
                        : _AuthOptionsSection(
                            key: const ValueKey('auth'),
                            selectedRole: _selectedRole!,
                            termsAccepted: _termsAccepted,
                            errorMessage: _errorMessage,
                            showMagicLink: _showMagicLink,
                            magicLinkSent: _magicLinkSent,
                            magicLinkError: _magicLinkError,
                            emailController: _emailController,
                            onTermsChanged: (value) {
                              setState(() {
                                _termsAccepted = value;
                                if (_termsAccepted) _errorMessage = null;
                              });
                            },
                            onGoogleSignIn: _signInWithGoogle,
                            onMagicLinkPressed: () {
                              setState(() {
                                _showMagicLink = true;
                              });
                            },
                            onSendMagicLink: _sendMagicLink,
                            onTryDifferentEmail: _tryDifferentEmail,
                            onBack: _goBack,
                            onEmailChanged: () {
                              if (_magicLinkError != null) {
                                setState(() {
                                  _magicLinkError = null;
                                });
                              }
                            },
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

/// Lottie animation hero for login screen.
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
          'assets/animations/computer.json',
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

/// Role selection section showing the role cards.
class _RoleSelectionSection extends StatelessWidget {
  final ValueChanged<UserType> onRoleSelected;

  const _RoleSelectionSection({
    super.key,
    required this.onRoleSelected,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, bottomPadding + 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFC471ED).withValues(alpha: 0.15),
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

          // Title
          Text(
            'Choose Your Path',
            style: AppTextStyles.headingSmall.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

          const SizedBox(height: 6),

          Text(
            'Select the option that best describes you',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 150.ms, duration: 400.ms),

          const SizedBox(height: 16),

          // Role cards
          ..._roles.asMap().entries.map((entry) {
            final index = entry.key;
            final role = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _RoleCard(
                role: role,
                onTap: () => onRoleSelected(role.type),
              ).animate().fadeIn(
                    delay: Duration(milliseconds: 200 + (index * 80)),
                    duration: const Duration(milliseconds: 400),
                  ),
            );
          }),

          const SizedBox(height: 8),

          // Note about signing in vs signing up
          Text(
            'New user? We\'ll create your account automatically.',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 500.ms, duration: 400.ms),
        ],
      ),
    );
  }
}

/// Individual role selection card - compact version.
class _RoleCard extends StatelessWidget {
  final _RoleData role;
  final VoidCallback onTap;

  const _RoleCard({
    required this.role,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: role.color.withValues(alpha: 0.3),
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              // Icon
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: role.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  role.icon,
                  color: role.color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              // Text content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      role.title,
                      style: AppTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      role.description,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.15,
                        fontSize: 11,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              // Arrow
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: role.color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.arrow_forward_rounded,
                  color: role.color,
                  size: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Auth options section with Google + Magic Link - compact version.
class _AuthOptionsSection extends StatelessWidget {
  final UserType selectedRole;
  final bool termsAccepted;
  final String? errorMessage;
  final bool showMagicLink;
  final bool magicLinkSent;
  final String? magicLinkError;
  final TextEditingController emailController;
  final ValueChanged<bool> onTermsChanged;
  final VoidCallback onGoogleSignIn;
  final VoidCallback onMagicLinkPressed;
  final VoidCallback onSendMagicLink;
  final VoidCallback onTryDifferentEmail;
  final VoidCallback onBack;
  final VoidCallback onEmailChanged;

  const _AuthOptionsSection({
    super.key,
    required this.selectedRole,
    required this.termsAccepted,
    this.errorMessage,
    required this.showMagicLink,
    required this.magicLinkSent,
    this.magicLinkError,
    required this.emailController,
    required this.onTermsChanged,
    required this.onGoogleSignIn,
    required this.onMagicLinkPressed,
    required this.onSendMagicLink,
    required this.onTryDifferentEmail,
    required this.onBack,
    required this.onEmailChanged,
  });

  _RoleData get _roleData =>
      _roles.firstWhere((r) => r.type == selectedRole);

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, bottomPadding + 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFC471ED).withValues(alpha: 0.15),
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
          const SizedBox(height: 8),

          // Back button
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back_rounded, size: 16),
              label: Text(
                showMagicLink ? 'Back to options' : 'Back',
                style: const TextStyle(fontSize: 13),
              ),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.textSecondary,
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),

          if (magicLinkSent)
            _MagicLinkSentView(
              email: emailController.text,
              onTryDifferent: onTryDifferentEmail,
            )
          else if (showMagicLink)
            _MagicLinkForm(
              selectedRole: selectedRole,
              emailController: emailController,
              error: magicLinkError,
              onSend: onSendMagicLink,
              onEmailChanged: onEmailChanged,
            )
          else
            _GoogleAndMagicLinkOptions(
              roleData: _roleData,
              termsAccepted: termsAccepted,
              errorMessage: errorMessage,
              onTermsChanged: onTermsChanged,
              onGoogleSignIn: onGoogleSignIn,
              onMagicLinkPressed: onMagicLinkPressed,
            ),
        ],
      ),
    );
  }
}

/// Magic link sent success view - compact version.
class _MagicLinkSentView extends StatelessWidget {
  final String email;
  final VoidCallback onTryDifferent;

  const _MagicLinkSentView({
    required this.email,
    required this.onTryDifferent,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 6),
        // Success icon
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle_rounded,
            color: Color(0xFF10B981),
            size: 28,
          ),
        ),
        const SizedBox(height: 10),

        Text(
          'Check your email',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 6),

        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: AppTextStyles.caption.copyWith(
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
            fontSize: 11,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),

        OutlinedButton(
          onPressed: onTryDifferent,
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 40),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          child: const Text(
            'Try a different email',
            style: TextStyle(fontSize: 13),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Magic link email form - compact version.
class _MagicLinkForm extends StatelessWidget {
  final UserType selectedRole;
  final TextEditingController emailController;
  final String? error;
  final VoidCallback onSend;
  final VoidCallback onEmailChanged;

  const _MagicLinkForm({
    required this.selectedRole,
    required this.emailController,
    this.error,
    required this.onSend,
    required this.onEmailChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Mail icon
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.mail_rounded,
            color: AppColors.primary,
            size: 20,
          ),
        ),
        const SizedBox(height: 8),

        Text(
          'Sign in with email',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 2),

        Text(
          "We'll send you a magic link to sign in instantly",
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textSecondary,
            fontSize: 11,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),

        // Student email notice - compact
        if (selectedRole == UserType.student) ...[
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFCD34D)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: Color(0xFFB45309),
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Use your college email (.edu, .ac.in, .ac.uk, etc.)',
                    style: AppTextStyles.caption.copyWith(
                      color: const Color(0xFFB45309),
                      fontWeight: FontWeight.w500,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],

        // Email input - compact
        TextField(
          controller: emailController,
          onChanged: (_) => onEmailChanged(),
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => onSend(),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            hintText: selectedRole == UserType.student
                ? 'yourname@college.edu'
                : 'Enter your email address',
            hintStyle: const TextStyle(fontSize: 13),
            prefixIcon: const Icon(Icons.email_outlined, size: 18),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.error),
            ),
            filled: true,
            fillColor: Colors.grey.shade50,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            isDense: true,
          ),
        ),

        // Error message
        if (error != null) ...[
          const SizedBox(height: 4),
          Text(
            error!,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.error,
              fontSize: 11,
            ),
          ),
        ],

        const SizedBox(height: 10),

        // Send button - compact
        SizedBox(
          width: double.infinity,
          height: 44,
          child: ElevatedButton(
            onPressed: onSend,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(22),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Send Magic Link',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),

        const SizedBox(height: 6),

        Text(
          'We\'ll send you a secure link that expires in 10 minutes.',
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textSecondary,
            fontSize: 10,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Google sign-in and magic link options - compact version.
class _GoogleAndMagicLinkOptions extends StatelessWidget {
  final _RoleData roleData;
  final bool termsAccepted;
  final String? errorMessage;
  final ValueChanged<bool> onTermsChanged;
  final VoidCallback onGoogleSignIn;
  final VoidCallback onMagicLinkPressed;

  const _GoogleAndMagicLinkOptions({
    required this.roleData,
    required this.termsAccepted,
    this.errorMessage,
    required this.onTermsChanged,
    required this.onGoogleSignIn,
    required this.onMagicLinkPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Role icon - smaller
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: roleData.color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: roleData.color.withValues(alpha: 0.3),
              width: 2,
            ),
          ),
          child: Icon(
            roleData.icon,
            color: roleData.color,
            size: 22,
          ),
        ),
        const SizedBox(height: 8),

        Text(
          'Sign up as ${roleData.title}',
          style: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 2),

        Text(
          'Choose how you want to create your account',
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textSecondary,
            fontSize: 11,
          ),
        ),
        const SizedBox(height: 8),

        // Student email notice - compact
        if (roleData.type == UserType.student) ...[
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFCD34D)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: Color(0xFFB45309),
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Requires a valid college email (e.g., name@university.edu)',
                    style: AppTextStyles.caption.copyWith(
                      color: const Color(0xFFB45309),
                      fontWeight: FontWeight.w500,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Error message - compact
        if (errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.errorLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  color: AppColors.error,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    errorMessage!,
                    style: const TextStyle(
                      color: AppColors.error,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Terms checkbox - compact
        Row(
          children: [
            GestureDetector(
              onTap: () => onTermsChanged(!termsAccepted),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: termsAccepted
                        ? AppColors.primary
                        : AppColors.textSecondary.withValues(alpha: 0.4),
                    width: 1.5,
                  ),
                  color: termsAccepted ? AppColors.primary : Colors.transparent,
                ),
                child: termsAccepted
                    ? const Icon(
                        Icons.check,
                        size: 11,
                        color: Colors.white,
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: () => onTermsChanged(!termsAccepted),
                child: RichText(
                  text: TextSpan(
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                    ),
                    children: const [
                      TextSpan(text: 'I agree to the '),
                      TextSpan(
                        text: 'Terms',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      TextSpan(text: ' and '),
                      TextSpan(
                        text: 'Privacy Policy',
                        style: TextStyle(
                          color: AppColors.primary,
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

        const SizedBox(height: 10),

        // Google Sign-in button - compact
        _GoogleSignInButton(
          onPressed: termsAccepted ? onGoogleSignIn : null,
          enabled: termsAccepted,
        ),

        const SizedBox(height: 8),

        // Divider
        Row(
          children: [
            Expanded(child: Divider(color: Colors.grey.shade300)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Text(
                'Or',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
            ),
            Expanded(child: Divider(color: Colors.grey.shade300)),
          ],
        ),

        const SizedBox(height: 8),

        // Magic Link button - compact
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton.icon(
            onPressed: termsAccepted ? onMagicLinkPressed : null,
            icon: const Icon(Icons.mail_outline_rounded, size: 18),
            label: const Text(
              'Sign in with Email',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            style: OutlinedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(22),
              ),
              side: BorderSide(
                color: termsAccepted
                    ? AppColors.primary
                    : Colors.grey.shade300,
              ),
              foregroundColor: termsAccepted
                  ? AppColors.primary
                  : AppColors.textSecondary,
            ),
          ),
        ),

        const SizedBox(height: 6),

        // Security note
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lock_outline_rounded,
              size: 10,
              color: AppColors.textSecondary.withValues(alpha: 0.6),
            ),
            const SizedBox(width: 4),
            Text(
              'Secure passwordless authentication',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textSecondary.withValues(alpha: 0.6),
                fontSize: 10,
              ),
            ),
          ],
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

/// Google sign-in button - compact version.
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
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
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
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Center(
                  child: Text(
                    'G',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      foreground: Paint()
                        ..shader = const LinearGradient(
                          colors: [
                            Color(0xFF4285F4),
                            Color(0xFF34A853),
                            Color(0xFFFBBC05),
                            Color(0xFFEA4335),
                          ],
                        ).createShader(const Rect.fromLTWH(0, 0, 20, 20)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Continue with Google',
                style: TextStyle(
                  fontSize: 13,
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

/// Gradient background with doodles (like onboarding).
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
              Color(0xFFEC407A), // Pink
              Color(0xFFF48FB1), // Light pink
            ],
          ),
        ),
        child: Stack(
          children: _buildDoodleElements(),
        ),
      ),
    );
  }

  /// Build decorative doodle elements matching onboarding style.
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
