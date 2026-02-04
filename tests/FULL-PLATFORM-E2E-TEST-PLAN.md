# Full Platform E2E Test Plan - AssignX

## Test Date: 2026-02-04
## Test Environment: Local Development
## Tester: Claude Code

---

## Overview

This document covers comprehensive E2E testing for all three AssignX applications:
1. **User-Web** (Port 3000) - Client-facing application
2. **Supervisor-Web** (Port 3001) - Supervisor management portal
3. **Doer-Web** (Port 3002) - Expert/Doer work portal

---

# Part 1: Doer-Web Features

## 1.1 Authentication & Onboarding

### Registration Flow
- [ ] Landing page displays correctly
- [ ] Welcome carousel works (slides, skip, complete)
- [ ] Google OAuth sign-up initiates correctly
- [ ] Redirect to profile-setup after OAuth success
- [ ] Error handling for OAuth failures

### Login Flow
- [ ] Login page displays correctly
- [ ] Google OAuth sign-in works
- [ ] Redirect to appropriate page based on user state
- [ ] Error handling for login failures

### Onboarding (Profile Setup)
- [ ] Profile setup form displays all fields
- [ ] Full name validation
- [ ] Phone number validation
- [ ] Qualification selection works
- [ ] Experience level selection works
- [ ] Skills multi-select works
- [ ] Form submission creates profile
- [ ] Redirect to activation flow after setup

## 1.2 Activation Flow

### Training Module
- [ ] Training page loads correctly
- [ ] Training video/content displays
- [ ] Progress tracking works
- [ ] Completion button enables after watching
- [ ] Redirect to quiz after completion

### Quiz Assessment
- [ ] Quiz loads with questions
- [ ] Question navigation works
- [ ] Answer selection works
- [ ] Timer (if any) displays correctly
- [ ] Submit quiz calculates score
- [ ] Pass/fail result displays (80% passing score)
- [ ] Retry mechanism for failed attempts (max 3)
- [ ] Redirect to bank-details after passing

### Bank Details
- [ ] Bank details form displays
- [ ] Account holder name validation
- [ ] Account number validation (masking)
- [ ] IFSC code validation (pattern: ^[A-Z]{4}0[A-Z0-9]{6}$)
- [ ] UPI ID validation (pattern: ^[\w.-]+@[\w.-]+$)
- [ ] Either bank or UPI required validation
- [ ] Form submission saves bank details
- [ ] Activation completes, redirect to dashboard

## 1.3 Dashboard

### Dashboard Overview
- [ ] Dashboard loads for activated doers
- [ ] User profile displays in sidebar/header
- [ ] Stats cards display:
  - [ ] Active projects count
  - [ ] Pending earnings
  - [ ] Completed projects
  - [ ] Average rating
- [ ] Navigation menu works correctly

### Task Pool
- [ ] Task pool section displays
- [ ] Available tasks load from database
- [ ] Task cards show:
  - [ ] Title
  - [ ] Subject/Topic
  - [ ] Price (doer_payout)
  - [ ] Deadline
  - [ ] Priority indicator
- [ ] Accept task button works
- [ ] Task moves to assigned after acceptance
- [ ] Real-time updates via subscription

### Assigned Tasks
- [ ] Assigned tasks section displays
- [ ] User's assigned projects show
- [ ] Status indicators correct
- [ ] Click navigates to project detail

## 1.4 Projects

### Projects List
- [ ] Projects page loads
- [ ] Tab navigation:
  - [ ] Active Projects tab
  - [ ] Under Review tab
  - [ ] Completed tab
- [ ] Project cards display correctly
- [ ] Search/filter works
- [ ] Pagination (if implemented)

### Active Projects Tab
- [ ] Shows projects in progress
- [ ] Shows assigned but not started
- [ ] Shows revision requested projects
- [ ] Deadline urgency indicator
- [ ] Price displays in INR (₹)

### Project Detail/Workspace
- [ ] Project detail page loads
- [ ] Project info displays:
  - [ ] Title, description
  - [ ] Requirements
  - [ ] Deadline
  - [ ] Doer payout amount
- [ ] Reference files downloadable
- [ ] Live document URL (if available)
- [ ] Chat panel with supervisor
- [ ] File upload for deliverables
- [ ] Submit for QC button
- [ ] Revision handling

### Under Review Tab
- [ ] Shows projects submitted for QC
- [ ] Shows QC status (pending, in_review, approved, rejected)
- [ ] QC feedback display (if rejected)

