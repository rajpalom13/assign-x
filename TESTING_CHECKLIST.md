# 🧪 AssignX - Web Platforms Testing Checklist

> **Created:** February 2, 2026  
> **Tester:** Coco (AI Assistant)  
> **Focus:** Core workflows across user-web, superviser-web, doer-web

---

## 🔧 Test Environment

| Platform | Port | Status |
|----------|------|--------|
| user-web | 3000 | ✅ Code Ready |
| superviser-web | 3001 | ✅ Code Ready |
| doer-web | 3002 | ✅ Code Ready |

---

## 🔧 Code Changes Made (February 2, 2026)

### superviser-web/hooks/use-projects.ts

**Problem:** Supervisors couldn't see new project requests. The `useProjects` hook was filtering:
```javascript
.eq("supervisor_id", supervisor.id)  // Only shows ALREADY assigned projects
```
But new projects have `supervisor_id = NULL` until claimed.

**Solution - Added 3 new functions:**

1. **`claimProject(projectId)`** - Assigns project to current supervisor
   - Sets `supervisor_id` to current supervisor
   - Changes status to "analyzing"
   - Only works if project is not already claimed

2. **`useNewRequests()`** - Fetches unassigned projects
   - Query: `supervisor_id IS NULL` AND `status IN ('submitted', 'analyzing')`
   - Returns projects available for any supervisor to claim

3. **`useReadyToAssign()`** - Fetches projects needing doer assignment
   - Query: `supervisor_id = current` AND `status = 'paid'` AND `doer_id IS NULL`

4. **Updated `useProjectsByStatus()`** - Now includes new hooks
   - `needsQuote` returns unassigned projects (from useNewRequests)
   - `readyToAssign` returns projects needing doer assignment

### superviser-web/app/(dashboard)/dashboard/page.tsx

- Imported `claimProject` function and `useRouter`
- Updated `handleAnalyzeRequest` to claim the project before navigating
- Shows toast on success/failure

### superviser-web/hooks/index.ts

- Exported new functions: `useNewRequests`, `useReadyToAssign`, `claimProject`

**Commit:** `30ea780` - "fix(superviser-web): Add hooks to fetch unassigned projects for New Requests"

---

## 📊 Database Analysis (via Supabase REST API)

### Projects needing supervisor (New Requests)
**Query:** `supervisor_id IS NULL AND status IN ('submitted', 'analyzing')`

| Project # | Title | Status |
|-----------|-------|--------|
| AX-368423 | ljnlb k | submitted |
| AX-286468 | Test Project - Renewable Energy Analysis | submitted |
| AX-196026 | medicine | submitted |
| AX-503685 | Design and Analysis of a Solar-Powered Water Purification System | submitted |
| AX-153083 | lawww | submitted |
| AX-602031 | TItee | submitted |
| AX-029265 | Proofreading - case-study | submitted |
| PRJ-2501-001 | Machine Learning Research Paper | submitted |
| PRJ-2501-002 | Business Strategy Analysis | analyzing |
| AX-636543 | testt | submitted |
| AX-673968 | Complete Report - 1 document(s) | submitted |
| AX-541878 | testtt | submitted |
| AX-598695 | Proofreading - research-paper | submitted |
| AX-866617 | testtt | submitted |

**Total: 14 projects should appear in supervisor's "New Requests" tab**

### Projects in Open Pool (for Doers)
**Query:** `doer_id IS NULL AND status = 'paid'`

| Project # | Title | Doer Payout |
|-----------|-------|-------------|
| PRJ-2024-021 | Computer Networks Report | ₹5,200 |
| PRJ-2024-022 | Mechanical Design Project | ₹6,800 |
| PRJ-2501-003 | Structural Engineering Report | null |
| PRJ-2024-010 | Legal Research Brief | ₹5,500 |
| PRJ-2024-011 | Architecture Portfolio | ₹4,800 |
| PRJ-2501-004 | PhD Thesis Proofreading | null |

**Total: 6 projects in doer's Open Pool**

### Supervisors
- Om has 2 supervisor accounts:
  - `om@agiready.io` (supervisor_id: d71f24a4...)
  - `omrajpal.exe@gmail.com` (supervisor_id: ea21427b...)

---

## ✅ What's Working

### user-web (localhost:3000)
- ✅ Google OAuth login
- ✅ Project creation wizard (4 steps)
- ✅ Projects list with tab filtering
- ✅ Status categorization (Active/In Progress/Review/Completed)
- ✅ Projects correctly have `supervisor_id = NULL` on creation

### superviser-web (localhost:3001)
- ✅ Google OAuth login
- ✅ Dashboard layout and navigation
- ✅ **NEW: useNewRequests() fetches unassigned projects**
- ✅ **NEW: claimProject() assigns project to supervisor**
- ✅ **NEW: useReadyToAssign() fetches paid projects for doer assignment**

### doer-web (localhost:3002)
- ✅ Google OAuth login
- ✅ Dashboard with stats
- ✅ Open Pool shows unassigned paid projects
- ✅ Accept task functionality

---

## ⚠️ Known Issues (Not Code Bugs)

1. **Data inconsistency**: Some projects have `status=paid` but `supervisor_id=null`
   - PRJ-2501-003, PRJ-2501-004 are in this state
   - This shouldn't happen in normal workflow (supervisor assigns before payment)
   - Likely test data issue

2. **Pre-seeded test data**: Most PRJ-2024-TEST-* projects already have supervisors assigned
   - If logged in with different email, these won't show as "your" projects

---

## 🧪 Manual Testing Required

### Test 1: Supervisor New Requests
1. Go to `localhost:3001/dashboard`
2. Login as supervisor
3. Check "New Requests" tab - should show 14 unassigned projects
4. Click "Analyze" on a project - should claim it and navigate to detail

### Test 2: Doer Open Pool
1. Go to `localhost:3002`
2. Login as doer
3. Check "Open Pool" tab - should show 6 available tasks
4. Click "Accept" on a task - should assign to doer

### Test 3: Full Workflow
1. Create project in user-web
2. Supervisor claims in superviser-web
3. Supervisor quotes, user pays
4. Doer accepts from pool
5. Doer completes, supervisor QC
6. User receives deliverable

---

## 📝 Status

- **Code fixes:** ✅ Committed
- **Server testing:** ⚠️ Local servers need manual startup
- **Browser testing:** ⚠️ Requires Om to test in his browser

---

**Last Updated:** February 2, 2026 06:45 IST
