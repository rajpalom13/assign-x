import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/route_names.dart';
import '../../../core/utils/validators.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

/// Login screen for existing users.
///
/// Provides email/password authentication with form validation,
/// error handling, and navigation to registration for new users.
///
/// ## Navigation
/// - Entry: From [OnboardingScreen] via "Sign In" or when session expires
/// - Success + Activated: Navigates to [DashboardScreen]
/// - Success + Has Profile: Navigates to [ActivationGateScreen]
/// - Success + No Profile: Navigates to [ProfileSetupScreen]
/// - Register: Navigates to [RegisterScreen] via "Sign Up" link
/// - Back: Returns to [OnboardingScreen]
///
/// ## Features
/// - Email validation using [Validators.email]
/// - Password field with obscured text
/// - Forgot password link (placeholder)
/// - Google OAuth sign-in option (placeholder)
/// - Loading state during authentication
/// - Error feedback via SnackBar
///
/// ## Form Fields
/// - Email: Required, validated for email format
/// - Password: Required
///
/// See also:
/// - [RegisterScreen] for new user registration
/// - [AuthProvider] for authentication state management
/// - [Validators] for form validation utilities
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

/// State class for [LoginScreen].
///
/// Manages form state, text controllers, and loading state
/// for the login process.
class _LoginScreenState extends ConsumerState<LoginScreen> {
  /// Form key for validating the login form.
  final _formKey = GlobalKey<FormState>();

  /// Controller for the email input field.
  final _emailController = TextEditingController();

  /// Controller for the password input field.
  final _passwordController = TextEditingController();

  /// Whether a login request is currently in progress.
  bool _isLoading = false;

  /// Disposes of text controllers to prevent memory leaks.
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Handles the login form submission.
  ///
  /// Validates the form, then attempts to sign in using the
  /// [AuthProvider]. On success, navigates to the appropriate
  /// screen based on user activation status. On failure,
  /// displays an error message via SnackBar.
  ///
  /// The method includes a brief delay after successful auth
  /// to ensure the auth state is fully updated before navigation.
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final success = await ref.read(authProvider.notifier).signIn(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (success) {
        // Wait briefly for auth state to fully update
        await Future.delayed(const Duration(milliseconds: 100));
        if (!mounted) return;

        final user = ref.read(currentUserProvider);
        if (user != null && user.isActivated) {
          context.go(RouteNames.dashboard);
        } else if (user != null && user.hasDoerProfile) {
          context.go(RouteNames.activationGate);
        } else {
          context.go(RouteNames.profileSetup);
        }
      } else {
        final errorMessage = ref.read(authProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage ?? 'Login failed'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('An error occurred. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  /// Builds the login screen UI.
  ///
  /// Layout structure:
  /// - AppBar with back navigation to onboarding
  /// - Header with welcome message
  /// - Email input field with validation
  /// - Password input field with validation
  /// - Forgot password link
  /// - Sign In button with loading state
  /// - Divider with "OR" text
  /// - Google OAuth button (placeholder)
  /// - Sign Up link for new users
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(RouteNames.onboarding),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.paddingLg,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.lg),

                // Header
                const Text(
                  'Welcome Back',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                const Text(
                  'Sign in to continue your earning journey',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),

                const SizedBox(height: AppSpacing.xxl),

                // Email field
                AppTextField(
                  label: 'Email',
                  hint: 'Enter your email',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: Validators.email,
                ),

                const SizedBox(height: AppSpacing.lg),

                // Password field
                AppTextField(
                  label: 'Password',
                  hint: 'Enter your password',
                  controller: _passwordController,
                  obscureText: true,
                  prefixIcon: Icons.lock_outline,
                  validator: (value) => Validators.required(value, fieldName: 'Password'),
                ),

                const SizedBox(height: AppSpacing.sm),

                // Forgot password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      // TODO: Navigate to forgot password
                    },
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Login button
                AppButton(
                  text: 'Sign In',
                  onPressed: _handleLogin,
                  isLoading: _isLoading,
                  isFullWidth: true,
                  size: AppButtonSize.large,
                ),

                const SizedBox(height: AppSpacing.xxl),

                // Divider
                const Row(
                  children: [
                    Expanded(child: Divider(color: AppColors.border)),
                    Padding(
                      padding: AppSpacing.paddingHorizontalMd,
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: AppColors.textTertiary,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Expanded(child: Divider(color: AppColors.border)),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Social login buttons (placeholder)
                AppButton(
                  text: 'Continue with Google',
                  onPressed: () {
                    // TODO: Implement Google sign in
                  },
                  variant: AppButtonVariant.outline,
                  isFullWidth: true,
                  icon: Icons.g_mobiledata,
                ),

                const SizedBox(height: AppSpacing.xxl),

                // Sign up link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Don't have an account? ",
                      style: TextStyle(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go(RouteNames.register),
                      child: const Text(
                        'Sign Up',
                        style: TextStyle(
                          color: AppColors.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
