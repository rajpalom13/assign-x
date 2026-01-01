# AssignX User Platform - Complete Testing Guide

## Platform Overview
**Application**: AssignX User Platform
**URL**: http://localhost:3000
**Purpose**: Academic assistance platform for students and professionals to submit projects, get proofreading, AI/plagiarism reports, and expert consultations.

---

## Table of Contents
1. [Pre-requisites](#1-pre-requisites)
2. [Authentication Testing](#2-authentication-testing)
3. [Onboarding Flow Testing](#3-onboarding-flow-testing)
4. [Dashboard Testing](#4-dashboard-testing)
5. [Project Submission Testing](#5-project-submission-testing)
6. [Project Management Testing](#6-project-management-testing)
7. [Wallet & Payments Testing](#7-wallet--payments-testing)
8. [Student Connect/Marketplace Testing](#8-student-connectmarketplace-testing)
9. [Profile & Settings Testing](#9-profile--settings-testing)
10. [Notifications Testing](#10-notifications-testing)
11. [Chat Testing](#11-chat-testing)
12. [Mobile App Specific Testing](#12-mobile-app-specific-testing)

---

## 1. Pre-requisites

### Environment Setup
- [ ] Node.js installed (v18+)
- [ ] Web application running at `http://localhost:3000`
- [ ] Supabase backend connected
- [ ] Google OAuth credentials configured
- [ ] Razorpay test keys configured

### Test Accounts
Create test accounts for:
- [ ] New user (first-time registration)
- [ ] Existing student user
- [ ] Existing professional user
- [ ] User with wallet balance
- [ ] User with active projects

---

## 2. Authentication Testing

### 2.1 Splash Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1.1 | Open `http://localhost:3000` | Splash screen appears with AssignX logo and loading animation | |
| 2.1.2 | Wait 2-3 seconds | Auto-redirect based on auth state | |
| 2.1.3 | (If logged out) Verify redirect | Should redirect to `/onboarding` or `/login` | |
| 2.1.4 | (If logged in) Verify redirect | Should redirect to `/home` | |

### 2.2 Onboarding Carousel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.2.1 | Navigate to `http://localhost:3000/onboarding` | Onboarding screen with first slide appears | |
| 2.2.2 | Verify slide 1 content | Shows "Expert Help" message with illustration | |
| 2.2.3 | Swipe/click next | Advances to slide 2 | |
| 2.2.4 | Verify slide 2 content | Shows "Track Progress" message | |
| 2.2.5 | Swipe/click next | Advances to slide 3 | |
| 2.2.6 | Verify slide 3 content | Shows "Quality Guaranteed" message | |
| 2.2.7 | Click "Skip" button | Jumps to login page | |
| 2.2.8 | Verify pagination dots | Dots show current position and clickable | |

### 2.3 Login Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.3.1 | Navigate to `http://localhost:3000/login` | Login page loads with Google sign-in button | |
| 2.3.2 | Verify page elements | Logo, welcome text, Google button, T&C link visible | |
| 2.3.3 | Click "Continue with Google" | Google OAuth popup opens | |
| 2.3.4 | Select Google account | OAuth completes, redirects to callback | |
| 2.3.5 | (New user) Verify redirect | Redirects to role selection or profile setup | |
| 2.3.6 | (Existing user) Verify redirect | Redirects to `/home` dashboard | |
| 2.3.7 | Click Terms & Conditions link | Terms modal opens with full T&C text | |

### 2.4 Role Selection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.4.1 | (After first login) View role selection | Two options: "Student" and "Professional" | |
| 2.4.2 | Click "Student" card | Student card highlighted, continue enabled | |
| 2.4.3 | Click "Professional" card | Professional card highlighted | |
| 2.4.4 | Click "Continue" with Student selected | Redirects to `/signup/student` | |
| 2.4.5 | Click "Continue" with Professional selected | Redirects to `/signup/professional` | |

### 2.5 Student Registration
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.5.1 | Navigate to `http://localhost:3000/signup/student` | Student profile form loads | |
| 2.5.2 | Verify form fields | Full name, Phone, University, Course, Semester, Avatar | |
| 2.5.3 | Leave all fields empty, click Submit | Validation errors appear | |
| 2.5.4 | Enter invalid phone (less than 10 digits) | Phone validation error | |
| 2.5.5 | Click University dropdown | University search/selection opens | |
| 2.5.6 | Search for "Delhi" | Filtered results show Delhi universities | |
| 2.5.7 | Select a university | University selected, Course dropdown enabled | |
| 2.5.8 | Select course and semester | All fields populated | |
| 2.5.9 | Click avatar upload | Image picker opens | |
| 2.5.10 | Upload avatar image | Avatar preview shows | |
| 2.5.11 | Fill all fields correctly, submit | Success animation, redirect to home | |

### 2.6 Professional Registration
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.6.1 | Navigate to `http://localhost:3000/signup/professional` | Professional profile form loads | |
| 2.6.2 | Verify form fields | Full name, Phone, Industry, Job Title, Company (optional) | |
| 2.6.3 | Select industry from dropdown | Industry selected | |
| 2.6.4 | Fill all required fields | Form validates | |
| 2.6.5 | Submit form | Success animation, redirect to home | |

### 2.7 Logout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.7.1 | Click profile menu or sidebar | Menu options appear | |
| 2.7.2 | Click "Logout" | Confirmation dialog appears | |
| 2.7.3 | Confirm logout | Session cleared, redirect to login | |
| 2.7.4 | Try accessing `/home` | Redirected to login page | |

---

## 3. Onboarding Flow Testing

### 3.1 Progress Steps
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.1 | During signup, verify progress indicator | Shows current step (1/3, 2/3, etc.) | |
| 3.1.2 | Verify step labels | "User Type", "Profile Details", "Complete" | |
| 3.1.3 | Click back button | Returns to previous step | |
| 3.1.4 | Verify data persistence | Previous step data retained | |

---

## 4. Dashboard Testing

### 4.1 Dashboard Header
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1.1 | Navigate to `http://localhost:3000/home` | Dashboard loads | |
| 4.1.2 | Verify greeting message | Shows "Good morning/afternoon/evening, [Name]" | |
| 4.1.3 | Click notification bell | Notification panel opens | |
| 4.1.4 | Verify wallet pill | Shows current balance (e.g., "₹500") | |
| 4.1.5 | Click wallet pill | Redirects to `/wallet` | |

### 4.2 Services Grid
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.2.1 | Verify 4 service cards visible | Project, Proofreading, AI/Plag Report, Consultation | |
| 4.2.2 | Click "Project Support" card | Opens new project form or redirects to `/projects/new` | |
| 4.2.3 | Click "Proofreading" card | Opens proofreading form | |
| 4.2.4 | Click "AI/Plag Report" card | Opens report request form | |
| 4.2.5 | Click "Expert Consultation" card | Shows "Coming Soon" or opens form | |
| 4.2.6 | Verify service card icons and descriptions | Each card has unique icon and brief description | |

### 4.3 Banner Carousel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.3.1 | Verify promotional banner visible | Auto-rotating banner carousel | |
| 4.3.2 | Swipe/click to next banner | Advances to next promotion | |
| 4.3.3 | Click banner CTA | Opens relevant page (offer details, etc.) | |

### 4.4 Recent Projects Section
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.1 | Verify "Recent Projects" section | Shows up to 3 recent projects | |
| 4.4.2 | (No projects) Verify empty state | "No projects yet" message with CTA | |
| 4.4.3 | Click on a project card | Redirects to project detail | |
| 4.4.4 | Click "View All" | Redirects to `/projects` | |

### 4.5 Central FAB (Floating Action Button)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.5.1 | Verify FAB visible (+ button) | Centered FAB on bottom nav | |
| 4.5.2 | Click FAB | Upload/Service selection sheet opens | |
| 4.5.3 | Select "New Project" | Opens new project form | |
| 4.5.4 | Select "Proofreading" | Opens proofreading form | |
| 4.5.5 | Select "AI/Plag Report" | Opens report form | |
| 4.5.6 | Tap outside sheet | Sheet closes | |

### 4.6 Bottom Navigation (Mobile/Responsive)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.6.1 | Verify bottom nav items | Home, Projects, [FAB], Connect, Profile | |
| 4.6.2 | Click "Home" | Highlights Home, shows dashboard | |
| 4.6.3 | Click "Projects" | Highlights Projects, shows `/projects` | |
| 4.6.4 | Click "Connect" | Highlights Connect, shows Student Connect | |
| 4.6.5 | Click "Profile" | Highlights Profile, shows `/profile` | |

### 4.7 Sidebar Navigation (Desktop)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.7.1 | Verify sidebar items | Home, Projects, Wallet, Connect, Profile, Settings, Support | |
| 4.7.2 | Click each sidebar item | Navigates to correct page | |
| 4.7.3 | Verify active state highlighting | Current page highlighted | |
| 4.7.4 | Click collapse button | Sidebar collapses to icons only | |

---

## 5. Project Submission Testing

### 5.1 New Project Form (Multi-Step)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.1 | Navigate to `http://localhost:3000/projects/new` | Project form loads with Step 1 | |
| 5.1.2 | Verify step indicator | Shows "1/4" or step labels | |

#### Step 1: Subject Selection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.3 | Verify subject categories | Engineering, Science, Commerce, etc. | |
| 5.1.4 | Click a category | Expands to show subjects | |
| 5.1.5 | Select a subject | Subject selected, Next enabled | |
| 5.1.6 | Click "Next" | Advances to Step 2 | |

#### Step 2: Project Details
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.7 | Verify form fields | Title, Description, Word Count, Requirements | |
| 5.1.8 | Enter project title | Title field populated | |
| 5.1.9 | Enter description (min 50 chars) | Description validated | |
| 5.1.10 | Enter word count | Word count slider/input works | |
| 5.1.11 | Add special requirements | Requirements text added | |
| 5.1.12 | Click "Next" | Advances to Step 3 | |

#### Step 3: File Upload
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.13 | Verify file upload zone | Drag-drop area visible | |
| 5.1.14 | Drag and drop a file | File uploads, preview shows | |
| 5.1.15 | Click upload zone | File picker opens | |
| 5.1.16 | Select multiple files | All files uploaded | |
| 5.1.17 | Click remove (X) on file | File removed from list | |
| 5.1.18 | Verify file size limit (25MB) | Large files rejected with error | |
| 5.1.19 | Click "Next" | Advances to Step 4 | |

#### Step 4: Deadline & Review
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.20 | Verify deadline picker | Calendar/date picker visible | |
| 5.1.21 | Select date in past | Validation error - must be future | |
| 5.1.22 | Select date less than 24h away | Warning about urgent deadline | |
| 5.1.23 | Select valid future date | Date selected | |
| 5.1.24 | Select time | Time picker works | |
| 5.1.25 | Verify price estimate | Dynamic price based on word count + deadline | |
| 5.1.26 | Review project summary | All entered details displayed | |
| 5.1.27 | Click "Submit Project" | Loading state, then success | |
| 5.1.28 | Verify success screen | Confetti animation, project number shown | |
| 5.1.29 | Click "View Project" | Redirects to project detail | |

### 5.2 Proofreading Form
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.2.1 | Navigate to proofreading form | Form loads | |
| 5.2.2 | Verify required fields | Document upload, Word count, Deadline | |
| 5.2.3 | Upload document | File uploaded | |
| 5.2.4 | Select language | English/Hindi/other selected | |
| 5.2.5 | Select service level | Basic/Advanced/Premium | |
| 5.2.6 | Verify price updates | Price changes based on selections | |
| 5.2.7 | Submit form | Proofreading request created | |

### 5.3 AI/Plagiarism Report Form
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.3.1 | Navigate to `/services/report` | Report form loads | |
| 5.3.2 | Select report type | AI Check, Plagiarism Check, or Both | |
| 5.3.3 | Upload document | File uploaded | |
| 5.3.4 | Verify price display | Shows price for selected report type | |
| 5.3.5 | Submit form | Report request created | |

---

## 6. Project Management Testing

### 6.1 Projects List Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1.1 | Navigate to `http://localhost:3000/projects` | Projects list loads | |
| 6.1.2 | Verify filter tabs | All, Active, Completed, Cancelled | |
| 6.1.3 | Click "Active" tab | Shows only active projects | |
| 6.1.4 | Click "Completed" tab | Shows only completed projects | |
| 6.1.5 | Verify project cards | Each card shows title, status, deadline, progress | |
| 6.1.6 | Click on a project card | Redirects to `/project/[id]` | |

### 6.2 Project Detail Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.2.1 | Navigate to `http://localhost:3000/project/[id]` | Project detail loads | |
| 6.2.2 | Verify status banner | Shows current status with color code | |
| 6.2.3 | Verify project brief accordion | Expandable section with project details | |
| 6.2.4 | Click expand on accordion | Shows full description, requirements | |
| 6.2.5 | Verify attached files section | Shows uploaded reference files | |
| 6.2.6 | Click download on attached file | File downloads | |
| 6.2.7 | Verify deadline countdown | Shows time remaining | |

### 6.3 Project Status-Specific Testing

#### Draft Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.1 | View draft project | Shows "Draft" status, Edit button | |
| 6.3.2 | Click "Edit" | Opens edit form | |
| 6.3.3 | Click "Delete Draft" | Confirmation, then deletes | |

#### Quoted Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.4 | View quoted project | Shows quote amount prominently | |
| 6.3.5 | Verify quote breakdown | Base price, urgency fee, total visible | |
| 6.3.6 | Click "Pay Now" | Opens payment modal | |
| 6.3.7 | Click "Request Revision" | Opens revision request form | |

#### In Progress Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.8 | View in-progress project | Shows progress percentage | |
| 6.3.9 | Verify progress bar | Visual progress indicator | |
| 6.3.10 | Verify live draft tracker | Google Docs embed visible (if available) | |
| 6.3.11 | Click "Open in New Tab" on live draft | Opens Google Doc in new tab | |

#### Delivered Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.12 | View delivered project | Shows deliverables section | |
| 6.3.13 | Verify deliverable files | List of completed work files | |
| 6.3.14 | Click download on deliverable | File downloads | |
| 6.3.15 | Verify quality report badges | AI score, Plagiarism score displayed | |
| 6.3.16 | Click on quality badge | Shows full report | |
| 6.3.17 | Verify auto-approval timer | Shows countdown to auto-approve | |
| 6.3.18 | Click "Approve" | Project moves to Completed | |
| 6.3.19 | Click "Request Revision" | Opens revision form | |

#### Revision Requested
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.20 | View revision project | Shows revision request details | |
| 6.3.21 | Verify revision notes | User's revision notes visible | |

#### Completed Status
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.22 | View completed project | Shows completion badge | |
| 6.3.23 | Click "Download Invoice" | Invoice PDF downloads | |
| 6.3.24 | Click "Enter Grade" | Grade entry dialog opens | |
| 6.3.25 | Enter grade (A, B, 85%, etc.) | Grade saved | |
| 6.3.26 | Click "Rate Experience" | Rating dialog opens | |
| 6.3.27 | Submit rating | Rating saved | |

### 6.4 Project Timeline
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.4.1 | Navigate to `http://localhost:3000/project/[id]/timeline` | Timeline page loads | |
| 6.4.2 | Verify timeline entries | All status changes listed chronologically | |
| 6.4.3 | Verify timestamps | Each entry shows date/time | |
| 6.4.4 | Verify actor information | Shows who made each change | |

### 6.5 Revision Request
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.5.1 | Click "Request Revision" on delivered project | Revision form opens | |
| 6.5.2 | Verify form fields | Revision notes (required), File upload (optional) | |
| 6.5.3 | Enter revision notes | Text entered | |
| 6.5.4 | Upload supporting file | File uploaded | |
| 6.5.5 | Submit revision request | Project status changes to "Revision Requested" | |

---

## 7. Wallet & Payments Testing

### 7.1 Wallet Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1.1 | Navigate to `http://localhost:3000/wallet` | Wallet page loads | |
| 7.1.2 | Verify balance display | Current balance shown prominently | |
| 7.1.3 | Click "Add Money" | Top-up modal opens | |
| 7.1.4 | Enter amount (e.g., ₹500) | Amount entered | |
| 7.1.5 | Click "Pay" | Razorpay checkout opens | |
| 7.1.6 | Complete test payment | Balance updated | |
| 7.1.7 | Verify transaction history | Top-up transaction appears | |

### 7.2 Transaction History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.2.1 | Scroll down to transactions | Transaction list visible | |
| 7.2.2 | Verify transaction types | Credit, Debit badges | |
| 7.2.3 | Verify transaction details | Amount, date, description | |
| 7.2.4 | Filter by type | Shows only selected type | |
| 7.2.5 | Click on transaction | Expands to show more details | |

### 7.3 Payment Flow (Project Payment)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.3.1 | Go to quoted project, click "Pay Now" | Payment modal opens | |
| 7.3.2 | Verify payment options | Wallet, Card, UPI, Net Banking | |
| 7.3.3 | (Sufficient balance) Select "Pay from Wallet" | Wallet balance deducted, project paid | |
| 7.3.4 | (Insufficient balance) Select "Pay from Wallet" | Error message, prompt to add money | |
| 7.3.5 | Select "Pay with Card" | Razorpay card input opens | |
| 7.3.6 | Enter test card details | Card validated | |
| 7.3.7 | Complete payment | Success message, project status updated | |
| 7.3.8 | Verify payment confirmation | Email/notification received | |

### 7.4 Payment Methods Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.4.1 | Navigate to `http://localhost:3000/payment-methods` | Payment methods page loads | |
| 7.4.2 | Click "Add Card" | Card input form opens | |
| 7.4.3 | Enter card details | Card added | |
| 7.4.4 | Click "Add UPI" | UPI input opens | |
| 7.4.5 | Enter UPI ID | UPI saved | |
| 7.4.6 | Set default method | Default badge shows | |
| 7.4.7 | Delete a payment method | Method removed | |

---

## 8. Student Connect/Marketplace Testing

### 8.1 Connect Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1.1 | Navigate to `http://localhost:3000/connect` | Connect page loads | |
| 8.1.2 | Verify category tabs | Tutors, Study Groups, Resources, Q&A, Products, etc. | |
| 8.1.3 | Verify search bar | Search input visible | |
| 8.1.4 | Enter search term | Results filter in real-time | |

### 8.2 Tutors Section
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.2.1 | Click "Tutors" tab | Tutor listings shown | |
| 8.2.2 | Verify tutor cards | Photo, name, subject, rating, price | |
| 8.2.3 | Click on tutor card | Tutor profile sheet opens | |
| 8.2.4 | Verify profile details | Bio, subjects, availability, reviews | |
| 8.2.5 | Click "Book Session" | Booking sheet opens | |
| 8.2.6 | Select date/time | Slot selected | |
| 8.2.7 | Confirm booking | Booking created | |

### 8.3 Study Groups Section
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.3.1 | Click "Study Groups" tab | Study group listings shown | |
| 8.3.2 | Verify group cards | Title, subject, member count | |
| 8.3.3 | Click "Join Group" | Join confirmation | |
| 8.3.4 | Click "Create Group" | Group creation form opens | |

### 8.4 Resources Section
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.4.1 | Click "Resources" tab | Resource listings shown | |
| 8.4.2 | Verify resource cards | Title, type (PDF, video), downloads | |
| 8.4.3 | Click download | Resource downloads | |
| 8.4.4 | Click "Upload Resource" | Upload form opens | |

### 8.5 Q&A Section
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.5.1 | Click "Q&A" tab | Questions listed | |
| 8.5.2 | Click on a question | Expands to show answers | |
| 8.5.3 | Click "Ask Question" | Question form opens | |
| 8.5.4 | Enter question and submit | Question posted | |
| 8.5.5 | Click "Answer" on a question | Answer input opens | |
| 8.5.6 | Submit answer | Answer posted | |

### 8.6 Products/Marketplace
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.6.1 | Click "Products" tab | Product listings in masonry grid | |
| 8.6.2 | Verify product cards | Image, title, price, seller | |
| 8.6.3 | Click on product | Product detail page opens | |
| 8.6.4 | Click "Contact Seller" | Chat or inquiry opens | |
| 8.6.5 | Click "Create Listing" | Listing form opens | |

### 8.7 Create Listing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.7.1 | Navigate to `http://localhost:3000/connect/create` | Create listing form loads | |
| 8.7.2 | Select listing type | Product, Housing, Opportunity, etc. | |
| 8.7.3 | Upload images | Images uploaded with preview | |
| 8.7.4 | Enter title and description | Text entered | |
| 8.7.5 | Set price | Price entered | |
| 8.7.6 | Select category | Category selected | |
| 8.7.7 | Submit listing | Listing created, visible in marketplace | |

---

## 9. Profile & Settings Testing

### 9.1 Profile Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1.1 | Navigate to `http://localhost:3000/profile` | Profile page loads | |
| 9.1.2 | Verify profile header | Avatar, name, email, user type | |
| 9.1.3 | Click on avatar | Avatar upload dialog opens | |
| 9.1.4 | Upload new avatar | Avatar updated | |
| 9.1.5 | Verify stats section | Projects completed, Amount spent, etc. | |

### 9.2 Personal Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.2.1 | Click "Edit" on personal info | Form becomes editable | |
| 9.2.2 | Change full name | Name updated | |
| 9.2.3 | Change phone number | Phone updated | |
| 9.2.4 | Change date of birth | DOB updated | |
| 9.2.5 | Click "Save" | Changes saved | |

### 9.3 Academic/Professional Information
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.3.1 | Click "Edit" on academic info | Form becomes editable | |
| 9.3.2 | Change university | University updated | |
| 9.3.3 | Change course | Course updated | |
| 9.3.4 | Change semester | Semester updated | |
| 9.3.5 | Save changes | Changes persisted | |

### 9.4 Security Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.4.1 | Click "Security" section | Security settings expand | |
| 9.4.2 | Click "Change Password" | Password change form opens | |
| 9.4.3 | Enable Two-Factor Auth | 2FA setup flow starts | |
| 9.4.4 | View active sessions | List of logged-in devices | |
| 9.4.5 | Click "Logout All Devices" | All sessions terminated | |

### 9.5 Preferences
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.5.1 | Click "Preferences" section | Preferences expand | |
| 9.5.2 | Toggle dark mode | Theme changes | |
| 9.5.3 | Change language | Language updated | |
| 9.5.4 | Toggle notifications | Notification settings saved | |

### 9.6 Subscription
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.6.1 | Verify current subscription | Shows Free/Pro/Premium | |
| 9.6.2 | Click "Upgrade" | Subscription options shown | |
| 9.6.3 | Select a plan | Plan details displayed | |
| 9.6.4 | Complete upgrade payment | Subscription upgraded | |

### 9.7 Referral Program
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.7.1 | Find referral section | Referral code displayed | |
| 9.7.2 | Click "Copy Code" | Code copied to clipboard | |
| 9.7.3 | Click "Share" | Share options (WhatsApp, email) | |
| 9.7.4 | Verify referral stats | Total referrals, earnings shown | |

### 9.8 Danger Zone
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.8.1 | Scroll to Danger Zone | Delete account option visible | |
| 9.8.2 | Click "Delete Account" | Confirmation dialog with warning | |
| 9.8.3 | Type confirmation text | Delete button enables | |
| 9.8.4 | Click "Delete" (CAUTION) | Account deleted, logged out | |

### 9.9 Settings Page
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.9.1 | Navigate to `http://localhost:3000/settings` | Settings page loads | |
| 9.9.2 | Verify sections | Notifications, Privacy, About, etc. | |
| 9.9.3 | Toggle each notification type | Settings saved | |
| 9.9.4 | Click "Terms of Service" | Terms page opens | |
| 9.9.5 | Click "Privacy Policy" | Privacy page opens | |
| 9.9.6 | Check app version | Version number displayed | |

---

## 10. Notifications Testing

### 10.1 Notification Panel
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1.1 | Click notification bell | Notification panel opens | |
| 10.1.2 | Verify unread count badge | Shows number of unread | |
| 10.1.3 | View notification list | Notifications sorted by date | |
| 10.1.4 | Click on a notification | Navigates to relevant page | |
| 10.1.5 | Click "Mark all as read" | All notifications marked read | |
| 10.1.6 | Swipe to dismiss (mobile) | Notification dismissed | |

### 10.2 Push Notifications
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.2.1 | Enable push notifications | Browser permission requested | |
| 10.2.2 | Grant permission | Push subscription created | |
| 10.2.3 | Trigger a notification (e.g., quote received) | Push notification appears | |
| 10.2.4 | Click push notification | Opens app to relevant page | |

### 10.3 Notification Types
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.3.1 | Verify "Project Submitted" notification | Shows after project submission | |
| 10.3.2 | Verify "Quote Received" notification | Shows when supervisor quotes | |
| 10.3.3 | Verify "Payment Successful" notification | Shows after payment | |
| 10.3.4 | Verify "Project Delivered" notification | Shows when work delivered | |
| 10.3.5 | Verify "Revision Completed" notification | Shows after revision done | |
| 10.3.6 | Verify "Chat Message" notification | Shows for new messages | |

---

## 11. Chat Testing

### 11.1 Project Chat
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.1.1 | Go to project detail | Chat button/window visible | |
| 11.1.2 | Click chat button | Chat opens (panel or new page) | |
| 11.1.3 | Verify chat history | Previous messages loaded | |
| 11.1.4 | Type a message | Text appears in input | |
| 11.1.5 | Press send | Message sent, appears in chat | |
| 11.1.6 | Receive a reply | New message appears in real-time | |
| 11.1.7 | Upload file in chat | File uploaded and sent | |
| 11.1.8 | Reply to a message | Reply with quote | |

### 11.2 Floating Chat Button
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.2.1 | Verify floating chat FAB | Visible on project detail | |
| 11.2.2 | Click FAB | Chat panel opens | |
| 11.2.3 | Verify unread badge | Shows unread count | |

---

## 12. Mobile App Specific Testing

### 12.1 Flutter App Installation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.1.1 | Install APK / TestFlight build | App installs | |
| 12.1.2 | Open app | Splash screen appears | |
| 12.1.3 | Grant permissions (camera, storage) | Permissions granted | |

### 12.2 Mobile-Specific Features
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.2.1 | Test swipe gestures | Swipe navigation works | |
| 12.2.2 | Test pull-to-refresh | Lists refresh | |
| 12.2.3 | Test offline mode | Graceful error handling | |
| 12.2.4 | Test deep links | Opens correct screen | |

### 12.3 Document Viewer
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.3.1 | Navigate to project with live draft | Live draft button visible | |
| 12.3.2 | Click "View Live Draft" | WebView opens with Google Docs | |
| 12.3.3 | Verify document loads | Content visible | |
| 12.3.4 | Click back | Returns to project detail | |

---

## 13. Referral System Testing

### 13.1 Referral Code Generation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.1.1 | Navigate to `http://localhost:3000/profile` | Profile page loads | |
| 13.1.2 | Locate "Referral Program" section | Referral section visible | |
| 13.1.3 | Verify referral code displayed | Unique code format (e.g., EXPERTXXXX) | |
| 13.1.4 | Click "Copy Code" button | Code copied to clipboard, toast shown | |
| 13.1.5 | Click "Share" button | Share options appear (WhatsApp, Email, Copy Link) | |
| 13.1.6 | Click "Share via WhatsApp" | WhatsApp opens with pre-filled message | |
| 13.1.7 | Click "Share via Email" | Email client opens with referral link | |

### 13.2 Referral Code Redemption
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.2.1 | New user opens signup with referral link | Referral code pre-filled | |
| 13.2.2 | Manually enter referral code during signup | Code validated | |
| 13.2.3 | Enter invalid referral code | Error: "Invalid referral code" | |
| 13.2.4 | Enter own referral code | Error: "Cannot use your own code" | |
| 13.2.5 | Complete signup with valid code | Signup successful, referral tracked | |

### 13.3 Referral Earnings & Tracking
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 13.3.1 | View referral statistics | Total referrals, Pending, Completed | |
| 13.3.2 | Verify referral earnings | Earned amount displayed | |
| 13.3.3 | (Referee completes first project) Check earnings | Referral bonus credited | |
| 13.3.4 | View referral history | List of all referred users | |
| 13.3.5 | Verify referral status | Pending/Completed for each | |

---

## 14. Invoice Testing

### 14.1 Invoice Generation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.1.1 | Navigate to completed project | Project detail loads | |
| 14.1.2 | Locate "Download Invoice" button | Button visible | |
| 14.1.3 | Click "Download Invoice" | Invoice PDF downloads | |
| 14.1.4 | Verify invoice filename | Format: Invoice-AX-XXXXX.pdf | |

### 14.2 Invoice Content Verification
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.2.1 | Open downloaded invoice | PDF opens correctly | |
| 14.2.2 | Verify invoice header | AssignX logo, Invoice number, Date | |
| 14.2.3 | Verify client details | Name, Email, Address | |
| 14.2.4 | Verify project details | Title, Project number, Description | |
| 14.2.5 | Verify pricing breakdown | Base price, Urgency fee, Taxes, Total | |
| 14.2.6 | Verify payment status | "PAID" stamp visible | |
| 14.2.7 | Verify payment method | Card/UPI/Wallet shown | |
| 14.2.8 | Verify GST/Tax details | Tax registration, Amount | |

### 14.3 Invoice from Wallet
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 14.3.1 | Navigate to `http://localhost:3000/wallet` | Wallet page loads | |
| 14.3.2 | Click on a transaction | Transaction details expand | |
| 14.3.3 | Click "View Invoice" (for project payments) | Invoice opens/downloads | |

---

## 15. Two-Factor Authentication Testing

### 15.1 2FA Setup
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.1.1 | Navigate to `http://localhost:3000/profile` → Security | Security section loads | |
| 15.1.2 | Click "Enable Two-Factor Authentication" | 2FA setup wizard opens | |
| 15.1.3 | Verify authenticator app instructions | Setup instructions shown | |
| 15.1.4 | Scan QR code with authenticator app | Code added to app | |
| 15.1.5 | Enter 6-digit verification code | Code field accepts input | |
| 15.1.6 | Submit correct code | 2FA enabled successfully | |
| 15.1.7 | Submit incorrect code | Error: "Invalid code" | |
| 15.1.8 | View backup codes | 10 backup codes displayed | |
| 15.1.9 | Click "Download Backup Codes" | Text file downloads | |

### 15.2 2FA Login Flow
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.2.1 | Login with Google (2FA enabled) | Redirects to 2FA verification | |
| 15.2.2 | Enter correct TOTP code | Login successful | |
| 15.2.3 | Enter incorrect TOTP code | Error, retry allowed | |
| 15.2.4 | Click "Use Backup Code" | Backup code input shown | |
| 15.2.5 | Enter valid backup code | Login successful, code consumed | |
| 15.2.6 | Try used backup code | Error: "Code already used" | |

### 15.3 2FA Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 15.3.1 | Click "Disable 2FA" | Confirmation dialog | |
| 15.3.2 | Enter current TOTP to confirm | 2FA disabled | |
| 15.3.3 | Click "Regenerate Backup Codes" | New codes generated | |
| 15.3.4 | Verify old codes invalidated | Old codes no longer work | |

---

## 16. WhatsApp Notifications Testing

### 16.1 WhatsApp Opt-In
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.1.1 | Navigate to Settings → Notifications | Notification settings load | |
| 16.1.2 | Locate "WhatsApp Notifications" toggle | Toggle visible | |
| 16.1.3 | Enable WhatsApp notifications | Opt-in confirmation | |
| 16.1.4 | Verify phone number linked | Phone number shown | |
| 16.1.5 | Click "Update Phone Number" | Phone update dialog opens | |

### 16.2 WhatsApp Message Types
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.2.1 | Submit a project | WhatsApp: "Project submitted" message | |
| 16.2.2 | Receive quote | WhatsApp: "Quote received - ₹XXX" | |
| 16.2.3 | Project delivered | WhatsApp: "Your project is ready" | |
| 16.2.4 | Payment reminder | WhatsApp: "Payment pending for..." | |
| 16.2.5 | Revision completed | WhatsApp: "Revision ready for review" | |

### 16.3 WhatsApp Opt-Out
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 16.3.1 | Disable WhatsApp notifications | Confirmation dialog | |
| 16.3.2 | Confirm opt-out | WhatsApp notifications disabled | |
| 16.3.3 | Trigger notification event | No WhatsApp message received | |

---

## 17. Auto-Approval Timer Testing

### 17.1 Timer Display
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.1.1 | View delivered project | Auto-approval timer visible | |
| 17.1.2 | Verify timer format | Shows "XX hours YY minutes remaining" | |
| 17.1.3 | Verify 72-hour countdown | Timer starts at 72 hours from delivery | |
| 17.1.4 | Refresh page | Timer continues accurately | |
| 17.1.5 | Check timer updates | Timer decrements in real-time | |

### 17.2 Timer Actions
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.2.1 | Click "Approve" before timer expires | Project approved, timer stops | |
| 17.2.2 | Click "Request Revision" | Revision requested, timer stops | |
| 17.2.3 | (Let timer expire) Wait 72 hours | Project auto-approved | |
| 17.2.4 | Verify auto-approval notification | "Project auto-approved" notification | |
| 17.2.5 | Verify project status | Status = "auto_approved" | |

### 17.3 Timer Edge Cases
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 17.3.1 | Revision redelivered | New 72-hour timer starts | |
| 17.3.2 | Timer with < 1 hour | Shows "XX minutes remaining" | |
| 17.3.3 | Timer with < 1 minute | Shows "Less than 1 minute" | |

---

## 18. Campus Pulse Testing

### 18.1 Campus Pulse Feed
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.1.1 | Navigate to `http://localhost:3000/home` | Dashboard loads | |
| 18.1.2 | Locate "Campus Pulse" section | Feed section visible | |
| 18.1.3 | Verify feed items | Recent campus activity shown | |
| 18.1.4 | Scroll feed | More items load (infinite scroll) | |
| 18.1.5 | Click on feed item | Opens relevant detail | |

### 18.2 Feed Content Types
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 18.2.1 | Verify trending topics | Trending items highlighted | |
| 18.2.2 | Verify recent listings | New marketplace items | |
| 18.2.3 | Verify active discussions | Q&A with activity | |
| 18.2.4 | Verify campus events | Upcoming events shown | |

---

## 19. Advanced Marketplace Testing

### 19.1 Poll Listings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.1.1 | Navigate to Connect → Community | Community tab loads | |
| 19.1.2 | Find a poll listing | Poll with options visible | |
| 19.1.3 | Vote on a poll option | Vote registered | |
| 19.1.4 | Verify vote count updates | Count increments | |
| 19.1.5 | Try voting again | Error: "Already voted" | |
| 19.1.6 | View poll results | Results chart/percentages shown | |

### 19.2 Create Poll
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.2.1 | Click "Create Listing" → Poll | Poll creation form opens | |
| 19.2.2 | Enter poll question | Question entered | |
| 19.2.3 | Add poll options (min 2, max 6) | Options added | |
| 19.2.4 | Try submitting with 1 option | Error: "Minimum 2 options" | |
| 19.2.5 | Set poll duration | Duration selected (1 day, 1 week, etc.) | |
| 19.2.6 | Submit poll | Poll created and visible | |

### 19.3 Housing Listings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.3.1 | Navigate to Connect → Housing | Housing tab loads | |
| 19.3.2 | Verify listing types | Rooms, Flatmates, PG visible | |
| 19.3.3 | Click on housing listing | Detail page opens | |
| 19.3.4 | Verify housing details | Rent, Location, Amenities, Photos | |
| 19.3.5 | Click "Contact" | Contact options shown | |
| 19.3.6 | Click "Save" | Listing saved to favorites | |

### 19.4 Create Housing Listing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.4.1 | Click "Create Listing" → Housing | Housing form opens | |
| 19.4.2 | Select listing type | Room/Flatmate/PG | |
| 19.4.3 | Enter rent amount | Amount validated | |
| 19.4.4 | Enter location details | Address, Area, City | |
| 19.4.5 | Select amenities | Multi-select checkboxes | |
| 19.4.6 | Upload photos | Photos uploaded (max 10) | |
| 19.4.7 | Submit listing | Listing created | |

### 19.5 Events & Opportunities
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.5.1 | Navigate to Connect → Opportunities | Opportunities tab loads | |
| 19.5.2 | Filter by type | Jobs, Internships, Events | |
| 19.5.3 | Click on event/opportunity | Detail page opens | |
| 19.5.4 | Verify event details | Date, Time, Location, Description | |
| 19.5.5 | Click "Register" / "Apply" | Registration/application flow | |
| 19.5.6 | Click "Add to Calendar" | Calendar event created | |

### 19.6 Create Event/Opportunity
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 19.6.1 | Click "Create Listing" → Event | Event form opens | |
| 19.6.2 | Enter event title | Title entered | |
| 19.6.3 | Select date and time | Date/time picker works | |
| 19.6.4 | Enter venue/location | Location entered | |
| 19.6.5 | Add description | Description entered | |
| 19.6.6 | Set registration limit (optional) | Limit set | |
| 19.6.7 | Submit event | Event created | |

---

## 20. Reference Style Selection Testing

### 20.1 Reference Style in Project Form
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 20.1.1 | Navigate to new project form | Form loads | |
| 20.1.2 | Locate "Reference Style" dropdown | Dropdown visible | |
| 20.1.3 | Click dropdown | Options: APA, MLA, Harvard, Chicago, IEEE, etc. | |
| 20.1.4 | Select "APA 7th Edition" | Style selected | |
| 20.1.5 | Select "None/Not Required" | Option available | |
| 20.1.6 | Verify selection saved | Style shown in project summary | |

### 20.2 Reference Style in Project Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 20.2.1 | View project detail | Project info loads | |
| 20.2.2 | Locate reference style | Style displayed in project brief | |
| 20.2.3 | Verify delivered work | References formatted correctly | |

---

## 21. Promo Codes & Discounts Testing

### 21.1 Apply Promo Code
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.1.1 | Navigate to payment step | Payment page loads | |
| 21.1.2 | Locate "Have a promo code?" | Promo code input visible | |
| 21.1.3 | Enter valid promo code | Code validated | |
| 21.1.4 | Click "Apply" | Discount applied to total | |
| 21.1.5 | Verify discount amount | Discount shown in breakdown | |
| 21.1.6 | Verify new total | Total reduced correctly | |

### 21.2 Invalid Promo Codes
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.2.1 | Enter expired promo code | Error: "Code expired" | |
| 21.2.2 | Enter invalid promo code | Error: "Invalid code" | |
| 21.2.3 | Enter already-used code (single use) | Error: "Code already used" | |
| 21.2.4 | Enter code below minimum order | Error: "Minimum order ₹XXX required" | |

### 21.3 Remove Promo Code
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 21.3.1 | Click "Remove" next to applied code | Code removed | |
| 21.3.2 | Verify original total restored | Full amount shown | |

---

## Test Execution Checklist

### Smoke Test (Critical Path)
- [ ] Login with Google
- [ ] Submit a new project
- [ ] View project list
- [ ] Make a payment
- [ ] View delivered project
- [ ] Approve project
- [ ] Logout

### Regression Test (Full Coverage)
- [ ] All authentication flows
- [ ] All project types (Project, Proofreading, Report)
- [ ] All project statuses
- [ ] All payment methods
- [ ] All profile sections
- [ ] All Student Connect features
- [ ] Chat functionality
- [ ] Notifications

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Bug Reporting Template

```
**Bug ID**: USER-XXX
**Title**: [Brief description]
**Environment**: Web/Mobile, Browser, OS
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
*Platform: AssignX User Platform*
