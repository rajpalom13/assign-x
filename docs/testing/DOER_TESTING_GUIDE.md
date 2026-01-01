# AssignX Doer Platform - Complete Testing Guide

## Platform Overview
**Application**: AssignX Doer Platform
**URL**: http://localhost:3001 (Web) / Mobile App
**Purpose**: Platform for skilled professionals (Doers) to complete academic tasks, earn money, and build their reputation.

---

## Table of Contents
1. [Pre-requisites](#1-pre-requisites)
2. [Authentication Testing](#2-authentication-testing)
3. [Onboarding Flow Testing](#3-onboarding-flow-testing)
4. [Activation Flow Testing](#4-activation-flow-testing)
5. [Dashboard Testing](#5-dashboard-testing)
6. [Project Management Testing](#6-project-management-testing)
7. [Workspace Testing](#7-workspace-testing)
8. [Profile & Earnings Testing](#8-profile--earnings-testing)
9. [Resources Center Testing](#9-resources-center-testing)
10. [Chat Testing](#10-chat-testing)
11. [Reviews & Ratings Testing](#11-reviews--ratings-testing)
12. [Mobile App Specific Testing](#12-mobile-app-specific-testing)

---

## 1. Pre-requisites

### Environment Setup
- [ ] Web application running at `http://localhost:3001`
- [ ] Mobile app installed (Flutter APK/IPA)
- [ ] Supabase backend connected
- [ ] Google OAuth credentials configured
- [ ] Test projects available in system

### Test Accounts
Create test accounts for:
- [ ] New doer (first-time registration)
- [ ] Doer pending activation (training incomplete)
- [ ] Doer pending activation (quiz incomplete)
- [ ] Doer pending activation (bank details incomplete)
- [ ] Fully activated doer
- [ ] Doer with assigned projects
- [ ] Doer with completed projects and earnings

---

## 2. Authentication Testing

### 2.1 Splash Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1.1 | Open `http://localhost:3001` (or mobile app) | Splash screen with DOER logo appears | |
| 2.1.2 | Verify branding | Logo, "DOER" text, tagline "Your Skills, Your Earnings" | |
| 2.1.3 | Wait 2-3 seconds | Auto-redirect based on auth state | |
| 2.1.4 | (Not logged in) Verify redirect | Redirects to `/onboarding` or `/login` | |
| 2.1.5 | (Logged in, not activated) Verify redirect | Redirects to activation flow | |
| 2.1.6 | (Logged in, activated) Verify redirect | Redirects to `/dashboard` | |

### 2.2 Onboarding Carousel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.2.1 | Navigate to `/welcome` or onboarding | Onboarding screen loads | |
| 2.2.2 | Verify slide 1 | "Earn on Your Terms" with illustration | |
| 2.2.3 | Swipe/click next | Slide 2 - "Quality Work, Quality Pay" | |
| 2.2.4 | Swipe/click next | Slide 3 - "Build Your Reputation" | |
| 2.2.5 | Swipe/click next | Slide 4 - "Get Started Today" | |
| 2.2.6 | Click "Skip" at any point | Jumps to login | |
| 2.2.7 | Click "Get Started" on last slide | Proceeds to login | |
| 2.2.8 | Verify pagination dots | Shows current position | |

### 2.3 Login Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.3.1 | Navigate to `http://localhost:3001/login` | Login page loads | |
| 2.3.2 | Verify page elements | DOER logo, "Sign in to continue", Google button | |
| 2.3.3 | Click "Continue with Google" | Google OAuth popup opens | |
| 2.3.4 | Complete Google sign-in | OAuth completes | |
| 2.3.5 | (New user) Verify redirect | Redirects to profile setup | |
| 2.3.6 | (Existing user, not activated) Verify | Redirects to activation gate | |
| 2.3.7 | (Existing user, activated) Verify | Redirects to dashboard | |
| 2.3.8 | Verify "Powered by AssignX" footer | Footer visible | |

### 2.4 Logout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.4.1 | Open sidebar/menu | Menu drawer opens | |
| 2.4.2 | Click "Logout" | Confirmation dialog appears | |
| 2.4.3 | Confirm logout | Session cleared, redirect to login | |
| 2.4.4 | Try accessing `/dashboard` | Redirected to login | |

---

## 3. Onboarding Flow Testing

### 3.1 Profile Setup Form
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.1 | Navigate to `/profile-setup` | Profile setup form loads | |
| 3.1.2 | Verify form sections | Personal, Qualification, Skills, Subjects | |

#### Personal Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.3 | Verify pre-filled fields | Name, email from Google account | |
| 3.1.4 | Enter phone number | Phone field validates (10 digits) | |
| 3.1.5 | Enter invalid phone | Validation error shown | |
| 3.1.6 | Upload profile photo | Photo preview displays | |

#### Qualification
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.7 | Select highest qualification | Dropdown works (Bachelor's, Master's, PhD) | |
| 3.1.8 | Enter institution name | Text entered | |
| 3.1.9 | Select year of completion | Year picker works | |
| 3.1.10 | Upload qualification certificate | File uploaded | |

#### Skills Selection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.11 | View skills list | Skill chips displayed | |
| 3.1.12 | Select multiple skills | Skills highlighted (max 10) | |
| 3.1.13 | Try selecting more than limit | Warning shown | |
| 3.1.14 | Search for a skill | Filter works | |
| 3.1.15 | Add custom skill | Custom skill added | |

#### Subject Selection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.16 | View subject categories | Categories expandable | |
| 3.1.17 | Expand a category | Shows subjects within | |
| 3.1.18 | Select subjects | Subjects highlighted | |
| 3.1.19 | Verify min/max limits | Enforced (min 3, max 15) | |

#### Experience
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.20 | Select experience level | Junior/Intermediate/Senior | |
| 3.1.21 | Enter years of experience | Number input works | |
| 3.1.22 | Add portfolio links | URLs validated | |

### 3.2 Form Submission
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.2.1 | Leave required fields empty, submit | Validation errors appear | |
| 3.2.2 | Fill all required fields | Submit button enabled | |
| 3.2.3 | Click Submit | Loading state | |
| 3.2.4 | Verify success | Redirects to activation gate | |

---

## 4. Activation Flow Testing

### 4.1 Activation Gate Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1.1 | Navigate to `/training` (or activation gate) | Activation gate loads | |
| 4.1.2 | Verify 3 steps displayed | Training, Quiz, Bank Details | |
| 4.1.3 | Verify step statuses | Completed (green), In Progress (blue), Locked (gray) | |
| 4.1.4 | Click on locked step | Shows "Complete previous step first" | |
| 4.1.5 | Verify progress indicator | Overall progress percentage | |

### 4.2 Training Modules (Step 1)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.2.1 | Click "Start Training" | Training modules list opens | |
| 4.2.2 | Verify module list | Multiple training videos/docs | |
| 4.2.3 | Click on first module | Video player opens | |
| 4.2.4 | Watch video to completion | Progress tracked | |
| 4.2.5 | Try skipping video | Cannot proceed until watched | |
| 4.2.6 | Complete all modules | Training step marked complete | |
| 4.2.7 | Verify quiz unlocked | Quiz step now accessible | |

### 4.3 Qualification Quiz (Step 2)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.3.1 | Click "Start Quiz" | Quiz screen loads | |
| 4.3.2 | Verify quiz info | Number of questions, time limit, passing score | |
| 4.3.3 | Click "Begin Quiz" | Quiz starts, timer begins | |
| 4.3.4 | Answer question | Option selected | |
| 4.3.5 | Navigate to next question | Navigation works | |
| 4.3.6 | Navigate to previous question | Can go back | |
| 4.3.7 | View question overview | Shows answered/unanswered | |
| 4.3.8 | Submit quiz | Submission confirmation | |
| 4.3.9 | (Score >= 80%) Verify pass | "Congratulations" message, step complete | |
| 4.3.10 | (Score < 80%) Verify fail | "Try Again" option, attempt count shown | |
| 4.3.11 | Retry after fail | New attempt starts | |
| 4.3.12 | Verify max attempts | After 3 failures, contact support message | |

### 4.4 Bank Details (Step 3)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.1 | Click "Add Bank Details" | Bank details form opens | |
| 4.4.2 | Verify form fields | Account holder name, Account number, IFSC, Bank name, UPI ID | |

#### Bank Account
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.3 | Enter account holder name | Text entered | |
| 4.4.4 | Enter account number | Number entered | |
| 4.4.5 | Re-enter account number | Confirmation matches | |
| 4.4.6 | Enter IFSC code | IFSC validated | |
| 4.4.7 | Enter invalid IFSC | Validation error | |
| 4.4.8 | Auto-fetch bank name from IFSC | Bank name populated | |

#### UPI
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.9 | Enter UPI ID | UPI format validated | |
| 4.4.10 | Enter invalid UPI | Validation error | |

#### Submission
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.11 | Check terms acceptance | Checkbox checked | |
| 4.4.12 | Submit without terms | Error shown | |
| 4.4.13 | Submit with all valid data | Success message | |
| 4.4.14 | Verify activation complete | Redirects to dashboard | |

### 4.5 Activation Complete
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.5.1 | View activation complete screen | Celebration animation | |
| 4.5.2 | Verify welcome message | "Welcome to DOER!" | |
| 4.5.3 | Click "Go to Dashboard" | Redirects to dashboard | |

---

## 5. Dashboard Testing

### 5.1 Dashboard Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.1 | Navigate to `http://localhost:3001/dashboard` | Dashboard loads | |
| 5.1.2 | Verify header | Greeting, notification bell, availability toggle | |
| 5.1.3 | Verify stats bar | Active projects, Completed, Earnings, Rating | |

### 5.2 Availability Toggle
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.2.1 | Locate availability toggle | Toggle visible in header | |
| 5.2.2 | Click toggle (Available -> Unavailable) | Status changes, confirmation | |
| 5.2.3 | Verify visual change | Color/icon changes | |
| 5.2.4 | Click toggle again | Status changes back | |
| 5.2.5 | Verify no new tasks when unavailable | Open pool empty or tasks not assignable | |

### 5.3 My Projects Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.3.1 | Click "My Projects" tab | Shows assigned projects | |
| 5.3.2 | Verify project cards | Title, deadline, status, progress | |
| 5.3.3 | Verify urgency sorting | Urgent projects first | |
| 5.3.4 | Verify deadline countdown | Time remaining displayed | |
| 5.3.5 | Verify urgency badges | Red (urgent), Yellow (soon), Green (normal) | |
| 5.3.6 | Click on project card | Opens project workspace | |
| 5.3.7 | (No projects) Verify empty state | "No projects assigned" message | |

### 5.4 Open Pool Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.4.1 | Click "Open Pool" tab | Shows available tasks | |
| 5.4.2 | Verify task cards | Title, subject, deadline, payout | |
| 5.4.3 | Verify subject matching | Tasks match doer's subjects | |
| 5.4.4 | Click "View Details" on task | Task detail modal opens | |
| 5.4.5 | Review task requirements | Full requirements visible | |
| 5.4.6 | Click "Accept Task" | Confirmation dialog | |
| 5.4.7 | Confirm acceptance | Task moves to My Projects | |
| 5.4.8 | Verify notification | "Task accepted" notification | |

### 5.5 Navigation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.5.1 | Click hamburger menu | Sidebar/drawer opens | |
| 5.5.2 | Verify menu items | Dashboard, Projects, Resources, Profile, Reviews, Statistics | |
| 5.5.3 | Click each menu item | Navigates correctly | |
| 5.5.4 | Verify active state | Current page highlighted | |

---

## 6. Project Management Testing

### 6.1 Projects Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1.1 | Navigate to `http://localhost:3001/projects` | Projects page loads | |
| 6.1.2 | Verify tabs | Active, Under Review, Completed | |
| 6.1.3 | Click "Active" tab | Shows in-progress projects | |
| 6.1.4 | Click "Under Review" tab | Shows submitted projects | |
| 6.1.5 | Click "Completed" tab | Shows finished projects | |

### 6.2 Project Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.2.1 | Click on a project | Project detail page loads | |
| 6.2.2 | Verify project info | Title, subject, deadline, requirements | |
| 6.2.3 | Verify reference files | Attached files downloadable | |
| 6.2.4 | Download reference file | File downloads correctly | |
| 6.2.5 | Verify payout amount | Doer payout displayed | |
| 6.2.6 | Click "Open Workspace" | Workspace screen opens | |

### 6.3 Revision Banner
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.1 | (Project with revision) View project | Revision banner prominently displayed | |
| 6.3.2 | Verify revision notes | Supervisor's feedback visible | |
| 6.3.3 | Click "Start Revision" | Opens workspace in revision mode | |

---

## 7. Workspace Testing

### 7.1 Workspace Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1.1 | Open project workspace | Workspace screen loads | |
| 7.1.2 | Verify sections | Project info, Progress, Files, Chat | |
| 7.1.3 | Verify timer | Work session timer visible | |

### 7.2 Project Info Card
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.2.1 | Locate project info card | Collapsible card visible | |
| 7.2.2 | Expand card | Full project details shown | |
| 7.2.3 | Collapse card | Card minimizes | |
| 7.2.4 | Verify requirements list | All requirements listed | |

### 7.3 Progress Tracking
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.3.1 | Locate progress tracker | Progress bar/slider visible | |
| 7.3.2 | Update progress (e.g., 25% -> 50%) | Progress updates | |
| 7.3.3 | Verify progress saves | Progress persisted on refresh | |
| 7.3.4 | Verify progress reflects on project card | Dashboard card shows updated progress | |

### 7.4 Work Session Timer
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.4.1 | Verify timer starts automatically | Timer counting up | |
| 7.4.2 | Pause timer | Timer pauses | |
| 7.4.3 | Resume timer | Timer continues | |
| 7.4.4 | Leave workspace | Timer pauses | |
| 7.4.5 | Return to workspace | Timer can be resumed | |

### 7.5 File Upload
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.5.1 | Locate file upload zone | Upload area visible | |
| 7.5.2 | Click to upload | File picker opens | |
| 7.5.3 | Select file | File uploads with progress | |
| 7.5.4 | Drag and drop file | File uploads | |
| 7.5.5 | Upload multiple files | All files upload | |
| 7.5.6 | Verify file preview | Uploaded files listed | |
| 7.5.7 | Delete uploaded file | File removed | |
| 7.5.8 | Upload large file (>25MB) | Error message shown | |

### 7.6 Work Submission
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.6.1 | Click "Submit Work" button | Submission form opens | |
| 7.6.2 | Verify required uploads | At least one file required | |
| 7.6.3 | Enter submission notes | Notes text entered | |
| 7.6.4 | Submit without files | Validation error | |
| 7.6.5 | Upload deliverable file | File attached | |
| 7.6.6 | Click "Submit for Review" | Confirmation dialog | |
| 7.6.7 | Confirm submission | Work submitted | |
| 7.6.8 | Verify status change | Project moves to "Under Review" | |
| 7.6.9 | Verify notification | Submission notification sent | |

### 7.7 Revision Handling
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.7.1 | Open project with revision request | Revision mode active | |
| 7.7.2 | View revision notes | Feedback clearly displayed | |
| 7.7.3 | Make changes | Edit work | |
| 7.7.4 | Upload revised file | New file uploaded | |
| 7.7.5 | Add response to revision notes | Notes added | |
| 7.7.6 | Submit revision | Revision submitted | |

### 7.8 Chat Panel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.8.1 | Open chat panel | Chat visible | |
| 7.8.2 | View message history | Previous messages loaded | |
| 7.8.3 | Send message | Message sent | |
| 7.8.4 | Receive real-time message | Message appears instantly | |
| 7.8.5 | Send file in chat | File uploaded and sent | |

---

## 8. Profile & Earnings Testing

### 8.1 Profile Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1.1 | Navigate to `http://localhost:3001/profile` | Profile page loads | |
| 8.1.2 | Verify profile header | Avatar, name, rating, completed projects | |
| 8.1.3 | Verify stats | Total earnings, Projects completed, Avg rating | |

### 8.2 Edit Profile
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.2.1 | Click "Edit Profile" | Edit mode or edit page opens | |
| 8.2.2 | Change profile photo | Photo updated | |
| 8.2.3 | Edit skills | Skills updated | |
| 8.2.4 | Edit subjects | Subjects updated | |
| 8.2.5 | Save changes | Changes persisted | |

### 8.3 Bank Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.3.1 | Click "Bank Settings" | Bank details page opens | |
| 8.3.2 | View saved bank details | Details masked for security | |
| 8.3.3 | Click "Update Bank Details" | Edit form opens | |
| 8.3.4 | Update account number | Account updated | |
| 8.3.5 | Update UPI ID | UPI updated | |
| 8.3.6 | Save changes | Changes saved | |

### 8.4 Earnings & Payments
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.4.1 | Click "Earnings" or navigate to earnings | Earnings page loads | |
| 8.4.2 | Verify balance display | Total balance, Available, Pending | |
| 8.4.3 | Verify earnings graph | Visual chart showing earnings over time | |
| 8.4.4 | Change period (Week/Month/Year) | Graph updates | |

### 8.5 Payment History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.5.1 | Click "Payment History" | Transaction list opens | |
| 8.5.2 | Verify transaction list | All transactions listed | |
| 8.5.3 | Filter by type | Shows only selected type | |
| 8.5.4 | Click on transaction | Details expand | |
| 8.5.5 | Verify transaction details | Date, amount, project, status | |

### 8.6 Request Payout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.6.1 | Click "Request Payout" | Payout form opens | |
| 8.6.2 | Verify available balance | Shows withdrawable amount | |
| 8.6.3 | Enter payout amount | Amount entered | |
| 8.6.4 | Enter amount > available | Validation error | |
| 8.6.5 | Enter valid amount | Amount accepted | |
| 8.6.6 | Verify bank details shown | Payout destination displayed | |
| 8.6.7 | Submit payout request | Request submitted | |
| 8.6.8 | Verify confirmation | "Payout requested" message | |
| 8.6.9 | Check pending amount | Shows in pending | |

### 8.7 Scorecard
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.7.1 | Locate scorecard section | Stats visible | |
| 8.7.2 | Verify metrics | Rating, Completion rate, On-time delivery | |
| 8.7.3 | Verify rating breakdown | Star distribution shown | |

### 8.8 Skill Verification
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.8.1 | Locate skill verification | Skills with verification status | |
| 8.8.2 | Click "Verify" on unverified skill | Verification flow starts | |
| 8.8.3 | Complete verification | Skill marked as verified | |

---

## 9. Resources Center Testing

### 9.1 Resources Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1.1 | Navigate to `http://localhost:3001/resources` | Resources page loads | |
| 9.1.2 | Verify resource cards | Grid of available resources | |
| 9.1.3 | Verify categories | Training, Tools, Templates | |

### 9.2 Training Center
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.2.1 | Click "Training Center" | Training list opens | |
| 9.2.2 | View training modules | Module list with progress | |
| 9.2.3 | Search for training | Search filter works | |
| 9.2.4 | Click on a module | Video/content plays | |
| 9.2.5 | Track completion | Progress saved | |

### 9.3 AI Report Generator
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.3.1 | Click "AI Report Generator" | Tool opens | |
| 9.3.2 | Upload document | Document uploaded | |
| 9.3.3 | Click "Check" | Processing starts | |
| 9.3.4 | View report | AI detection results shown | |
| 9.3.5 | Download report | Report downloads | |

### 9.4 Citation Builder
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.4.1 | Click "Citation Builder" | Citation tool opens | |
| 9.4.2 | Select citation style | APA, MLA, Harvard, Chicago | |
| 9.4.3 | Enter source details | Form fields populate | |
| 9.4.4 | Click "Generate" | Citation generated | |
| 9.4.5 | Copy citation | Copied to clipboard | |
| 9.4.6 | Add multiple sources | Multiple citations generated | |

### 9.5 Format Templates
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.5.1 | Click "Format Templates" | Templates list opens | |
| 9.5.2 | View template categories | Essay, Report, Thesis, etc. | |
| 9.5.3 | Click on template | Template preview opens | |
| 9.5.4 | Click "Download" | Template downloads | |
| 9.5.5 | Verify file format | .docx or .pdf | |

---

## 10. Chat Testing

### 10.1 Project Chat
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1.1 | Open project workspace | Chat panel visible | |
| 10.1.2 | View chat history | Previous messages loaded | |
| 10.1.3 | Type message | Text entered | |
| 10.1.4 | Send message | Message appears in chat | |
| 10.1.5 | Receive reply | Real-time message appears | |
| 10.1.6 | Upload file | File sent in chat | |
| 10.1.7 | Download received file | File downloads | |

### 10.2 Chat Notifications
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.2.1 | Receive message when not in chat | Notification badge appears | |
| 10.2.2 | Click notification | Opens chat | |
| 10.2.3 | Read messages | Badge clears | |

---

## 11. Reviews & Ratings Testing

### 11.1 Reviews Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.1.1 | Navigate to `http://localhost:3001/reviews` | Reviews page loads | |
| 11.1.2 | Verify average rating | Overall rating displayed | |
| 11.1.3 | Verify rating distribution | Star breakdown chart | |
| 11.1.4 | View individual reviews | Review cards listed | |
| 11.1.5 | Filter by rating | Shows only selected star reviews | |

### 11.2 Review Details
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.2.1 | Click on a review | Review expands | |
| 11.2.2 | Verify review content | Rating, comment, date, project | |
| 11.2.3 | Verify client info | Client name (anonymized if applicable) | |

### 11.3 Statistics Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.3.1 | Navigate to `http://localhost:3001/statistics` | Statistics page loads | |
| 11.3.2 | Verify performance metrics | Completion rate, On-time rate, etc. | |
| 11.3.3 | Verify earnings chart | Monthly/weekly earnings graph | |
| 11.3.4 | Verify project breakdown | By subject, by status | |

---

## 12. Mobile App Specific Testing

### 12.1 App Installation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.1.1 | Install APK/IPA | App installs successfully | |
| 12.1.2 | Open app | Splash screen appears | |
| 12.1.3 | Grant permissions | Camera, storage, notifications | |

### 12.2 Mobile Navigation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.2.1 | Verify bottom nav | Dashboard, Projects, (FAB), Resources, Profile | |
| 12.2.2 | Tap each nav item | Navigates correctly | |
| 12.2.3 | Verify drawer menu | Opens with swipe or hamburger | |

### 12.3 Mobile Gestures
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.3.1 | Pull to refresh | Lists refresh | |
| 12.3.2 | Swipe to navigate | Swipe gestures work | |
| 12.3.3 | Long press actions | Context menus appear | |

### 12.4 Push Notifications
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.4.1 | Enable push notifications | Permission granted | |
| 12.4.2 | Receive "Task Available" notification | Push appears | |
| 12.4.3 | Tap notification | Opens relevant screen | |
| 12.4.4 | Receive "Payment Received" notification | Push appears | |

### 12.5 Offline Behavior
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.5.1 | Turn off network | Offline indicator shows | |
| 12.5.2 | View cached content | Previously loaded data visible | |
| 12.5.3 | Try to submit work | Queued or error shown | |
| 12.5.4 | Reconnect | Syncs pending actions | |

---

## 13. Skill Verification Testing

### 13.1 Skill Verification Request
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.1.1 | Navigate to `http://localhost:3001/profile` | Profile page loads | |
| 13.1.2 | Locate "Skills" section | Skills listed with verification status | |
| 13.1.3 | Find unverified skill | Shows "Unverified" badge | |
| 13.1.4 | Click "Verify" button | Verification form opens | |
| 13.1.5 | View verification requirements | Instructions displayed | |

### 13.2 Upload Verification Documents
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.2.1 | Click "Upload Certificate" | File picker opens | |
| 13.2.2 | Select certificate/proof | File uploaded | |
| 13.2.3 | Verify file preview | Uploaded file shown | |
| 13.2.4 | Add additional documents (optional) | Multiple files allowed | |
| 13.2.5 | Enter verification notes | Notes text entered | |
| 13.2.6 | Submit verification request | Request submitted | |

### 13.3 Verification Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.3.1 | View skill after submission | Status: "Pending Verification" | |
| 13.3.2 | (After admin approval) Check skill | Status: "Verified" with badge | |
| 13.3.3 | (After rejection) Check skill | Status: "Rejected" with reason | |
| 13.3.4 | Resubmit after rejection | New verification request allowed | |

### 13.4 Verified Skills Benefits
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.4.1 | View profile with verified skills | Verified badge on skill chips | |
| 13.4.2 | Check task priority | Verified doers get priority | |
| 13.4.3 | View in open pool | Verified skills highlighted | |

---

## 14. Project Limits & Workload Testing

### 14.1 Maximum Concurrent Projects
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.1.1 | Accept projects until limit (e.g., 5) | Projects accepted | |
| 14.1.2 | Try to accept one more project | Error: "Maximum projects reached" | |
| 14.1.3 | View Open Pool with max projects | "Accept" button disabled | |
| 14.1.4 | Complete one project | Slot freed for new project | |
| 14.1.5 | Try accepting new project | Now allowed | |

### 14.2 Workload Indicator
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.2.1 | View dashboard | Workload indicator visible | |
| 14.2.2 | Verify indicator levels | Low/Medium/High based on projects | |
| 14.2.3 | (High workload) Check availability | Auto-set to unavailable if overloaded | |

---

## 15. Performance Metrics Testing

### 15.1 Success Rate
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.1.1 | Navigate to Statistics page | Statistics load | |
| 15.1.2 | Locate "Success Rate" metric | Percentage displayed | |
| 15.1.3 | Verify calculation | (Approved / Total Submitted) × 100 | |
| 15.1.4 | Complete project successfully | Success rate updates | |
| 15.1.5 | Project rejected (QC fail) | Success rate decreases | |

### 15.2 On-Time Delivery Rate
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.2.1 | Locate "On-Time Rate" metric | Percentage displayed | |
| 15.2.2 | Verify calculation | (On-time submissions / Total) × 100 | |
| 15.2.3 | Submit before deadline | On-time rate maintained | |
| 15.2.4 | Submit after deadline | On-time rate decreases | |

### 15.3 Average Rating
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.3.1 | Locate "Average Rating" | Rating displayed (e.g., 4.5/5) | |
| 15.3.2 | Verify rating calculation | Average of all received ratings | |
| 15.3.3 | Receive new rating | Average updates | |

### 15.4 Earnings Statistics
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.4.1 | View earnings chart | Chart displays correctly | |
| 15.4.2 | Toggle period (Week/Month/Year) | Data updates for period | |
| 15.4.3 | Verify earnings breakdown | By project type, by month | |
| 15.4.4 | Export earnings report | Report downloads (PDF/CSV) | |

---

## 16. Doer Flagging & Status Testing

### 16.1 Performance Warnings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.1.1 | (Low rating) View dashboard | Warning banner displayed | |
| 16.1.2 | (Missed deadlines) View dashboard | "Improve on-time rate" warning | |
| 16.1.3 | (Multiple rejections) View dashboard | Performance warning shown | |
| 16.1.4 | Click "View Details" | Performance improvement tips | |

### 16.2 Account Restriction
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.2.1 | (Flagged account) Try to accept task | Restricted - "Account under review" | |
| 16.2.2 | View restriction reason | Reason displayed | |
| 16.2.3 | Contact support option | Support link available | |
| 16.2.4 | (After review) Check status | Restriction lifted or account suspended | |

### 16.3 Blacklist Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.3.1 | (Blacklisted by supervisor) View tasks | Tasks from that supervisor not shown | |
| 16.3.2 | Check notification | "You've been removed from a supervisor's pool" | |

---

## 17. Statistics Page Testing

### 17.1 Overview Stats
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.1.1 | Navigate to `http://localhost:3001/statistics` | Statistics page loads | |
| 17.1.2 | Verify summary cards | Projects, Earnings, Rating, On-time % | |
| 17.1.3 | Verify data accuracy | Matches actual performance | |

### 17.2 Project Breakdown
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.2.1 | Locate "Projects by Subject" | Chart/breakdown visible | |
| 17.2.2 | Verify subject distribution | Pie chart or bar chart | |
| 17.2.3 | Click on subject slice | Shows projects in that subject | |

### 17.3 Earnings Breakdown
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.3.1 | Locate "Earnings by Month" | Monthly chart visible | |
| 17.3.2 | Verify earnings trend | Line/bar chart showing trend | |
| 17.3.3 | Hover on data point | Shows exact amount | |

### 17.4 Time Analysis
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.4.1 | Locate "Average Time per Project" | Time metric displayed | |
| 17.4.2 | Verify time tracking | Based on workspace timer data | |
| 17.4.3 | View "Most Productive Hours" | Hour distribution chart | |

---

## 18. Advanced Workspace Features

### 18.1 Draft Saving
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.1.1 | Start working on project | Workspace opens | |
| 18.1.2 | Upload partial work | Files uploaded | |
| 18.1.3 | Navigate away | Warning: "Save your progress?" | |
| 18.1.4 | Click "Save as Draft" | Progress saved | |
| 18.1.5 | Return to workspace | Previous uploads present | |

### 18.2 Live Progress Sync
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.2.1 | Update progress percentage | Progress bar updates | |
| 18.2.2 | (Supervisor views project) Check progress | Same percentage shown | |
| 18.2.3 | Progress sync in real-time | Updates without refresh | |

### 18.3 Workspace Notes
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.3.1 | Locate "Notes" section | Notes area visible | |
| 18.3.2 | Add personal notes | Notes saved | |
| 18.3.3 | Notes are private | Not visible to supervisor | |
| 18.3.4 | Add submission notes | Visible in submission | |

---

## Test Execution Checklist

### Smoke Test (Critical Path)
- [ ] Login with Google
- [ ] Complete activation (if new user)
- [ ] View dashboard
- [ ] Accept a task from open pool
- [ ] Submit work
- [ ] View earnings
- [ ] Request payout
- [ ] Logout

### Regression Test (Full Coverage)
- [ ] All authentication flows
- [ ] Complete onboarding
- [ ] All activation steps
- [ ] Dashboard functionality
- [ ] Project management
- [ ] Workspace features
- [ ] File uploads
- [ ] Work submission
- [ ] Revision handling
- [ ] Profile editing
- [ ] Earnings and payouts
- [ ] Resources center
- [ ] Chat functionality
- [ ] Reviews

### Cross-Platform Testing
- [ ] Web (Chrome, Firefox, Safari, Edge)
- [ ] Android app
- [ ] iOS app

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Bug Reporting Template

```
**Bug ID**: DOER-XXX
**Title**: [Brief description]
**Environment**: Web/Android/iOS, Browser/Version, OS
**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:
**Actual Result**:
**Screenshots/Video**: [Attach]
**Severity**: Critical/High/Medium/Low
**Priority**: P1/P2/P3/P4
```

---

## Sign-Off

| Tester Name | Date | Version Tested | Status |
|-------------|------|----------------|--------|
| | | | |

---

*Document Version: 1.0*
*Last Updated: [Date]*
*Platform: AssignX Doer Platform*
