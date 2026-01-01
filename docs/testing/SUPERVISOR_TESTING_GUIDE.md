# AssignX Supervisor Platform - Complete Testing Guide

## Platform Overview
**Application**: AssignX Supervisor Platform
**URL**: http://localhost:3002 (Web) / Mobile App
**Purpose**: Quality control platform for supervisors to manage projects, set quotes, assign doers, review deliverables, and ensure quality work delivery.

---

## Table of Contents
1. [Pre-requisites](#1-pre-requisites)
2. [Authentication Testing](#2-authentication-testing)
3. [Onboarding & Registration Testing](#3-onboarding--registration-testing)
4. [Activation Flow Testing](#4-activation-flow-testing)
5. [Dashboard Testing](#5-dashboard-testing)
6. [Project Management Testing](#6-project-management-testing)
7. [Quality Control Testing](#7-quality-control-testing)
8. [Earnings & Payments Testing](#8-earnings--payments-testing)
9. [Resources Center Testing](#9-resources-center-testing)
10. [Users/Clients Management Testing](#10-usersclients-management-testing)
11. [Doers Management Testing](#11-doers-management-testing)
12. [Chat & Communication Testing](#12-chat--communication-testing)
13. [Support Center Testing](#13-support-center-testing)
14. [Notifications Testing](#14-notifications-testing)
15. [Reviews & Profile Testing](#15-reviews--profile-testing)
16. [Mobile App Specific Testing](#16-mobile-app-specific-testing)

---

## 1. Pre-requisites

### Environment Setup
- [ ] Mobile app installed (Flutter APK/IPA)
- [ ] Web application running (if available) at `http://localhost:3002`
- [ ] Supabase backend connected
- [ ] Test projects in various states available
- [ ] Test doers available for assignment
- [ ] Test clients with projects

### Test Accounts
Create test accounts for:
- [ ] New supervisor (first-time registration)
- [ ] Supervisor with pending application
- [ ] Supervisor pending activation (training incomplete)
- [ ] Supervisor pending activation (quiz incomplete)
- [ ] Fully activated supervisor
- [ ] Supervisor with active projects
- [ ] Supervisor with earnings/completed projects

---

## 2. Authentication Testing

### 2.1 Splash Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1.1 | Open the mobile app | Splash screen appears | |
| 2.1.2 | Verify branding | Logo, app name visible | |
| 2.1.3 | Wait for auth check | Auto-redirects based on auth state | |
| 2.1.4 | (Not logged in) Verify redirect | Goes to onboarding or login | |
| 2.1.5 | (Logged in, not activated) Verify | Goes to activation flow | |
| 2.1.6 | (Logged in, activated) Verify | Goes to dashboard | |

### 2.2 Onboarding Carousel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.2.1 | View onboarding screen | Swipeable slides appear | |
| 2.2.2 | Verify slide content | Introduction to supervisor role | |
| 2.2.3 | Swipe through all slides | All slides viewable | |
| 2.2.4 | Click "Skip" | Jumps to login | |
| 2.2.5 | Click "Get Started" on last slide | Proceeds to login | |

### 2.3 Login Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.3.1 | Navigate to login screen | Login form loads | |
| 2.3.2 | Verify login fields | Email, Password fields visible | |
| 2.3.3 | Enter valid email | Email accepted | |
| 2.3.4 | Enter invalid email format | Validation error shown | |
| 2.3.5 | Enter password | Password masked | |
| 2.3.6 | Toggle password visibility | Password shows/hides | |
| 2.3.7 | Click "Login" with valid credentials | Login successful, redirects | |
| 2.3.8 | Click "Login" with invalid credentials | Error message shown | |
| 2.3.9 | Click "Forgot Password" | Password recovery screen opens | |
| 2.3.10 | Click "Register" | Registration screen opens | |

### 2.4 Registration Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.4.1 | Navigate to registration | Registration form loads | |
| 2.4.2 | Verify form fields | Email, Password, Confirm Password | |
| 2.4.3 | Enter email | Email validated | |
| 2.4.4 | Enter password (min 8 chars) | Password accepted | |
| 2.4.5 | Enter weak password | Validation error | |
| 2.4.6 | Confirm password (mismatch) | "Passwords don't match" error | |
| 2.4.7 | Confirm password (match) | Validation passes | |
| 2.4.8 | Submit registration | Account created, proceeds to registration wizard | |

### 2.5 Forgot Password
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.5.1 | Open forgot password screen | Email input shown | |
| 2.5.2 | Enter registered email | Email accepted | |
| 2.5.3 | Click "Send Reset Link" | Success message, email sent | |
| 2.5.4 | Enter unregistered email | Error message | |
| 2.5.5 | Click reset link in email | Opens password reset screen | |
| 2.5.6 | Enter new password | Password updated | |

### 2.6 Logout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.6.1 | Open menu drawer | Drawer opens | |
| 2.6.2 | Click "Logout" | Confirmation dialog | |
| 2.6.3 | Confirm logout | Session cleared, returns to login | |

---

## 3. Onboarding & Registration Testing

### 3.1 Registration Wizard Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.1 | After account creation, view wizard | 4-step wizard loads | |
| 3.1.2 | Verify step indicator | Shows Step 1 of 4 | |
| 3.1.3 | Verify step labels | Personal Info, Experience, Banking, Review | |

### 3.2 Step 1: Personal Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.2.1 | View personal info form | Form fields visible | |
| 3.2.2 | Enter full name | Name entered | |
| 3.2.3 | Enter phone number | Phone validated (10 digits) | |
| 3.2.4 | Enter invalid phone | Validation error | |
| 3.2.5 | Select date of birth | Date picker works | |
| 3.2.6 | Enter city | City entered | |
| 3.2.7 | Select state | Dropdown works | |
| 3.2.8 | Upload profile photo | Photo uploaded and previews | |
| 3.2.9 | Click "Next" without required fields | Validation errors shown | |
| 3.2.10 | Fill all required fields, click "Next" | Advances to Step 2 | |

### 3.3 Step 2: Experience
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.3.1 | View experience form | Form fields visible | |
| 3.3.2 | Select highest qualification | Dropdown works (Bachelor's, Master's, PhD) | |
| 3.3.3 | Enter institution name | Text entered | |
| 3.3.4 | Select year of completion | Year picker works | |
| 3.3.5 | Upload CV/Resume | File uploaded | |
| 3.3.6 | Verify file size limit | Files > 5MB rejected | |
| 3.3.7 | Select subject expertise | Multi-select subjects | |
| 3.3.8 | Verify min/max subjects | Enforced (min 5 subjects) | |
| 3.3.9 | Enter years of experience | Number input | |
| 3.3.10 | Add portfolio/LinkedIn links | URLs validated | |
| 3.3.11 | Click "Next" | Advances to Step 3 | |

### 3.4 Step 3: Banking Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.4.1 | View banking form | Bank details fields visible | |
| 3.4.2 | Enter account holder name | Name entered | |
| 3.4.3 | Enter account number | Number entered | |
| 3.4.4 | Re-enter account number | Confirmation validated | |
| 3.4.5 | Enter IFSC code | IFSC validated | |
| 3.4.6 | Verify bank auto-fetch | Bank name auto-populated from IFSC | |
| 3.4.7 | Enter UPI ID (optional) | UPI format validated | |
| 3.4.8 | Accept terms | Checkbox checked | |
| 3.4.9 | Click "Next" | Advances to Step 4 | |

### 3.5 Step 4: Review & Submit
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.5.1 | View review screen | All entered data summarized | |
| 3.5.2 | Verify personal info section | Correct data displayed | |
| 3.5.3 | Verify experience section | Qualification, CV visible | |
| 3.5.4 | Verify banking section | Bank details (masked) shown | |
| 3.5.5 | Click "Edit" on any section | Returns to that step | |
| 3.5.6 | Click "Submit Application" | Confirmation dialog | |
| 3.5.7 | Confirm submission | Application submitted | |
| 3.5.8 | Verify redirect | Goes to Application Pending screen | |

### 3.6 Application Pending Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.6.1 | View pending screen | "Application Under Review" message | |
| 3.6.2 | Verify status indicator | Shows pending status | |
| 3.6.3 | Verify estimated time | "Within 24-48 hours" or similar | |
| 3.6.4 | Check contact support option | Support link/button available | |
| 3.6.5 | Try accessing dashboard | Blocked, stays on pending screen | |
| 3.6.6 | (After approval) Verify notification | Approval notification received | |
| 3.6.7 | (After approval) Verify redirect | Advances to activation | |

---

## 4. Activation Flow Testing

### 4.1 Activation Screen Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1.1 | After approval, view activation | Training modules list shown | |
| 4.1.2 | Verify progress indicator | Overall completion percentage | |
| 4.1.3 | Verify module list | Video and document modules listed | |
| 4.1.4 | Verify locked modules | Some locked until previous complete | |

### 4.2 Training Video Module
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.2.1 | Click on video module | Video player opens | |
| 4.2.2 | Verify video loads | Video plays | |
| 4.2.3 | Try skipping ahead | Cannot skip (or limited skip) | |
| 4.2.4 | Watch video to completion | Progress tracked to 100% | |
| 4.2.5 | Click "Mark Complete" | Module marked complete | |
| 4.2.6 | Verify next module unlocked | Next module accessible | |

### 4.3 Training Document Module
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.3.1 | Click on document module | Document viewer opens | |
| 4.3.2 | Verify document loads | PDF/content visible | |
| 4.3.3 | Scroll through document | Full document readable | |
| 4.3.4 | Click "Mark Complete" | Module marked complete | |

### 4.4 Qualification Quiz
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.1 | Complete all training modules | Quiz unlocked | |
| 4.4.2 | Click "Start Quiz" | Quiz screen loads | |
| 4.4.3 | Verify quiz info | 10 questions, scenario-based | |
| 4.4.4 | Read first question | Question and options displayed | |
| 4.4.5 | Select an answer | Option highlighted | |
| 4.4.6 | Navigate to next question | Next question loads | |
| 4.4.7 | Navigate back | Previous question with answer | |
| 4.4.8 | View question overview | Shows answered/unanswered | |
| 4.4.9 | Submit incomplete quiz | Warning shown | |
| 4.4.10 | Complete all questions | Submit button enabled | |
| 4.4.11 | Submit quiz | Results calculated | |
| 4.4.12 | (Pass) Verify success | Congratulations screen | |
| 4.4.13 | (Fail) Verify retry option | "Try Again" with attempt count | |

### 4.5 Activation Complete
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.5.1 | Complete quiz successfully | Activation complete screen | |
| 4.5.2 | Verify celebration animation | Confetti or success animation | |
| 4.5.3 | Verify welcome message | "Welcome, Supervisor!" | |
| 4.5.4 | Click "Go to Dashboard" | Redirects to dashboard | |

---

## 5. Dashboard Testing

### 5.1 Dashboard Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.1 | Navigate to dashboard | Dashboard loads | |
| 5.1.2 | Verify header | User name, notification bell | |
| 5.1.3 | Verify summary cards | Total Projects, Active, Pending QC, Completed | |
| 5.1.4 | Tap on summary card | Navigates to filtered project list | |

### 5.2 Earnings Summary
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.2.1 | Locate earnings section | Earnings summary visible | |
| 5.2.2 | Verify total earnings | Correct amount displayed | |
| 5.2.3 | Change period selector | Week/Month/Year options | |
| 5.2.4 | Select different period | Earnings update | |
| 5.2.5 | Click "View Details" | Opens earnings page | |

### 5.3 Quick Actions
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.3.1 | Locate quick actions | Action buttons visible | |
| 5.3.2 | Click "View Projects" | Opens projects list | |
| 5.3.3 | Click "Resources" | Opens resources page | |
| 5.3.4 | Click "Messages" | Opens chat list | |

### 5.4 Recent Projects
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.4.1 | Locate recent projects section | Project cards visible | |
| 5.4.2 | Verify project card info | Title, status, deadline, client | |
| 5.4.3 | Click on project card | Opens project detail | |
| 5.4.4 | Click "View All" | Opens full projects list | |

### 5.5 Doer Availability Indicator
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.5.1 | Locate doer availability | Shows available doers count | |
| 5.5.2 | Click on indicator | Opens doers list | |

### 5.6 Navigation Drawer
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.6.1 | Swipe or tap hamburger | Drawer opens | |
| 5.6.2 | Verify menu items | Dashboard, Projects, Messages, Earnings, Resources, Clients, Doers, Support, Notifications | |
| 5.6.3 | Tap each menu item | Navigates correctly | |
| 5.6.4 | Verify user info | Name, avatar, role | |

### 5.7 Bottom Navigation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.7.1 | Verify bottom nav | Dashboard, Projects, Chat, Profile | |
| 5.7.2 | Tap each nav item | Navigates to correct screen | |
| 5.7.3 | Verify active indicator | Current tab highlighted | |
| 5.7.4 | Verify badge on Chat | Shows unread count | |

---

## 6. Project Management Testing

### 6.1 Projects List
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1.1 | Navigate to Projects | Projects list loads | |
| 6.1.2 | Verify tabs | All, Active, Pending QC, Completed | |
| 6.1.3 | Click "All" tab | Shows all projects | |
| 6.1.4 | Click "Active" tab | Shows active projects only | |
| 6.1.5 | Click "Pending QC" tab | Shows projects awaiting QC | |
| 6.1.6 | Click "Completed" tab | Shows completed projects | |
| 6.1.7 | Use search | Search by title, project number | |
| 6.1.8 | Verify search results | Filtered list shown | |

### 6.2 Project Cards
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.2.1 | View project card | Card shows key info | |
| 6.2.2 | Verify project number | Format AX-XXXXX | |
| 6.2.3 | Verify status badge | Color-coded status | |
| 6.2.4 | Verify deadline | Time remaining shown | |
| 6.2.5 | Verify client info | Client name visible | |
| 6.2.6 | Click on card | Opens project detail | |

### 6.3 Project Detail - Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.1 | Open project detail | Detail page loads | |
| 6.3.2 | Verify header | Project title, status, deadline | |
| 6.3.3 | Verify project info section | Subject, word count, requirements | |
| 6.3.4 | View attached files | Reference files listed | |
| 6.3.5 | Download attached file | File downloads | |
| 6.3.6 | Verify deadline timer | Countdown visible | |

### 6.4 Project Detail - Pricing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.4.1 | Locate pricing section | Pricing breakdown visible | |
| 6.4.2 | Verify client price | Total amount from client | |
| 6.4.3 | Verify doer payout | Amount for doer | |
| 6.4.4 | Verify commission | Supervisor commission | |
| 6.4.5 | Verify platform fee | Platform fee amount | |
| 6.4.6 | Verify calculations | All amounts add up correctly | |

### 6.5 Project Detail - Client Info
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.5.1 | Locate client info card | Client details visible | |
| 6.5.2 | Verify client name | Name displayed | |
| 6.5.3 | Verify client type | Student/Professional | |
| 6.5.4 | Click "View Client Profile" | Opens client detail | |

### 6.6 Project Detail - Doer Info
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.6.1 | Locate doer info card | Doer details visible (if assigned) | |
| 6.6.2 | Verify doer name | Name displayed | |
| 6.6.3 | Verify doer rating | Rating shown | |
| 6.6.4 | Click "View Doer Profile" | Opens doer detail | |

### 6.7 Quote Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.7.1 | Open new project (unquoted) | "Set Quote" button visible | |
| 6.7.2 | Click "Set Quote" | Quote form opens | |
| 6.7.3 | Verify pricing calculator | Shows base price, adjustments | |
| 6.7.4 | Enter custom quote amount | Amount entered | |
| 6.7.5 | Enter quote notes | Notes entered | |
| 6.7.6 | Submit quote | Quote sent to client | |
| 6.7.7 | Verify status change | Project status updates | |
| 6.7.8 | Verify notification sent | Client receives quote notification | |

### 6.8 Doer Assignment
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.8.1 | Open paid project (unassigned) | "Assign Doer" button visible | |
| 6.8.2 | Click "Assign Doer" | Doer selection modal opens | |
| 6.8.3 | View available doers | List of matching doers | |
| 6.8.4 | Filter by subject | Filtered doer list | |
| 6.8.5 | Filter by availability | Only available doers shown | |
| 6.8.6 | Filter by rating | Minimum rating filter | |
| 6.8.7 | View doer details | Rating, completed projects, expertise | |
| 6.8.8 | Select a doer | Doer highlighted | |
| 6.8.9 | Confirm assignment | Doer assigned to project | |
| 6.8.10 | Verify notification | Doer receives assignment notification | |

### 6.9 Project History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.9.1 | Locate history section | History timeline visible | |
| 6.9.2 | Verify history entries | All status changes logged | |
| 6.9.3 | Verify timestamps | Date/time for each entry | |
| 6.9.4 | Verify actor info | Who made each change | |

---

## 7. Quality Control Testing

### 7.1 QC Review Cards
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1.1 | Open project with submitted work | QC review section visible | |
| 7.1.2 | View deliverable cards | Files listed with preview | |
| 7.1.3 | Click to download deliverable | File downloads | |
| 7.1.4 | Preview document | Document preview opens | |

### 7.2 Quality Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.2.1 | Locate quality reports | AI and Plagiarism reports visible | |
| 7.2.2 | View AI detection score | Score percentage shown | |
| 7.2.3 | View plagiarism score | Score percentage shown | |
| 7.2.4 | Click "View Full Report" | Full report opens | |
| 7.2.5 | Download report | Report PDF downloads | |

### 7.3 Approve Work
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.3.1 | Review deliverables | All files reviewed | |
| 7.3.2 | Click "Approve" | Confirmation dialog | |
| 7.3.3 | Add approval notes (optional) | Notes entered | |
| 7.3.4 | Confirm approval | Work approved | |
| 7.3.5 | Verify status change | Project moves to "QC Approved" | |
| 7.3.6 | Verify doer payment | Doer payout queued | |

### 7.4 Request Revision
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.4.1 | Review deliverables (issues found) | Issues identified | |
| 7.4.2 | Click "Request Revision" | Revision form opens | |
| 7.4.3 | Enter revision notes | Required notes entered | |
| 7.4.4 | Select revision type | Minor/Major revision | |
| 7.4.5 | Attach reference file (optional) | File uploaded | |
| 7.4.6 | Submit revision request | Request sent | |
| 7.4.7 | Verify status change | Project moves to "QC Rejected" | |
| 7.4.8 | Verify doer notification | Doer receives revision notification | |

### 7.5 Deliver to Client
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.5.1 | Open QC-approved project | "Deliver to Client" button visible | |
| 7.5.2 | Click "Deliver to Client" | Confirmation dialog | |
| 7.5.3 | Review deliverables | Final check | |
| 7.5.4 | Confirm delivery | Work delivered | |
| 7.5.5 | Verify status change | Project moves to "Delivered" | |
| 7.5.6 | Verify client notification | Client receives delivery notification | |

---

## 8. Earnings & Payments Testing

### 8.1 Earnings Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1.1 | Navigate to Earnings | Earnings page loads | |
| 8.1.2 | Verify total balance | Balance displayed prominently | |
| 8.1.3 | Verify available balance | Withdrawable amount shown | |
| 8.1.4 | Verify pending balance | Pending earnings shown | |

### 8.2 Earnings Chart
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.2.1 | Locate earnings chart | Chart visible | |
| 8.2.2 | Verify daily breakdown | Daily earnings bars | |
| 8.2.3 | Change period (Week) | Weekly view | |
| 8.2.4 | Change period (Month) | Monthly view | |
| 8.2.5 | Change period (Year) | Yearly view | |
| 8.2.6 | Tap on bar | Shows specific day's earnings | |

### 8.3 Commission Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.3.1 | Locate commission info | Commission rate displayed | |
| 8.3.2 | Verify commission percentage | Correct rate (e.g., 15%) | |
| 8.3.3 | Click "Learn More" | Commission details modal | |

### 8.4 Transaction History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.4.1 | Locate transaction history | Transactions listed | |
| 8.4.2 | Verify transaction types | Credit, Debit, Payout | |
| 8.4.3 | Filter by type | Shows only selected type | |
| 8.4.4 | Click on transaction | Details expand | |
| 8.4.5 | Verify transaction info | Amount, date, project, status | |
| 8.4.6 | Load more transactions | Pagination works | |

### 8.5 Request Payout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.5.1 | Click "Request Payout" | Payout form opens | |
| 8.5.2 | Verify minimum payout | Minimum amount enforced | |
| 8.5.3 | Enter amount > available | Validation error | |
| 8.5.4 | Enter valid amount | Amount accepted | |
| 8.5.5 | Verify bank details | Destination displayed | |
| 8.5.6 | Submit request | Payout requested | |
| 8.5.7 | Verify confirmation | Success message | |
| 8.5.8 | Verify pending amount updates | Available balance reduced | |

---

## 9. Resources Center Testing

### 9.1 Resources Overview
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1.1 | Navigate to Resources | Resources page loads | |
| 9.1.2 | Verify tabs | Tools, Training, Pricing | |

### 9.2 Tools Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.2.1 | Click "Tools" tab | Tools section visible | |
| 9.2.2 | Verify frequently used tools | Top tools listed | |
| 9.2.3 | Verify all tools grid | All available tools | |
| 9.2.4 | Click "Plagiarism Checker" | Tool opens | |
| 9.2.5 | Click "AI Detector" | Tool opens | |
| 9.2.6 | Click external tool | Opens in webview | |

### 9.3 Plagiarism Checker Tool
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.3.1 | Open plagiarism checker | Tool interface loads | |
| 9.3.2 | Upload document | Document uploaded | |
| 9.3.3 | Click "Check" | Processing starts | |
| 9.3.4 | View results | Plagiarism score shown | |
| 9.3.5 | View highlighted sources | Sources highlighted | |
| 9.3.6 | Download report | Report downloads | |

### 9.4 AI Detector Tool
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.4.1 | Open AI detector | Tool interface loads | |
| 9.4.2 | Upload document | Document uploaded | |
| 9.4.3 | Click "Detect" | Processing starts | |
| 9.4.4 | View results | AI percentage shown | |
| 9.4.5 | View detailed breakdown | Section-by-section analysis | |
| 9.4.6 | Download report | Report downloads | |

### 9.5 Training Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.5.1 | Click "Training" tab | Training section visible | |
| 9.5.2 | Verify "Continue Watching" | Incomplete videos shown | |
| 9.5.3 | Verify training library | All training modules | |
| 9.5.4 | Search for training | Search filter works | |
| 9.5.5 | Click on video | Video player opens | |
| 9.5.6 | Watch video | Progress tracked | |

### 9.6 Pricing Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.6.1 | Click "Pricing" tab | Pricing section visible | |
| 9.6.2 | View price table | Reference pricing table | |
| 9.6.3 | Click "Pricing Calculator" | Calculator opens | |

### 9.7 Pricing Calculator
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.7.1 | Open pricing calculator | Calculator form loads | |
| 9.7.2 | Select work type | Essay, Report, Thesis, etc. | |
| 9.7.3 | Select academic level | High School, Undergraduate, etc. | |
| 9.7.4 | Select urgency | Normal, Urgent, Very Urgent | |
| 9.7.5 | Enter page/word count | Count entered | |
| 9.7.6 | Verify calculated price | Price updates dynamically | |
| 9.7.7 | Verify breakdown | Base + urgency + level adjustments | |

---

## 10. Users/Clients Management Testing

### 10.1 Users/Clients List
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1.1 | Navigate to Users/Clients | Client list loads | |
| 10.1.2 | Verify client cards | Name, avatar, verification, projects | |
| 10.1.3 | Search for client | Search filter works | |
| 10.1.4 | Sort by name | Alphabetical sorting | |
| 10.1.5 | Sort by recent activity | Most recent first | |
| 10.1.6 | Sort by project count | Highest projects first | |

### 10.2 Client Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.2.1 | Click on client card | Client detail opens | |
| 10.2.2 | Verify contact info | Email, phone visible | |
| 10.2.3 | Verify stats | Total, Active, Completed projects, Total spent | |
| 10.2.4 | View personal notes | Notes section visible | |
| 10.2.5 | Edit personal notes | Notes editable | |
| 10.2.6 | Save notes | Notes saved | |
| 10.2.7 | View project history | Client's projects listed | |
| 10.2.8 | Click on project | Opens project detail | |

---

## 11. Doers Management Testing

### 11.1 Doers List
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.1.1 | Navigate to Doers | Doers list loads | |
| 11.1.2 | Verify doer cards | Name, avatar, rating, expertise, projects | |
| 11.1.3 | Search for doer | Search filter works | |

### 11.2 Doer Filters
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.2.1 | Click filter icon | Filter options open | |
| 11.2.2 | Toggle "Available Only" | Only available doers shown | |
| 11.2.3 | Set minimum rating (3+) | Filters by 3+ rating | |
| 11.2.4 | Set minimum rating (4+) | Filters by 4+ rating | |
| 11.2.5 | Select expertise area | Filters by subject | |
| 11.2.6 | Verify active filters bar | Applied filters shown | |
| 11.2.7 | Click "Clear All" | All filters removed | |

### 11.3 Doer Card Details
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.3.1 | View doer card | Card info visible | |
| 11.3.2 | Verify availability indicator | Green/red status | |
| 11.3.3 | Verify rating | Star rating shown | |
| 11.3.4 | Verify expertise tags | Subject tags visible | |
| 11.3.5 | Verify project counts | Completed, Active counts | |
| 11.3.6 | Click on card | Opens doer detail | |

### 11.4 Blacklist Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.4.1 | Navigate to Profile > Blacklist | Blacklist page opens | |
| 11.4.2 | View blacklisted doers | List of blacklisted doers | |
| 11.4.3 | Verify reason shown | Blacklist reason visible | |
| 11.4.4 | Click "Remove from Blacklist" | Confirmation dialog | |
| 11.4.5 | Confirm removal | Doer unblacklisted | |
| 11.4.6 | Add doer to blacklist (from doer detail) | Blacklist option available | |
| 11.4.7 | Enter blacklist reason | Reason required | |
| 11.4.8 | Confirm blacklist | Doer blacklisted | |

---

## 12. Chat & Communication Testing

### 12.1 Chat List
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.1.1 | Navigate to Chat | Chat list loads | |
| 12.1.2 | Verify chat rooms | Project-based chat rooms listed | |
| 12.1.3 | Verify unread grouping | Unread chats at top | |
| 12.1.4 | Verify unread count | Badge shows unread messages | |
| 12.1.5 | Search for chat | Search by project/name | |
| 12.1.6 | Click on chat room | Opens chat screen | |

### 12.2 Chat Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.2.1 | Open chat room | Chat messages load | |
| 12.2.2 | Verify message history | Previous messages visible | |
| 12.2.3 | Verify date separators | Messages grouped by date | |
| 12.2.4 | Verify sender names | Sender identified | |
| 12.2.5 | Scroll to load older | Pagination works | |

### 12.3 Sending Messages
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.3.1 | Type message | Text entered in input | |
| 12.3.2 | Click send | Message sent | |
| 12.3.3 | Verify message appears | Message in chat list | |
| 12.3.4 | Send empty message | Send disabled | |
| 12.3.5 | Send long message | Message wraps correctly | |

### 12.4 Message Replies
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.4.1 | Long press on message | Context menu appears | |
| 12.4.2 | Click "Reply" | Reply mode activated | |
| 12.4.3 | Type reply | Text entered | |
| 12.4.4 | Send reply | Reply shows with quote | |
| 12.4.5 | Cancel reply | Reply mode cancelled | |

### 12.5 File Attachments
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.5.1 | Click attachment icon | Attachment options open | |
| 12.5.2 | Select image | Image picker opens | |
| 12.5.3 | Choose image | Image uploaded | |
| 12.5.4 | Send image | Image appears in chat | |
| 12.5.5 | Select document | File picker opens | |
| 12.5.6 | Choose file | File uploaded | |
| 12.5.7 | Send file | File appears in chat | |
| 12.5.8 | Download received file | File downloads | |

### 12.6 Chat Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.6.1 | Click chat info icon | Chat info modal opens | |
| 12.6.2 | View project details | Project info shown | |
| 12.6.3 | View participants | Participants listed | |
| 12.6.4 | Click "Suspend Chat" | Confirmation dialog | |
| 12.6.5 | Confirm suspend | Chat suspended | |
| 12.6.6 | Verify suspended state | Messages disabled | |
| 12.6.7 | Click "Unsuspend Chat" | Chat reactivated | |

### 12.7 Real-time Updates
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.7.1 | Have another user send message | Message appears in real-time | |
| 12.7.2 | Verify notification | Notification received | |
| 12.7.3 | Verify unread badge updates | Badge increments | |

---

## 13. Support Center Testing

### 13.1 Support Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.1.1 | Navigate to Support | Support page loads | |
| 13.1.2 | Verify tabs | My Tickets, New Ticket | |
| 13.1.3 | Verify quick support | FAQ, Email, Chat, Phone options | |

### 13.2 My Tickets Tab
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.2.1 | Click "My Tickets" | Ticket list loads | |
| 13.2.2 | Verify status filter | All, Open, Pending, Resolved, Closed | |
| 13.2.3 | Filter by status | Shows filtered tickets | |
| 13.2.4 | (No tickets) Verify empty state | "No tickets" message | |
| 13.2.5 | Click on ticket | Ticket detail opens | |
| 13.2.6 | Load more tickets | Pagination works | |

### 13.3 Ticket Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.3.1 | Open ticket detail | Ticket thread loads | |
| 13.3.2 | Verify ticket info | Subject, status, priority, date | |
| 13.3.3 | View message thread | Messages listed chronologically | |
| 13.3.4 | Type reply | Text entered | |
| 13.3.5 | Send reply | Reply added to thread | |
| 13.3.6 | Verify status updates | Status reflected | |

### 13.4 New Ticket
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.4.1 | Click "New Ticket" tab | New ticket form loads | |
| 13.4.2 | Enter subject | Subject entered | |
| 13.4.3 | Enter description | Description entered | |
| 13.4.4 | Select category | Category dropdown works | |
| 13.4.5 | Select priority | Low, Medium, High, Urgent | |
| 13.4.6 | Submit with empty fields | Validation errors | |
| 13.4.7 | Submit valid ticket | Ticket created | |
| 13.4.8 | Verify success message | Confirmation shown | |
| 13.4.9 | Verify ticket in list | Appears in My Tickets | |

### 13.5 FAQ Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.5.1 | Click "FAQ" | FAQ page opens | |
| 13.5.2 | Verify FAQ list | Questions listed | |
| 13.5.3 | Search FAQ | Filter works | |
| 13.5.4 | Click on question | Answer expands (accordion) | |
| 13.5.5 | Click "Contact Support" FAB | Support options shown | |

### 13.6 Quick Support Actions
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.6.1 | Click "Email Support" | Email client opens with pre-filled address | |
| 13.6.2 | Click "Live Chat" | Chat opens | |
| 13.6.3 | Click "Phone Support" | Phone dialer opens | |

---

## 14. Notifications Testing

### 14.1 Notifications Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.1.1 | Navigate to Notifications | Notifications list loads | |
| 14.1.2 | Verify notification list | Notifications sorted by date | |
| 14.1.3 | Verify filter chips | All, Project, Chat, Payment, etc. | |
| 14.1.4 | Filter by type | Shows only selected type | |
| 14.1.5 | Click "Mark All as Read" | All marked as read | |
| 14.1.6 | Click "Clear All" | All notifications cleared | |

### 14.2 Notification Items
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.2.1 | View notification item | Title, message, time visible | |
| 14.2.2 | Verify unread indicator | Unread have visual indicator | |
| 14.2.3 | Click notification | Navigates to related content | |
| 14.2.4 | Swipe to dismiss | Notification dismissed | |
| 14.2.5 | Verify undo option | Undo dismiss available | |
| 14.2.6 | Click undo | Notification restored | |

### 14.3 Notification Types
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.3.1 | Receive "Project Assigned" | Notification appears | |
| 14.3.2 | Receive "Work Submitted" | Notification appears | |
| 14.3.3 | Receive "Quote Accepted/Rejected" | Notification appears | |
| 14.3.4 | Receive "Revision Requested" | Notification appears | |
| 14.3.5 | Receive "Chat Message" | Notification appears | |
| 14.3.6 | Receive "Payment Received" | Notification appears | |
| 14.3.7 | Click each notification type | Navigates correctly | |

### 14.4 Notification Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.4.1 | Navigate to Notification Settings | Settings page loads | |
| 14.4.2 | Toggle "Push Notifications" | Setting saved | |
| 14.4.3 | Toggle "Email Notifications" | Setting saved | |
| 14.4.4 | Toggle by type (Projects) | Setting saved | |
| 14.4.5 | Toggle by type (Chat) | Setting saved | |
| 14.4.6 | Toggle by type (Payments) | Setting saved | |
| 14.4.7 | Toggle by type (System) | Setting saved | |
| 14.4.8 | Toggle "Marketing Emails" | Setting saved | |
| 14.4.9 | Configure Quiet Hours | Quiet hours enabled | |
| 14.4.10 | Set quiet hours start time | Time picker works | |
| 14.4.11 | Set quiet hours end time | Time picker works | |
| 14.4.12 | Verify quiet hours enforced | No notifications during quiet hours | |

---

## 15. Reviews & Profile Testing

### 15.1 Profile Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.1.1 | Navigate to Profile | Profile page loads | |
| 15.1.2 | Verify avatar | Profile photo displayed | |
| 15.1.3 | Verify name | Full name shown | |
| 15.1.4 | Verify stats | Rating, Projects, Earnings | |
| 15.1.5 | Toggle theme | Dark/Light mode switches | |

### 15.2 Account Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.2.1 | Click "Edit Profile" | Edit screen opens | |
| 15.2.2 | Change profile photo | Photo updated | |
| 15.2.3 | Change name | Name updated | |
| 15.2.4 | Change phone | Phone updated | |
| 15.2.5 | Save changes | Changes persisted | |

### 15.3 Reviews Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.3.1 | Navigate to Reviews | Reviews page loads | |
| 15.3.2 | Verify average rating | Overall rating displayed | |
| 15.3.3 | Verify rating distribution | Star breakdown chart | |
| 15.3.4 | View individual reviews | Review cards listed | |
| 15.3.5 | Filter by rating | Shows only selected stars | |

### 15.4 Review Details
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.4.1 | Click on review | Review expands | |
| 15.4.2 | Verify client info | Client name shown | |
| 15.4.3 | Verify project info | Project reference shown | |
| 15.4.4 | Verify review date | Date displayed | |
| 15.4.5 | Click "Respond" | Response form opens | |
| 15.4.6 | Enter response | Response text entered | |
| 15.4.7 | Submit response | Response posted | |

---

## 16. Mobile App Specific Testing

### 16.1 App Installation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.1.1 | Install APK/IPA | App installs | |
| 16.1.2 | Open app | Splash screen appears | |
| 16.1.3 | Grant permissions | Camera, storage, notifications | |

### 16.2 Push Notifications
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.2.1 | Enable push notifications | Permission granted | |
| 16.2.2 | Receive "New Project" notification | Push appears | |
| 16.2.3 | Receive "Work Submitted" notification | Push appears | |
| 16.2.4 | Receive "Payment" notification | Push appears | |
| 16.2.5 | Tap notification | Opens relevant screen | |

### 16.3 Mobile Gestures
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.3.1 | Pull to refresh | Lists refresh | |
| 16.3.2 | Swipe to navigate | Swipe gestures work | |
| 16.3.3 | Long press actions | Context menus appear | |
| 16.3.4 | Pinch to zoom (docs) | Zoom works | |

### 16.4 Offline Behavior
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.4.1 | Turn off network | Offline indicator shows | |
| 16.4.2 | View cached content | Previously loaded data visible | |
| 16.4.3 | Try to perform action | Queued or error shown | |
| 16.4.4 | Reconnect | Syncs pending actions | |

### 16.5 WebView Tools
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.5.1 | Open external tool | WebView loads | |
| 16.5.2 | Use tool interface | Tool functions correctly | |
| 16.5.3 | Navigate within tool | Navigation works | |
| 16.5.4 | Close webview | Returns to app | |

---

## 17. Application Rejection & Resubmission Testing

### 17.1 Application Rejection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.1.1 | (Admin rejects application) Check app | Status changes to "Rejected" | |
| 17.1.2 | Verify rejection notification | Push/email notification received | |
| 17.1.3 | View rejection reason | Detailed reason displayed | |
| 17.1.4 | Locate "Resubmit" option | Resubmit button available | |

### 17.2 Resubmission Flow
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.2.1 | Click "Resubmit Application" | Registration wizard reopens | |
| 17.2.2 | Verify previous data loaded | Existing data pre-filled | |
| 17.2.3 | Update rejected sections | Able to edit | |
| 17.2.4 | Upload new CV | New file uploaded | |
| 17.2.5 | Submit updated application | Application resubmitted | |
| 17.2.6 | Verify status | "Under Review" again | |

### 17.3 Multiple Rejections
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.3.1 | (Second rejection) View status | Rejection reason shown | |
| 17.3.2 | Check resubmit limit | Max attempts info shown (if any) | |
| 17.3.3 | Contact support option | Escalation path available | |

---

## 18. Commission & Earnings Details Testing

### 18.1 Commission Rate Display
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.1.1 | Navigate to Earnings page | Earnings load | |
| 18.1.2 | Locate "Commission Rate" info | Rate displayed (e.g., 15%) | |
| 18.1.3 | Click "Commission Details" | Detailed breakdown modal | |
| 18.1.4 | Verify tier-based rates | Different rates by volume/level | |

### 18.2 Commission Calculation Verification
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.2.1 | View completed project | Project earnings visible | |
| 18.2.2 | Verify commission math | (Client Price - Doer Payout - Platform Fee) = Commission | |
| 18.2.3 | Check multiple projects | Calculations consistent | |

### 18.3 Earnings Milestones
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.3.1 | Locate earnings milestones | Progress to next tier shown | |
| 18.3.2 | View tier benefits | Higher tier = better commission rate | |
| 18.3.3 | (Reach new tier) Verify notification | Tier upgrade notification | |

---

## 19. Doer Performance Metrics in Assignment Testing

### 19.1 Doer Metrics Display
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.1.1 | Open doer assignment modal | Doer list with metrics | |
| 19.1.2 | Verify metrics per doer | Rating, Success %, On-time %, Projects | |
| 19.1.3 | View "Recommended" badge | Best match highlighted | |
| 19.1.4 | Sort by rating | Highest rated first | |
| 19.1.5 | Sort by success rate | Highest success first | |
| 19.1.6 | Sort by availability | Available first | |

### 19.2 Doer History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.2.1 | Click "View History" on doer | Past assignments shown | |
| 19.2.2 | Verify project outcomes | Ratings from previous work | |
| 19.2.3 | Check revision history | Number of revisions per project | |

### 19.3 Smart Assignment Suggestions
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.3.1 | View AI-suggested doer | "Best Match" recommendation | |
| 19.3.2 | Verify suggestion logic | Based on subject, rating, availability | |
| 19.3.3 | Override suggestion | Can select different doer | |

---

## 20. Quality Report Details Testing

### 20.1 AI Detection Report
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 20.1.1 | View project with AI report | AI score displayed | |
| 20.1.2 | Click "View Full AI Report" | Detailed report opens | |
| 20.1.3 | Verify section breakdown | Per-paragraph AI probability | |
| 20.1.4 | Verify color coding | Red (high AI), Yellow (medium), Green (low) | |
| 20.1.5 | View highlighted text | AI-flagged sections marked | |
| 20.1.6 | Export AI report | PDF download | |

### 20.2 Plagiarism Report
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 20.2.1 | View project with plagiarism report | Plagiarism score displayed | |
| 20.2.2 | Click "View Full Report" | Detailed report opens | |
| 20.2.3 | View matched sources | List of source URLs/documents | |
| 20.2.4 | View similarity breakdown | Percentage per source | |
| 20.2.5 | View highlighted matches | Matching text highlighted | |
| 20.2.6 | Export plagiarism report | PDF download | |

### 20.3 Report Thresholds
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 20.3.1 | View project with high AI score (>20%) | Warning indicator | |
| 20.3.2 | View project with high plagiarism (>15%) | Warning indicator | |
| 20.3.3 | Approve despite warning | Extra confirmation required | |
| 20.3.4 | Reject based on report | Report attached to rejection | |

---

## 21. Response Time & SLA Testing

### 21.1 Response Time Metrics
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.1.1 | Navigate to Statistics/Profile | Metrics visible | |
| 21.1.2 | Locate "Average Response Time" | Time displayed (e.g., 2.5 hours) | |
| 21.1.3 | Verify calculation | Time from project receipt to quote | |

### 21.2 Quote SLA
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.2.1 | Receive new project | SLA timer starts | |
| 21.2.2 | View pending quote projects | SLA deadline shown | |
| 21.2.3 | (Approaching SLA) View project | Warning indicator | |
| 21.2.4 | (SLA breached) View project | Overdue badge | |
| 21.2.5 | Set quote after SLA | Quote sent but late flag recorded | |

### 21.3 QC SLA
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.3.1 | Receive submitted work | QC SLA timer starts | |
| 21.3.2 | View pending QC projects | QC deadline shown | |
| 21.3.3 | Complete QC within SLA | On-time completion recorded | |
| 21.3.4 | (QC SLA breached) View project | Overdue QC badge | |

---

## 22. Advanced Chat Features Testing

### 22.1 Contact Info Detection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 22.1.1 | Try sending phone number in chat | Message flagged/blocked | |
| 22.1.2 | Try sending email address | Message flagged/blocked | |
| 22.1.3 | View flagged message warning | "Contact sharing not allowed" | |
| 22.1.4 | Verify notification to admin | System flags message | |

### 22.2 Chat Suspension Details
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 22.2.1 | Click "Suspend Chat" | Suspension form opens | |
| 22.2.2 | Enter suspension reason | Reason required | |
| 22.2.3 | Confirm suspension | Chat suspended | |
| 22.2.4 | Verify suspended state | "Chat Suspended" banner | |
| 22.2.5 | (Other party) Try sending message | "Chat is suspended" error | |
| 22.2.6 | Click "Unsuspend" | Chat reactivated | |

### 22.3 Message Moderation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 22.3.1 | Long press on inappropriate message | Moderation options | |
| 22.3.2 | Click "Report Message" | Report form opens | |
| 22.3.3 | Select report reason | Options: Spam, Inappropriate, etc. | |
| 22.3.4 | Submit report | Report sent to admin | |
| 22.3.5 | Click "Delete Message" | Message removed (for moderator) | |

---

## 23. Advanced Project Assignment Features

### 23.1 Bulk Assignment
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 23.1.1 | Select multiple pending projects | Multi-select enabled | |
| 23.1.2 | Click "Bulk Assign" | Assignment modal opens | |
| 23.1.3 | Select doer | Doer chosen | |
| 23.1.4 | Confirm bulk assignment | All selected projects assigned | |
| 23.1.5 | Verify notifications | Doer receives multiple notifications | |

### 23.2 Reassignment
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 23.2.1 | Open assigned project | Project detail loads | |
| 23.2.2 | Click "Reassign" | Reassignment confirmation | |
| 23.2.3 | Select new doer | New doer chosen | |
| 23.2.4 | Enter reassignment reason | Reason required | |
| 23.2.5 | Confirm reassignment | Project reassigned | |
| 23.2.6 | Verify original doer notified | Removal notification sent | |
| 23.2.7 | Verify new doer notified | Assignment notification sent | |

### 23.3 Assignment History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 23.3.1 | View project with reassignment | Assignment history visible | |
| 23.3.2 | Verify all assignments logged | Original and current doer | |
| 23.3.3 | Verify timestamps | When each assignment occurred | |

---

## 24. Reporting & Analytics Testing

### 24.1 Performance Dashboard
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 24.1.1 | Navigate to Statistics | Dashboard loads | |
| 24.1.2 | Verify KPI cards | Projects, Revenue, Rating, Response Time | |
| 24.1.3 | Verify charts | Visual representations | |
| 24.1.4 | Change date range | Data filters by period | |

### 24.2 Export Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 24.2.1 | Click "Export Report" | Export options appear | |
| 24.2.2 | Select format (PDF) | PDF generated | |
| 24.2.3 | Select format (CSV) | CSV downloaded | |
| 24.2.4 | Select date range | Report filtered | |
| 24.2.5 | Select report type | Projects/Earnings/Performance | |

### 24.3 Doer Performance Report
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 24.3.1 | Click "Doer Performance" | Report opens | |
| 24.3.2 | View doer rankings | Ranked by performance | |
| 24.3.3 | Filter by subject | Subject-specific performance | |
| 24.3.4 | Export doer report | Report downloads | |

---

## Test Execution Checklist

### Smoke Test (Critical Path)
- [ ] Login
- [ ] Complete activation (if new)
- [ ] View dashboard
- [ ] View projects
- [ ] Set quote on new project
- [ ] Assign doer to paid project
- [ ] Review submitted work (QC)
- [ ] Approve work
- [ ] Deliver to client
- [ ] View earnings
- [ ] Logout

### Regression Test (Full Coverage)
- [ ] All authentication flows
- [ ] Complete registration wizard
- [ ] All activation steps
- [ ] Dashboard functionality
- [ ] Project management
- [ ] Quote management
- [ ] Doer assignment
- [ ] QC review process
- [ ] Earnings and payouts
- [ ] Resources center
- [ ] Client management
- [ ] Doer management
- [ ] Blacklist functionality
- [ ] Chat functionality
- [ ] Support center
- [ ] Notifications
- [ ] Profile and reviews

### Cross-Platform Testing
- [ ] Android app
- [ ] iOS app
- [ ] Web (if available)

---

## Bug Reporting Template

```
**Bug ID**: SUP-XXX
**Title**: [Brief description]
**Environment**: Android/iOS, Version, OS Version
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
*Platform: AssignX Supervisor Platform*
