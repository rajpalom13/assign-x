# 🔧 CODER AGENT: CRITICAL FIX CHECKLIST

## Priority: 🔥 IMMEDIATE

This checklist contains the exact fixes needed to make the supervisor dashboard production-ready.

---

## ✅ CHECKLIST (Complete in Order)

### 1. Fix Foreign Key Syntax ❌ CRITICAL
**File:** `superviser-web/hooks/use-supervisor.ts`
**Line:** 58

```typescript
// BEFORE (WRONG):
profiles!profile_id (*)

// AFTER (CORRECT):
profiles!supervisors_profile_id_fkey (*)
```

**Verification:** Run query in Supabase SQL editor to confirm FK name.

---

### 2. Add Error Boundaries ❌ CRITICAL
**Files:** All dashboard page files

```typescript
// BEFORE:
export default function DashboardPage() {
  return <div>...</div>
}

// AFTER:
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function DashboardPage() {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      <DashboardContent />
    </ErrorBoundary>
  )
}
```

**Files to update:**
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/projects/page.tsx`
- `app/(dashboard)/doers/page.tsx`
- `app/(dashboard)/earnings/page.tsx`

---

### 3. Add Authentication Middleware ❌ CRITICAL
**File:** `middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response })

  // 1. Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Check user is supervisor
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'supervisor') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // 3. Check supervisor is activated
  const { data: supervisor } = await supabase
    .from('supervisors')
    .select('is_activated')
    .eq('profile_id', user.id)
    .single()

  if (!supervisor?.is_activated) {
    return NextResponse.redirect(new URL('/activation', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/doers/:path*', '/earnings/:path*']
}
```

---

### 4. Fix Null Pointer Exceptions ❌ CRITICAL
**File:** `app/(dashboard)/dashboard/page.tsx`
**Lines:** 53-86

```typescript
// BEFORE (UNSAFE):
const newRequests: ProjectRequest[] = useMemo(() => {
  return needsQuote.map(project => ({
    subject: project.subjects?.name || "General", // ❌ Crash if null
  }))
}, [needsQuote])

// AFTER (SAFE):
const newRequests: ProjectRequest[] = useMemo(() => {
  return needsQuote
    .filter(project => {
      // Filter out invalid projects
      if (!project || !project.id) {
        console.warn('[WARN] Invalid project found:', project)
        return false
      }
      if (!project.created_at) {
        console.warn('[WARN] Project missing created_at:', project.id)
        return false
      }
      return true
    })
    .map(project => ({
      id: project.id,
      project_number: project.project_number || 'N/A',
      title: project.title || 'Untitled Project',
      subject: project.subjects?.name ?? "General",
      service_type: project.service_type ?? 'new_project',
      user_name: project.profiles?.full_name ?? "Unknown User",
      deadline: project.deadline || project.created_at,
      word_count: project.word_count ?? undefined,
      page_count: project.page_count ?? undefined,
      created_at: project.created_at,
      attachments_count: 0,
    }))
}, [needsQuote])
```

**Apply same pattern to:**
- `readyToAssign` mapping
- `activeProjects` mapping

---

### 5. Remove Type Assertions ❌ CRITICAL
**File:** `hooks/use-supervisor.ts`
**Line:** 73

```typescript
// BEFORE (UNSAFE):
setSupervisor(transformedSupervisor as SupervisorWithProfile | null)

// AFTER (SAFE):
// Create type guard
function isSupervisorWithProfile(data: unknown): data is SupervisorWithProfile {
  if (!data || typeof data !== 'object') return false
  const supervisor = data as Record<string, unknown>

  return (
    typeof supervisor.id === 'string' &&
    typeof supervisor.profile_id === 'string' &&
    (supervisor.profiles === undefined ||
     (typeof supervisor.profiles === 'object' && supervisor.profiles !== null))
  )
}

// Use type guard
if (supervisorData && isSupervisorWithProfile(transformedSupervisor)) {
  setSupervisor(transformedSupervisor)
} else {
  console.error('[ERROR] Invalid supervisor data:', transformedSupervisor)
  setSupervisor(null)
  setError(new Error('Invalid supervisor data received'))
}
```

---

### 6. Fix Race Conditions ❌ CRITICAL
**File:** `hooks/use-supervisor-stats.ts`
**Lines:** 154-194

```typescript
// BEFORE (RACE CONDITION):
const { data: supervisor } = await supabase.from("supervisors")...
const { data: projects } = await supabase.from("projects")...
const { data: wallet } = await supabase.from("wallets")...

// AFTER (PARALLEL):
const [supervisorResult, projectsResult, walletResult] = await Promise.all([
  supabase
    .from("supervisors")
    .select("id, average_rating, total_projects_managed, total_earnings")
    .eq("profile_id", user.id)
    .single(),

  supabase
    .from("supervisors")
    .select("id")
    .eq("profile_id", user.id)
    .single()
    .then(result => {
      if (!result.data?.id) return { data: null, error: null }
      return supabase
        .from("projects")
        .select("id, status, doer_id")
        .eq("supervisor_id", result.data.id)
    }),

  supabase
    .from("wallets")
    .select("balance, total_credited")
    .eq("profile_id", user.id)
    .single()
])

// Check all results
if (supervisorResult.error) {
  console.error('[ERROR] Failed to fetch supervisor:', supervisorResult.error)
  throw supervisorResult.error
}
if (projectsResult.error) {
  console.error('[ERROR] Failed to fetch projects:', projectsResult.error)
  throw projectsResult.error
}
if (walletResult.error) {
  console.error('[ERROR] Failed to fetch wallet:', walletResult.error)
  throw walletResult.error
}

const supervisor = supervisorResult.data
const projects = projectsResult.data || []
const wallet = walletResult.data
```

---

### 7. Add Error Logging ❌ CRITICAL
**All hooks files**

```typescript
// BEFORE:
catch (err) {
  setError(err instanceof Error ? err : new Error("Failed"))
}

// AFTER:
catch (err) {
  console.error('[ERROR] Failed to fetch supervisor:', err)
  console.error('[ERROR] Stack trace:', err instanceof Error ? err.stack : 'N/A')

  let userMessage = 'Unable to load supervisor data. '

  if (err instanceof Error) {
    if (err.message.includes('JWT')) {
      userMessage += 'Your session may have expired. Please log in again.'
    } else if (err.message.includes('network')) {
      userMessage += 'Please check your internet connection and try again.'
    } else if (err.message.includes('permission')) {
      userMessage += 'You do not have permission to access this data.'
    } else {
      userMessage += 'Please try refreshing the page or contact support.'
    }
  }

  setError(new Error(userMessage))
}
```

---

### 8. Create Status Constants ❌ CRITICAL
**New file:** `constants/project-statuses.ts`

```typescript
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ANALYZING: 'analyzing',
  QUOTED: 'quoted',
  PAYMENT_PENDING: 'payment_pending',
  PAID: 'paid',
  ASSIGNING: 'assigning',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  SUBMITTED_FOR_QC: 'submitted_for_qc',
  QC_IN_PROGRESS: 'qc_in_progress',
  QC_APPROVED: 'qc_approved',
  QC_REJECTED: 'qc_rejected',
  DELIVERED: 'delivered',
  REVISION_REQUESTED: 'revision_requested',
  IN_REVISION: 'in_revision',
  COMPLETED: 'completed',
  AUTO_APPROVED: 'auto_approved',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]

export const STATUS_GROUPS = {
  NEEDS_QUOTE: [PROJECT_STATUS.SUBMITTED, PROJECT_STATUS.ANALYZING],
  READY_TO_ASSIGN: [PROJECT_STATUS.PAID, PROJECT_STATUS.ASSIGNING],
  IN_PROGRESS: [
    PROJECT_STATUS.ASSIGNED,
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.SUBMITTED_FOR_QC,
    PROJECT_STATUS.QC_IN_PROGRESS,
    PROJECT_STATUS.REVISION_REQUESTED,
    PROJECT_STATUS.IN_REVISION,
  ],
  NEEDS_QC: [PROJECT_STATUS.SUBMITTED_FOR_QC, PROJECT_STATUS.QC_IN_PROGRESS],
  COMPLETED: [
    PROJECT_STATUS.COMPLETED,
    PROJECT_STATUS.AUTO_APPROVED,
    PROJECT_STATUS.DELIVERED,
  ],
} as const
```

**Then update all files using hard-coded statuses:**
- `hooks/use-supervisor-stats.ts`
- `hooks/use-projects-by-status.ts`
- `app/(dashboard)/projects/page.tsx`

---

## 🧪 Verification Steps

After making fixes, verify each one:

### 1. Foreign Key Fix
```bash
# Run in Supabase SQL editor
SELECT * FROM supervisors
INNER JOIN profiles ON supervisors.profile_id = profiles.id
LIMIT 1;
```

### 2. Error Boundary
```typescript
// In component, throw test error:
throw new Error('Test error boundary')
// Should show error UI, not white screen
```

### 3. Authentication
```bash
# Try accessing /dashboard without login
# Should redirect to /login
```

### 4. Null Checks
```typescript
// Create test data with null subjects
// Should show "General" not crash
```

### 5. Type Guards
```typescript
// Log transformed data
// Should pass type guard or log error
```

### 6. Parallel Queries
```typescript
// Check network tab
// Should see 3 parallel requests, not sequential
```

### 7. Error Logging
```typescript
// Trigger error
// Should see detailed logs in console
```

### 8. Status Constants
```bash
# Search for hard-coded status strings
# Should find none (all using constants)
```

---

## 📝 Commit Messages

After each fix, commit with clear message:

```bash
git commit -m "fix(supervisor): correct foreign key syntax in useSupervisor hook"
git commit -m "feat(dashboard): add error boundaries to all pages"
git commit -m "security(middleware): add authentication and role verification"
git commit -m "fix(dashboard): add null checks to prevent runtime crashes"
git commit -m "refactor(hooks): remove unsafe type assertions"
git commit -m "perf(stats): fix race conditions with parallel queries"
git commit -m "feat(errors): add comprehensive error logging"
git commit -m "refactor(constants): extract project statuses to constants"
```

---

## 🎯 Definition of Done

All 8 items must be:
- ✅ Code written
- ✅ Tested manually
- ✅ No console errors
- ✅ Type checking passes
- ✅ Committed to git
- ✅ Verified by QA tester

---

## ⏱️ Time Estimate

- Item 1-3: 2 hours
- Item 4-5: 3 hours
- Item 6-7: 2 hours
- Item 8: 1 hour

**Total: 8 hours (1 day)**

---

## 📞 Questions?

If stuck on any item:
1. Read the detailed QA report: `docs/QA_SUPERVISOR_DASHBOARD_REPORT.md`
2. Check the database schema: `database.md`
3. Ask the reviewer agent for guidance

---

**Created by:** QA Tester Agent
**For:** Coder Agent
**Priority:** 🔥 CRITICAL - Start Immediately
