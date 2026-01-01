import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/client_model.dart';
import '../providers/users_provider.dart';

/// Users/Clients screen.
class UsersScreen extends ConsumerStatefulWidget {
  const UsersScreen({super.key});

  @override
  ConsumerState<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends ConsumerState<UsersScreen> {
  final _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(clientsProvider.notifier).loadClients();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(clientsProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search clients...',
                  border: InputBorder.none,
                ),
                onChanged: (query) {
                  ref.read(clientsProvider.notifier).search(query);
                },
              )
            : const Text('Clients'),
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) {
                  _searchController.clear();
                  ref.read(clientsProvider.notifier).clearSearch();
                }
              });
            },
            icon: Icon(_isSearching ? Icons.close : Icons.search),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            tooltip: 'Sort',
            onSelected: (value) {
              switch (value) {
                case 'name_asc':
                  ref.read(clientsProvider.notifier).sort('full_name', ascending: true);
                  break;
                case 'name_desc':
                  ref.read(clientsProvider.notifier).sort('full_name', ascending: false);
                  break;
                case 'recent':
                  ref.read(clientsProvider.notifier).sort('last_active_at', ascending: false);
                  break;
                case 'projects':
                  ref.read(clientsProvider.notifier).sort('created_at', ascending: false);
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'name_asc',
                child: Text('Name (A-Z)'),
              ),
              const PopupMenuItem(
                value: 'name_desc',
                child: Text('Name (Z-A)'),
              ),
              const PopupMenuItem(
                value: 'recent',
                child: Text('Recently Active'),
              ),
              const PopupMenuItem(
                value: 'projects',
                child: Text('Most Projects'),
              ),
            ],
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.clients.isEmpty
              ? const _EmptyClients()
              : RefreshIndicator(
                  onRefresh: () => ref.read(clientsProvider.notifier).refresh(),
                  child: _ClientsList(
                    clients: state.clients,
                    onClientTap: (client) {
                      context.pushNamed(
                        RouteNames.clientDetail,
                        pathParameters: {'clientId': client.id},
                      );
                    },
                    onLoadMore: () {
                      ref.read(clientsProvider.notifier).loadMore();
                    },
                    isLoadingMore: state.isLoadingMore,
                    hasMore: state.hasMore,
                  ),
                ),
    );
  }
}

/// Clients list.
class _ClientsList extends StatelessWidget {
  const _ClientsList({
    required this.clients,
    required this.onClientTap,
    required this.onLoadMore,
    required this.isLoadingMore,
    required this.hasMore,
  });

  final List<ClientModel> clients;
  final void Function(ClientModel) onClientTap;
  final VoidCallback onLoadMore;
  final bool isLoadingMore;
  final bool hasMore;

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is ScrollEndNotification &&
            notification.metrics.extentAfter < 100 &&
            hasMore &&
            !isLoadingMore) {
          onLoadMore();
        }
        return false;
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: clients.length + (isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == clients.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final client = clients[index];
          return _ClientCard(
            client: client,
            onTap: () => onClientTap(client),
          );
        },
      ),
    );
  }
}

/// Client card.
class _ClientCard extends StatelessWidget {
  const _ClientCard({
    required this.client,
    required this.onTap,
  });

  final ClientModel client;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                backgroundImage: client.avatarUrl != null
                    ? NetworkImage(client.avatarUrl!)
                    : null,
                child: client.avatarUrl == null
                    ? Text(
                        client.initials,
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),

              // Client info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            client.name,
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                        if (client.isVerified)
                          Icon(
                            Icons.verified,
                            size: 16,
                            color: AppColors.success,
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      client.email,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondaryLight,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _StatChip(
                          icon: Icons.folder_outlined,
                          label: '${client.totalProjects} projects',
                        ),
                        const SizedBox(width: 12),
                        if (client.activeProjects > 0)
                          _StatChip(
                            icon: Icons.play_circle_outline,
                            label: '${client.activeProjects} active',
                            color: AppColors.success,
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              // Arrow
              const Icon(
                Icons.chevron_right,
                color: AppColors.textSecondaryLight,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Stat chip.
class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.icon,
    required this.label,
    this.color,
  });

  final IconData icon;
  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: color ?? AppColors.textSecondaryLight,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: color ?? AppColors.textSecondaryLight,
                fontSize: 11,
              ),
        ),
      ],
    );
  }
}

/// Empty clients state.
class _EmptyClients extends StatelessWidget {
  const _EmptyClients();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: AppColors.textSecondaryLight.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No clients yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.textSecondaryLight,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Clients from your projects will appear here',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondaryLight,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Client detail screen.
class ClientDetailScreen extends ConsumerStatefulWidget {
  const ClientDetailScreen({
    super.key,
    required this.clientId,
  });

  final String clientId;

