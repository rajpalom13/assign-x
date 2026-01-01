import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/invoice_service.dart';

/// Invoice Download Button Widget
/// Displays download and share options for project invoices
/// Implements U37 from feature spec
class InvoiceDownloadButton extends ConsumerStatefulWidget {
  final InvoiceData? invoice;
  final String? projectId;
  final bool compact;
  final VoidCallback? onDownloadComplete;

  const InvoiceDownloadButton({
    super.key,
    this.invoice,
    this.projectId,
    this.compact = false,
    this.onDownloadComplete,
  });

  @override
  ConsumerState<InvoiceDownloadButton> createState() => _InvoiceDownloadButtonState();
}

class _InvoiceDownloadButtonState extends ConsumerState<InvoiceDownloadButton> {
  bool _isLoading = false;
  InvoiceData? _invoice;

  @override
  void initState() {
    super.initState();
    _invoice = widget.invoice;
    if (_invoice == null && widget.projectId != null) {
      _loadInvoice();
    }
  }

  /// Load invoice data from server
  Future<void> _loadInvoice() async {
    if (widget.projectId == null) return;

    setState(() => _isLoading = true);

    try {
      // In production: fetch from API
      await Future.delayed(const Duration(milliseconds: 500));

      // Mock invoice data
      _invoice = InvoiceData(
        invoiceNumber: 'INV-2024-${widget.projectId!.substring(0, 6)}',
        projectNumber: 'AX-2024-001',
        projectTitle: 'Sample Project',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        paidAt: DateTime.now().subtract(const Duration(days: 4)),
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        amount: 1500.0,
        platformFee: 150.0,
        gst: 297.0,
        totalAmount: 1947.0,
        paymentMethod: 'UPI',
        transactionId: 'TXN123456789',
        status: 'paid',
      );

      if (mounted) setState(() {});
    } catch (e) {
      debugPrint('Error loading invoice: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  /// Handle download
  Future<void> _handleDownload() async {
    if (_invoice == null) return;

    setState(() => _isLoading = true);

    try {
      await InvoiceService.downloadInvoice(context, _invoice!);
      widget.onDownloadComplete?.call();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  /// Handle share
  Future<void> _handleShare() async {
    if (_invoice == null) return;

    setState(() => _isLoading = true);

    try {
      await InvoiceService.shareInvoice(_invoice!);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  /// Show options bottom sheet
  void _showOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.receipt_long,
                    color: Colors.blue[700],
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Invoice',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_invoice != null)
                        Text(
                          _invoice!.invoiceNumber,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Invoice Summary
            if (_invoice != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildSummaryRow('Project', _invoice!.projectNumber),
                    _buildSummaryRow('Amount', '\u20B9${_invoice!.totalAmount.toStringAsFixed(2)}'),
                    _buildSummaryRow('Status', _invoice!.status.toUpperCase()),
                    if (_invoice!.paidAt != null)
                      _buildSummaryRow('Paid On', _formatDate(_invoice!.paidAt!)),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _handleShare();
                    },
                    icon: const Icon(Icons.share, size: 18),
                    label: const Text('Share'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _handleDownload();
                    },
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Download PDF'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey[600]),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    if (_invoice == null && !_isLoading) {
      return const SizedBox.shrink();
    }

    if (widget.compact) {
      return IconButton(
        onPressed: _isLoading ? null : _showOptions,
        icon: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.receipt_long),
        tooltip: 'View Invoice',
      );
    }

    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _showOptions,
      icon: _isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.receipt_long, size: 18),
      label: const Text('Invoice'),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}

/// Quick invoice download button for lists
class InvoiceQuickButton extends StatelessWidget {
  final InvoiceData invoice;

  const InvoiceQuickButton({
    super.key,
    required this.invoice,
  });

  @override
  Widget build(BuildContext context) {
    return InvoiceDownloadButton(
      invoice: invoice,
      compact: true,
    );
  }
}
