/**
 * Authorization helper functions
 * Provides consistent authorization checks across all services
 */

import { createClient } from '@/lib/supabase/client'

/** Error thrown when user is not authenticated */
export class AuthenticationError extends Error {
  constructor(message = 'User not authenticated') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/** Error thrown when user doesn't have permission */
export class ForbiddenError extends Error {
  constructor(message = 'Access denied to this resource') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/** Error thrown when resource is not found */
export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/**
 * Get the currently authenticated user
 * @throws AuthenticationError if user is not authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError()
  }

  return user
}

/**
 * Verify that the authenticated user owns the specified doer record
 * @param doerId - The doer ID to check ownership of
 * @throws AuthenticationError if user is not authenticated
 * @throws ForbiddenError if user doesn't own this doer record
 * @throws NotFoundError if doer record doesn't exist
 */
export async function verifyDoerOwnership(doerId: string): Promise<void> {
  const supabase = createClient()
  const user = await getAuthenticatedUser()

  const { data: doer, error } = await supabase
    .from('doers')
    .select('profile_id')
    .eq('id', doerId)
    .single()

  if (error || !doer) {
    throw new NotFoundError('Doer record not found')
  }

  if (doer.profile_id !== user.id) {
    throw new ForbiddenError('You do not have permission to access this resource')
  }
}

/**
 * Verify that the authenticated user owns the specified project
 * (either as the assigned doer or has supervisor role)
 * @param projectId - The project ID to check access to
 * @throws AuthenticationError if user is not authenticated
 * @throws ForbiddenError if user doesn't have access to this project
 * @throws NotFoundError if project doesn't exist
 */
export async function verifyProjectAccess(projectId: string): Promise<void> {
  const supabase = createClient()
  const user = await getAuthenticatedUser()

  // Get the user's doer record
  const { data: doer } = await supabase
    .from('doers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  // Get the project and check if user is the assigned doer
  const { data: project, error } = await supabase
    .from('projects')
    .select('doer_id, supervisor_id')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    throw new NotFoundError('Project not found')
  }

  // Check if user is either the assigned doer or the supervisor
  const isAssignedDoer = doer && project.doer_id === doer.id
  const isSupervisor = project.supervisor_id === user.id

  if (!isAssignedDoer && !isSupervisor) {
    throw new ForbiddenError('You do not have permission to access this project')
  }
}

/**
 * Get the authenticated user's doer record
 * @throws AuthenticationError if user is not authenticated
 * @throws NotFoundError if user doesn't have a doer record
 * @returns The doer record
 */
export async function getAuthenticatedDoer() {
  const supabase = createClient()
  const user = await getAuthenticatedUser()

  const { data: doer, error } = await supabase
    .from('doers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (error || !doer) {
    throw new NotFoundError('Doer profile not found')
  }

  return doer
}

/**
 * Verify that the authenticated user owns the specified profile
 * @param profileId - The profile ID to check ownership of
 * @throws AuthenticationError if user is not authenticated
 * @throws ForbiddenError if user doesn't own this profile
 */
export async function verifyProfileOwnership(profileId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  if (user.id !== profileId) {
    throw new ForbiddenError('You do not have permission to access this profile')
  }
}
