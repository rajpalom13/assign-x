# Comprehensive E2E Test Plan - AssignX Platform

## Test Date: 2026-02-04
## Tester: Claude Code

---

## User-Web Features

### 1. Authentication
- [ ] Login with magic link
- [ ] Signup (Student flow)
- [ ] Signup (Professional flow)
- [ ] Onboarding completion
- [ ] College verification

### 2. Home/Dashboard
- [ ] Dashboard loads correctly
- [ ] Stats display (active projects, completed, etc.)
- [ ] Quick actions work

### 3. Projects
- [ ] Projects list displays
- [ ] Create new project
- [ ] Project detail view
- [ ] Project timeline
- [ ] Project status updates
- [ ] File uploads

### 4. Wallet
- [ ] Wallet balance displays
- [ ] Transaction history
- [ ] Add funds (if applicable)

### 5. Experts
- [ ] Experts list displays
- [ ] Expert detail view
- [ ] Book expert appointment
- [ ] Expert availability

### 6. Campus Connect
- [ ] Posts list displays
- [ ] Create new post
- [ ] View post detail
- [ ] Like/Comment on posts

### 7. Marketplace
- [ ] Marketplace items display
- [ ] Item detail view

### 8. Chat/Messaging
- [ ] Send message to supervisor
- [ ] Receive message from supervisor
- [ ] Real-time updates

### 9. Profile
- [ ] View profile
- [ ] Edit profile

### 10. Settings
- [ ] Notification toggles persist
- [ ] Privacy settings persist
- [ ] Appearance settings work

### 11. Support
- [ ] Support page loads
- [ ] Submit support request

---

## Supervisor-Web Features

### 1. Authentication
- [ ] Login
- [ ] Register
- [ ] Onboarding
- [ ] Activation quiz

### 2. Dashboard
- [ ] Stats display correctly
- [ ] Quick actions work
- [ ] Recent activity shows

### 3. Projects
- [ ] Projects list (by status)
- [ ] New requests (unclaimed)
- [ ] Claim project
- [ ] Set quote for project
- [ ] Assign doer to project
- [ ] Project detail view
- [ ] QC review (approve/reject)

### 4. Doers
- [ ] Doers list displays
- [ ] Doer detail/profile
- [ ] Search doers
- [ ] Filter by status/skills

### 5. Users
- [ ] Users list displays
- [ ] User detail view

### 6. Chat/Messages
- [ ] Chat rooms list
- [ ] Send message to user
- [ ] Receive message from user
- [ ] Real-time updates

### 7. Earnings
- [ ] Earnings summary
- [ ] Transaction history
- [ ] Payout requests

### 8. Profile
- [ ] View profile
- [ ] Edit profile

### 9. Settings
- [ ] Settings persist

### 10. Resources
- [ ] Resources page loads
- [ ] View/download resources

### 11. Notifications
- [ ] Notifications list
- [ ] Mark as read

---

## Cross-Platform Integration Tests

### 1. Two-Way Messaging
- [ ] User sends message → Supervisor receives
- [ ] Supervisor sends message → User receives
- [ ] Real-time sync

### 2. Project Workflow
- [ ] User creates project → Supervisor sees in new requests
- [ ] Supervisor claims → Status updates
- [ ] Supervisor quotes → User sees quote
- [ ] User pays → Status updates
- [ ] Supervisor assigns doer → Progress tracking
- [ ] Project completion → QC flow

### 3. Quote Flow
- [ ] Supervisor sets quote
- [ ] User sees quote notification
- [ ] User can pay quoted amount

---

## Test Results

| Feature | Status | Notes |
|---------|--------|-------|
| | | |

---

## Bugs Found

| Bug ID | Description | Severity | Status |
|--------|-------------|----------|--------|
| | | | |

