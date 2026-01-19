import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/services/payment_service.dart';
import '../../../data/models/wallet_model.dart';
import '../../../providers/profile_provider.dart';
import '../../../shared/widgets/glass_container.dart';

/// Wallet screen with curved dome hero, credit card design, and glass styling.
///
/// Features:
/// - Tall curved dome hero with mesh gradient
/// - Credit card widget with balance display
/// - Balance widgets grid (2x2 on mobile)
/// - Glass-styled transaction items
/// - Horizontal scrolling offer pills
class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);
    final transactionsAsync = ref.watch(walletTransactionsProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(walletProvider);
            ref.invalidate(walletTransactionsProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Curved dome hero with credit card
              SliverToBoxAdapter(
                child: walletAsync.when(
                  data: (wallet) => _CurvedDomeHero(
                    wallet: wallet,
                    onTopUp: () => _showTopUpSheet(context, ref),
                    onBack: () => context.pop(),
                  ),
                  loading: () => _CurvedDomeHero(
                    wallet: null,
                    isLoading: true,
                    onBack: () => context.pop(),
                  ),
                  error: (_, _) => _CurvedDomeHero(
                    wallet: null,
                    hasError: true,
                    onBack: () => context.pop(),
                  ),
                ),
              ),

              // Balance widgets grid
              SliverToBoxAdapter(
                child: walletAsync.when(
                  data: (wallet) => _BalanceWidgetsGrid(wallet: wallet),
                  loading: () => const _BalanceWidgetsGrid(wallet: null, isLoading: true),
                  error: (_, _) => const SizedBox.shrink(),
                ),
              ),

              // Offer pills section
              const SliverToBoxAdapter(
                child: _OfferPillsSection(),
              ),

              // Transaction history header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Transactions',
                        style: AppTextStyles.headingSmall,
                      ),
                      GestureDetector(
                        onTap: () {
                          // Show filter
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.filter_list_rounded,
                                size: 16,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'Filter',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Transactions list with glass styling
              transactionsAsync.when(
                data: (transactions) {
                  if (transactions.isEmpty) {
                    return SliverToBoxAdapter(
                      child: _EmptyTransactions(),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final transaction = transactions[index];
                          return _GlassTransactionTile(transaction: transaction);
                        },
                        childCount: transactions.length,
                      ),
                    ),
                  );
                },
                loading: () => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(40),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                        strokeWidth: 2,
                      ),
                    ),
                  ),
                ),
                error: (_, _) => SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          Icon(Icons.error_outline, color: AppColors.error, size: 48),
                          const SizedBox(height: 12),
                          Text(
                            'Failed to load transactions',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Bottom padding for safe area
              SliverToBoxAdapter(
                child: SizedBox(height: MediaQuery.of(context).padding.bottom + 100),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showTopUpSheet(BuildContext context, WidgetRef ref) {
    final amounts = [100, 500, 1000, 2000, 5000];
    int? selectedAmount;
    final logger = Logger(printer: PrettyPrinter(methodCount: 0));

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 12,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Add Money to Wallet',
                style: AppTextStyles.headingSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Select an amount to top up your wallet',
                style: AppTextStyles.bodySmall,
              ),
              const SizedBox(height: 24),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: amounts.map((amount) {
                  final isSelected = selectedAmount == amount;
                  return GestureDetector(
                    onTap: () => setState(() => selectedAmount = amount),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? LinearGradient(
                                colors: [
                                  AppColors.primary,
                                  AppColors.primary.withAlpha(200),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : null,
                        color: isSelected ? null : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 2 : 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppColors.primary.withAlpha(50),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ]
                            : null,
                      ),
                      child: Text(
                        '\u20B9$amount',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: selectedAmount != null
                      ? () {
                          Navigator.pop(context);
                          _initiatePayment(
                            context: context,
                            ref: ref,
                            amount: selectedAmount!,
                            logger: logger,
                          );
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text('Proceed to Pay'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Initiates the payment flow with proper loading and error handling.
  void _initiatePayment({
    required BuildContext context,
    required WidgetRef ref,
    required int amount,
    required Logger logger,
  }) {
    logger.i('[Wallet] Initiating payment for INR $amount');

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => PopScope(
        canPop: false,
        child: AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Row(
            children: [
              CircularProgressIndicator(
                color: AppColors.primary,
                strokeWidth: 2,
              ),
              const SizedBox(width: 20),
              const Text('Creating order...'),
            ],
          ),
        ),
      ),
    );

    // Initialize payment service
    final paymentService = PaymentService();

    // Open Razorpay checkout
    paymentService.topUpWallet(
      amountInRupees: amount,
      onSuccess: (result) {
        logger.i('[Wallet] Payment verified: ${result.paymentId}');

        // Close loading dialog if still showing
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        }

        // Show success message with new balance if available
        String successMessage = 'Payment successful! Wallet updated.';
        if (result.newBalance != null) {
          successMessage = 'Payment successful! New balance: \u20B9${result.newBalance!.toStringAsFixed(2)}';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(successMessage),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(seconds: 3),
          ),
        );

        // Refresh wallet data to show updated balance immediately
        ref.invalidate(walletProvider);
        ref.invalidate(walletTransactionsProvider);

        // Dispose payment service
        paymentService.dispose();
      },
      onError: (result) {
        logger.e('[Wallet] Payment failed: ${result.errorMessage}');

        // Close loading dialog if still showing
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        }

        // Determine user-friendly error message
        String errorMessage = result.errorMessage ?? 'Payment failed';
        if (result.errorCode == 'VERIFICATION_ERROR') {
          errorMessage = result.errorMessage ??
            'Payment may have been processed. Please contact support.';
        } else if (result.errorCode == 'INIT_ERROR') {
          errorMessage = 'Could not initiate payment. Please try again.';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(seconds: 5),
            action: result.errorCode == 'VERIFICATION_ERROR'
              ? SnackBarAction(
                  label: 'Contact Support',
                  textColor: Colors.white,
                  onPressed: () {
                    // TODO: Open support chat or email
                  },
                )
              : null,
          ),
        );

        // Dispose payment service
        paymentService.dispose();
      },
      onExternalWallet: () {
        logger.i('[Wallet] External wallet selected');

        // Close loading dialog if still showing
        if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        }

        // Dispose payment service
        paymentService.dispose();
      },
    );

    // Close the loading dialog after checkout opens (with slight delay)
    final navigator = Navigator.of(context);
    Future.delayed(const Duration(seconds: 2), () {
      try {
        if (navigator.canPop()) {
          navigator.pop();
        }
      } catch (e) {
        logger.d('[Wallet] Dialog already closed');
      }
    });
  }
}

