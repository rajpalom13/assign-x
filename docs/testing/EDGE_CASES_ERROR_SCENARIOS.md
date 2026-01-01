# AssignX Edge Cases & Error Scenarios Testing Guide

## Overview
**Purpose**: Test error handling, edge cases, and failure scenarios across all platforms
**Platforms**: User, Supervisor, Doer

---

## Table of Contents
1. [Authentication Edge Cases](#1-authentication-edge-cases)
2. [Payment Edge Cases](#2-payment-edge-cases)
3. [File Upload Edge Cases](#3-file-upload-edge-cases)
4. [Chat Edge Cases](#4-chat-edge-cases)
5. [Activation Edge Cases](#5-activation-edge-cases)
6. [Project Edge Cases](#6-project-edge-cases)
7. [Network & Connectivity Edge Cases](#7-network--connectivity-edge-cases)
8. [Session & Security Edge Cases](#8-session--security-edge-cases)
9. [Data Validation Edge Cases](#9-data-validation-edge-cases)
10. [Payout Edge Cases](#10-payout-edge-cases)
11. [Real-time Edge Cases](#11-real-time-edge-cases)
12. [System & Performance Edge Cases](#12-system--performance-edge-cases)

---

## 1. Authentication Edge Cases

### 1.1 OAuth Errors
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| AUTH-001 | OAuth popup blocked | 1. Enable popup blocker 2. Click "Sign in with Google" | Error message: "Please allow popups" | |
| AUTH-002 | OAuth cancelled by user | 1. Click Google sign-in 2. Close popup without completing | App handles gracefully, stays on login | |
| AUTH-003 | OAuth network failure | 1. Disconnect network during OAuth 2. Complete OAuth | Error: "Network error, please try again" | |
| AUTH-004 | Google account not verified | 1. Sign in with unverified Google account | Error or prompt to verify email | |
| AUTH-005 | Multiple Google accounts | 1. Have multiple Google accounts 2. Sign in | Account picker shown correctly | |

### 1.2 Token Expiration
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| AUTH-006 | Access token expires during session | 1. Login 2. Wait for token expiry 3. Make API call | Token refreshed automatically OR redirect to login | |
| AUTH-007 | Refresh token expired | 1. Login 2. Clear refresh token 3. Make API call | Redirect to login with message | |
| AUTH-008 | Concurrent session token conflict | 1. Login on browser A 2. Login on browser B 3. Act on both | Both sessions work OR one invalidated with notice | |

### 1.3 Session Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| AUTH-009 | Session timeout | 1. Login 2. Leave idle for 30+ minutes 3. Try action | Session expired message, redirect to login | |
| AUTH-010 | Force logout from another device | 1. Login on device A 2. "Logout all devices" from device B | Device A receives logout, redirected | |
| AUTH-011 | Browser back after logout | 1. Logout 2. Press browser back | Cannot access protected routes | |
| AUTH-012 | Deep link while logged out | 1. Logout 2. Navigate to /project/123 directly | Redirect to login, then back to /project/123 | |

### 1.4 Account Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| AUTH-013 | Deleted account login attempt | 1. Delete account 2. Try logging in again | Account not found or option to create new | |
| AUTH-014 | Blocked account login | 1. Account blocked by admin 2. Try logging in | Error: "Account suspended" with reason | |
| AUTH-015 | Email already registered (different OAuth) | 1. Register with Google 2. Try Apple Sign-in same email | Prompt to use existing login method | |

---

## 2. Payment Edge Cases

### 2.1 Payment Failures
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-001 | Card declined | 1. Initiate payment 2. Use test declined card | Error: "Card declined", retry option | |
| PAY-002 | Insufficient funds | 1. Initiate payment 2. Use card with low balance | Error: "Insufficient funds" | |
| PAY-003 | Payment timeout | 1. Start payment 2. Wait 5 minutes on Razorpay | Timeout error, payment not processed | |
| PAY-004 | Network failure during payment | 1. Start payment 2. Disconnect network | Error handled, no duplicate charge | |
| PAY-005 | Bank OTP timeout | 1. Start payment 2. Don't enter OTP | OTP expired error | |
| PAY-006 | Bank OTP wrong 3 times | 1. Start payment 2. Enter wrong OTP 3x | Card blocked message | |

### 2.2 Double Payment Prevention
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-007 | Double click pay button | 1. Click "Pay" rapidly twice | Only one payment processed | |
| PAY-008 | Back button after payment initiated | 1. Start payment 2. Press back 3. Pay again | No duplicate payment | |
| PAY-009 | Payment success but app crashed | 1. Complete payment 2. Kill app before confirmation | Payment recovered on next login | |

### 2.3 Webhook Failures
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-010 | Razorpay webhook delayed | 1. Complete payment 2. Webhook arrives late | Payment status eventually updates | |
| PAY-011 | Razorpay webhook failure | 1. Complete payment 2. Webhook fails | Manual sync or retry mechanism | |
| PAY-012 | Mismatched webhook signature | 1. Tampered webhook received | Webhook rejected, logged for review | |

### 2.4 Wallet Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-013 | Wallet balance insufficient | 1. Try paying ₹500 with ₹200 balance | Prompt to add funds or use card | |
| PAY-014 | Concurrent wallet transactions | 1. Two tabs pay from same wallet simultaneously | Only one succeeds, other fails | |
| PAY-015 | Wallet top-up during payment | 1. Start payment 2. Top-up wallet in another tab 3. Complete | Either old or new balance used, no errors | |

### 2.5 Refund Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-016 | Refund request for cancelled project | 1. Cancel project 2. Request refund | Refund processed correctly | |
| PAY-017 | Partial refund | 1. Complete partial work 2. Cancel 3. Refund | Partial amount refunded | |
| PAY-018 | Refund to expired card | 1. Pay with card 2. Card expires 3. Refund | Refund to original method or alternative | |

---

## 3. File Upload Edge Cases

### 3.1 File Size & Type
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| FILE-001 | File exceeds size limit (>25MB) | 1. Upload 30MB file | Error: "File too large (max 25MB)" | |
| FILE-002 | Unsupported file type | 1. Upload .exe file | Error: "File type not supported" | |
| FILE-003 | Empty file (0 bytes) | 1. Upload empty file | Error: "File is empty" | |
| FILE-004 | File with special characters in name | 1. Upload "file@#$%.pdf" | File renamed or handled correctly | |
| FILE-005 | File with very long name | 1. Upload file with 200+ char name | Name truncated, file uploads | |

### 3.2 Upload Interruptions
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| FILE-006 | Network lost during upload | 1. Start uploading large file 2. Disconnect network | Error message, partial upload cleaned up | |
| FILE-007 | Browser closed during upload | 1. Start upload 2. Close browser | Upload cancelled, no orphan files | |
| FILE-008 | Page navigation during upload | 1. Start upload 2. Navigate away | Warning dialog, or background upload | |
| FILE-009 | Upload timeout | 1. Upload on very slow connection | Timeout error after reasonable wait | |

### 3.3 Multiple File Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| FILE-010 | Upload more than max files | 1. Try uploading 15 files (limit 10) | Error: "Maximum 10 files allowed" | |
| FILE-011 | Duplicate file names | 1. Upload file.pdf 2. Upload another file.pdf | Renamed or replaced with confirmation | |
| FILE-012 | Total upload size exceeded | 1. Upload 5 x 20MB files | Total size limit error (e.g., 50MB total) | |

### 3.4 Corrupt Files
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| FILE-013 | Corrupted PDF | 1. Upload corrupted PDF | Upload succeeds (validation on download) | |
| FILE-014 | Virus-infected file | 1. Upload file with virus signature | File rejected by AV scan (if enabled) | |
| FILE-015 | Wrong extension (pdf.exe → pdf.pdf) | 1. Upload disguised file | Detected and rejected (if MIME check enabled) | |

---

## 4. Chat Edge Cases

### 4.1 Message Delivery
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| CHAT-001 | Send message while offline | 1. Open chat 2. Go offline 3. Send message | Queued, sent when online OR error shown | |
| CHAT-002 | Very long message (>5000 chars) | 1. Type 6000 character message 2. Send | Character limit enforced or message sent | |
| CHAT-003 | Rapid message sending | 1. Send 50 messages in 10 seconds | Rate limiting applied OR all sent | |
| CHAT-004 | Empty message | 1. Try sending empty message | Send button disabled | |
| CHAT-005 | Message with only whitespace | 1. Send "    " | Treated as empty, not sent | |

### 4.2 Contact Detection
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| CHAT-006 | Phone number in message | 1. Send "Call me at 9876543210" | Message flagged/blocked | |
| CHAT-007 | Email in message | 1. Send "Email me: test@gmail.com" | Message flagged/blocked | |
| CHAT-008 | Obfuscated contact info | 1. Send "Call me at nine-eight-seven-six..." | Should be detected (advanced) | |
| CHAT-009 | Phone in image | 1. Upload image with phone number | Not detected (image analysis not implemented) | |

### 4.3 Chat Room Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| CHAT-010 | Message to suspended chat | 1. (Supervisor suspends chat) 2. Try sending | Error: "Chat is suspended" | |
| CHAT-011 | Access deleted project chat | 1. Project deleted 2. Try opening chat | Chat archived or not accessible | |
| CHAT-012 | Chat room doesn't exist | 1. Navigate to invalid chat room ID | 404 or error handling | |

### 4.4 File Attachments in Chat
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| CHAT-013 | Large file attachment | 1. Send 30MB file in chat | Size limit error | |
| CHAT-014 | Many attachments at once | 1. Attach 10 files and send | Limit enforced or all sent | |
| CHAT-015 | Attachment upload fails | 1. Upload file 2. Network fails | Error, message not sent | |

---

## 5. Activation Edge Cases

### 5.1 Training Module Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| ACT-001 | Video won't play | 1. Open training video 2. Video fails to load | Error message, retry option | |
| ACT-002 | Video buffering timeout | 1. Video buffers forever on slow connection | Timeout error, offline alternative | |
| ACT-003 | Skip video attempt | 1. Try to jump to end of video | Prevented OR progress not counted | |
| ACT-004 | Video playback interrupted | 1. Watch video halfway 2. Network fails | Progress saved, resume from where left | |
| ACT-005 | Complete video on different device | 1. Start on mobile 2. Complete on web | Progress synced across devices | |

### 5.2 Quiz Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| ACT-006 | Quiz timer expires | 1. Start quiz 2. Don't complete within time | Auto-submit, score calculated | |
| ACT-007 | Network failure during quiz | 1. Take quiz 2. Network fails 3. Restore | Answers saved, can resume | |
| ACT-008 | Submit quiz with unanswered questions | 1. Skip 3 questions 2. Submit | Warning shown, can still submit | |
| ACT-009 | Maximum quiz attempts (3) | 1. Fail quiz 3 times | Locked, contact support | |
| ACT-010 | Browser back during quiz | 1. In quiz 2. Press back | Warning, progress may be lost | |
| ACT-011 | Quiz questions don't load | 1. Open quiz 2. Questions fail to fetch | Error, retry button | |

### 5.3 Bank Details Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| ACT-012 | Invalid IFSC code | 1. Enter wrong IFSC format | Validation error | |
| ACT-013 | IFSC lookup fails | 1. Enter valid IFSC 2. API fails | Manual bank name entry enabled | |
| ACT-014 | Account number mismatch | 1. Enter account 2. Confirm with different number | Error: "Numbers don't match" | |
| ACT-015 | Invalid UPI format | 1. Enter "invalid-upi" | Validation error | |

---

## 6. Project Edge Cases

### 6.1 Project Submission Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PROJ-001 | Submit project with past deadline | 1. Select yesterday's date | Validation: "Deadline must be future" | |
| PROJ-002 | Submit project with deadline < 24 hours | 1. Select deadline in 12 hours | Warning: "Urgent deadline fee applies" | |
| PROJ-003 | Word count = 0 | 1. Enter 0 word count | Validation error | |
| PROJ-004 | Word count extremely high | 1. Enter 1,000,000 words | Cap or validation error | |
| PROJ-005 | Submit duplicate project | 1. Submit identical project twice | Duplicate warning or allowed | |

### 6.2 Quote Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PROJ-006 | Quote set to ₹0 | 1. Supervisor enters ₹0 quote | Minimum quote enforced | |
| PROJ-007 | Quote higher than max limit | 1. Enter ₹1,000,000 quote | Maximum cap enforced | |
| PROJ-008 | Quote modified after sent | 1. Send quote 2. Try to change | Can modify before payment only | |
| PROJ-009 | User pays during quote update | 1. User on payment page 2. Supervisor changes quote | Pays original OR error | |

### 6.3 Assignment Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PROJ-010 | Assign to unavailable doer | 1. Doer goes unavailable 2. Supervisor assigns | Error: "Doer no longer available" | |
| PROJ-011 | Assign to doer at max capacity | 1. Doer has max projects 2. Assign more | Error: "Doer at capacity" | |
| PROJ-012 | Assign to blacklisted doer | 1. Blacklist doer 2. Try assigning | Doer not in list | |
| PROJ-013 | Doer rejects assignment | 1. Assign project 2. Doer declines | Project returns to unassigned | |

### 6.4 Delivery Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PROJ-014 | Deliver without deliverables | 1. Try delivering with no files | Error: "No deliverables" | |
| PROJ-015 | Deliver after deadline | 1. Submit work after deadline | Late submission flagged | |
| PROJ-016 | User approves after timer expires | 1. 72h timer expires 2. Try manual approve | Already auto-approved | |
| PROJ-017 | Request revision after auto-approve | 1. Project auto-approved 2. Try revision | Revision not allowed OR support ticket | |

### 6.5 Cancellation Edge Cases
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PROJ-018 | Cancel after payment | 1. Pay for project 2. Cancel | Refund policy applies | |
| PROJ-019 | Cancel with work in progress | 1. Doer started work 2. Cancel | Partial payment/penalty | |
| PROJ-020 | Cancel during QC | 1. Work submitted for QC 2. Cancel | Not allowed | |

---

## 7. Network & Connectivity Edge Cases

### 7.1 Offline Scenarios
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| NET-001 | App launched offline | 1. Disable network 2. Open app | Offline indicator, cached data shown | |
| NET-002 | Goes offline during operation | 1. Start task 2. Network drops | Operation queued or error shown | |
| NET-003 | Slow network (2G simulation) | 1. Throttle to 2G 2. Use app | Slower but functional, timeouts handled | |
| NET-004 | Intermittent connectivity | 1. Network flaps on/off 2. Use app | Graceful handling, no crashes | |

### 7.2 API Failures
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| NET-005 | API returns 500 error | 1. Trigger action 2. Backend returns 500 | User-friendly error, retry option | |
| NET-006 | API returns 503 (maintenance) | 1. Trigger action 2. Backend in maintenance | "Service unavailable" message | |
| NET-007 | API timeout | 1. API takes >30s to respond | Timeout error, retry option | |
| NET-008 | API returns invalid JSON | 1. API returns malformed response | Error handled, app doesn't crash | |

### 7.3 Supabase Real-time Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| NET-009 | Real-time subscription fails | 1. Subscription drops 2. New message | Fallback to polling or manual refresh | |
| NET-010 | Multiple reconnection attempts | 1. Network flaps 2. Observe reconnection | Exponential backoff, eventual success | |

---

## 8. Session & Security Edge Cases

### 8.1 Session Management
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SEC-001 | Login on multiple devices | 1. Login on browser 2. Login on mobile | Both active OR one invalidated (policy dependent) | |
| SEC-002 | Session replay attack | 1. Capture session token 2. Use in different browser | Token validated, rejected if suspicious | |
| SEC-003 | Modified JWT token | 1. Alter JWT payload | Token rejected, forced logout | |

### 8.2 CSRF Protection
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SEC-004 | Request without CSRF token | 1. Make POST request without token | 403 Forbidden | |
| SEC-005 | Invalid CSRF token | 1. Make POST with wrong token | 403 Forbidden | |

### 8.3 Input Sanitization
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SEC-006 | XSS in text field | 1. Enter `<script>alert('xss')</script>` | Script not executed, text escaped | |
| SEC-007 | SQL injection attempt | 1. Enter `'; DROP TABLE users;--` | Query parameterized, no injection | |
| SEC-008 | Malicious file name | 1. Upload file with path traversal: `../../../etc/passwd` | Path sanitized | |

---

## 9. Data Validation Edge Cases

### 9.1 Form Validation
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| VAL-001 | Required field left empty | 1. Submit form with required field empty | Validation error on field | |
| VAL-002 | Email format invalid | 1. Enter "notanemail" | Validation: "Invalid email format" | |
| VAL-003 | Phone number too short | 1. Enter "12345" | Validation: "Phone must be 10 digits" | |
| VAL-004 | Phone with country code | 1. Enter "+91 9876543210" | Accepted or normalized | |
| VAL-005 | Unicode characters in name | 1. Enter "日本語名前" | Accepted (if supported) | |
| VAL-006 | Emoji in text field | 1. Enter "Project 🚀" | Accepted or stripped | |

### 9.2 Date/Time Validation
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| VAL-007 | Invalid date format | 1. Enter "32/13/2025" | Validation error | |
| VAL-008 | Timezone handling | 1. User in IST sets deadline 2. Supervisor in EST views | Correct conversion | |
| VAL-009 | Daylight saving time | 1. Set deadline during DST change | Handled correctly | |

### 9.3 Numeric Validation
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| VAL-010 | Negative number | 1. Enter -100 for word count | Validation: "Must be positive" | |
| VAL-011 | Decimal in integer field | 1. Enter 50.5 for word count | Rounded or validation error | |
| VAL-012 | Very large number | 1. Enter 999999999999 | Overflow prevented | |

---

## 10. Payout Edge Cases

### 10.1 Payout Request Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-OUT-001 | Request more than available | 1. Balance ₹1000 2. Request ₹1500 | Error: "Insufficient balance" | |
| PAY-OUT-002 | Request below minimum | 1. Request ₹50 (min ₹100) | Error: "Minimum payout is ₹100" | |
| PAY-OUT-003 | Multiple payout requests | 1. Request payout 2. Immediately request another | Second request blocked until first processed | |
| PAY-OUT-004 | Payout with unverified bank | 1. Bank not verified 2. Request payout | Error: "Please verify bank details" | |

### 10.2 Payout Processing Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| PAY-OUT-005 | Bank account closed | 1. Request payout 2. Bank rejects | Payout failed, notify user | |
| PAY-OUT-006 | Wrong account number | 1. Saved wrong account 2. Payout | Transfer fails, funds returned | |
| PAY-OUT-007 | Bank server down | 1. Request payout 2. Bank API fails | Retry later, status pending | |
| PAY-OUT-008 | Payout partial success | 1. Batch payout 2. Some fail | Failed items retried, success items completed | |

---

## 11. Real-time Edge Cases

### 11.1 Subscription Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| RT-001 | Subscription limit reached | 1. Open many tabs/connections | Graceful degradation or limit message | |
| RT-002 | Stale subscription data | 1. Leave tab open for hours 2. Check data | Data refreshes or stale indicator | |
| RT-003 | Race condition on update | 1. Two users update same field simultaneously | Last write wins with conflict resolution | |

### 11.2 Presence Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| RT-004 | User appears offline but isn't | 1. Presence check fails | Eventually corrects | |
| RT-005 | Typing indicator stuck | 1. User types 2. Network fails | Indicator clears after timeout | |

---

## 12. System & Performance Edge Cases

### 12.1 Load & Stress
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SYS-001 | High concurrent users | 1. 1000 users simultaneously | System remains responsive | |
| SYS-002 | Large file download by many | 1. 100 users download same file | CDN/caching handles load | |
| SYS-003 | Rapid page navigation | 1. Navigate 50 pages in 30 seconds | No memory leaks, responsive | |

### 12.2 Storage Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SYS-004 | Storage quota exceeded | 1. Upload many files 2. Reach quota | Error: "Storage limit reached" | |
| SYS-005 | File doesn't exist on download | 1. File deleted from storage 2. Try download | 404 with user-friendly message | |

### 12.3 Database Issues
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SYS-006 | Database connection pool exhausted | 1. High load 2. Pool full | Queued or error with retry | |
| SYS-007 | Database timeout | 1. Complex query takes too long | Timeout error, logged for optimization | |
| SYS-008 | Constraint violation | 1. Try duplicate unique value | User-friendly error | |

### 12.4 Rate Limiting
| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| SYS-009 | API rate limit hit | 1. Make 100 requests in 1 second | 429 Too Many Requests, retry after header | |
| SYS-010 | Login attempt rate limit | 1. 10 failed logins | Temporary lockout, CAPTCHA | |

---

## Test Execution Template

```
=== EDGE CASE TEST EXECUTION ===
Date: __________
Tester: __________
Environment: __________

Test ID: __________
Category: __________
Scenario: __________

Pre-conditions:
- __________

Steps Executed:
1. __________
2. __________
3. __________

Actual Result: __________
Expected Result: __________
Status: [ PASS / FAIL / BLOCKED ]

If FAIL:
- Bug ID: __________
- Severity: __________
- Screenshots: __________

Notes:
__________
```

---

## Bug Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | System unusable, data loss, security breach | Payment charged but not recorded |
| **High** | Major feature broken, no workaround | Cannot submit projects |
| **Medium** | Feature works with workaround | File upload fails, can retry |
| **Low** | Minor issue, cosmetic | Error message typo |

---

## Sign-Off

| Tester Name | Date | Categories Tested | Status |
|-------------|------|-------------------|--------|
| | | | |

---

*Document Version: 1.0*
*Last Updated: [Date]*
*Covers: All Platforms Error Scenarios*