### Completed Tab
- [ ] Shows completed projects
- [ ] Total earnings summary
- [ ] Individual project earnings
- [ ] Rating/review (if available)

## 1.5 Chat/Messaging

### Chat with Supervisor
- [ ] Chat panel loads in workspace
- [ ] Chat history displays
- [ ] Send text message works
- [ ] Receive messages from supervisor
- [ ] File attachment upload
- [ ] Real-time updates
- [ ] Message timestamps

## 1.6 Profile & Earnings

### Profile Page
- [ ] Profile page loads
- [ ] Personal info displays
- [ ] Skills display
- [ ] Rating breakdown
- [ ] Scorecard/stats
- [ ] Edit profile works

### Earnings Overview
- [ ] Earnings graph displays
- [ ] Period selector (week/month/year)
- [ ] Total earnings shows
- [ ] Average earnings shows

### Payment History
- [ ] Wallet balance displays
- [ ] Transaction history loads
- [ ] Transaction types displayed correctly:
  - [ ] project_earning
  - [ ] bonus
  - [ ] payout
  - [ ] penalty (if any)
- [ ] Pending balance shows

### Request Payout
- [ ] Payout dialog opens
- [ ] Available balance shows
- [ ] Minimum amount validation (₹500)
- [ ] Amount input works
- [ ] Quick amount buttons
- [ ] Payment method selection (bank/UPI)
- [ ] Fee calculation displays
- [ ] Net amount calculates
- [ ] Confirmation step
- [ ] Payout request submission
- [ ] Success/error feedback

## 1.7 Resources

### Resources Page
- [ ] Resources page loads
- [ ] AI Report Generator tool
- [ ] Citation Builder tool
- [ ] Format Templates
- [ ] Training center materials

## 1.8 Statistics

### Statistics Page
- [ ] Statistics page loads
- [ ] Performance metrics display
- [ ] Completion rate
- [ ] Average turnaround time
- [ ] Quality scores
- [ ] Trend graphs

## 1.9 Settings

### Settings Page
- [ ] Settings page loads
- [ ] Notification preferences
- [ ] Display preferences
- [ ] Account settings
- [ ] Settings persist after save

## 1.10 Support

### Support Page
- [ ] Support page loads
- [ ] FAQ section
- [ ] Contact support form
- [ ] Ticket submission works

---

# Part 2: User-Web Features

## 2.1 Authentication
- [ ] Magic link login works
- [ ] Login email sent
- [ ] Magic link redirects correctly
- [ ] Session established

## 2.2 Onboarding
- [ ] Student flow works
- [ ] Professional flow works
- [ ] College verification (student)
- [ ] Profile completion

## 2.3 Dashboard
- [ ] Dashboard loads
- [ ] Stats display
- [ ] Recent projects
- [ ] Quick actions

## 2.4 Projects
- [ ] Create new project
- [ ] Project list displays
- [ ] Project detail view
- [ ] Chat with supervisor (messages on right for user)
- [ ] View quote
- [ ] Make payment
- [ ] View deliverables
- [ ] Request revision
- [ ] Mark complete

## 2.5 Wallet
- [ ] Wallet balance
- [ ] Transaction history
- [ ] Add funds (if applicable)

## 2.6 Settings
- [ ] Notification settings persist
- [ ] Privacy settings persist
- [ ] Appearance settings work

---

# Part 3: Supervisor-Web Features

## 3.1 Authentication
- [ ] Login works
- [ ] Registration works
- [ ] Onboarding complete
- [ ] Activation quiz passed

## 3.2 Dashboard
- [ ] Stats display correctly
- [ ] Recent activity
- [ ] Quick actions

## 3.3 Projects Management
- [ ] New requests (unclaimed) display
- [ ] Claim project works
- [ ] Analyze & set quote works
- [ ] Assign doer to project
- [ ] Project status tracking
- [ ] QC review (approve/reject)

## 3.4 Chat
- [ ] Chat rooms list displays
- [ ] Click opens chat room
- [ ] Send message to user
- [ ] Send message to doer
- [ ] Suspend/resume chat

## 3.5 Doers Management
- [ ] Doers list displays
- [ ] Search doers
- [ ] Filter by status/skills
- [ ] View doer profile

---

# Part 4: Cross-Platform Integration Tests

