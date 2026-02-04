# AssignX Comprehensive E2E Test Cases

## Test Date: 2026-02-04
## Test Environment: Local Development
## Methodology: Systematic feature-by-feature testing

---

# PART 1: USER-WEB (Port 3000)

## 1.1 Authentication & Onboarding

### TC-U-001: Landing Page
- [ ] Landing page loads correctly at localhost:3000
- [ ] Hero section displays
- [ ] Navigation menu visible
- [ ] CTA buttons work
- [ ] Footer links work

### TC-U-002: Login Flow
- [ ] Login page loads at /login
- [ ] Magic link email input works
- [ ] Email validation works
- [ ] Submit button sends magic link
- [ ] Error handling for invalid email

### TC-U-003: Signup Flow
- [ ] Signup page loads at /signup
- [ ] Role selection (student/professional) works
- [ ] Student signup flow at /signup/student
- [ ] Professional signup flow at /signup/professional
- [ ] Form validation works
- [ ] Redirect to onboarding after signup

### TC-U-004: Onboarding
- [ ] Onboarding page loads
- [ ] Step-by-step flow works
- [ ] Progress indicator updates
- [ ] Skip option (if available)
- [ ] Completion redirects to dashboard

## 1.2 Dashboard

### TC-U-005: Dashboard Overview
- [ ] Dashboard loads at /home
- [ ] Stats cards display
- [ ] Recent projects section
- [ ] Quick actions visible
- [ ] Sidebar navigation works
- [ ] DockNav (bottom) works

### TC-U-006: Dashboard Navigation
- [ ] Home link works
- [ ] Projects link works
- [ ] Wallet link works
- [ ] Profile link works
- [ ] Settings link works
- [ ] Support link works
- [ ] Notification bell works

### TC-U-007: Banner Carousel
- [ ] Banner carousel displays
- [ ] Auto-rotation works
- [ ] Manual navigation dots work
- [ ] CTAs on banners work

## 1.3 Projects

### TC-U-008: Projects List
- [ ] Projects page loads at /projects
- [ ] Project cards display
- [ ] Status badges correct
- [ ] Deadline countdown works
- [ ] Filter tabs work (All/Active/Completed)
- [ ] Search works

### TC-U-009: Create New Project
- [ ] New project page at /projects/new
- [ ] Title input works
- [ ] Description textarea works
- [ ] Subject selection works
- [ ] Deadline picker works
- [ ] Word count input works
- [ ] Reference style dropdown works
- [ ] File upload works
- [ ] Budget input works
- [ ] Submit creates project
- [ ] Success feedback shown

### TC-U-010: Project Detail
- [ ] Project detail page loads at /project/[id]
- [ ] Project header shows title, status
- [ ] Brief accordion expands/collapses
- [ ] Files section shows attachments
- [ ] Deliverables section works
- [ ] Timeline shows history
- [ ] Chat button opens chat

### TC-U-011: Project Chat
- [ ] Chat panel opens
- [ ] Previous messages display
- [ ] User messages on right side
- [ ] Supervisor messages on left
- [ ] Send message works
- [ ] File attachment works
- [ ] Real-time updates work

### TC-U-012: Quote & Payment
- [ ] Quote notification appears
- [ ] Quote details display (price breakdown)
- [ ] Accept quote button works
- [ ] Payment modal opens
- [ ] Razorpay checkout loads
- [ ] Payment success updates status
- [ ] Invoice download available

### TC-U-013: Deliverables
- [ ] Delivered files display
- [ ] Preview available
- [ ] Download works
- [ ] Approve delivery button
- [ ] Request revision button
- [ ] Revision form works
- [ ] Grade entry dialog (if applicable)

## 1.4 Wallet

### TC-U-014: Wallet Page
- [ ] Wallet page loads at /wallet
- [ ] Balance displays correctly
- [ ] Add funds button works
- [ ] Transaction history displays
- [ ] Transaction types correct (payment, refund, etc.)
- [ ] Date sorting works
- [ ] Pagination works (if many transactions)

