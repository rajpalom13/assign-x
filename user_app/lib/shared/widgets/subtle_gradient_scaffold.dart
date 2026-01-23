import 'package:flutter/material.dart';

/// Design colors for subtle gradient backgrounds.
class SubtleGradientColors {
  SubtleGradientColors._();

  /// Base scaffold background - lighter clean cream
  static const Color background = Color(0xFFFEFBF8);

  /// Lavender gradient colors (top-right)
  static const Color lavenderLight = Color(0xFFF5E6FF);
  static const Color lavenderMedium = Color(0xFFE8E0F8);
  static const Color lavenderDark = Color(0xFFD4C4F0);

  /// Peach gradient colors (bottom-left)
  static const Color peachLight = Color(0xFFFFF5E6);
  static const Color peachMedium = Color(0xFFFFE6D5);
  static const Color peachDark = Color(0xFFFFD6C4);

  /// Soft blue (alternative)
  static const Color blueLight = Color(0xFFE6F3FF);
  static const Color blueMedium = Color(0xFFD4E8FF);

  /// Soft green (alternative)
  static const Color greenLight = Color(0xFFE6FFF0);
  static const Color greenMedium = Color(0xFFD4F5E0);
}

/// Position for gradient patches.
enum GradientPatchPosition {
  topRight,
  topLeft,
  bottomRight,
  bottomLeft,
  center,
}

/// A single gradient patch (blob) for background decoration.
class GradientPatch extends StatelessWidget {
  final GradientPatchPosition position;
  final List<Color> colors;
  final double size;
  final double opacity;
  final double blur;

  const GradientPatch({
    super.key,
    required this.position,
    required this.colors,
    this.size = 300,
    this.opacity = 0.25,
    this.blur = 100,
  });

  /// Lavender patch for top-right corner
  factory GradientPatch.lavender({
    GradientPatchPosition position = GradientPatchPosition.topRight,
    double opacity = 0.25,
  }) {
    return GradientPatch(
      position: position,
      colors: [
        SubtleGradientColors.lavenderLight,
        SubtleGradientColors.lavenderMedium,
        SubtleGradientColors.lavenderDark.withValues(alpha: 0.5),
      ],
      opacity: opacity,
    );
  }

  /// Peach patch for bottom-left corner
  factory GradientPatch.peach({
    GradientPatchPosition position = GradientPatchPosition.bottomLeft,
    double opacity = 0.25,
  }) {
    return GradientPatch(
      position: position,
      colors: [
        SubtleGradientColors.peachLight,
        SubtleGradientColors.peachMedium,
        SubtleGradientColors.peachDark.withValues(alpha: 0.5),
      ],
      opacity: opacity,
    );
  }

  /// Blue patch (alternative)
  factory GradientPatch.blue({
    GradientPatchPosition position = GradientPatchPosition.topRight,
    double opacity = 0.25,
  }) {
    return GradientPatch(
      position: position,
      colors: [
        SubtleGradientColors.blueLight,
        SubtleGradientColors.blueMedium,
        SubtleGradientColors.blueLight.withValues(alpha: 0.3),
      ],
      opacity: opacity,
    );
  }

