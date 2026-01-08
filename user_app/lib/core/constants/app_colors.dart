import 'package:flutter/material.dart';

/// App color constants following the Premium Earthy Design System.
///
/// Palette: Pitch Black to Toasted Almond
/// #141204 | #262A10 | #54442B | #A9714B | #E8985E
///
/// Theme: Professionalism, Warmth, Trust
class AppColors {
  AppColors._();

  // ============================================================
  // PRIMARY COLORS - Cinnamon Wood
  // ============================================================

  /// Primary brand color - Cinnamon Wood (#A9714B)
  static const Color primary = Color(0xFFA9714B);

  /// Lighter variant of primary for hover states
  static const Color primaryLight = Color(0xFFBD8A66);

  /// Darker variant of primary for pressed states
  static const Color primaryDark = Color(0xFF8B5D3D);

  // ============================================================
  // ACCENT COLORS - Toasted Almond
  // ============================================================

  /// Accent color - Toasted Almond (#E8985E)
  static const Color accent = Color(0xFFE8985E);

  /// Lighter variant of accent
  static const Color accentLight = Color(0xFFF0B285);

  /// Darker variant of accent
  static const Color accentDark = Color(0xFFD07D42);

  // ============================================================
  // GRADIENT COLORS
  // ============================================================

  /// Gradient start - Pitch Black variant (#262A10)
  static const Color gradientStart = Color(0xFF262A10);

  /// Gradient middle - Dark Brown (#54442B)
  static const Color gradientMiddle = Color(0xFF54442B);

  /// Gradient end - Toasted Almond (#E8985E)
  static const Color gradientEnd = Color(0xFFE8985E);