/// Custom clipper for curved bottom edge on the dome hero.
class _CurvedBottomClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 40);

    // Quadratic bezier curve for smooth bottom edge
    path.quadraticBezierTo(
      size.width / 2,
      size.height + 20,
      size.width,
      size.height - 40,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

/// Curved dome hero widget with gradient background and credit card.
class _CurvedDomeHero extends StatelessWidget {
  final Wallet? wallet;
  final bool isLoading;
  final bool hasError;
  final VoidCallback? onTopUp;
  final VoidCallback? onBack;

  const _CurvedDomeHero({
    this.wallet,
    this.isLoading = false,
    this.hasError = false,
    this.onTopUp,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return ClipPath(
      clipper: _CurvedBottomClipper(),
      child: Container(
        height: 360 + topPadding,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF54442B), // dark brown
              Color(0xFF3A2E1E), // mid dark
              Color(0xFF14110F), // pitch black
            ],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Mesh gradient overlay effect
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: const Alignment(0.8, -0.3),
                    radius: 1.5,
                    colors: [
                      AppColors.primary.withAlpha(40),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: const Alignment(-0.5, 0.8),
                    radius: 1.2,
                    colors: [
                      AppColors.accent.withAlpha(30),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Content
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 60),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Back button and title
                    Row(
                      children: [
                        GestureDetector(
                          onTap: onBack,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(20),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.arrow_back_rounded,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Text(
                          'Wallet',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Credit card widget
                    _CreditCardWidget(
                      wallet: wallet,
                      isLoading: isLoading,
                      onTopUp: onTopUp,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Credit card widget with dark gradient styling.
class _CreditCardWidget extends StatelessWidget {
  final Wallet? wallet;
  final bool isLoading;
  final VoidCallback? onTopUp;

  const _CreditCardWidget({
    this.wallet,
    this.isLoading = false,
    this.onTopUp,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF4D4D5D),
            Color(0xFF3D3D4D),
            Color(0xFF2D2D3D),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(80),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
          BoxShadow(
            color: Colors.black.withAlpha(40),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: Colors.white.withAlpha(20),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card header with chip icon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.amber.shade600,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Icon(
                  Icons.memory_rounded,
                  color: Colors.amber,
                  size: 20,
                ),
              ),
              Icon(
                Icons.contactless_rounded,
                color: Colors.white.withAlpha(180),
                size: 28,
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Balance label
          Text(
            'Available Balance',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Colors.white.withAlpha(180),
              letterSpacing: 0.5,
            ),
          ),

          const SizedBox(height: 6),

          // Balance amount
          isLoading
              ? Container(
                  width: 160,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                )
              : Text(
                  wallet?.balanceString ?? '\u20B90.00',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -1,
                  ),
                ),

          const SizedBox(height: 20),

          // Add money button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onTopUp,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.textPrimary,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text(
                'Add Money',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Balance widgets grid (2x2 on mobile).
class _BalanceWidgetsGrid extends StatelessWidget {
  final Wallet? wallet;
  final bool isLoading;

  const _BalanceWidgetsGrid({
    this.wallet,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                _BalanceWidget(
                  icon: Icons.account_balance_wallet_rounded,
                  iconColor: AppColors.success,
                  label: 'Available',
                  value: wallet?.availableBalanceString ?? '\u20B90',
                  isLoading: isLoading,
                ),
                const SizedBox(height: 12),
                _BalanceWidget(
                  icon: Icons.schedule_rounded,
                  iconColor: AppColors.warning,
                  label: 'Pending',
                  value: wallet?.lockedAmountString ?? '\u20B90',
                  isLoading: isLoading,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              children: [
                _BalanceWidget(
                  icon: Icons.emoji_events_rounded,
                  iconColor: AppColors.info,
                  label: 'Rewards',
                  value: '\u20B90',
                  isLoading: isLoading,
                ),
                const SizedBox(height: 12),
                _BalanceWidget(
                  icon: Icons.credit_card_rounded,
                  iconColor: AppColors.error,
                  label: 'Total Spent',
                  value: '\u20B9${wallet?.totalDebited.toStringAsFixed(0) ?? '0'}',
                  isLoading: isLoading,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Individual balance widget with glass styling.
class _BalanceWidget extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final bool isLoading;

  const _BalanceWidget({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      blur: 8,
      opacity: 0.85,
      padding: const EdgeInsets.all(14),
      borderRadius: BorderRadius.circular(14),
      elevation: 1,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 20,
              color: iconColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                isLoading
                    ? Container(
                        width: 60,
                        height: 18,
                        decoration: BoxDecoration(
                          color: AppColors.shimmerBase,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      )
                    : Text(
                        value,
                        style: AppTextStyles.labelLarge.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Offer pills horizontal scroll section.
class _OfferPillsSection extends StatelessWidget {
  const _OfferPillsSection();

  @override
  Widget build(BuildContext context) {
    final offers = [
      _OfferData(
        icon: Icons.local_offer_rounded,
        text: '10% cashback on first top-up',
        color: AppColors.success,
      ),
      _OfferData(
        icon: Icons.card_giftcard_rounded,
        text: 'Refer & earn \u20B9100',
        color: AppColors.info,
      ),
      _OfferData(
        icon: Icons.bolt_rounded,
        text: 'Instant withdrawal',
        color: AppColors.warning,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: SizedBox(
        height: 42,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: offers.length,
          separatorBuilder: (_, _) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final offer = offers[index];
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: offer.color.withAlpha(15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: offer.color.withAlpha(40),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    offer.icon,
                    size: 16,
                    color: offer.color,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    offer.text,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: offer.color,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Offer data model.
class _OfferData {
  final IconData icon;
  final String text;
  final Color color;

  const _OfferData({
    required this.icon,
    required this.text,
    required this.color,
  });
}

/// Glass-styled transaction tile widget.
class _GlassTransactionTile extends StatelessWidget {
  final WalletTransaction transaction;

  const _GlassTransactionTile({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.type.isCredit;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        blur: 6,
        opacity: 0.9,
        padding: const EdgeInsets.all(14),
        borderRadius: BorderRadius.circular(14),
        elevation: 1,
        child: Row(
          children: [
            // Transaction type icon
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: transaction.type.color.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                transaction.type.icon,
                size: 22,
                color: transaction.type.color,
              ),
            ),
            const SizedBox(width: 14),

            // Transaction details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    transaction.description,
                    style: AppTextStyles.labelMedium.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time_rounded,
                        size: 12,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${transaction.dateString} \u2022 ${transaction.timeString}',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Amount
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: (isCredit ? AppColors.success : AppColors.error).withAlpha(15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                transaction.amountString,
                style: AppTextStyles.labelMedium.copyWith(
                  color: isCredit ? AppColors.success : AppColors.error,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Empty transactions state widget.
class _EmptyTransactions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(48),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 48,
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'No transactions yet',
            style: AppTextStyles.labelLarge.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your transaction history will appear here\nonce you start using your wallet',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
