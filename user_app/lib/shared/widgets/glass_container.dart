import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

/// Glass morphism container with backdrop blur effect.
///
/// Creates a frosted glass effect commonly used in modern UI designs.
/// Supports configurable blur intensity, opacity, and border styling.
///
/// Example:
/// ```dart
/// GlassContainer(
///   blur: 10,
///   opacity: 0.15,
///   child: Padding(
///     padding: EdgeInsets.all(16),
///     child: Text('Glass Content'),
///   ),
/// )
/// ```
class GlassContainer extends StatelessWidget {
  /// Child widget to display inside the glass container.
  final Widget child;

  /// Blur intensity for the backdrop filter.
  /// Higher values create more blur. Default is 10.
  final double blur;

  /// Background opacity (0.0 to 1.0).
  /// Lower values create more transparency. Default is 0.15.
  final double opacity;

  /// Border radius for the container.
  /// Default is 16.0 (AppSpacing.radiusLg).
  final double borderRadius;

  /// Border opacity (0.0 to 1.0).
  /// Default is 0.2 for subtle border visibility.
  final double borderOpacity;

  /// Border width in pixels. Default is 1.0.
  final double borderWidth;

  /// Optional padding inside the container.
  final EdgeInsetsGeometry? padding;

  /// Optional margin around the container.
  final EdgeInsetsGeometry? margin;

  /// Background color before opacity is applied.
  /// Default is white for light glass effect.
  final Color? backgroundColor;

  /// Border color before opacity is applied.
  /// Default is white for light border.
  final Color? borderColor;

  /// Optional width constraint.
  final double? width;

  /// Optional height constraint.
  final double? height;

  /// Optional box shadow for depth effect.
  final List<BoxShadow>? shadows;

  const GlassContainer({
    super.key,
    required this.child,
    this.blur = 10.0,
    this.opacity = 0.15,
    this.borderRadius = AppSpacing.radiusLg,
    this.borderOpacity = 0.2,
    this.borderWidth = 1.0,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.width,
    this.height,
    this.shadows,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = backgroundColor ?? Colors.white;
    final bdrColor = borderColor ?? Colors.white;

    return Container(
      width: width,
      height: height,
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: bgColor.withAlpha((opacity * 255).round()),
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: bdrColor.withAlpha((borderOpacity * 255).round()),
                width: borderWidth,
              ),
              boxShadow: shadows,
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Preset glass container variants for common use cases.
class GlassContainerVariants {
  GlassContainerVariants._();

  /// Light glass effect - subtle blur with white background.
  static GlassContainer light({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double borderRadius = AppSpacing.radiusLg,
  }) {
    return GlassContainer(
      blur: 12,
      opacity: 0.2,
      borderOpacity: 0.25,
      borderRadius: borderRadius,
      padding: padding,
      margin: margin,
      backgroundColor: Colors.white,
      borderColor: Colors.white,
      child: child,
    );
  }

  /// Dark glass effect - blur with dark background.
  static GlassContainer dark({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double borderRadius = AppSpacing.radiusLg,
  }) {
    return GlassContainer(
      blur: 15,
      opacity: 0.3,
      borderOpacity: 0.15,
      borderRadius: borderRadius,
      padding: padding,
      margin: margin,
      backgroundColor: AppColors.textPrimary,
      borderColor: Colors.white,
      child: child,
    );
  }

  /// Primary colored glass effect.
  static GlassContainer primary({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double borderRadius = AppSpacing.radiusLg,
  }) {
    return GlassContainer(
      blur: 10,
      opacity: 0.12,
      borderOpacity: 0.2,
      borderRadius: borderRadius,
      padding: padding,
      margin: margin,
      backgroundColor: AppColors.primary,
      borderColor: AppColors.primaryLight,
      child: child,
    );
  }

  /// Card-style glass with subtle shadow.
  static GlassContainer card({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double borderRadius = AppSpacing.radiusLg,
  }) {
    return GlassContainer(
      blur: 8,
      opacity: 0.7,
      borderOpacity: 0.1,
      borderRadius: borderRadius,
      padding: padding ?? AppSpacing.cardPadding,
      margin: margin,
      backgroundColor: Colors.white,
      borderColor: AppColors.border,
      shadows: [
        BoxShadow(
          color: Colors.black.withAlpha(10),
          blurRadius: 20,
          offset: const Offset(0, 4),
        ),
      ],
      child: child,
    );
  }
}

/// Animated glass container with shimmer effect.
class AnimatedGlassContainer extends StatefulWidget {
  /// Child widget to display inside the glass container.
  final Widget child;

  /// Animation duration. Default is 2 seconds.
  final Duration duration;

  /// Blur intensity. Default is 10.
  final double blur;

  /// Base opacity. Default is 0.15.
  final double opacity;

  /// Border radius. Default is 16.
  final double borderRadius;

  /// Optional padding inside the container.
  final EdgeInsetsGeometry? padding;

  const AnimatedGlassContainer({
    super.key,
    required this.child,
    this.duration = const Duration(seconds: 2),
    this.blur = 10.0,
    this.opacity = 0.15,
    this.borderRadius = AppSpacing.radiusLg,
    this.padding,
  });

  @override
  State<AnimatedGlassContainer> createState() => _AnimatedGlassContainerState();
}

class _AnimatedGlassContainerState extends State<AnimatedGlassContainer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat(reverse: true);

    _opacityAnimation = Tween<double>(
      begin: widget.opacity,
      end: widget.opacity + 0.1,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _opacityAnimation,
      builder: (context, child) {
        return GlassContainer(
          blur: widget.blur,
          opacity: _opacityAnimation.value,
          borderRadius: widget.borderRadius,
          padding: widget.padding,
          child: widget.child,
        );
      },
    );
  }
}