## 4.1 Complete Project Workflow
1. [ ] User creates project
2. [ ] Supervisor sees in new requests
3. [ ] Supervisor claims project
4. [ ] Supervisor analyzes & sets quote
5. [ ] User receives quote notification
6. [ ] User views quote
7. [ ] User makes payment
8. [ ] Project enters task pool
9. [ ] Doer sees in available tasks
10. [ ] Doer accepts task
11. [ ] Supervisor notified of assignment
12. [ ] Doer works on project
13. [ ] Doer submits for QC
14. [ ] Supervisor reviews QC
15. [ ] Supervisor approves/rejects
16. [ ] (If approved) Project delivered to user
17. [ ] User reviews deliverables
18. [ ] User marks complete OR requests revision
19. [ ] Doer earnings credited to wallet

## 4.2 Two-Way Messaging

### User ↔ Supervisor
- [ ] User sends message → Supervisor receives
- [ ] Supervisor replies → User receives
- [ ] Real-time sync

### Supervisor ↔ Doer
- [ ] Supervisor sends message → Doer receives
- [ ] Doer replies → Supervisor receives
- [ ] Real-time sync

## 4.3 Commission Structure
- [ ] User quote = doer_payout + supervisor_commission + platform_fee
- [ ] Commission calculated correctly
- [ ] Platform fee recorded
- [ ] Supervisor commission tracked
- [ ] Doer receives correct payout

---

# Part 5: Special Features

## 5.1 Location-Based Currency (PLANNED/TO VERIFY)
- [ ] IP detection for country
- [ ] Currency display based on location:
  - [ ] India → INR (₹)
  - [ ] UK → GBP (£)
  - [ ] US → USD ($)
  - [ ] EU → EUR (€)
- [ ] Manual currency override option
- [ ] Conversion rates applied

## 5.2 Commission Structure (Database Fields)
- [ ] `user_quote` - Amount charged to user
- [ ] `doer_payout` - Amount paid to doer
- [ ] `supervisor_commission` - Supervisor's cut
- [ ] `platform_fee` - Platform's cut (e.g., 10%)
- [ ] All fields populated correctly in projects table

---

# Test Results

| App | Feature | Status | Notes |
|-----|---------|--------|-------|
| doer-web | Welcome/Onboarding Carousel | ✅ PASS | All 4 slides work, navigation works |
| doer-web | Dashboard | ✅ PASS | Stats display, task pool shows 8 tasks |
| doer-web | Open Pool Tab | ✅ PASS | Shows available tasks with prices in ₹ |
| doer-web | Accept Task | ✅ PASS | Fixed - Added INSERT policy on notifications table |
| doer-web | Projects Page | ✅ PASS | Shows empty state, search, filters |
| doer-web | Profile Page | ✅ PASS | Shows user info, earnings, options |
| doer-web | Settings - Account | ✅ PASS | Shows account info, language settings |
| doer-web | Settings - Notifications | ✅ PASS | Toggle switches work |
| doer-web | Resources Page | ✅ PASS | Shows 4 tools, 14 training modules loaded |
| doer-web | Support Page | ✅ PASS | Help cards, contact form, 9 FAQs loaded |
| user-web | Chat Message Alignment | ✅ PASS | User messages on right, others on left |
| supervisor-web | Chat Navigation | ✅ PASS | Clicking conversation opens chat room |
| supervisor-web | Projects Page | ✅ PASS | Shows 16 new requests, status rail works |
| supervisor-web | Claim Project | ✅ PASS | Project claimed and status changed to "analyzing" |
| supervisor-web | Set Quote | ✅ PASS | Quote ₹4,600 set with commission breakdown |
| user-web | Quote Notification | ✅ PASS | Quote appears immediately with "Pay Now" option |
| doer-web | Accept Task | ✅ PASS | Task accepted, moved to Assigned tab |
| Integration | Supervisor→User Quote Flow | ✅ PASS | Full flow works end-to-end |

---

# Bugs Found

| Bug ID | App | Description | Severity | Status |
|--------|-----|-------------|----------|--------|
| BUG-001 | doer-web | Dashboard file syntax error from git merge | High | FIXED |
| BUG-002 | doer-web | Accept task fails with RLS error 42501 | High | FIXED - Added notifications INSERT policy |
| BUG-003 | doer-web | Training modules DB column error (order_index) | Medium | FIXED - Changed to sequence_order, added training_modules table |
| BUG-004 | doer-web | FAQ DB query error (is_active, order_index) | Medium | FIXED - Changed to display_order, added sample FAQs |

---

# Test Execution Log

## Session Start: 2026-02-04

### Pre-requisites:
- [ ] All three apps running locally
- [ ] Database seeded with test data
- [ ] Test users created for each app

### Test Accounts:
- User-Web: TBD
- Supervisor-Web: TBD
- Doer-Web: TBD