### TC-U-015: Add Funds
- [ ] Add funds dialog opens
- [ ] Amount input works
- [ ] Quick amount buttons work
- [ ] Razorpay checkout loads
- [ ] Success updates balance
- [ ] Transaction appears in history

## 1.5 Profile & Settings

### TC-U-016: Profile Page
- [ ] Profile page loads at /profile
- [ ] Personal info displays
- [ ] Avatar displays/uploads
- [ ] Academic info section (student)
- [ ] Edit profile works
- [ ] Save changes works

### TC-U-017: Settings - Account
- [ ] Settings page loads at /settings
- [ ] Account tab shows info
- [ ] Email display correct
- [ ] Name editable
- [ ] Phone editable
- [ ] Save works

### TC-U-018: Settings - Notifications
- [ ] Notification settings tab
- [ ] Email notifications toggle
- [ ] Push notifications toggle
- [ ] WhatsApp notifications toggle
- [ ] Settings persist after save

### TC-U-019: Settings - Security
- [ ] Security tab loads
- [ ] Password change option
- [ ] Two-factor authentication setup
- [ ] Active sessions display
- [ ] Revoke session works
- [ ] Danger zone (delete account)

## 1.6 Support

### TC-U-020: Support Page
- [ ] Support page loads at /support
- [ ] FAQ section displays
- [ ] FAQ accordion works
- [ ] Contact form works
- [ ] Ticket submission works
- [ ] Success feedback

## 1.7 Marketplace (if enabled)

### TC-U-021: Marketplace Browse
- [ ] Marketplace loads at /marketplace
- [ ] Listings display
- [ ] Category filter works
- [ ] Search works
- [ ] Listing cards clickable

### TC-U-022: Listing Detail
- [ ] Listing detail page loads
- [ ] Seller info displays
- [ ] Price displays
- [ ] Contact seller works
- [ ] Purchase/inquiry works

## 1.8 Campus Connect (if enabled)

### TC-U-023: Connect Feed
- [ ] Connect page loads at /connect
- [ ] Posts display
- [ ] Create post button
- [ ] Search bar works
- [ ] Category filter works

### TC-U-024: Create Post
- [ ] Create post page loads
- [ ] Title input works
- [ ] Content editor works
- [ ] Category selection
- [ ] Submit creates post

---

# PART 2: SUPERVISOR-WEB (Port 3001)

## 2.1 Authentication

### TC-S-001: Login
- [ ] Login page loads at localhost:3001/login
- [ ] Email input works
- [ ] Password input works (or OAuth)
- [ ] Login button authenticates
- [ ] Redirect to dashboard

### TC-S-002: Registration
- [ ] Register page loads at /register
- [ ] Registration form works
- [ ] Validation works
- [ ] Submit creates account
- [ ] Redirect to onboarding

## 2.2 Dashboard

### TC-S-003: Dashboard Overview
- [ ] Dashboard loads at /dashboard
- [ ] Stats cards display:
  - [ ] New requests count
  - [ ] Active projects count
  - [ ] Completed this month
  - [ ] Earnings this month
- [ ] Quick actions work
- [ ] Recent activity shows

### TC-S-004: Dashboard Navigation
- [ ] Sidebar navigation works
- [ ] Dashboard link
- [ ] Projects link
- [ ] Messages/Chat link
- [ ] Doers link
- [ ] Users link
- [ ] Earnings link
- [ ] Settings link

## 2.3 Projects Management

### TC-S-005: Projects List
- [ ] Projects page loads at /projects
- [ ] Status filter rail works:
  - [ ] New Requests (unclaimed)
  - [ ] Analyzing
  - [ ] Quoted
  - [ ] Paid/Active
  - [ ] In Progress
  - [ ] Submitted for QC
  - [ ] Completed
- [ ] Project cards display correctly
- [ ] Click opens project detail

### TC-S-006: Claim Project
- [ ] New request shows "Claim" button
- [ ] Claim button works
- [ ] Project status changes to "analyzing"
- [ ] Project moves to correct tab
- [ ] Supervisor assigned