  Alignment get _alignment {
    switch (position) {
      case GradientPatchPosition.topRight:
        return const Alignment(1.2, -0.8);
      case GradientPatchPosition.topLeft:
        return const Alignment(-1.2, -0.8);
      case GradientPatchPosition.bottomRight:
        return const Alignment(1.2, 1.0);
      case GradientPatchPosition.bottomLeft:
        return const Alignment(-1.0, 1.2);
      case GradientPatchPosition.center:
        return Alignment.center;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Align(
        alignment: _alignment,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: colors.map((c) => c.withValues(alpha: opacity)).toList(),
              stops: const [0.0, 0.5, 1.0],
            ),
            boxShadow: [
              BoxShadow(
                color: colors.first.withValues(alpha: opacity * 0.5),
                blurRadius: blur,
                spreadRadius: blur * 0.3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A scaffold with subtle gradient patches in the background.
///
/// This provides a consistent, elegant background treatment across all pages.
class SubtleGradientScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final bool extendBody;
  final bool extendBodyBehindAppBar;
  final Color? backgroundColor;
  final List<GradientPatch>? patches;
  final bool showGradients;

  const SubtleGradientScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.extendBody = true,
    this.extendBodyBehindAppBar = true,
    this.backgroundColor,
    this.patches,
    this.showGradients = true,
  });

  /// Standard preset with lavender top-right and peach bottom-left
  factory SubtleGradientScaffold.standard({
    required Widget body,
    PreferredSizeWidget? appBar,
    Widget? bottomNavigationBar,
    Widget? floatingActionButton,
    FloatingActionButtonLocation? floatingActionButtonLocation,
  }) {
    return SubtleGradientScaffold(
      body: body,
      appBar: appBar,
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
      floatingActionButtonLocation: floatingActionButtonLocation,
      patches: [
        GradientPatch.lavender(opacity: 0.25),
        GradientPatch.peach(opacity: 0.25),
      ],
    );
  }

  /// Minimal preset with just one subtle patch
  factory SubtleGradientScaffold.minimal({
    required Widget body,
    PreferredSizeWidget? appBar,
    Widget? bottomNavigationBar,
  }) {
    return SubtleGradientScaffold(
      body: body,
      appBar: appBar,
      bottomNavigationBar: bottomNavigationBar,
      patches: [
        GradientPatch.lavender(opacity: 0.15),
      ],
    );
  }

  /// Warm preset with peach tones
  factory SubtleGradientScaffold.warm({
    required Widget body,
    PreferredSizeWidget? appBar,
    Widget? bottomNavigationBar,
  }) {
    return SubtleGradientScaffold(
      body: body,
      appBar: appBar,
      bottomNavigationBar: bottomNavigationBar,
      patches: [
        GradientPatch.peach(
          position: GradientPatchPosition.topRight,
          opacity: 0.3,
        ),
        GradientPatch.peach(
          position: GradientPatchPosition.bottomLeft,
          opacity: 0.2,
        ),
      ],
    );
  }

  /// Cool preset with blue/lavender tones
  factory SubtleGradientScaffold.cool({
    required Widget body,
    PreferredSizeWidget? appBar,
    Widget? bottomNavigationBar,
  }) {
    return SubtleGradientScaffold(
      body: body,
      appBar: appBar,
      bottomNavigationBar: bottomNavigationBar,
      patches: [
        GradientPatch.blue(
          position: GradientPatchPosition.topRight,
          opacity: 0.25,
        ),
        GradientPatch.lavender(
          position: GradientPatchPosition.bottomLeft,
          opacity: 0.2,
        ),
      ],
    );
  }

  List<GradientPatch> get _defaultPatches => [
        GradientPatch.lavender(opacity: 0.25),
        GradientPatch.peach(opacity: 0.25),
      ];

  @override
  Widget build(BuildContext context) {
    final gradientPatches = patches ?? _defaultPatches;

    return Scaffold(
      backgroundColor: backgroundColor ?? SubtleGradientColors.background,
      extendBody: extendBody,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      floatingActionButtonLocation: floatingActionButtonLocation,
      bottomNavigationBar: bottomNavigationBar,
      body: Stack(
        children: [
          // Gradient patches (fixed, don't scroll)
          if (showGradients)
            ...gradientPatches,

          // Actual content (scrollable)
          Positioned.fill(
            child: body,
          ),
        ],
      ),
    );
  }
}

/// A simple wrapper to add gradient background to any widget.
/// Use this when you can't replace the entire Scaffold.
class SubtleGradientBackground extends StatelessWidget {
  final Widget child;
  final List<GradientPatch>? patches;
  final Color? backgroundColor;

  const SubtleGradientBackground({
    super.key,
    required this.child,
    this.patches,
    this.backgroundColor,
  });

  /// Standard preset
  factory SubtleGradientBackground.standard({required Widget child}) {
    return SubtleGradientBackground(
      patches: [
        GradientPatch.lavender(opacity: 0.25),
        GradientPatch.peach(opacity: 0.25),
      ],
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final gradientPatches = patches ?? [
      GradientPatch.lavender(opacity: 0.25),
      GradientPatch.peach(opacity: 0.25),
    ];

    return Container(
      color: backgroundColor ?? SubtleGradientColors.background,
      child: Stack(
        children: [
          // Gradient patches
          ...gradientPatches,
          // Content
          Positioned.fill(child: child),
        ],
      ),
    );
  }
}
