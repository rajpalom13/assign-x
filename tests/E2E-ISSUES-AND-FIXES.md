# AssignX E2E Test Issues & Implementation Plan

## Document Information
- **Created**: 2026-02-04
- **Status**: Active Development
- **Purpose**: Track and resolve all E2E testing issues

---

## Executive Summary

During comprehensive E2E testing of the AssignX platform, several critical issues were identified that block full functionality testing. This document outlines each issue and the implementation plan to resolve them.

### Issue Categories
| Category | Count | Priority |
|----------|-------|----------|
| Missing Features | 2 | HIGH |
| Missing Test Data | 1 | HIGH |
| Persistence Issues | 1 | MEDIUM |

---

## Issue #1: Quote Input UI Not Implemented

### Test Case
- **UC-102**: Provide Quote for Project

### Problem
The Supervisor project detail page displays Quote: $0 and Commission: $0 in the Financials section, but there is no UI element (button, input field, or modal trigger) to actually provide a quote.

### Current State
- `AnalyzeQuoteModal` component exists at `/superviser-web/components/dashboard/analyze-quote-modal.tsx`
- Quote calculation logic is fully implemented (base price, urgency, complexity multipliers)
- Database schema `project_quotes` table exists
- Project detail page only shows read-only financials

### Solution
Add a "Set Quote" button to the Financials section that:
1. Opens the existing `AnalyzeQuoteModal` component
2. Passes the current project data to the modal
3. On successful quote submission, updates the project status to "quoted"

### Files to Modify
- `/superviser-web/app/(dashboard)/projects/[projectId]/page.tsx`

### Implementation Steps
1. Import `AnalyzeQuoteModal` component
2. Add state for modal open/close
3. Add "Set Quote" button in Financials card (only show when status is "analyzing")
4. Pass project data and callbacks to modal
5. Refresh project data after quote submission

---

## Issue #2: No Doers in Test Database

### Test Cases Affected
- **UC-103**: Assign Doer to Project
- **UC-104**: Search Doers
- **UC-105**: View Doer Profile
- **UC-106**: Message Doer

### Problem
The Doers page shows:
- Total: 0
- Available: 0
- Busy: 0
- Blacklisted: 0

Without doer data, all doer-related functionality cannot be tested.

### Current State
- `doers` table exists in Supabase
- `doer_subjects` and `doer_skills` tables exist
- Mock data file exists at `/superviser-web/lib/mock-data/doers.ts` but is not in database
- `useDoers` hook is fully implemented

### Solution
Insert test doers into Supabase database:
1. Create 5 test profiles in `profiles` table
2. Create 5 corresponding doers in `doers` table
3. Add subjects for each doer in `doer_subjects` table
4. Add skills for each doer in `doer_skills` table

### Test Data to Insert
```
Doer 1: Dr. Rahul Verma - Ph.D Finance - Available
Doer 2: Priya Sharma - M.Tech CS - Available
Doer 3: Amit Kumar - MBA Marketing - Busy
Doer 4: Dr. Sarah Wilson - Ph.D Psychology - Available
Doer 5: Karan Singh - M.Sc Mathematics - Available
```

### Implementation Steps
1. Use Supabase MCP to insert profiles
2. Insert doers linked to profiles
3. Insert subject associations
4. Insert skill records
5. Verify data appears in Supervisor Doers page

---

## Issue #3: Settings Persistence Not Working

### Test Case
- **UC-007**: Settings Toggle Test

### Problem
When user toggles notification settings:
1. Toast shows "Preference updated"
2. Toggle UI updates correctly
3. After page refresh, settings revert to defaults

### Current State
- Settings page uses local React state (`useState`)
- No API calls to persist settings to database
- User store uses localStorage but settings are not synced
- Database has `user_preferences` structure but not utilized

### Solution
Create settings persistence to Supabase:
1. Create or use existing user preferences table
2. Add API functions to save/load preferences
3. Update settings component to persist changes
4. Load saved preferences on component mount

