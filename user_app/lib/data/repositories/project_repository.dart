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
  /// - 1: Active projects (in_progress, assigned, assigning, paid, analyzing)
  /// - 2: Review projects (delivered, submitted_for_qc, qc_in_progress, qc_approved)
  Future<List<Project>> getProjectsByTab(int tabIndex) async {
    final allProjects = await getProjects();

    switch (tabIndex) {
      case 0:
        // All projects
        return allProjects;
      case 1:
        // Active projects - currently being worked on
        return allProjects.where((p) => _isActiveStatus(p.status)).toList();
      case 2:
        // Review projects - awaiting user review or in QC
        return allProjects.where((p) => _isReviewStatus(p.status)).toList();
      default:
        return allProjects;
    }
  }

  /// Check if status is considered "active" (work in progress).
  bool _isActiveStatus(ProjectStatus status) {
    return [
      ProjectStatus.submitted,
      ProjectStatus.analyzing,
      ProjectStatus.quoted,
      ProjectStatus.paymentPending,
      ProjectStatus.paid,
      ProjectStatus.assigning,
      ProjectStatus.assigned,
      ProjectStatus.inProgress,
      ProjectStatus.revisionRequested,
      ProjectStatus.inRevision,
    ].contains(status);
  }

  /// Check if status is considered "review" (awaiting review).
  bool _isReviewStatus(ProjectStatus status) {
    return [
      ProjectStatus.delivered,
      ProjectStatus.submittedForQc,
      ProjectStatus.qcInProgress,
      ProjectStatus.qcApproved,
    ].contains(status);
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
    final activeCount = projects.where((p) => _isActiveStatus(p.status)).length;
    final reviewCount = projects.where((p) => _isReviewStatus(p.status)).length;
    final completedCount = projects.where((p) => _isCompletedStatus(p.status)).length;

    return {
      0: allCount,       // Total (for tab 0 - All)
      1: activeCount,    // Active (for tab 1 - Active)
      2: reviewCount,    // Review (for tab 2 - Review)
      3: completedCount, // Completed (for stats display - Done)
    };
  }

  /// Check if status is considered "completed".
  bool _isCompletedStatus(ProjectStatus status) {
    return [
      ProjectStatus.completed,
      ProjectStatus.autoApproved,
    ].contains(status);
  }
}