### TC-S-007: Analyze & Quote
- [ ] Analyze button/section works
- [ ] Requirements analysis display
- [ ] Quote form appears
- [ ] User quote input works
- [ ] Doer payout input works
- [ ] Commission auto-calculates
- [ ] Submit quote button works
- [ ] Project status changes to "quoted"
- [ ] User gets notification

### TC-S-008: Assign Doer
- [ ] Paid projects show "Assign Doer" option
- [ ] Doer selection list loads
- [ ] Filter by skills works
- [ ] Select doer works
- [ ] Confirm assignment works
- [ ] Project status changes to "assigned"
- [ ] Doer gets notification

### TC-S-009: QC Review
- [ ] QC queue shows submitted projects
- [ ] Project opens with deliverables
- [ ] Review interface works
- [ ] Approve button works
- [ ] Reject with feedback works
- [ ] Revision requested status
- [ ] Approved moves to completed

### TC-S-010: Project Detail
- [ ] Project detail page loads
- [ ] All project info displays
- [ ] User info section
- [ ] Doer info section (if assigned)
- [ ] Timeline shows all events
- [ ] Files/deliverables section
- [ ] Chat access works

## 2.4 Chat/Messages

### TC-S-011: Chat List
- [ ] Chat/Messages page loads
- [ ] Conversations list displays
- [ ] Unread count badges
- [ ] Category tabs (User/Doer/All)
- [ ] Search works
- [ ] Click opens conversation

### TC-S-012: Chat Room
- [ ] Chat room loads
- [ ] Message history displays
- [ ] Supervisor messages on right
- [ ] Other party messages on left
- [ ] Send message works
- [ ] File attachment works
- [ ] Real-time updates

### TC-S-013: User Chat
- [ ] Chat with user works
- [ ] Messages sent to user
- [ ] User messages received

### TC-S-014: Doer Chat
- [ ] Chat with doer works
- [ ] Messages sent to doer
- [ ] Doer messages received

## 2.5 Doers Management

### TC-S-015: Doers List
- [ ] Doers page loads at /doers
- [ ] Doer cards display
- [ ] Search works
- [ ] Filter by skills
- [ ] Filter by status (active/inactive)
- [ ] Rating displays
- [ ] Click opens profile

### TC-S-016: Doer Profile
- [ ] Doer profile page loads
- [ ] Personal info displays
- [ ] Skills list
- [ ] Rating breakdown
- [ ] Completed projects count
- [ ] Project history
- [ ] Contact/message option

## 2.6 Users Management

### TC-S-017: Users List
- [ ] Users page loads at /users
- [ ] User cards display
- [ ] Search works
- [ ] Click opens profile

### TC-S-018: User Profile
- [ ] User profile page loads
- [ ] User info displays
- [ ] Project history with this user
- [ ] Contact option

## 2.7 Earnings

### TC-S-019: Earnings Page
- [ ] Earnings page loads at /earnings
- [ ] Total earnings display
- [ ] Period selector (week/month/year)
- [ ] Earnings chart displays
- [ ] Project breakdown
- [ ] Commission details

## 2.8 Settings

### TC-S-020: Settings
- [ ] Settings page loads
- [ ] Profile edit works
- [ ] Notification preferences
- [ ] Save works

---

# PART 3: DOER-WEB (Port 3002)

## 3.1 Authentication & Onboarding

### TC-D-001: Landing/Welcome
- [ ] Welcome page loads at localhost:3002
- [ ] Welcome carousel shows
- [ ] Slides navigation works
- [ ] Skip button works
- [ ] Complete redirects to login

### TC-D-002: Login
- [ ] Login page loads
- [ ] Google OAuth button works
- [ ] OAuth redirects correctly
- [ ] Session established
- [ ] Redirect based on profile state

### TC-D-003: Registration
- [ ] Registration initiates OAuth
- [ ] Profile created in database
- [ ] Redirect to profile-setup

### TC-D-004: Profile Setup
- [ ] Profile setup page loads
- [ ] Full name input
- [ ] Phone number input (validation)
- [ ] Qualification selection
- [ ] Experience level selection
- [ ] Skills multi-select
- [ ] Submit saves profile
- [ ] Redirect to activation

