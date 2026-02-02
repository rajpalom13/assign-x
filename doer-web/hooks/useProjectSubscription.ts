/**
 * @fileoverview Real-time subscription hook for project updates
 * @module hooks/useProjectSubscription
 */

"use client"

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Project } from '@/types/database'

interface UseProjectSubscriptionOptions {
  /** The doer ID to subscribe to project updates for */
  doerId: string | undefined
  /** Callback when a project is assigned to this doer */
  onProjectAssigned?: (project: Project) => void
  /** Callback when any project update occurs */
  onProjectUpdate?: (project: Project) => void
  /** Callback when project status changes */
  onStatusChange?: (project: Project, oldStatus: string, newStatus: string) => void
  /** Whether the subscription is enabled */
  enabled?: boolean
}

/**
 * Hook to subscribe to real-time project updates for a doer
 *
 * @example
 * ```tsx
 * useProjectSubscription({
 *   doerId: doer?.id,
 *   onProjectAssigned: (project) => {
 *     toast.success(`New project assigned: ${project.project_number}`)
 *     refetchProjects()
 *   },
 *   onProjectUpdate: (project) => {
 *     refetchProjects()
 *   }
 * })
 * ```
 */
export function useProjectSubscription({
  doerId,
  onProjectAssigned,
  onProjectUpdate,
  onStatusChange,
  enabled = true,
}: UseProjectSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const previousProjectsRef = useRef<Map<string, Project>>(new Map())

  const handleProjectChange = useCallback((payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Project
    old: Partial<Project>
  }) => {
    const { eventType, new: newProject, old: oldProject } = payload

    if (eventType === 'UPDATE') {
      // Check if this is a new assignment (doer_id was null, now it's set to this doer)
      if (!oldProject.doer_id && newProject.doer_id === doerId) {
        onProjectAssigned?.(newProject)
      }

      // Check for status changes
      if (oldProject.status && oldProject.status !== newProject.status) {
        onStatusChange?.(newProject, oldProject.status, newProject.status)
      }

      // General update callback
      onProjectUpdate?.(newProject)
    } else if (eventType === 'INSERT' && newProject.doer_id === doerId) {
      // New project directly assigned to this doer
      onProjectAssigned?.(newProject)
      onProjectUpdate?.(newProject)
    }

    // Update cache
    previousProjectsRef.current.set(newProject.id, newProject)
  }, [doerId, onProjectAssigned, onProjectUpdate, onStatusChange])

  useEffect(() => {
    if (!doerId || !enabled) {
      return
    }

    const supabase = createClient()

    // Create channel for this doer's project updates
    const channel = supabase
      .channel(`doer_projects_${doerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `doer_id=eq.${doerId}`,
        },
        (payload) => {
          handleProjectChange(payload as unknown as {
            eventType: 'INSERT' | 'UPDATE' | 'DELETE'
            new: Project
            old: Partial<Project>
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[ProjectSubscription] Connected for doer:', doerId)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[ProjectSubscription] Channel error for doer:', doerId)
        }
      })

    channelRef.current = channel

    // Cleanup on unmount or when doerId changes
    return () => {
      if (channelRef.current) {
        console.log('[ProjectSubscription] Unsubscribing for doer:', doerId)
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [doerId, enabled, handleProjectChange])

  // Return a manual unsubscribe function if needed
  return {
    unsubscribe: useCallback(() => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }, []),
  }
}

/**
 * Hook to subscribe to NEW project assignments (for pool/available projects)
 * This watches for projects that become available for claiming
 */
export function useNewProjectsSubscription({
  enabled = true,
  onNewProject,
}: {
  enabled?: boolean
  onNewProject?: (project: Project) => void
}) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    // Subscribe to projects that become "paid" and have no doer assigned
    const channel = supabase
      .channel('available_projects')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: 'status=eq.paid',
        },
        (payload) => {
          const project = payload.new as Project
          // Only notify if doer_id is null (available for claiming)
          if (!project.doer_id) {
            onNewProject?.(project)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channelRef.current?.unsubscribe()
      channelRef.current = null
    }
  }, [enabled, onNewProject])
}
