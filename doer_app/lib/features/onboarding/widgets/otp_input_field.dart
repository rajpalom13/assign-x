/// OTP (One-Time Password) input widget with individual digit fields.
///
/// This file provides a specialized input widget for entering OTP codes,
/// with individual boxes for each digit and automatic focus management.
///
/// ## Features
/// - Individual digit boxes with auto-advance
/// - Configurable OTP length (default 6 digits)
/// - Automatic focus on first field
/// - Paste support for full OTP codes
/// - Backspace navigation to previous field
/// - Error state display
/// - Completion callback when all digits entered
///
/// ## Example
/// ```dart
/// OtpInputField(
///   length: 6,
///   autofocus: true,
///   onCompleted: (otp) => verifyOtp(otp),
///   onChanged: (otp) => print('Current: $otp'),
///   errorText: hasError ? 'Invalid OTP' : null,
/// )
/// ```
///
/// See also:
/// - [PinCodeTextField] for alternative PIN input
/// - [TextFormField] for standard text input
/// - [AppColors] for the color scheme
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// OTP input field widget with individual digit boxes.
///
/// Displays separate input boxes for each OTP digit with automatic
/// focus management and paste support.
///
/// ## Usage
/// ```dart
/// OtpInputField(
///   length: 6,
///   onCompleted: (otp) {
///     print('OTP entered: $otp');
///     verifyOtp(otp);
///   },
///   onChanged: (otp) {
///     setState(() => currentOtp = otp);
///   },
///   errorText: isInvalid ? 'Invalid verification code' : null,
/// )
/// ```
///
/// ## Input Behavior
/// - Digits only (0-9)
/// - Auto-advances to next field on input
/// - Backspace moves to previous field when empty
/// - Paste fills all fields automatically
/// - Completion callback fires when all digits entered
///
/// ## State Management
/// The widget manages its own focus nodes and controllers internally.
/// Use the [clear] method (via GlobalKey) to reset all fields.
///
/// See also:
/// - [_OtpDigitField] for individual digit field implementation
class OtpInputField extends StatefulWidget {
  /// Creates an OTP input field.
  const OtpInputField({
    super.key,
    this.length = 6,
    this.onCompleted,
    this.onChanged,
    this.enabled = true,
    this.autofocus = true,
    this.errorText,
  });

  /// Number of OTP digits.
  ///
  /// Defaults to 6.
  final int length;

  /// Callback when all digits are entered.
  ///
  /// Called with the complete OTP string.
  final ValueChanged<String>? onCompleted;

  /// Callback when any digit changes.
  ///
  /// Called with the current OTP string (may be incomplete).
  final ValueChanged<String>? onChanged;

  /// Whether the input fields are enabled.
  ///
  /// Defaults to true.
  final bool enabled;

  /// Whether to auto-focus the first field.
  ///
  /// Defaults to true.
  final bool autofocus;

  /// Error message to display below the fields.
  ///
  /// When not null, fields show error styling (red border).
  final String? errorText;

  @override
  State<OtpInputField> createState() => _OtpInputFieldState();
}

class _OtpInputFieldState extends State<OtpInputField> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
      (_) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
      (_) => FocusNode(),
    );

    // Auto-focus first field
    if (widget.autofocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNodes[0].requestFocus();
      });
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  /// Returns the current OTP value by joining all digit fields.
  String get _otp => _controllers.map((c) => c.text).join();

  /// Handles digit input and focus management.
  void _onChanged(int index, String value) {
    if (value.length > 1) {
      // Handle paste
      _handlePaste(value);
      return;
    }

    if (value.isNotEmpty && index < widget.length - 1) {
      // Move to next field
      _focusNodes[index + 1].requestFocus();
    }

    widget.onChanged?.call(_otp);

    if (_otp.length == widget.length) {
      widget.onCompleted?.call(_otp);
    }
  }

  /// Handles pasted OTP codes.
  void _handlePaste(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    for (int i = 0; i < widget.length && i < digits.length; i++) {
      _controllers[i].text = digits[i];
    }
    if (digits.length >= widget.length) {
      _focusNodes[widget.length - 1].requestFocus();
      widget.onCompleted?.call(_otp);
    } else if (digits.isNotEmpty) {
      _focusNodes[digits.length.clamp(0, widget.length - 1)].requestFocus();
    }
    widget.onChanged?.call(_otp);
  }

  /// Handles backspace key for navigating to previous field.
  void _onKeyDown(int index, KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _controllers[index].text.isEmpty &&
        index > 0) {
      _controllers[index - 1].clear();
      _focusNodes[index - 1].requestFocus();
    }
  }

  /// Clears all OTP fields and focuses the first one.
  ///
  /// Call this method via a GlobalKey to reset the OTP input:
  /// ```dart
  /// final otpKey = GlobalKey<_OtpInputFieldState>();
  /// // Later...
  /// otpKey.currentState?.clear();
  /// ```
  void clear() {
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.length, (index) {
            return Padding(
              padding: EdgeInsets.symmetric(
                horizontal: index == 0 || index == widget.length - 1
                    ? 0
                    : AppSpacing.xs,
              ),
              child: _OtpDigitField(
                controller: _controllers[index],
                focusNode: _focusNodes[index],
                enabled: widget.enabled,
                hasError: widget.errorText != null,
                onChanged: (value) => _onChanged(index, value),
                onKeyEvent: (event) => _onKeyDown(index, event),
              ),
            );
          }),
        ),
        if (widget.errorText != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            widget.errorText!,
            style: const TextStyle(
              color: AppColors.error,
              fontSize: 12,
            ),
          ),
        ],
      ],
    );
  }
}

/// Internal widget for a single OTP digit field.
///
/// Displays a single digit input box with custom styling
/// and keyboard event handling.
class _OtpDigitField extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool enabled;
  final bool hasError;
  final ValueChanged<String> onChanged;
  final ValueChanged<KeyEvent> onKeyEvent;

  const _OtpDigitField({
    required this.controller,
    required this.focusNode,
    required this.enabled,
    required this.hasError,
    required this.onChanged,
    required this.onKeyEvent,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 56,
      child: KeyboardListener(
        focusNode: FocusNode(),
        onKeyEvent: onKeyEvent,
        child: TextFormField(
          controller: controller,
          focusNode: focusNode,
          enabled: enabled,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          maxLength: 1,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            counterText: '',
            contentPadding: EdgeInsets.zero,
            filled: true,
            fillColor: enabled ? AppColors.surface : AppColors.surfaceVariant,
            border: OutlineInputBorder(
              borderRadius: AppSpacing.borderRadiusSm,
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.border,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: AppSpacing.borderRadiusSm,
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.border,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: AppSpacing.borderRadiusSm,
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.primary,
                width: 2,
              ),
            ),
          ),
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(1),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }
}
