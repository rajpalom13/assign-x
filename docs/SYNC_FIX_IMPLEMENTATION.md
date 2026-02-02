# ASSIGN X - SYNC FIX IMPLEMENTATION PLAN

## Date: 2026-02-03
## Status: ✅ COMPLETED - ALL FIXES VERIFIED

---

## CRITICAL ISSUES TO FIX

### Issue #1: Column Name Mismatch (SHOWSTOPPER)
**File:** `superviser-web/components/dashboard/assign-doer-modal.tsx`
**Line:** ~220
**Problem:** Uses `assigned_doer_id` but database column is `doer_id`
**Fix:** Change `assigned_doer_id` to `doer_id` and add `doer_assigned_at`

### Issue #2: Auth Helpers Inconsistency
**File:** `doer-web/lib/auth-helpers.ts`
**Line:** ~95
**Problem:** Uses `assigned_doer_id` in SELECT and comparison
**Fix:** Change to `doer_id` for consistency

### Issue #3: TypeScript Any Casts
**File:** `superviser-web/components/dashboard/assign-doer-modal.tsx`
**Problem:** `(supabase as any)` bypasses type checking
**Fix:** Remove `any` casts and use proper typing

### Issue #4: Missing Notification Triggers
**Problem:** No automatic notifications on project status changes
**Fix:** Create database trigger function for auto-notifications

### Issue #5: No Real-Time Project Subscriptions
**Problem:** Apps don't subscribe to project table changes
**Fix:** Add Supabase Realtime subscriptions in all 3 apps

### Issue #6: Hooks use-projects.ts assignDoer function
**File:** `superviser-web/hooks/use-projects.ts`
**Problem:** May have inconsistent column usage
**Fix:** Verify and align with correct `doer_id` column

---

## IMPLEMENTATION TASKS

### TASK 1: Fix assign-doer-modal.tsx
```typescript
// BEFORE (BROKEN):
.update({
  status: "assigned",
  assigned_doer_id: selectedDoer.id,
})

// AFTER (FIXED):
.update({
  status: "assigned",
  doer_id: selectedDoer.id,
  doer_assigned_at: new Date().toISOString(),
})
```

### TASK 2: Fix auth-helpers.ts
```typescript
// BEFORE (BROKEN):
.select('assigned_doer_id, supervisor_id')
const isAssignedDoer = doer && project.assigned_doer_id === doer.id

// AFTER (FIXED):
.select('doer_id, supervisor_id')
const isAssignedDoer = doer && project.doer_id === doer.id
```

### TASK 3: Fix use-projects.ts
- Verify assignDoer function uses `doer_id`
- Ensure all project queries are consistent
- Remove any `assigned_doer_id` references

### TASK 4: Create Notification Database Trigger
```sql
-- Migration: create_notification_triggers
CREATE OR REPLACE FUNCTION notify_on_project_status_change()
RETURNS TRIGGER AS $$
DECLARE
  doer_profile_id UUID;
  supervisor_profile_id UUID;
  user_profile_id UUID;
BEGIN
  -- Get profile IDs for notifications
  user_profile_id := NEW.user_id;

  IF NEW.doer_id IS NOT NULL THEN
    SELECT profile_id INTO doer_profile_id FROM doers WHERE id = NEW.doer_id;
  END IF;

  IF NEW.supervisor_id IS NOT NULL THEN
    SELECT profile_id INTO supervisor_profile_id FROM supervisors WHERE id = NEW.supervisor_id;
  END IF;

  -- Notify doer when assigned
  IF NEW.status = 'assigned' AND (OLD.status IS NULL OR OLD.status != 'assigned') AND doer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (doer_profile_id, 'task_assigned', 'New Project Assigned',
            'You have been assigned to project ' || NEW.project_number, 'project', NEW.id);
  END IF;

  -- Notify supervisor when work submitted
  IF NEW.status = 'submitted_for_qc' AND OLD.status != 'submitted_for_qc' AND supervisor_profile_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (supervisor_profile_id, 'work_submitted', 'Work Submitted for Review',
            'Project ' || NEW.project_number || ' has been submitted for QC', 'project', NEW.id);
  END IF;

  -- Notify doer when QC approved
  IF NEW.status = 'qc_approved' AND OLD.status != 'qc_approved' AND doer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (doer_profile_id, 'qc_approved', 'Work Approved',
            'Your work on project ' || NEW.project_number || ' has been approved', 'project', NEW.id);
  END IF;

  -- Notify doer when revision requested
  IF NEW.status = 'revision_requested' AND OLD.status != 'revision_requested' AND doer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (doer_profile_id, 'revision_requested', 'Revision Requested',
            'Revision requested for project ' || NEW.project_number, 'project', NEW.id);
  END IF;

  -- Notify user when project delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (user_profile_id, 'project_delivered', 'Project Delivered',
            'Your project ' || NEW.project_number || ' has been delivered', 'project', NEW.id);
  END IF;

  -- Notify user when quote ready
  IF NEW.status = 'quoted' AND OLD.status != 'quoted' THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (user_profile_id, 'quote_ready', 'Quote Ready',
            'A quote is ready for project ' || NEW.project_number, 'project', NEW.id);
  END IF;

  -- Notify supervisor when payment received
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND supervisor_profile_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, notification_type, title, body, reference_type, reference_id)
    VALUES (supervisor_profile_id, 'payment_received', 'Payment Received',
            'Payment received for project ' || NEW.project_number, 'project', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS project_notification_trigger ON projects;
CREATE TRIGGER project_notification_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_project_status_change();
```

