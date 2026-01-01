import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../config/razorpay_config.dart';
import '../config/supabase_config.dart';

/// Payment result model
class PaymentResult {
  final bool success;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? errorCode;
  final String? errorMessage;

  const PaymentResult({
    required this.success,
    this.paymentId,
    this.orderId,
    this.signature,
    this.errorCode,
    this.errorMessage,
  });
}

/// Callback types for payment events
typedef PaymentSuccessCallback = void Function(PaymentResult result);
typedef PaymentErrorCallback = void Function(PaymentResult result);

/// Payment service for handling Razorpay transactions.
class PaymentService {
  late Razorpay _razorpay;
  PaymentSuccessCallback? _onSuccess;
  PaymentErrorCallback? _onError;
  VoidCallback? _onExternalWallet;

  PaymentService() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  /// Opens Razorpay checkout for a project payment.
  Future<void> payForProject({
    required String projectId,
    required int amountInRupees,
    required String projectTitle,
    PaymentSuccessCallback? onSuccess,
    PaymentErrorCallback? onError,
    VoidCallback? onExternalWallet,
  }) async {
    _onSuccess = onSuccess;
    _onError = onError;
    _onExternalWallet = onExternalWallet;

    final user = SupabaseConfig.currentUser;
    final userEmail = user?.email;
    final userPhone = user?.phone;

    // Get user profile for name
    String? userName;
    if (user != null) {
      final profile = await SupabaseConfig.client
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
      userName = profile?['full_name'] as String?;
    }

    // Create order on backend (ideally this should be done via a server function)
    // For now, we'll use a mock order ID
    final orderId = 'order_${DateTime.now().millisecondsSinceEpoch}';

    final options = RazorpayConfig.createCheckoutOptions(
      amountInPaise: amountInRupees * 100, // Convert to paise
      orderId: orderId,
      name: userName,
      email: userEmail,
      phone: userPhone,
      description: 'Payment for: $projectTitle',
    );

    try {
      _razorpay.open(options);
    } catch (e) {
      _onError?.call(PaymentResult(
        success: false,
        errorCode: 'OPEN_ERROR',
        errorMessage: e.toString(),
      ));
    }
  }

  /// Opens Razorpay checkout for wallet top-up.
  Future<void> topUpWallet({
    required int amountInRupees,
    PaymentSuccessCallback? onSuccess,
    PaymentErrorCallback? onError,
    VoidCallback? onExternalWallet,
  }) async {
    _onSuccess = onSuccess;
    _onError = onError;
    _onExternalWallet = onExternalWallet;

    final user = SupabaseConfig.currentUser;
    final userEmail = user?.email;
    final userPhone = user?.phone;

    // Get user profile for name
    String? userName;
    if (user != null) {
      final profile = await SupabaseConfig.client
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
      userName = profile?['full_name'] as String?;
    }

    // Create order ID
    final orderId = 'wallet_${DateTime.now().millisecondsSinceEpoch}';

    final options = RazorpayConfig.createCheckoutOptions(
      amountInPaise: amountInRupees * 100,
      orderId: orderId,
      name: userName,
      email: userEmail,
      phone: userPhone,
      description: 'Wallet Top-up: ₹$amountInRupees',
    );

    try {
      _razorpay.open(options);
    } catch (e) {
      _onError?.call(PaymentResult(
        success: false,
        errorCode: 'OPEN_ERROR',
        errorMessage: e.toString(),
      ));
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    _onSuccess?.call(PaymentResult(
      success: true,
      paymentId: response.paymentId,
      orderId: response.orderId,
      signature: response.signature,
    ));
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _onError?.call(PaymentResult(
      success: false,
      errorCode: response.code.toString(),
      errorMessage: response.message,
    ));
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    _onExternalWallet?.call();
  }

  /// Verify payment signature (should be done server-side)
  Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    // This should call a server-side function to verify the signature
    // For now, we'll just return true
    return true;
  }

  /// Record payment in database
  Future<void> recordPayment({
    required String projectId,
    required String paymentId,
    required String orderId,
    required String signature,
    required int amount,
    required String status,
  }) async {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) return;

    await SupabaseConfig.client.from('payments').insert({
      'user_id': userId,
      'amount': amount,
      'currency': 'INR',
      'gateway': 'razorpay',
      'gateway_order_id': orderId,
      'gateway_payment_id': paymentId,
      'gateway_signature': signature,
      'reference_type': 'project',
      'reference_id': projectId,
      'status': status,
      'initiated_at': DateTime.now().toIso8601String(),
    });
  }

  /// Dispose of Razorpay instance
  void dispose() {
    _razorpay.clear();
  }
}
