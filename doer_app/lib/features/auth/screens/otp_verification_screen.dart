import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/route_names.dart';
import '../../../shared/widgets/app_button.dart';
import '../../onboarding/widgets/otp_input_field.dart';

/// OTP verification screen for phone number verification.
///
/// Provides a 6-digit OTP input interface with automatic verification
/// on completion, resend functionality with countdown timer, and
/// error handling.
///
/// ## Navigation
/// - Entry: From registration or phone verification flow
/// - Success: Navigates to [ProfileSetupScreen] or calls [onVerified]
/// - Back: Returns to previous screen
///
/// ## Features
/// - 6-digit OTP input with auto-submit on completion
/// - Resend OTP with 30-second countdown cooldown
/// - Masked phone number display for privacy
/// - Error feedback with inline error message
/// - Alternative verification method link
///
/// ## Parameters
/// - [phoneNumber]: Required phone number being verified
/// - [email]: Optional email for display purposes
/// - [onVerified]: Optional callback executed on successful verification
///
/// ## Mock Implementation
/// Currently uses mock verification (accepts "123456" as valid OTP).
/// TODO: Implement actual Supabase OTP verification.
///
/// See also:
/// - [OtpInputField] for the OTP input widget
/// - [ProfileSetupScreen] for post-verification flow
class OtpVerificationScreen extends StatefulWidget {
  /// Phone number to verify.
  final String phoneNumber;

  /// Email for display.
  final String? email;

  /// Callback after successful verification.
  final VoidCallback? onVerified;

  const OtpVerificationScreen({
    super.key,
    required this.phoneNumber,
    this.email,
    this.onVerified,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

/// State class for [OtpVerificationScreen].
///
/// Manages OTP input, verification state, and resend timer functionality.
class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  /// The current OTP value entered by the user.
  String _otp = '';

  /// Whether OTP verification is in progress.
  bool _isLoading = false;

  /// Whether OTP resend request is in progress.
  bool _isResending = false;

  /// Error message to display, null if no error.
  String? _errorText;

  /// Countdown seconds until resend is allowed.
  int _resendCountdown = 30;

  /// Timer for the resend countdown.
  Timer? _timer;

  /// Initializes the screen and starts the resend countdown.
  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  /// Cancels the timer to prevent memory leaks.
  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  /// Starts or restarts the 30-second resend countdown timer.
  ///
  /// Decrements [_resendCountdown] every second until it reaches 0,
  /// at which point the user can request a new OTP.
  void _startResendTimer() {
    _resendCountdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() => _resendCountdown--);
      } else {
        timer.cancel();
      }
    });
  }

  /// Verifies the entered OTP.
  ///
  /// Validates that 6 digits are entered, then attempts verification.
  /// On success, either calls [onVerified] callback or navigates
  /// to [ProfileSetupScreen]. On failure, displays error message.
  ///
  /// TODO: Replace mock verification with actual Supabase implementation.
  Future<void> _verifyOtp() async {
    if (_otp.length != 6) {
      setState(() => _errorText = 'Please enter complete OTP');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorText = null;
    });

    try {
      // TODO: Implement actual OTP verification with Supabase
      await Future.delayed(const Duration(seconds: 2));

      // Simulate verification
      if (_otp == '123456') {
        if (mounted) {
          widget.onVerified?.call();
          // Navigate to profile setup
          context.go(RouteNames.profileSetup);
        }
      } else {
        setState(() => _errorText = 'Invalid OTP. Please try again.');
      }
    } catch (e) {
      setState(() => _errorText = 'Verification failed. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  /// Requests a new OTP to be sent.
  ///
  /// Only available when [_resendCountdown] is 0. On success,
  /// restarts the countdown timer and shows a success message.
  /// On failure, shows an error SnackBar.
  ///
  /// TODO: Implement actual OTP resend with Supabase.
  Future<void> _resendOtp() async {
    if (_resendCountdown > 0) return;

    setState(() => _isResending = true);

    try {
      // TODO: Implement actual OTP resend
      await Future.delayed(const Duration(seconds: 1));
      _startResendTimer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('OTP sent successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to resend OTP. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResending = false);
      }
    }
  }

  /// Returns a masked version of the phone number for privacy.
  ///
  /// Shows only the last 4 digits, e.g., "******1234".
  String get _maskedPhone {
    if (widget.phoneNumber.length >= 10) {
      return '******${widget.phoneNumber.substring(widget.phoneNumber.length - 4)}';
    }
    return widget.phoneNumber;
  }

  /// Builds the OTP verification screen UI.
  ///
  /// Layout structure:
  /// - AppBar with back navigation
  /// - Header with instructions and masked phone number
  /// - 6-digit OTP input field
  /// - Verify button with loading state
  /// - Resend OTP with countdown timer
  /// - Help text with alternative verification option
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.paddingLg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.lg),

              // Header
              const Text(
                'Verify Your Phone',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'We\'ve sent a 6-digit code to +91 $_maskedPhone',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),

              // OTP Input
              Center(
                child: OtpInputField(
                  length: 6,
                  errorText: _errorText,
                  onCompleted: (otp) {
                    _otp = otp;
                    _verifyOtp();
                  },
                  onChanged: (otp) {
                    _otp = otp;
                    if (_errorText != null) {
                      setState(() => _errorText = null);
                    }
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Verify button
              AppButton(
                text: 'Verify',
                onPressed: _verifyOtp,
                isLoading: _isLoading,
                isFullWidth: true,
                size: AppButtonSize.large,
              ),

              const SizedBox(height: AppSpacing.xl),

              // Resend OTP
              Center(
                child: _resendCountdown > 0
                    ? Text(
                        'Resend OTP in ${_resendCountdown}s',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textTertiary,
                        ),
                      )
                    : _isResending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                            ),
                          )
                        : GestureDetector(
                            onTap: _resendOtp,
                            child: const Text(
                              'Resend OTP',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.accent,
                              ),
                            ),
                          ),
              ),

              const Spacer(),

              // Help text
              Center(
                child: Column(
                  children: [
                    const Text(
                      'Didn\'t receive the code?',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    GestureDetector(
                      onTap: () {
                        // TODO: Navigate to support or change phone number
                      },
                      child: const Text(
                        'Try different verification method',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.accent,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