### TASK 5: Add Real-Time Subscriptions

**doer-web/hooks/useProjectSubscription.ts** (NEW FILE):
```typescript
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useProjectSubscription(
  doerId: string | undefined,
  onProjectUpdate: (project: any) => void
) {
  useEffect(() => {
    if (!doerId) return

    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
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
          onProjectUpdate(payload.new)
        }
      )
      .subscribe()

    return () => {
      channel?.unsubscribe()
    }
  }, [doerId, onProjectUpdate])
}
```

**supervisor-web real-time subscription** (add to use-projects.ts):
```typescript
// Add subscription for supervisor's projects
useEffect(() => {
  if (!supervisor?.id) return

  const channel = supabase
    .channel(`supervisor_projects_${supervisor.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `supervisor_id=eq.${supervisor.id}`,
      },
      () => {
        refetch() // Refetch all projects on any change
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}, [supervisor?.id, refetch])
```

### TASK 6: Fix Type Definitions
- Remove `any` casts in supervisor-web
- Ensure Database types include correct column names
- Verify TypeScript catches column mismatches

---

## VERIFICATION CHECKLIST

### After Implementation:
- [ ] Supervisor can assign doer and `doer_id` is set in database
- [ ] Doer can see assigned projects in their dashboard
- [ ] Doer can see assigned projects in projects list
- [ ] Real-time updates work for project status changes
- [ ] Notifications are created automatically on status changes
- [ ] All TypeScript errors are resolved
- [ ] No `any` casts remain in critical paths

### Database Verification Queries:
```sql
-- Check if doer_id is being set correctly
SELECT id, project_number, status, doer_id, supervisor_id
FROM projects
WHERE status = 'assigned'
ORDER BY updated_at DESC
LIMIT 10;

-- Check notifications are being created
SELECT * FROM notifications
WHERE notification_type IN ('task_assigned', 'work_submitted', 'qc_approved')
ORDER BY created_at DESC
LIMIT 20;

-- Verify trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'project_notification_trigger';
```

---

## AGENT ASSIGNMENTS

| Agent | Task | Files |
|-------|------|-------|
| Agent 1 | Fix assign-doer-modal.tsx | superviser-web/components/dashboard/assign-doer-modal.tsx |
| Agent 2 | Fix auth-helpers.ts | doer-web/lib/auth-helpers.ts |
| Agent 3 | Fix use-projects.ts | superviser-web/hooks/use-projects.ts |
| Agent 4 | Create notification trigger | Database migration via Supabase MCP |
| Agent 5 | Add doer-web real-time subscription | doer-web/hooks/useProjectSubscription.ts |
| Agent 6 | Add supervisor-web real-time subscription | superviser-web/hooks/use-projects.ts |
| Agent 7 | Quality Assurance & Verification | All files + Database queries |

---

## EXECUTION ORDER

1. **Phase 1 (Parallel):** Fix column names (Agent 1, 2, 3)
2. **Phase 2 (Parallel):** Add real-time subscriptions (Agent 5, 6)
3. **Phase 3 (Sequential):** Create database trigger (Agent 4)
4. **Phase 4 (Sequential):** Quality Assurance (Agent 7)

---

## SUCCESS CRITERIA

1. When supervisor assigns doer → `projects.doer_id` is set correctly
2. Doer dashboard shows assigned projects immediately
3. Real-time updates propagate within 1 second
4. Notifications appear for all status transitions
5. Zero TypeScript errors in affected files
6. All verification queries return expected results