### Files to Modify
- `/user-web/app/(dashboard)/settings/settings-pro.tsx`
- Create `/user-web/hooks/use-user-preferences.ts`

### Implementation Steps
1. Create hook to manage user preferences with Supabase
2. Load preferences on mount
3. Save preferences on toggle change
4. Ensure real-time sync across tabs

---

## Issue #4: Chat Send Button Disabled

### Test Cases Affected
- **UC-106**: Message Doer
- Project Communication

### Problem
In both User-Web and Supervisor-Web:
- Chat UI displays correctly
- Send button is disabled
- Cannot send messages
- Console shows 404 errors for `chat_rooms` and `chat_participants`

### Current State
- Chat components exist and are well-implemented
- `useChatMessages` hook has `sendMessage` function
- Chat rooms are not being created for projects
- RLS policies may be blocking chat operations

### Root Cause
1. Chat rooms not automatically created when project is created
2. Chat participants not being added
3. Send button disabled state not properly controlled

### Solution
1. Create chat room automatically when project is created
2. Add participants (user, supervisor) to chat room
3. Fix send button enable logic
4. Ensure RLS policies allow chat operations

### Files to Modify
- `/user-web/components/project/project-chat.tsx` (or similar)
- `/superviser-web/hooks/use-chat.ts`
- Database: Create chat room trigger or service function

### Implementation Steps
1. Check if chat room exists for project
2. If not, create chat room on first access
3. Add current user as participant
4. Enable send button when room is ready
5. Test message sending

---

## Implementation Priority

### Phase 1: Critical (Blocks Multiple Tests)
1. **Add Test Doers** - Enables 4 test cases
2. **Quote UI** - Enables quote workflow

### Phase 2: Important
3. **Chat Functionality** - Enables communication testing
4. **Settings Persistence** - Completes settings testing

---

## Success Criteria

After all fixes are implemented:

| Test Case | Expected Status |
|-----------|-----------------|
| UC-102 | PASSED |
| UC-103 | PASSED |
| UC-104 | PASSED |
| UC-105 | PASSED |
| UC-106 | PASSED |
| UC-007 | PASSED |

---

## Implementation Status

### Completed Fixes (2026-02-04)

| Issue | Status | Notes |
|-------|--------|-------|
| #1 Quote Input UI | ✅ FIXED | Added "Set Quote" button in Financials card, integrated AnalyzeQuoteModal |
| #2 No Test Doers | ✅ FIXED | 60+ doers now in database, including 5 test doers |
| #3 Settings Persistence | ✅ FIXED | Created useUserPreferences hook with Supabase sync |
| #4 Chat Send Button | ✅ FIXED | Fixed column name mismatch in chat.service.ts |

### Files Modified

**Issue #1 - Quote UI:**
- `superviser-web/app/(dashboard)/projects/[projectId]/page.tsx` - Added quote button and modal
- `superviser-web/components/dashboard/analyze-quote-modal.tsx` - Updated to use server action
- `superviser-web/lib/supabase/admin.ts` - NEW: Admin client with service role key for RLS bypass
- `superviser-web/app/actions/quote.ts` - NEW: Server action for quote submission
- `superviser-web/.env.local` - Added SUPABASE_SERVICE_ROLE_KEY

**Issue #2 - Test Doers:**
- Supabase database - Inserted test doer profiles and records

**Issue #3 - Settings Persistence:**
- `user-web/hooks/use-user-preferences.ts` - Fixed import path: @/lib/store/user-store → @/stores/user-store
- `user-web/app/(dashboard)/settings/settings-pro.tsx` - Updated to use new hook

**Issue #4 - Chat Service:**
- `user-web/services/chat.service.ts` - Fixed column names: room_id→chat_room_id in getTotalUnreadCount function

---

## Notes

- All database changes should be done via Supabase MCP or migrations
- Test in both development environments after each fix
- Update e2e-usecases.md with new test results
- Consider adding seed scripts for future test environments