### TC-D-005: Training
- [ ] Training page loads
- [ ] Training modules list
- [ ] Video/content plays
- [ ] Progress tracking
- [ ] Completion enables next step
- [ ] Redirect to quiz

### TC-D-006: Quiz
- [ ] Quiz page loads
- [ ] Questions display
- [ ] Answer selection works
- [ ] Navigation between questions
- [ ] Submit calculates score
- [ ] Pass (80%+) continues
- [ ] Fail allows retry (max 3)
- [ ] Redirect to bank-details

### TC-D-007: Bank Details
- [ ] Bank details form loads
- [ ] Account holder name input
- [ ] Account number input (masked)
- [ ] IFSC code input (validated)
- [ ] UPI ID input (validated)
- [ ] Either bank or UPI required
- [ ] Submit saves details
- [ ] Activation completes
- [ ] Redirect to dashboard

## 3.2 Dashboard

### TC-D-008: Dashboard Overview
- [ ] Dashboard loads
- [ ] Stats cards display:
  - [ ] Active projects
  - [ ] Pending earnings
  - [ ] Completed projects
  - [ ] Average rating
- [ ] Sidebar navigation works

### TC-D-009: Task Pool (Open Pool)
- [ ] Open pool tab displays
- [ ] Available tasks load
- [ ] Task cards show:
  - [ ] Title
  - [ ] Subject
  - [ ] Price (doer_payout in INR)
  - [ ] Deadline
  - [ ] Priority indicator
- [ ] Accept task button works
- [ ] Task moves to assigned
- [ ] Notification sent

### TC-D-010: Assigned Tasks
- [ ] Assigned tasks tab displays
- [ ] User's assigned projects show
- [ ] Status indicators correct
- [ ] Click opens project detail

## 3.3 Projects

### TC-D-011: Projects Page
- [ ] Projects page loads at /projects
- [ ] Tab navigation:
  - [ ] Active Projects
  - [ ] Under Review
  - [ ] Completed
- [ ] Project cards display
- [ ] Search works
- [ ] Filter works

### TC-D-012: Active Projects
- [ ] Shows in-progress projects
- [ ] Shows assigned but not started
- [ ] Shows revision requested
- [ ] Deadline indicator
- [ ] Price in INR

### TC-D-013: Project Workspace
- [ ] Project detail page loads
- [ ] Project info displays:
  - [ ] Title, description
  - [ ] Requirements
  - [ ] Deadline
  - [ ] Doer payout amount
- [ ] Reference files downloadable
- [ ] Live document URL (if available)
- [ ] Chat panel works
- [ ] File upload works
- [ ] Submit for QC button

### TC-D-014: Submit Deliverables
- [ ] File upload interface
- [ ] Multiple files support
- [ ] Preview before submit
- [ ] Submit for QC works
- [ ] Status changes to "submitted_for_qc"
- [ ] Supervisor notified

### TC-D-015: Handle Revision
- [ ] Revision feedback displays
- [ ] Revision requirements clear
- [ ] Update deliverables works
- [ ] Resubmit for QC

### TC-D-016: Under Review
- [ ] Shows submitted projects
- [ ] QC status displays
- [ ] Feedback visible (if rejected)

### TC-D-017: Completed Projects
- [ ] Shows completed projects
- [ ] Earnings per project
- [ ] Total earnings summary
- [ ] Rating/review (if available)

## 3.4 Chat

### TC-D-018: Chat with Supervisor
- [ ] Chat panel in workspace
- [ ] Chat history displays
- [ ] Send message works
- [ ] Receive messages
- [ ] File attachment
- [ ] Real-time updates
- [ ] Timestamps correct

## 3.5 Profile & Earnings

### TC-D-019: Profile Page
- [ ] Profile page loads at /profile
- [ ] Personal info displays
- [ ] Skills display
- [ ] Rating breakdown
- [ ] Performance stats
- [ ] Edit profile works

### TC-D-020: Earnings Section
- [ ] Earnings display
- [ ] Wallet balance
- [ ] Transaction history
- [ ] Period selector
- [ ] Graph/chart displays

