# AssignX QA TODO

## Priority: Full Workflow Test

### 1. Setup
- [x] Fix supervisor hooks for New Requests
- [x] Add New Requests tab to projects page
- [x] Fix all TypeScript errors
- [x] Start all 3 dev servers
- [x] Verify all servers accessible

### 2. User-Web Tests (localhost:3000)
- [x] Login works
- [ ] Dashboard loads with correct data
- [ ] Create new project (all steps)
- [ ] Projects list displays correctly
- [ ] Project detail page works

### 3. Supervisor-Web Tests (localhost:3001)
- [x] Login works (Om Rajpal logged in)
- [x] Dashboard loads with "Requires Attention" section
- [x] **New Requests shows 14 unassigned projects** ✅
- [x] **"Claim & Analyze" button on each project** ✅
- [x] Ready to Assign tab present
- [x] All 5 tabs: New Requests | Ready to Assign | Ongoing | For Review | Completed
- [ ] Can claim a project (test the button)
- [ ] Can create quote
- [ ] Can assign doer to project

### 4. Doer-Web Tests (localhost:3002)
- [x] Login works (Om Rajpal logged in)
- [x] Dashboard loads with stats
- [x] **Available Tasks: 6** shown in stats ✅
- [x] **Open Pool 6** tab badge ✅
- [x] **Potential Earnings: ₹22,300** ✅
- [ ] Can accept task from Open Pool
- [ ] My Tasks shows accepted tasks

### 5. End-to-End Workflow
- [ ] Create project → appears in supervisor New Requests
- [ ] Supervisor claims → project assigned
- [ ] Quote created → user notified
- [ ] User pays → moves to Ready to Assign
- [ ] Doer assigned → appears in doer tasks
- [ ] Work submitted → supervisor QC
- [ ] Approved → user receives

## Bugs Found & Fixed

| Bug | Status | Commit |
|-----|--------|--------|
| Supervisor can't see new projects | ✅ Fixed | 30ea780 |
| Missing New Requests tab in projects page | ✅ Fixed | 429b7d5 |
| TypeScript errors (6 files) | ✅ Fixed | ecf1d50 |

## Verified Working ✅

### Supervisor-Web
- New Requests tab shows 14 unassigned projects
- Project cards display with: number, title, subject, user, deadline
- "Claim & Analyze" button on each card
- Ready to Assign tab present
- All 5 project tabs functional

### Doer-Web  
- Stats cards show: 0 Assigned, 6 Available, 0 Urgent, ₹22,300 earnings
- Open Pool tab with 6 badge
- Assigned to Me tab

## In Progress

- Testing claim project functionality
- Testing doer accept task functionality

## Commits Made

```
ecf1d50 fix(superviser-web): Fix all TypeScript errors
c3a7219 docs: Add comprehensive testing checklist
429b7d5 feat(superviser-web): Add New Requests and Ready to Assign tabs
30ea780 fix(superviser-web): Add hooks to fetch unassigned projects
```

## Last Updated
February 2, 2026 - 06:55 IST