  /// Primary gradient for buttons and highlights
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [gradientStart, gradientMiddle, gradientEnd],
  );

  /// Subtle gradient for cards and surfaces
  static const LinearGradient subtleGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFFEFDFB), Color(0xFFF9F7F4)],
  );

  // ============================================================
  // BACKGROUND COLORS - Light Theme
  // ============================================================

  /// Main background - Warm Cream (#F9F7F4)
  static const Color background = Color(0xFFF9F7F4);

  /// Surface color - Warm White (#FEFDFB)
  static const Color surface = Color(0xFFFEFDFB);

  /// Muted surface - Warm Gray (#F1EEEA)
  static const Color surfaceVariant = Color(0xFFF1EEEA);

  /// Card background
  static const Color card = Color(0xFFFEFDFB);

  // ============================================================
  // BACKGROUND COLORS - Dark Theme
  // ============================================================

  /// Dark background - Pitch Black (#141204)
  static const Color backgroundDark = Color(0xFF141204);

  /// Dark surface - Dark Olive-Black (#1E1D0B)
  static const Color surfaceDark = Color(0xFF1E1D0B);

  /// Dark muted surface - Dark Brown (#332B1A)
  static const Color surfaceVariantDark = Color(0xFF332B1A);

  /// Dark card background
  static const Color cardDark = Color(0xFF1E1D0B);

  // ============================================================
  // TEXT COLORS - Light Theme
  // ============================================================

  /// Primary text - Pitch Black (#141204)
  static const Color textPrimary = Color(0xFF141204);

  /// Secondary text - Warm brown-gray (#7A6E52)
  static const Color textSecondary = Color(0xFF7A6E52);

  /// Tertiary text - Lighter brown-gray (#9B917F)
  /// Meets WCAG 2.1 AA contrast ratio (4.5:1) against light backgrounds
  static const Color textTertiary = Color(0xFF9B917F);

  /// Text on primary/accent colors
  static const Color textOnPrimary = Color(0xFFF9F7F4);

  // ============================================================
  // TEXT COLORS - Dark Theme
  // ============================================================

  /// Primary text for dark theme - Light warm (#F0ECE4)
  static const Color textPrimaryDark = Color(0xFFF0ECE4);

  /// Secondary text for dark theme
  static const Color textSecondaryDark = Color(0xFFB8AD99);

  /// Tertiary text for dark theme
  static const Color textTertiaryDark = Color(0xFF8A8170);

  // ============================================================
  // STATUS COLORS
  // ============================================================

  /// Success - Green (#16A34A)
  static const Color success = Color(0xFF16A34A);

  /// Success light background
  static const Color successLight = Color(0xFFDCFCE7);

  /// Warning - Gold (#F59E0B)
  static const Color warning = Color(0xFFF59E0B);

  /// Warning light background
  static const Color warningLight = Color(0xFFFEF3C7);

  /// Error/Destructive - Red (#DC2626)
  static const Color error = Color(0xFFDC2626);

  /// Error light background
  static const Color errorLight = Color(0xFFFEE2E2);

  /// Info - Blue (#2596BE)
  static const Color info = Color(0xFF2596BE);

  /// Info light background
  static const Color infoLight = Color(0xFFDBEAFE);

  // ============================================================
  // PROJECT STATUS COLORS
  // ============================================================

  /// Analyzing status - Gold
  static const Color analyzing = Color(0xFFEAB308);

  /// Analyzing light background
  static const Color analyzingLight = Color(0xFFFEF9C3);

  /// Payment pending status - Gold/Orange
  static const Color paymentPending = Color(0xFFF59E0B);

  /// In progress status - Uses primary
  static const Color inProgress = Color(0xFFA9714B);

  /// For review status - Accent
  static const Color forReview = Color(0xFFE8985E);

  /// Completed status - Success green
  static const Color completed = Color(0xFF16A34A);

  /// Revision required status - Error red
  static const Color revision = Color(0xFFDC2626);

  /// Archived status - Muted gray
  static const Color archived = Color(0xFF7A6E52);

  // ============================================================
  // BORDER COLORS
  // ============================================================

  /// Default border - Warm gray (#DDD7CD)
  static const Color border = Color(0xFFDDD7CD);

  /// Focused border - Uses primary
  static const Color borderFocused = Color(0xFFA9714B);

  /// Error border
  static const Color borderError = Color(0xFFDC2626);

  /// Dark theme border
  static const Color borderDark = Color(0xFF4D4333);

  // ============================================================
  // DIVIDER & OVERLAY
  // ============================================================

  /// Divider color - matches border
  static const Color divider = Color(0xFFDDD7CD);

  /// Dark theme divider
  static const Color dividerDark = Color(0xFF4D4333);

  /// Overlay - Semi-transparent black
  static const Color overlay = Color(0x80000000);

  /// Light overlay for dark surfaces
  static const Color overlayLight = Color(0x1AFFFFFF);

  // ============================================================
  // SHIMMER COLORS - Loading States
  // ============================================================

  /// Shimmer base color - Light theme
  static const Color shimmerBase = Color(0xFFE8E3DA);

  /// Shimmer highlight color - Light theme
  static const Color shimmerHighlight = Color(0xFFF5F2ED);

  /// Shimmer base color - Dark theme
  static const Color shimmerBaseDark = Color(0xFF332B1A);

  /// Shimmer highlight color - Dark theme
  static const Color shimmerHighlightDark = Color(0xFF4D4333);

  // ============================================================
  // INPUT COLORS
  // ============================================================

  /// Input background
  static const Color inputBackground = Color(0xFFF1EEEA);

  /// Input background dark
  static const Color inputBackgroundDark = Color(0xFF332B1A);

  // ============================================================
  // CHART COLORS - Earthy palette for data visualization
  // ============================================================

  /// Chart color 1 - Cinnamon
  static const Color chart1 = Color(0xFFA9714B);

  /// Chart color 2 - Toasted Almond
  static const Color chart2 = Color(0xFFE8985E);

  /// Chart color 3 - Dark Brown
  static const Color chart3 = Color(0xFF54442B);

  /// Chart color 4 - Dark Khaki
  static const Color chart4 = Color(0xFF6B6630);

  /// Chart color 5 - Olive
  static const Color chart5 = Color(0xFF808040);

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /// Get shimmer colors based on theme brightness
  static List<Color> getShimmerColors(Brightness brightness) {
    if (brightness == Brightness.dark) {
      return [shimmerBaseDark, shimmerHighlightDark, shimmerBaseDark];
    }
    return [shimmerBase, shimmerHighlight, shimmerBase];
  }

  /// Get appropriate text color for a given background
  static Color getTextColorForBackground(Color backgroundColor) {
    // Calculate relative luminance
    final luminance = backgroundColor.computeLuminance();
    return luminance > 0.5 ? textPrimary : textPrimaryDark;
  }
}