  @override
  ConsumerState<ClientDetailScreen> createState() => _ClientDetailScreenState();
}

class _ClientDetailScreenState extends ConsumerState<ClientDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(clientDetailProvider.notifier).loadClient(widget.clientId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(clientDetailProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(state.client?.name ?? 'Client'),
        actions: [
          IconButton(
            onPressed: state.client != null ? () => _showNotesDialog(context, ref) : null,
            icon: const Icon(Icons.note_add_outlined),
            tooltip: 'Add notes',
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text(state.error!))
              : state.client == null
                  ? const Center(child: Text('Client not found'))
                  : SingleChildScrollView(
                      child: Column(
                        children: [
                          // Client header
                          _ClientHeader(client: state.client!),

                          // Stats cards
                          _StatsSection(client: state.client!),

                          // Notes
                          if (state.notes != null && state.notes!.isNotEmpty)
                            _NotesSection(notes: state.notes!),

                          // Projects history
                          _ProjectsSection(
                            projects: state.projects,
                            isLoading: state.isLoadingProjects,
                            hasMore: state.hasMoreProjects,
                            onLoadMore: () {
                              ref
                                  .read(clientDetailProvider.notifier)
                                  .loadMoreProjects(widget.clientId);
                            },
                          ),
                        ],
                      ),
                    ),
    );
  }

  void _showNotesDialog(BuildContext context, WidgetRef ref) {
    final state = ref.read(clientDetailProvider);
    final controller = TextEditingController(text: state.notes ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Client Notes'),
        content: TextField(
          controller: controller,
          maxLines: 5,
          decoration: const InputDecoration(
            hintText: 'Add personal notes about this client...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              final success = await ref
                  .read(clientDetailProvider.notifier)
                  .updateNotes(widget.clientId, controller.text);
              if (context.mounted) {
                Navigator.pop(context);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notes saved')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

/// Client header.
class _ClientHeader extends StatelessWidget {
  const _ClientHeader({required this.client});

  final ClientModel client;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Avatar
          CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            backgroundImage: client.avatarUrl != null
                ? NetworkImage(client.avatarUrl!)
                : null,
            child: client.avatarUrl == null
                ? Text(
                    client.initials,
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 16),

          // Name
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                client.name,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              if (client.isVerified) ...[
                const SizedBox(width: 8),
                const Icon(
                  Icons.verified,
                  color: AppColors.success,
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),

          // Email
          Text(
            client.email,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondaryLight,
                ),
          ),

          // Phone
          if (client.phone != null) ...[
            const SizedBox(height: 4),
            Text(
              client.phone!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondaryLight,
                  ),
            ),
          ],

          // Last active
          const SizedBox(height: 8),
          Text(
            'Last active ${client.lastActiveTimeAgo}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondaryLight,
                ),
          ),
        ],
      ),
    );
  }
}

/// Stats section.
class _StatsSection extends StatelessWidget {
  const _StatsSection({required this.client});

  final ClientModel client;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.folder,
              label: 'Total',
              value: '${client.totalProjects}',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              icon: Icons.play_circle,
              label: 'Active',
              value: '${client.activeProjects}',
              color: AppColors.warning,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              icon: Icons.check_circle,
              label: 'Done',
              value: '${client.completedProjects}',
              color: AppColors.success,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatCard(
              icon: Icons.attach_money,
              label: 'Spent',
              value: '\$${client.totalSpent.toStringAsFixed(0)}',
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(
              icon,
              color: color ?? AppColors.textSecondaryLight,
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondaryLight,
                    fontSize: 10,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Notes section.
class _NotesSection extends StatelessWidget {
  const _NotesSection({required this.notes});

  final String notes;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: AppColors.warning.withValues(alpha: 0.3),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.note,
                    size: 18,
                    color: AppColors.warning,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'My Notes',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                notes,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondaryLight,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Projects history section.
class _ProjectsSection extends StatelessWidget {
  const _ProjectsSection({
    required this.projects,
    required this.isLoading,
    required this.hasMore,
    required this.onLoadMore,
  });

  final List<ClientProjectHistory> projects;
  final bool isLoading;
  final bool hasMore;
  final VoidCallback onLoadMore;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'Project History',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),

        if (projects.isEmpty && !isLoading)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Text(
                'No projects yet',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondaryLight,
                    ),
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: projects.length + (hasMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == projects.length) {
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Center(
                    child: isLoading
                        ? const CircularProgressIndicator()
                        : TextButton(
                            onPressed: onLoadMore,
                            child: const Text('Load more'),
                          ),
                  ),
                );
              }

              final project = projects[index];
              return _ProjectHistoryCard(project: project);
            },
          ),
      ],
    );
  }
}

class _ProjectHistoryCard extends StatelessWidget {
  const _ProjectHistoryCard({required this.project});

  final ClientProjectHistory project;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
        ),
      ),
      child: InkWell(
        onTap: () {
          context.pushNamed(
            RouteNames.projectDetail,
            pathParameters: {'projectId': project.projectId},
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Status indicator
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _getStatusColor(project.status),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),

              // Project info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          project.formattedDate,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondaryLight,
                              ),
                        ),
                        if (project.rating != null) ...[
                          const SizedBox(width: 12),
                          Icon(
                            Icons.star,
                            size: 14,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${project.rating}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),

              // Amount
              if (project.amount != null)
                Text(
                  '\$${project.amount!.toStringAsFixed(0)}',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                ),

              const SizedBox(width: 8),
              const Icon(
                Icons.chevron_right,
                size: 20,
                color: AppColors.textSecondaryLight,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return AppColors.success;
      case 'in_progress':
      case 'ongoing':
        return AppColors.info;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }
}
