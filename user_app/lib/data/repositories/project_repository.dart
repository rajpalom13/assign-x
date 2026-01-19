import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/project_model.dart';

/// Repository for project-related operations.
class ProjectRepository {
  final SupabaseClient _supabase;

  ProjectRepository({SupabaseClient? supabaseClient})
      : _supabase = supabaseClient ?? Supabase.instance.client;

  /// Fetches all projects for the current user.
  Future<List<Project>> getProjects() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    final response = await _supabase
        .from('projects')
        .select('*, subjects(name)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => Project.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Fetches projects by status tab.
  ///
  /// Tab indices (new design):
  /// - 0: All projects
  /// - 1: Active projects (not completed, auto_approved, cancelled, refunded)
  /// - 2: Completed projects (completed, auto_approved, cancelled, refunded)
  Future<List<Project>> getProjectsByTab(int tabIndex) async {
    final allProjects = await getProjects();

    switch (tabIndex) {
      case 0:
        // All projects
        return allProjects;
      case 1:
        // Active projects
        return allProjects.where((p) => p.status.isActive).toList();
      case 2:
        // Completed projects
        return allProjects.where((p) => !p.status.isActive).toList();
      default:
        return allProjects;
    }
  }

  /// Fetches projects with pending payments.
  Future<List<Project>> getPendingPaymentProjects() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    final response = await _supabase
        .from('projects')
        .select('*, subjects(name)')
        .eq('user_id', userId)
        .inFilter('status', ['payment_pending', 'quoted'])
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => Project.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Fetches a single project by ID.
  Future<Project?> getProject(String projectId) async {
    final response = await _supabase
        .from('projects')
        .select('*, subjects(name)')
        .eq('id', projectId)
        .maybeSingle();

    if (response == null) return null;
    return Project.fromJson(response);
  }

  /// Creates a new project.
  Future<Project> createProject({
    required String title,
    String? description,
    required ServiceType serviceType,
    String? subjectId,
    required DateTime deadline,
    String? topic,
    int? wordCount,
    int? pageCount,
    String? referenceStyleId,
    String? specificInstructions,
    List<String>? focusAreas,
  }) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    final projectData = {
      'user_id': userId,
      'title': title,
      'description': description,
      'service_type': serviceType.toDbString(),
      'subject_id': subjectId,
      'topic': topic,
      'word_count': wordCount,
      'page_count': pageCount,
      'reference_style_id': referenceStyleId,
      'specific_instructions': specificInstructions,
      'focus_areas': focusAreas,
      'deadline': deadline.toIso8601String(),
    };

    final response = await _supabase
        .from('projects')
        .insert(projectData)
        .select('*, subjects(name)')
        .single();

    return Project.fromJson(response);
  }

  /// Updates project status.
  Future<Project> updateProjectStatus(
    String projectId,
    ProjectStatus status,
  ) async {
    final response = await _supabase
        .from('projects')
        .update({
          'status': status.toDbString(),
          'status_updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', projectId)
        .select('*, subjects(name)')
        .single();

    return Project.fromJson(response);
  }

  /// Approves a project (moves to completed).
  Future<Project> approveProject(String projectId) async {
    return updateProjectStatus(projectId, ProjectStatus.completed);
  }

  /// Requests changes for a project.
  Future<Project> requestChanges(String projectId, String feedback) async {
    final response = await _supabase
        .from('projects')
        .update({
          'status': ProjectStatus.revisionRequested.toDbString(),
          'user_feedback': feedback,
          'status_updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', projectId)
        .select('*, subjects(name)')
        .single();

    return Project.fromJson(response);
  }

  /// Updates the grade received by user for a completed project.
  Future<Project> updateFinalGrade(String projectId, String grade) async {
    final response = await _supabase
        .from('projects')
        .update({
          'user_grade': grade,
        })
        .eq('id', projectId)
        .select('*, subjects(name)')
        .single();

    return Project.fromJson(response);
  }

  /// Records payment for a project.
  Future<Project> recordPayment(String projectId, String paymentId) async {
    final now = DateTime.now();
    final response = await _supabase
        .from('projects')
        .update({
          'status': ProjectStatus.paid.toDbString(),
          'payment_id': paymentId,
          'is_paid': true,
          'paid_at': now.toIso8601String(),
          'status_updated_at': now.toIso8601String(),
        })
        .eq('id', projectId)
        .select('*, subjects(name)')
        .single();

    return Project.fromJson(response);
  }

  /// Gets the project timeline events.
  Future<List<ProjectTimelineEvent>> getProjectTimeline(
    String projectId,
  ) async {
    final response = await _supabase
        .from('project_timeline')
        .select()
        .eq('project_id', projectId)
        .order('sequence_order', ascending: true);

    return (response as List)
        .map((json) => ProjectTimelineEvent.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Gets the deliverables for a project.
  Future<List<ProjectDeliverable>> getDeliverables(String projectId) async {
    final response = await _supabase
        .from('project_deliverables')
        .select()
        .eq('project_id', projectId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => ProjectDeliverable.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Subscribes to real-time project updates.
  Stream<List<Project>> watchProjects() {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) {
      return Stream.error(Exception('User not authenticated'));
    }

    return _supabase
        .from('projects')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .map((data) => data
            .map((json) => Project.fromJson(json))
            .toList());
  }

  /// Subscribes to a single project's updates.
  Stream<Project?> watchProject(String projectId) {
    return _supabase
        .from('projects')
        .stream(primaryKey: ['id'])
        .eq('id', projectId)
        .map((data) {
          if (data.isEmpty) return null;
          return Project.fromJson(data.first);
        });
  }

  /// Cancels a project.
  Future<Project> cancelProject(String projectId) async {
    return updateProjectStatus(projectId, ProjectStatus.cancelled);
  }

  /// Gets project count by status tab.
  ///
  /// Tab indices (new design):
  /// - 0: All projects
  /// - 1: Active projects
  /// - 2: Completed projects
  Future<Map<int, int>> getProjectCounts() async {
    final projects = await getProjects();

    final allCount = projects.length;
    final activeCount = projects.where((p) => p.status.isActive).length;
    final completedCount = projects.where((p) => !p.status.isActive).length;

    return {
      0: allCount,
      1: activeCount,
      2: completedCount,
    };
  }
}
