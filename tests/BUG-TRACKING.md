# AssignX Bug Tracking Document

## Test Session: 2026-02-04

---

## Active Bugs

None - All bugs fixed! ✅

---

## Fixed Bugs (This Session)

### BUG-006: Missing grid.svg asset (404)
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Created grid.svg pattern file in doer-web/public/

### BUG-001: Dashboard file syntax error from git merge
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Resolved git merge conflict markers

### BUG-002: Accept task fails with RLS error 42501
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Added notifications INSERT policy

### BUG-003: Training modules DB column error (order_index)
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Changed to sequence_order, added training_modules table

### BUG-004: FAQ DB query error (order_index)
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Changed to display_order, added sample FAQs

### BUG-005: Doer chat not visible in supervisor Messages
- **App**: supervisor-web, doer-web
- **Status**: FIXED
- **Root Cause**: Chat room creation didn't add participants, and existing room participant lookup failed
- **Fix**:
  1. Added `ensureUserIsParticipant()` function in chat.service.ts
  2. Added `addProjectChatParticipants()` function to auto-add supervisor and doer when creating rooms
  3. Fixed TypeScript type errors for Supabase relation responses
  4. Manually added participants to existing chat room via SQL

### BUG-007: FAQ mockData type mismatch (order_index/role_filter)
- **App**: doer-web
- **Status**: FIXED
- **Fix**: Changed `order_index` to `display_order` and `role_filter` to `target_role`, added missing `helpful_count` and `not_helpful_count` fields in constants.ts

---

## Test Results Summary

### User-Web (Port 3000)
| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | ✅ PASS | All sections visible |
| Hero Section | ✅ PASS | CTAs work |
| How It Works | ✅ PASS | 4 steps displayed |
| User Type Cards | ✅ PASS | Student/Professional/Business |
| Trust Stats | ✅ PASS | Numbers display |
| Testimonials | ✅ PASS | Marquee scrolling |
| Footer | ✅ PASS | All links present |
| Dashboard | ✅ PASS | Stats, quick actions, navigation work |

### Supervisor-Web (Port 3001)
| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ PASS | Stats, quick actions work |
| Navigation Sidebar | ✅ PASS | All links work |
| New Requests (15) | ✅ PASS | Projects display |
| Analyze Button | ✅ PASS | Opens project |
| Messages Page | ✅ PASS | Client chats show |
| Chat Room | ✅ PASS | User messages display |
| Expert Chats | ✅ PASS | Shows 1, doer chat visible (BUG-005 FIXED) |

### Doer-Web (Port 3002)
| Feature | Status | Notes |
|---------|--------|-------|
| Welcome Carousel | ✅ PASS | 4 slides, navigation works |
| Skip Button | ✅ PASS | Works |
| Get Started | ✅ PASS | Redirects to dashboard |
| Dashboard | ✅ PASS | Stats display correctly |
| Assigned Tasks (1) | ✅ PASS | Shows project card |
| Open Pool (7) | ✅ PASS | Available tasks |
| Project Workspace | ✅ PASS | Details, deadline, earnings |
| Chat Tab | ✅ PASS | Messages display correctly (BUG-005 FIXED) |
| Sidebar Nav | ✅ PASS | All links present |

### Cross-Platform Integration
| Test | Status | Notes |
|------|--------|-------|
| User→Supervisor Chat | ✅ PASS | Messages sync |
| Supervisor→Doer Chat | ✅ PASS | Chat room visible, messages sync (BUG-005 FIXED) |
| Quote Flow | ✅ PASS | Previously tested |
| Task Assignment | ✅ PASS | Previously tested |

---

## Next Steps

1. ~~Fix BUG-005~~ ✅ COMPLETED
2. Test remaining user-web features (login, projects, wallet)
3. Test remaining supervisor-web features (doers page, users page)
4. Test payment flow
5. Test file upload/download
6. Test notifications