### TC-D-021: Request Payout
- [ ] Payout button works
- [ ] Available balance shows
- [ ] Amount input works
- [ ] Minimum validation (INR 500)
- [ ] Quick amount buttons
- [ ] Payment method (bank/UPI)
- [ ] Fee calculation
- [ ] Net amount displays
- [ ] Confirmation step
- [ ] Submit request works
- [ ] Success/error feedback

## 3.6 Resources

### TC-D-022: Resources Page
- [ ] Resources page loads
- [ ] AI Report Generator tool
- [ ] Citation Builder tool
- [ ] Format Templates
- [ ] Training center materials

## 3.7 Statistics

### TC-D-023: Statistics Page
- [ ] Statistics page loads
- [ ] Performance metrics
- [ ] Completion rate
- [ ] Avg turnaround time
- [ ] Quality scores
- [ ] Trend graphs

## 3.8 Settings

### TC-D-024: Settings Page
- [ ] Settings page loads
- [ ] Account settings
- [ ] Notification preferences
- [ ] Display preferences
- [ ] Settings persist

## 3.9 Support

### TC-D-025: Support Page
- [ ] Support page loads
- [ ] FAQ section
- [ ] FAQ accordion works
- [ ] Contact form
- [ ] Ticket submission

---

# PART 4: CROSS-PLATFORM INTEGRATION TESTS

## 4.1 Complete Project Workflow

### TC-INT-001: Full Workflow
1. [ ] User creates project
2. [ ] Supervisor sees in new requests
3. [ ] Supervisor claims project
4. [ ] Supervisor analyzes & sets quote
5. [ ] User receives notification
6. [ ] User views quote
7. [ ] User makes payment
8. [ ] Project enters task pool
9. [ ] Doer sees in available tasks
10. [ ] Doer accepts task
11. [ ] Supervisor notified
12. [ ] Doer works on project
13. [ ] Doer submits for QC
14. [ ] Supervisor reviews
15. [ ] Supervisor approves
16. [ ] User receives delivery
17. [ ] User marks complete
18. [ ] Doer earnings credited

## 4.2 Real-Time Messaging

### TC-INT-002: User-Supervisor Chat
- [ ] User sends message
- [ ] Supervisor receives in real-time
- [ ] Supervisor replies
- [ ] User receives reply
- [ ] Messages persist on refresh

### TC-INT-003: Supervisor-Doer Chat
- [ ] Supervisor sends message
- [ ] Doer receives in real-time
- [ ] Doer replies
- [ ] Supervisor receives reply
- [ ] Messages persist on refresh

## 4.3 Notifications

### TC-INT-004: Quote Notification
- [ ] Supervisor sets quote
- [ ] User gets notification
- [ ] Notification shows in bell
- [ ] Click navigates to project

### TC-INT-005: Assignment Notification
- [ ] Supervisor assigns doer
- [ ] Doer gets notification
- [ ] Doer sees in task pool

### TC-INT-006: QC Notification
- [ ] Doer submits for QC
- [ ] Supervisor gets notification
- [ ] After approval, user notified

## 4.4 Data Consistency

### TC-INT-007: Status Sync
- [ ] Status changes reflect across all apps
- [ ] Timestamps consistent
- [ ] User info consistent

### TC-INT-008: Financial Data
- [ ] user_quote matches user view
- [ ] doer_payout matches doer view
- [ ] Commission calculated correctly
- [ ] Earnings credited correctly

---

# BUG TRACKING

| Bug ID | App | Description | Severity | Status | Fix Applied |
|--------|-----|-------------|----------|--------|-------------|
| | | | | | |

---

# TEST EXECUTION LOG

## Session: 2026-02-04

### Test Results Summary
| App | Total Tests | Passed | Failed | Blocked |
|-----|-------------|--------|--------|---------|
| user-web | 0 | 0 | 0 | 0 |
| supervisor-web | 0 | 0 | 0 | 0 |
| doer-web | 0 | 0 | 0 | 0 |
| Integration | 0 | 0 | 0 | 0 |

