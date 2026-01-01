import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:open_file/open_file.dart';
import 'package:share_plus/share_plus.dart';

/// Invoice data model
class InvoiceData {
  final String invoiceNumber;
  final String projectNumber;
  final String projectTitle;
  final DateTime createdAt;
  final DateTime? paidAt;
  final String customerName;
  final String customerEmail;
  final String? customerPhone;
  final double amount;
  final double? platformFee;
  final double? gst;
  final double totalAmount;
  final String paymentMethod;
  final String? transactionId;
  final String status;

  InvoiceData({
    required this.invoiceNumber,
    required this.projectNumber,
    required this.projectTitle,
    required this.createdAt,
    this.paidAt,
    required this.customerName,
    required this.customerEmail,
    this.customerPhone,
    required this.amount,
    this.platformFee,
    this.gst,
    required this.totalAmount,
    required this.paymentMethod,
    this.transactionId,
    required this.status,
  });

  factory InvoiceData.fromJson(Map<String, dynamic> json) {
    return InvoiceData(
      invoiceNumber: json['invoice_number'] ?? '',
      projectNumber: json['project_number'] ?? '',
      projectTitle: json['project_title'] ?? '',
      createdAt: DateTime.parse(json['created_at']),
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at']) : null,
      customerName: json['customer_name'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      customerPhone: json['customer_phone'],
      amount: (json['amount'] ?? 0).toDouble(),
      platformFee: json['platform_fee']?.toDouble(),
      gst: json['gst']?.toDouble(),
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      paymentMethod: json['payment_method'] ?? 'Unknown',
      transactionId: json['transaction_id'],
      status: json['status'] ?? 'pending',
    );
  }
}

/// Invoice Service
/// Handles invoice generation and download
/// Implements U37 from feature spec
class InvoiceService {
  /// Generate PDF invoice
  static Future<File> generateInvoicePdf(InvoiceData invoice) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            // Header
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'AssignX',
                      style: pw.TextStyle(
                        fontSize: 28,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blue800,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'Academic Excellence Platform',
                      style: const pw.TextStyle(
                        fontSize: 10,
                        color: PdfColors.grey600,
                      ),
                    ),
                  ],
                ),
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: pw.BoxDecoration(
                    color: invoice.status == 'paid'
                        ? PdfColors.green100
                        : PdfColors.orange100,
                    borderRadius: pw.BorderRadius.circular(4),
                  ),
                  child: pw.Text(
                    invoice.status.toUpperCase(),
                    style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      color: invoice.status == 'paid'
                          ? PdfColors.green800
                          : PdfColors.orange800,
                    ),
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 32),

            // Invoice Details
            pw.Container(
              padding: const pw.EdgeInsets.all(16),
              decoration: pw.BoxDecoration(
                color: PdfColors.grey100,
                borderRadius: pw.BorderRadius.circular(8),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'INVOICE',
                        style: pw.TextStyle(
                          fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.Text(
                        invoice.invoiceNumber,
                        style: const pw.TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'DATE',
                        style: pw.TextStyle(
                          fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.Text(
                        _formatDate(invoice.createdAt),
                        style: const pw.TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 24),

            // Bill To
            pw.Text(
              'BILL TO',
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.grey700,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Text(invoice.customerName),
            pw.Text(
              invoice.customerEmail,
              style: const pw.TextStyle(color: PdfColors.grey600),
            ),
            if (invoice.customerPhone != null)
              pw.Text(
                invoice.customerPhone!,
                style: const pw.TextStyle(color: PdfColors.grey600),
              ),
            pw.SizedBox(height: 24),

            // Project Details
            pw.Container(
              width: double.infinity,
              padding: const pw.EdgeInsets.all(16),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: PdfColors.grey300),
                borderRadius: pw.BorderRadius.circular(8),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    'PROJECT DETAILS',
                    style: pw.TextStyle(
                      fontSize: 12,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColors.grey700,
                    ),
                  ),
                  pw.SizedBox(height: 12),
                  _buildDetailRow('Project ID', invoice.projectNumber),
                  _buildDetailRow('Title', invoice.projectTitle),
                ],
              ),
            ),
            pw.SizedBox(height: 24),

            // Amount Breakdown
            pw.Container(
              width: double.infinity,
              child: pw.Column(
                children: [
                  _buildAmountRow('Service Amount', invoice.amount),
                  if (invoice.platformFee != null)
                    _buildAmountRow('Platform Fee', invoice.platformFee!),
                  if (invoice.gst != null)
                    _buildAmountRow('GST (18%)', invoice.gst!),
                  pw.Divider(color: PdfColors.grey300),
                  pw.Padding(
                    padding: const pw.EdgeInsets.symmetric(vertical: 8),
                    child: pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text(
                          'Total Amount',
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        pw.Text(
                          _formatCurrency(invoice.totalAmount),
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 16,
                            color: PdfColors.blue800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 24),

            // Payment Info
            if (invoice.paidAt != null)
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.all(16),
                decoration: pw.BoxDecoration(
                  color: PdfColors.green50,
                  borderRadius: pw.BorderRadius.circular(8),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'PAYMENT INFORMATION',
                      style: pw.TextStyle(
                        fontSize: 12,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.grey700,
                      ),
                    ),
                    pw.SizedBox(height: 12),
                    _buildDetailRow('Method', invoice.paymentMethod),
                    _buildDetailRow('Paid On', _formatDate(invoice.paidAt!)),
                    if (invoice.transactionId != null)
                      _buildDetailRow('Transaction ID', invoice.transactionId!),
                  ],
                ),
              ),
            pw.Spacer(),

            // Footer
            pw.Divider(color: PdfColors.grey300),
            pw.SizedBox(height: 16),
            pw.Center(
              child: pw.Column(
                children: [
                  pw.Text(
                    'Thank you for using AssignX!',
                    style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColors.grey700,
                    ),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(
                    'support@assignx.com | www.assignx.com',
                    style: const pw.TextStyle(
                      fontSize: 10,
                      color: PdfColors.grey500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );

    // Save to temp directory
    final directory = await getTemporaryDirectory();
    final file = File('${directory.path}/invoice_${invoice.invoiceNumber}.pdf');
    await file.writeAsBytes(await pdf.save());

    return file;
  }

  /// Download and open invoice
  static Future<void> downloadInvoice(
    BuildContext context,
    InvoiceData invoice,
  ) async {
    try {
      final file = await generateInvoicePdf(invoice);
      await OpenFile.open(file.path);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate invoice: $e')),
        );
      }
    }
  }

  /// Share invoice
  static Future<void> shareInvoice(InvoiceData invoice) async {
    try {
      final file = await generateInvoicePdf(invoice);
      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'Invoice ${invoice.invoiceNumber} from AssignX',
      );
    } catch (e) {
      debugPrint('Failed to share invoice: $e');
    }
  }

  /// Build detail row for PDF
  static pw.Widget _buildDetailRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 120,
            child: pw.Text(
              label,
              style: const pw.TextStyle(color: PdfColors.grey600),
            ),
          ),
          pw.Expanded(
            child: pw.Text(value),
          ),
        ],
      ),
    );
  }

  /// Build amount row for PDF
  static pw.Widget _buildAmountRow(String label, double amount) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: const pw.TextStyle(color: PdfColors.grey600),
          ),
          pw.Text(_formatCurrency(amount)),
        ],
      ),
    );
  }

  /// Format date
  static String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  /// Format currency
  static String _formatCurrency(double amount) {
    return '\u20B9${amount.toStringAsFixed(2)}';
  }
}
