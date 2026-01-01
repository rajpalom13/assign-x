import 'package:flutter/material.dart';

/// App color constants following the design system.
///
/// Theme: Professionalism, Security, Efficiency
class AppColors {
  AppColors._();

  // Primary Colors
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1D4ED8);

  // Background Colors
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  // Note: textTertiary darkened from 0xFF94A3B8 to meet WCAG 2.1 AA contrast (4.5:1)
  static const Color textTertiary = Color(0xFF64748B);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF22C55E);
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // Project Status Colors
  static const Color analyzing = Color(0xFFEAB308);
  static const Color analyzingLight = Color(0xFFFEF9C3);
  static const Color paymentPending = Color(0xFFF59E0B);
  static const Color inProgress = Color(0xFF3B82F6);
  static const Color forReview = Color(0xFF22C55E);
  static const Color completed = Color(0xFF22C55E);
  static const Color revision = Color(0xFFEF4444);
  static const Color archived = Color(0xFF6B7280);

  // Border Colors
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderFocused = Color(0xFF2563EB);
  static const Color borderError = Color(0xFFEF4444);

  // Divider
  static const Color divider = Color(0xFFE2E8F0);

  // Overlay
  static const Color overlay = Color(0x80000000);

  // Shimmer
  static const Color shimmerBase = Color(0xFFE2E8F0);
  static const Color shimmerHighlight = Color(0xFFF8FAFC);
}
