import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/services/external_actions_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/ticket_model.dart';
import '../providers/support_provider.dart';
import '../widgets/ticket_card.dart';
import '../widgets/ticket_form.dart';

/// Support screen with tabs for tickets and FAQ.
class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ticketsProvider.notifier).loadTickets();
      ref.read(faqProvider.notifier).loadFAQ();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support'),
        actions: [
          IconButton(
            onPressed: () => context.pushNamed(RouteNames.faq),
            icon: const Icon(Icons.quiz_outlined),
            tooltip: 'FAQ',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'My Tickets'),
            Tab(text: 'New Ticket'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _TicketsTab(),
          _NewTicketTab(
            onSuccess: () {
              _tabController.animateTo(0);
              ref.read(ticketsProvider.notifier).refresh();
            },
          ),
        ],
      ),
    );
  }
}

/// Tickets list tab.
class _TicketsTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(ticketsProvider);

    return Column(
      children: [
        // Status filter
        TicketStatusFilter(
          selectedStatus: state.selectedStatus,
          onStatusChanged: (status) {
            ref.read(ticketsProvider.notifier).setStatusFilter(status);
          },
        ),

        // Tickets list
        Expanded(
          child: state.isLoading
              ? const Center(child: CircularProgressIndicator())
              : state.tickets.isEmpty
                  ? EmptyTickets(
                      onCreateTicket: () {
                        // Switch to new ticket tab
                      },
                    )
                  : RefreshIndicator(
                      onRefresh: () =>
                          ref.read(ticketsProvider.notifier).refresh(),
                      child: TicketList(
                        tickets: state.tickets,
                        onTicketTap: (ticket) {
                          context.pushNamed(
                            RouteNames.ticketDetail,
                            pathParameters: {'ticketId': ticket.id},
                          );
                        },
                        onLoadMore: () {
                          ref.read(ticketsProvider.notifier).loadMore();
                        },
                        isLoadingMore: state.isLoadingMore,
                        hasMore: state.hasMore,
                      ),
                    ),
        ),
      ],
    );
  }
}

/// New ticket creation tab.
class _NewTicketTab extends ConsumerWidget {
  const _NewTicketTab({
    required this.onSuccess,
  });

  final VoidCallback onSuccess;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(createTicketProvider);

    return TicketForm(
      isSubmitting: state.isSubmitting,
      onSubmit: ({
        required String subject,
        required String description,
        required TicketCategory category,
        required TicketPriority priority,
      }) async {
        final ticket = await ref.read(createTicketProvider.notifier).createTicket(
              subject: subject,
              description: description,
              category: category,
              priority: priority,
            );

        if (ticket != null && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Ticket created successfully'),
              backgroundColor: Colors.green,
            ),
          );
          ref.read(ticketsProvider.notifier).addTicket(ticket);
          ref.read(createTicketProvider.notifier).reset();
          onSuccess();
        } else if (state.error != null && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: ${state.error}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
    );
  }
}

/// Quick support actions widget.
class QuickSupportActions extends ConsumerWidget {
  const QuickSupportActions({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How can we help?',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.quiz_outlined,
                    label: 'FAQ',
                    onTap: () => context.pushNamed(RouteNames.faq),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.email_outlined,
                    label: 'Email Us',
                    onTap: () {
                      ref.read(externalActionsServiceProvider).sendEmail(
                            to: 'support@assignx.com',
                            subject: 'Support Request',
                          );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.chat_outlined,
                    label: 'Live Chat',
                    onTap: () {
                      ref.read(externalActionsServiceProvider).openLiveChat();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.phone_outlined,
                    label: 'Call Us',
                    onTap: () {
                      ref.read(externalActionsServiceProvider).makePhoneCall('+1-800-ASSIGNX');
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
