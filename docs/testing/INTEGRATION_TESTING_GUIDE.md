# AssignX Cross-Platform Integration Testing Guide

## Overview
**Purpose**: Test end-to-end workflows that span multiple platforms (User, Supervisor, Doer)
**Platforms**:
- User: http://localhost:3000
- Doer: http://localhost:3001
- Supervisor: http://localhost:3002 (or Mobile App)

---

## Table of Contents
1. [Pre-requisites](#1-pre-requisites)
2. [Project Submission to Quote Flow](#2-project-submission-to-quote-flow)
3. [Payment to Assignment Flow](#3-payment-to-assignment-flow)
4. [Work Completion to Delivery Flow](#4-work-completion-to-delivery-flow)
5. [Revision Request Flow](#5-revision-request-flow)
6. [Three-Party Chat Flow](#6-three-party-chat-flow)
7. [Payment Distribution Flow](#7-payment-distribution-flow)
8. [Notification Sync Flow](#8-notification-sync-flow)
9. [Blacklist Enforcement Flow](#9-blacklist-enforcement-flow)
10. [Real-time Sync Testing](#10-real-time-sync-testing)

---

## 1. Pre-requisites

### Environment Setup
- [ ] All three platforms running simultaneously
- [ ] Shared Supabase backend connected
- [ ] Test accounts created on all platforms
- [ ] Real-time subscriptions working
- [ ] Push notifications configured

### Test Account Matrix
| Role | Account | Platform |
|------|---------|----------|
| User (Student) | user1@test.com | localhost:3000 |
| User (Professional) | user2@test.com | localhost:3000 |
| Supervisor | supervisor1@test.com | localhost:3002 |
| Doer 1 | doer1@test.com | localhost:3001 |
| Doer 2 | doer2@test.com | localhost:3001 |

### Testing Tools
- Multiple browser windows or incognito sessions
- Network monitoring (DevTools)
- Database viewer (Supabase Dashboard)

---

## 2. Project Submission to Quote Flow

### Flow: User → Supervisor

```
USER submits project → SUPERVISOR receives → SUPERVISOR sets quote → USER receives quote
```

### Test Steps

#### Step 1: User Submits Project
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 2.1.1 | Open `http://localhost:3000/projects/new` | New project form loads | |
| USER | 2.1.2 | Fill all project details | Form completed | |
| USER | 2.1.3 | Upload reference files | Files uploaded | |
| USER | 2.1.4 | Set deadline (3 days from now) | Deadline selected | |
| USER | 2.1.5 | Click "Submit Project" | Success message, project number shown (e.g., AX-12345) | |
| USER | 2.1.6 | Note project number | Record: _____________ | |

#### Step 2: Supervisor Receives Project
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 2.2.1 | Open dashboard | Dashboard loads | |
| SUPERVISOR | 2.2.2 | Check notification | "New project received" notification | |
| SUPERVISOR | 2.2.3 | View "Pending Quote" count | Count incremented by 1 | |
| SUPERVISOR | 2.2.4 | Navigate to Projects | Project list loads | |
| SUPERVISOR | 2.2.5 | Find project AX-12345 | Project card visible in "Pending" tab | |
| SUPERVISOR | 2.2.6 | Verify project details match | All user-entered details correct | |
| SUPERVISOR | 2.2.7 | Download reference files | Files match uploaded files | |

#### Step 3: Supervisor Sets Quote
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 2.3.1 | Click "Set Quote" on project | Quote form opens | |
| SUPERVISOR | 2.3.2 | Enter quote amount (e.g., ₹2500) | Amount entered | |
| SUPERVISOR | 2.3.3 | Add quote notes | Notes entered | |
| SUPERVISOR | 2.3.4 | Click "Send Quote" | Quote submitted | |
| SUPERVISOR | 2.3.5 | Verify project status | Status: "quoted" | |

#### Step 4: User Receives Quote
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 2.4.1 | Check notifications (without refresh) | Real-time: "Quote received" | |
| USER | 2.4.2 | Check email/WhatsApp | Quote notification message received | |
| USER | 2.4.3 | Navigate to project detail | Project shows quote amount | |
| USER | 2.4.4 | Verify quote breakdown | Base price + urgency fee visible | |
| USER | 2.4.5 | Verify "Pay Now" button | Button enabled | |

### Verification Checklist
- [ ] Project created in database with correct status
- [ ] Supervisor assigned automatically (or manually)
- [ ] Quote record created in `project_quotes` table
- [ ] User notification sent via all channels
- [ ] Project status history logged

---

## 3. Payment to Assignment Flow

### Flow: User → Supervisor → Doer

```
USER pays → SUPERVISOR receives → SUPERVISOR assigns doer → DOER receives task
```

### Test Steps

#### Step 1: User Makes Payment
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 3.1.1 | Open quoted project | Project detail loads | |
| USER | 3.1.2 | Click "Pay Now" | Payment modal opens | |
| USER | 3.1.3 | Select payment method (Card) | Razorpay opens | |
| USER | 3.1.4 | Complete payment (test card) | Payment successful | |
| USER | 3.1.5 | Verify success message | "Payment confirmed" | |
| USER | 3.1.6 | Verify project status | Status: "paid" | |

#### Step 2: Supervisor Receives Paid Project
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 3.2.1 | Check notifications | "Payment received for AX-12345" | |
| SUPERVISOR | 3.2.2 | View project | Status: "paid", amount confirmed | |
| SUPERVISOR | 3.2.3 | Verify "Assign Doer" button | Button now enabled | |

#### Step 3: Supervisor Assigns Doer
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 3.3.1 | Click "Assign Doer" | Doer selection modal opens | |
| SUPERVISOR | 3.3.2 | View available doers | List of matching doers | |
| SUPERVISOR | 3.3.3 | Check doer metrics | Rating, success rate, availability | |
| SUPERVISOR | 3.3.4 | Select doer1@test.com | Doer highlighted | |
| SUPERVISOR | 3.3.5 | Confirm assignment | Assignment confirmed | |
| SUPERVISOR | 3.3.6 | Verify project status | Status: "assigned" | |

#### Step 4: Doer Receives Task
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 3.4.1 | Check notifications | "New task assigned" notification | |
| DOER | 3.4.2 | View dashboard | Project appears in "My Projects" | |
| DOER | 3.4.3 | Open project | Full project details visible | |
| DOER | 3.4.4 | Verify deadline | Deadline matches user's request | |
| DOER | 3.4.5 | Verify payout amount | Doer payout amount correct | |
| DOER | 3.4.6 | Download reference files | Files accessible | |

### Verification Checklist
- [ ] Payment recorded in `payments` table
- [ ] Wallet transaction created (if wallet used)
- [ ] Assignment recorded in `project_assignments`
- [ ] Doer notification sent
- [ ] Project status history updated

---

## 4. Work Completion to Delivery Flow

### Flow: Doer → Supervisor → User

```
DOER submits work → SUPERVISOR QC review → SUPERVISOR approves → USER receives delivery
```

### Test Steps

#### Step 1: Doer Submits Work
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 4.1.1 | Open assigned project workspace | Workspace loads | |
| DOER | 4.1.2 | Update progress to 100% | Progress bar full | |
| DOER | 4.1.3 | Upload completed work file | File uploaded | |
| DOER | 4.1.4 | Add submission notes | Notes entered | |
| DOER | 4.1.5 | Click "Submit for Review" | Confirmation dialog | |
| DOER | 4.1.6 | Confirm submission | Work submitted | |
| DOER | 4.1.7 | Verify project status | Status: "submitted_for_qc" | |

#### Step 2: Supervisor Receives for QC
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 4.2.1 | Check notifications | "Work submitted for QC" | |
| SUPERVISOR | 4.2.2 | View "Pending QC" projects | Project in list | |
| SUPERVISOR | 4.2.3 | Open project | QC review section visible | |
| SUPERVISOR | 4.2.4 | Download deliverable | File downloads correctly | |
| SUPERVISOR | 4.2.5 | View quality reports | AI/Plagiarism scores visible | |

#### Step 3: Supervisor Approves Work
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 4.3.1 | Review deliverable quality | Content acceptable | |
| SUPERVISOR | 4.3.2 | Click "Approve" | Confirmation dialog | |
| SUPERVISOR | 4.3.3 | Add approval notes (optional) | Notes entered | |
| SUPERVISOR | 4.3.4 | Confirm approval | Work approved | |
| SUPERVISOR | 4.3.5 | Verify status | Status: "qc_approved" | |

#### Step 4: Supervisor Delivers to Client
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 4.4.1 | Click "Deliver to Client" | Confirmation dialog | |
| SUPERVISOR | 4.4.2 | Review deliverables | All files listed | |
| SUPERVISOR | 4.4.3 | Confirm delivery | Delivery sent | |
| SUPERVISOR | 4.4.4 | Verify status | Status: "delivered" | |

#### Step 5: User Receives Delivery
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 4.5.1 | Check notifications | "Your project is ready!" | |
| USER | 4.5.2 | Check email/WhatsApp | Delivery notification received | |
| USER | 4.5.3 | Open project | Deliverables section visible | |
| USER | 4.5.4 | Download deliverable files | All files download correctly | |
| USER | 4.5.5 | View quality reports | AI/Plagiarism badges visible | |
| USER | 4.5.6 | Verify auto-approval timer | 72-hour countdown started | |
| USER | 4.5.7 | Click "Approve" | Project completed | |

### Verification Checklist
- [ ] Deliverable files stored correctly
- [ ] QC review recorded
- [ ] Delivery timestamp logged
- [ ] User notification sent via all channels
- [ ] Auto-approval timer started
- [ ] Doer payout queued (after approval)

---

## 5. Revision Request Flow

### Flow: User → Supervisor → Doer → Supervisor → User

```
USER requests revision → SUPERVISOR forwards → DOER revises → SUPERVISOR re-reviews → USER receives
```

### Test Steps

#### Step 1: User Requests Revision
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 5.1.1 | Open delivered project | Project detail loads | |
| USER | 5.1.2 | Click "Request Revision" | Revision form opens | |
| USER | 5.1.3 | Enter revision notes | Detailed feedback entered | |
| USER | 5.1.4 | Upload reference file (optional) | File uploaded | |
| USER | 5.1.5 | Submit revision request | Request submitted | |
| USER | 5.1.6 | Verify status | Status: "revision_requested" | |
| USER | 5.1.7 | Verify timer stopped | Auto-approval timer reset | |

#### Step 2: Supervisor Receives Revision Request
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 5.2.1 | Check notifications | "Revision requested" notification | |
| SUPERVISOR | 5.2.2 | View project | Revision details visible | |
| SUPERVISOR | 5.2.3 | Review user's feedback | All notes displayed | |
| SUPERVISOR | 5.2.4 | Forward to doer | Revision forwarded | |

#### Step 3: Doer Receives Revision Request
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 5.3.1 | Check notifications | "Revision requested" notification | |
| DOER | 5.3.2 | Open project | Revision banner prominently displayed | |
| DOER | 5.3.3 | View revision notes | User's feedback visible | |
| DOER | 5.3.4 | Click "Start Revision" | Workspace opens in revision mode | |

#### Step 4: Doer Completes Revision
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 5.4.1 | Make requested changes | Work updated | |
| DOER | 5.4.2 | Upload revised file | New file uploaded | |
| DOER | 5.4.3 | Add revision response | Notes explaining changes | |
| DOER | 5.4.4 | Submit revision | Revision submitted | |
| DOER | 5.4.5 | Verify status | Status: "submitted_for_qc" again | |

#### Step 5: Supervisor Re-Reviews
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 5.5.1 | Check notifications | "Revision submitted" | |
| SUPERVISOR | 5.5.2 | Review revised work | Changes verified | |
| SUPERVISOR | 5.5.3 | Approve revision | Revision approved | |
| SUPERVISOR | 5.5.4 | Redeliver to client | Redelivery sent | |

#### Step 6: User Receives Revised Work
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 5.6.1 | Check notifications | "Revision complete" notification | |
| USER | 5.6.2 | View project | Updated deliverables visible | |
| USER | 5.6.3 | Download revised file | Revised version downloads | |
| USER | 5.6.4 | Verify new timer | New 72-hour timer started | |
| USER | 5.6.5 | Approve project | Project completed | |

### Verification Checklist
- [ ] Revision record created in `project_revisions`
- [ ] Original and revised files preserved
- [ ] All parties notified at each step
- [ ] New auto-approval timer started after redelivery
- [ ] Revision count tracked in project

---

## 6. Three-Party Chat Flow

### Flow: User ↔ Supervisor ↔ Doer

```
USER sends message → SUPERVISOR receives → SUPERVISOR responds
USER sends message → DOER receives (if in shared room)
DOER sends message → SUPERVISOR receives → USER may see (depending on room type)
```

### Test Steps

#### 6.1 User-Supervisor Chat
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 6.1.1 | Open project chat | Chat window opens | |
| USER | 6.1.2 | Send message "Hello" | Message sent | |
| SUPERVISOR | 6.1.3 | Check chat (same project) | Message received in real-time | |
| SUPERVISOR | 6.1.4 | Reply "Hi, how can I help?" | Reply sent | |
| USER | 6.1.5 | Verify reply received | Reply appears without refresh | |

#### 6.2 Supervisor-Doer Chat
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 6.2.1 | Open doer chat for project | Chat window opens | |
| SUPERVISOR | 6.2.2 | Send message "Please update progress" | Message sent | |
| DOER | 6.2.3 | Check project chat | Message received | |
| DOER | 6.2.4 | Reply "Working on it" | Reply sent | |
| SUPERVISOR | 6.2.5 | Verify reply | Reply appears | |

#### 6.3 Message Visibility Rules
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 6.3.1 | Send message in User-Supervisor room | Message sent | |
| DOER | 6.3.2 | Check if message visible | Should NOT see User messages (different room) | |
| SUPERVISOR | 6.3.3 | Can see both chat rooms | Both rooms accessible | |

#### 6.4 File Sharing in Chat
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 6.4.1 | Send file in chat | File uploaded and sent | |
| SUPERVISOR | 6.4.2 | Receive file | File visible in chat | |
| SUPERVISOR | 6.4.3 | Download file | File downloads correctly | |
| SUPERVISOR | 6.4.4 | Forward to doer (via doer chat) | File shared in doer chat | |
| DOER | 6.4.5 | Receive forwarded file | File accessible | |

### Verification Checklist
- [ ] Messages stored in `chat_messages` table
- [ ] Real-time updates working (Supabase subscriptions)
- [ ] Room type isolation working
- [ ] Read receipts tracked
- [ ] Files stored in Supabase storage

---

## 7. Payment Distribution Flow

### Flow: User Payment → Platform → Doer/Supervisor Payout

```
USER pays ₹2500 → Platform receives → Doer gets ₹1800 → Supervisor gets ₹400 → Platform keeps ₹300
```

### Test Steps

#### 7.1 Verify Payment Recording
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 7.1.1 | Complete payment | Payment successful | |
| DATABASE | 7.1.2 | Check `payments` table | Payment record with full amount | |
| DATABASE | 7.1.3 | Verify payment status | Status: "completed" | |

#### 7.2 Verify Payout Calculation
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DATABASE | 7.2.1 | Check `projects` table | `user_quote` = ₹2500 | |
| DATABASE | 7.2.2 | Verify `doer_payout` | Correct amount (e.g., ₹1800) | |
| DATABASE | 7.2.3 | Verify `supervisor_commission` | Correct amount (e.g., ₹400) | |
| DATABASE | 7.2.4 | Verify `platform_fee` | Correct amount (e.g., ₹300) | |
| DATABASE | 7.2.5 | Verify total equals payment | 1800 + 400 + 300 = 2500 ✓ | |

#### 7.3 Verify Wallet Credits (After Approval)
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 7.3.1 | Approve completed project | Project approved | |
| DOER | 7.3.2 | Check wallet | Balance increased by ₹1800 | |
| DOER | 7.3.3 | Check transaction history | "Project completion" credit | |
| SUPERVISOR | 7.3.4 | Check wallet | Balance increased by ₹400 | |
| SUPERVISOR | 7.3.5 | Check transaction history | "Commission" credit | |

#### 7.4 Verify Payout Request
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 7.4.1 | Request payout of ₹1800 | Request submitted | |
| DATABASE | 7.4.2 | Check `payout_requests` | Request created, status: "pending" | |
| DOER | 7.4.3 | Verify available balance | Reduced to ₹0 (pending) | |
| ADMIN | 7.4.4 | Approve payout | Payout processed | |
| DOER | 7.4.5 | Check transaction history | "Payout" debit recorded | |

### Verification Checklist
- [ ] Payment amount matches quote
- [ ] Distribution math is correct
- [ ] Wallet balances updated correctly
- [ ] Transaction history accurate
- [ ] Payout requests created and processed

---

## 8. Notification Sync Flow

### Test Steps

#### 8.1 Push Notification Sync
| Event | User Gets | Supervisor Gets | Doer Gets | Status |
|-------|-----------|-----------------|-----------|--------|
| Project submitted | "Submitted" | "New project" | - | |
| Quote set | "Quote received" | - | - | |
| Payment made | "Confirmed" | "Payment received" | - | |
| Doer assigned | - | - | "New task" | |
| Work submitted | - | "Submitted for QC" | - | |
| QC approved | - | - | "Work approved" | |
| Delivered | "Ready for review" | - | - | |
| Revision requested | - | "Revision requested" | "Revision needed" | |
| Project completed | "Completed" | "Project done" | "Payout queued" | |

#### 8.2 In-App Notification Sync
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| ALL | 8.2.1 | Keep all platforms open | All loaded | |
| USER | 8.2.2 | Trigger action (submit project) | - | |
| SUPERVISOR | 8.2.3 | Check notification bell (without refresh) | Badge appears, notification in list | |
| SUPERVISOR | 8.2.4 | Click notification | Navigates to project | |

#### 8.3 Email/WhatsApp Sync
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 8.3.1 | Enable WhatsApp notifications | Opt-in confirmed | |
| USER | 8.3.2 | Submit project | - | |
| USER | 8.3.3 | Check WhatsApp | "Project submitted" message | |
| SUPERVISOR | 8.3.4 | Set quote | - | |
| USER | 8.3.5 | Check WhatsApp | "Quote received: ₹XXX" message | |

### Verification Checklist
- [ ] All notification types triggered correctly
- [ ] Real-time delivery working
- [ ] Email notifications sent
- [ ] WhatsApp integration working
- [ ] Click navigation working

---

## 9. Blacklist Enforcement Flow

### Flow: Supervisor Blacklists Doer → Doer Can't See Supervisor's Tasks

### Test Steps

#### 9.1 Supervisor Blacklists Doer
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 9.1.1 | Navigate to Doers list | Doers displayed | |
| SUPERVISOR | 9.1.2 | Find doer1@test.com | Doer card visible | |
| SUPERVISOR | 9.1.3 | Click "Blacklist" | Blacklist dialog opens | |
| SUPERVISOR | 9.1.4 | Enter reason | Reason entered | |
| SUPERVISOR | 9.1.5 | Confirm blacklist | Doer blacklisted | |

#### 9.2 Verify Blacklist Enforcement
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 9.2.1 | Check notification | "Removed from supervisor pool" | |
| SUPERVISOR | 9.2.2 | Create new project (paid) | Project ready for assignment | |
| SUPERVISOR | 9.2.3 | Open assignment modal | Doer list opens | |
| SUPERVISOR | 9.2.4 | Check for blacklisted doer | doer1@test.com NOT in list | |
| DOER | 9.2.5 | (As blacklisted doer) Check Open Pool | Supervisor's projects NOT visible | |

#### 9.3 Verify Unblacklist
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| SUPERVISOR | 9.3.1 | Go to Blacklist management | Blacklist page opens | |
| SUPERVISOR | 9.3.2 | Find doer1@test.com | In blacklist | |
| SUPERVISOR | 9.3.3 | Click "Remove from Blacklist" | Confirmation dialog | |
| SUPERVISOR | 9.3.4 | Confirm removal | Doer unblacklisted | |
| DOER | 9.3.5 | Check Open Pool | Supervisor's projects visible again | |

### Verification Checklist
- [ ] Blacklist record created in `supervisor_blacklisted_doers`
- [ ] Doer excluded from assignment options
- [ ] Doer excluded from Open Pool
- [ ] Unblacklist restores access

---

## 10. Real-time Sync Testing

### Test Steps

#### 10.1 Progress Sync
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 10.1.1 | Open project workspace | Workspace loads | |
| DOER | 10.1.2 | Update progress to 50% | Progress updated | |
| SUPERVISOR | 10.1.3 | View same project (different browser) | Progress shows 50% | |
| USER | 10.1.4 | View project detail | Progress shows 50% | |
| DOER | 10.1.5 | Update progress to 75% | Progress updated | |
| SUPERVISOR | 10.1.6 | Verify real-time update | Progress changes to 75% without refresh | |
| USER | 10.1.7 | Verify real-time update | Progress changes to 75% without refresh | |

#### 10.2 Status Sync
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| DOER | 10.2.1 | Submit work | Status changes to "submitted_for_qc" | |
| SUPERVISOR | 10.2.2 | View project | Status reflects "Submitted for QC" | |
| USER | 10.2.3 | View project | Status shows "Under Review" | |
| SUPERVISOR | 10.2.4 | Approve and deliver | Status changes to "delivered" | |
| USER | 10.2.5 | Verify status update | Status shows "Delivered" | |
| DOER | 10.2.6 | Verify status update | Status shows "Delivered" | |

#### 10.3 Chat Sync
| Platform | Step | Action | Expected Result | Status |
|----------|------|--------|-----------------|--------|
| USER | 10.3.1 | Open chat | Chat loads | |
| SUPERVISOR | 10.3.2 | Open same chat room | Chat loads | |
| USER | 10.3.3 | Send message | Message sent | |
| SUPERVISOR | 10.3.4 | Verify instant appearance | Message appears < 1 second | |
| SUPERVISOR | 10.3.5 | Reply | Reply sent | |
| USER | 10.3.6 | Verify instant appearance | Reply appears < 1 second | |

### Verification Checklist
- [ ] Supabase real-time subscriptions active
- [ ] Updates appear without page refresh
- [ ] All platforms receive same data
- [ ] No data inconsistencies

---

## Test Summary Report Template

```
=== INTEGRATION TEST REPORT ===
Date: __________
Tester: __________
Environment: __________

FLOW RESULTS:
1. Project Submission → Quote: [ PASS / FAIL ]
2. Payment → Assignment: [ PASS / FAIL ]
3. Work → Delivery: [ PASS / FAIL ]
4. Revision Flow: [ PASS / FAIL ]
5. Three-Party Chat: [ PASS / FAIL ]
6. Payment Distribution: [ PASS / FAIL ]
7. Notification Sync: [ PASS / FAIL ]
8. Blacklist Enforcement: [ PASS / FAIL ]
9. Real-time Sync: [ PASS / FAIL ]

ISSUES FOUND:
1. __________
2. __________
3. __________

OVERALL STATUS: [ PASS / FAIL ]
```

---

*Document Version: 1.0*
*Last Updated: [Date]*
*Covers: User, Supervisor, Doer Platform Integration*
