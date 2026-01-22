# Supervisor Website Testing Checklist

**Testing URL:** http://localhost:3000
**Date:** 2026-01-20
**Status:** Ready for Testing

---

## 🔐 Authentication & Access (Priority: CRITICAL)

### Login Flow
- [ ] Navigate to http://localhost:3000/login
- [ ] Verify login form displays correctly
- [ ] Test login with valid supervisor credentials
- [ ] Verify error handling for invalid credentials
- [ ] Check "Remember Me" functionality
- [ ] Verify redirect to dashboard after successful login
- [ ] Test logout functionality

### Registration
- [ ] Navigate to http://localhost:3000/register
- [ ] Verify registration form displays all required fields
- [ ] Test form validation (email, password strength, etc.)
- [ ] Submit registration with valid data
- [ ] Verify success message and email verification prompt

### Onboarding
- [ ] Navigate to http://localhost:3000/onboarding
- [ ] Complete onboarding steps
- [ ] Verify profile information is saved correctly
- [ ] Check redirect to dashboard after onboarding

---

## 📊 Dashboard (Priority: HIGH)

### Main Dashboard (http://localhost:3000/dashboard)
- [ ] Verify dashboard loads without errors
- [ ] **Check all statistics cards display correctly:**
  - Total Projects count
  - Active Projects count
  - Total Earnings amount
  - This Month Earnings
  - Pending QC Reviews count
  - Average Rating
- [ ] **Verify charts and graphs display:**
  - Revenue trends chart
  - Projects by status chart
  - Projects by subject breakdown
- [ ] **Check recent activity feed:**
  - Recent project updates
  - Recent messages
  - Doer assignments
- [ ] **Verify quick actions work:**
  - "Review Projects" button
  - "Manage Doers" button
  - "View Earnings" button

---

## 📋 Projects Management (Priority: CRITICAL)

### Projects List (http://localhost:3000/projects)
- [ ] **Verify all project data columns are visible:**
  - Project Number
  - Title
  - User Name
  - Doer Name (if assigned)
  - Subject
  - Service Type
  - Status badge
  - Deadline
  - Quoted Amount
  - Doer Payout
  - Supervisor Commission
  - Created Date
- [ ] **Test filtering by status:**
  - All Projects
  - Submitted (awaiting assignment)
  - Assigned
  - In Progress
  - Submitted for QC
  - QC Approved
  - QC Rejected
  - Delivered
  - Revision Requested
  - In Revision
  - Completed
  - Cancelled
- [ ] **Test search functionality:**
  - Search by project number
  - Search by user name
  - Search by title
  - Search by subject
- [ ] **Test sorting:**
  - Sort by date (newest/oldest)
  - Sort by deadline (urgent first)
  - Sort by amount (high/low)
  - Sort by status
- [ ] **Test pagination:**
  - Navigate through pages
  - Change items per page
  - Verify total count matches
- [ ] **Test bulk actions (if available):**
  - Select multiple projects
  - Bulk status update
  - Bulk export

### Project Details (http://localhost:3000/projects/[projectId])
- [ ] Click on a project to open details
- [ ] **Verify all project information is visible:**
  - Project header (number, title, status)
  - User information (name, email, contact)
  - Doer information (name, rating, contact)
  - Service details (type, subject, word count, page count)
  - Timeline (created, assigned, submitted for QC, delivered, completed dates)
  - Financial breakdown (user amount, doer payout, supervisor commission, profit)
  - Deadline and time remaining
- [ ] **Test file management:**
  - View uploaded files (instructions, references)
  - Download project files
  - View submitted work files
  - Upload additional files
  - Delete files (if permitted)
- [ ] **Test chat/messaging:**
  - Send message to user
  - Send message to doer
  - View message history
  - Check unread message notifications
  - Verify real-time message updates
- [ ] **Test doer assignment:**
  - View available doers
  - Filter doers by skills/subjects
  - Assign doer to project
  - Reassign to different doer
  - View assignment history
- [ ] **Test QC functionality:**
  - Submit project for QC review
  - View QC report (plagiarism, AI, grammar, formatting scores)
  - Approve QC
  - Reject QC with feedback
  - Request revision
- [ ] **Test project status updates:**
  - Change status manually
  - Verify status change restrictions
  - Check status history/log
- [ ] **Test revision management:**
  - Request revision from doer
  - View revision history
  - Track revision completion
  - Approve revised work

---

## 👥 Users Management (Priority: HIGH)

### Users List (http://localhost:3000/users)
- [ ] **Verify all user data columns are visible:**
  - Full Name
  - Email
  - Phone
  - College
  - Course & Year
  - Total Projects count
  - Active Projects count
  - Completed Projects count
  - Total Spent amount
  - Average Project Value
  - Joined Date
  - Last Active date
  - Verification status badge
- [ ] **Test filtering:**
  - All users
  - Active users (with active projects)
  - Inactive users
  - Verified users
  - Unverified users
- [ ] **Test search:**
  - Search by name
  - Search by email
  - Search by college
- [ ] **Test sorting:**
  - Sort by name (A-Z, Z-A)
  - Sort by projects (high/low)
  - Sort by total spent (high/low)
  - Sort by join date (recent/oldest)
- [ ] Test pagination

### User Details (http://localhost:3000/users/[userId])
- [ ] Click on a user to view details
- [ ] **Verify all user information is visible:**
  - Profile information (name, email, phone, avatar)
  - Academic details (college, course, year)
  - Account status (verified, active)
  - Activity timeline (joined date, last active)
- [ ] **Verify user statistics:**
  - Total projects count
  - Active projects count
  - Completed projects count
  - Total spent
  - This month spent
  - Average project value
  - Projects by subject chart
  - Projects by status chart
- [ ] **View user's projects list:**
  - All projects for this user
  - Project details (number, title, status, deadline, amount)
  - Click to view project details
- [ ] **Test user actions:**
  - Edit user profile
  - Verify/unverify user
  - View user activity log
  - Send message to user

---

## 👨‍💼 Doers Management (Priority: HIGH)

### Doers List (http://localhost:3000/doers)
- [ ] **Verify all doer data columns are visible:**
  - Full Name
  - Email
  - Phone
  - Avatar
  - Qualification
  - Years of Experience
  - Skills list
  - Subjects list
  - Rating (stars)
  - Total Reviews count
  - Total Projects count
  - Completed Projects count
  - Active Projects count
  - Success Rate percentage
  - Average Response Time
  - Availability status (Available/Busy)
  - Verification status
  - Blacklist status
  - Joined Date
  - Last Active date
- [ ] **Test filtering:**
  - All doers
  - Available doers
  - Busy doers
  - Verified doers
  - Blacklisted doers
- [ ] **Test search:**
  - Search by name
  - Search by skills
  - Search by subjects
  - Search by email
- [ ] **Test sorting:**
  - Sort by name (A-Z, Z-A)
  - Sort by rating (high/low)
  - Sort by total projects (high/low)
  - Sort by success rate (high/low)
  - Sort by join date (recent/oldest)
- [ ] Test pagination

### Doer Details (http://localhost:3000/doers/[doerId])
- [ ] Click on a doer to view details
- [ ] **Verify all doer information is visible:**
  - Profile (name, email, phone, avatar, bio)
  - Qualifications and experience
  - Skills list
  - Subjects expertise
  - Rating and reviews count
  - Availability status
  - Verification status
  - Blacklist status and reason (if blacklisted)
- [ ] **Verify doer statistics:**
  - Total earnings
  - This month earnings
  - Average rating
  - Total reviews
  - On-time delivery rate
  - Revision rate
  - Projects by subject distribution
- [ ] **View doer's projects:**
  - All assigned projects
  - Active projects
  - Completed projects
  - Project details (number, title, status, deadline, payout)
- [ ] **View doer's reviews:**
  - All reviews with ratings
  - Reviewer names
  - Review comments
  - Review dates
  - Project links
- [ ] **Test doer actions:**
  - Edit doer profile
  - Verify/unverify doer
  - Blacklist/unblacklist doer
  - Add blacklist reason
  - View doer activity log
  - Send message to doer
  - Assign project to doer

---

## 💰 Earnings & Financials (Priority: HIGH)

### Earnings Dashboard (http://localhost:3000/earnings)
- [ ] **Verify financial overview:**
  - Total Earnings (all time)
  - This Month Earnings
  - Last Month Earnings
  - Pending Payouts
  - Average Commission per Project
- [ ] **Verify earnings charts:**
  - Monthly earnings trend (line/bar chart)
  - Earnings by service type
  - Earnings by subject
  - Commission breakdown
- [ ] **Test earnings table:**
  - All transactions/payouts listed
  - Project Number
  - User Name
  - Doer Name
  - Project Amount
  - Doer Payout
  - Supervisor Commission
  - Status
  - Date
- [ ] **Test filtering earnings:**
  - Filter by date range
  - Filter by service type
  - Filter by status (paid, pending)
  - Filter by amount range
- [ ] **Test export functionality:**
  - Export earnings report (CSV/PDF)
  - Download transaction statements
- [ ] **Test payout requests (if applicable):**
  - Request payout
  - View payout history
  - Check payout status

---

## 💬 Chat & Messaging (Priority: MEDIUM)

### Chat List (http://localhost:3000/chat)
- [ ] **Verify chat rooms list:**
  - All active conversations
  - Project number and title
  - Participant names (user, doer)
  - Last message preview
  - Timestamp
  - Unread count badge
- [ ] **Test filtering:**
  - All chats
  - Unread messages
  - Active projects only
- [ ] **Test search:**
  - Search by project number
  - Search by participant name

### Chat Room (http://localhost:3000/chat/[roomId])
- [ ] Open a chat room
- [ ] **Verify message display:**
  - All previous messages loaded
  - Sender names
  - Timestamps
  - Message status (sent, delivered, read)
  - File attachments visible
- [ ] **Test sending messages:**
  - Type and send text message
  - Verify message appears immediately
  - Send message with file attachment
  - Send multiple messages
- [ ] **Test real-time updates:**
  - Receive new messages without refresh
  - Typing indicators
  - Online status
- [ ] **Test file sharing:**
  - Upload and send file
  - Download received file
  - Preview images
- [ ] **Test message actions:**
  - Copy message text
  - Delete message (if permitted)
  - React to message (if available)

---

## 🔔 Notifications (Priority: MEDIUM)

### Notifications Page (http://localhost:3000/notifications)
- [ ] **Verify all notification types display:**
  - New project submitted
  - Project assigned to doer
  - Project submitted for QC
  - QC approved
  - QC rejected
  - Project delivered
  - Revision requested
  - New message received
  - Payment received
  - Doer application
- [ ] **Verify notification details:**
  - Notification title
  - Description
  - Timestamp
  - Read/unread status
  - Action button (link to relevant page)
  - Avatar/icon
- [ ] **Test notification actions:**
  - Click notification to navigate
  - Mark as read
  - Mark all as read
  - Delete notification
  - Delete all notifications
- [ ] **Test filtering:**
  - All notifications
  - Unread only
  - By type (projects, messages, payments)
- [ ] **Test notification badge:**
  - Unread count in header
  - Real-time update when new notification arrives

---

## 👤 Profile Management (Priority: MEDIUM)

### Profile Page (http://localhost:3000/profile)
- [ ] **Verify all profile information displays:**
  - Full Name
  - Email
  - Phone Number
  - Avatar/Profile Picture
  - Bio
  - Join Date
  - Account Type (Supervisor)
- [ ] **Test profile editing:**
  - Edit full name
  - Edit phone number
  - Update bio
  - Upload/change profile picture
  - Save changes
  - Verify changes persist after refresh
- [ ] **Test password change:**
  - Enter current password
  - Enter new password
  - Confirm new password
  - Submit and verify success message
- [ ] **Test email change (if allowed):**
  - Enter new email
  - Verify email verification sent
  - Confirm new email
- [ ] **View account statistics:**
  - Total supervised projects
  - Total earnings
  - Average rating
  - Join date

---

## ⚙️ Settings (Priority: LOW)

### Settings Page (http://localhost:3000/settings)
- [ ] **Verify all settings sections:**
  - Account Settings
  - Notification Preferences
  - Privacy Settings
  - Security Settings
  - Email Preferences
  - Display/Theme Settings
- [ ] **Test notification preferences:**
  - Email notifications toggle
  - Push notifications toggle
  - Notification types (projects, messages, payments)
  - Notification frequency
- [ ] **Test privacy settings:**
  - Profile visibility
  - Contact information visibility
  - Activity status
- [ ] **Test security settings:**
  - Two-factor authentication enable/disable
  - Active sessions list
  - Logout all devices
  - Change password
- [ ] **Test display settings:**
  - Dark/Light theme toggle
  - Language selection (if available)
  - Timezone selection

---

## 📚 Resources (Priority: LOW)

### Resources Page (http://localhost:3000/resources)
- [ ] Verify resources page loads
- [ ] **Check available resources:**
  - Guides and tutorials
  - FAQs
  - Pricing information
  - Service type details
  - Subject categories
  - Help articles
- [ ] **Test resource actions:**
  - View resource details
  - Download resources (if applicable)
  - Search resources
  - Filter by category

---

## 🆘 Support (Priority: MEDIUM)

### Support Page (http://localhost:3000/support)
- [ ] **Verify support options:**
  - Submit support ticket form
  - View existing tickets
  - FAQs section
  - Contact information
- [ ] **Test ticket submission:**
  - Fill subject
  - Fill description
  - Select category
  - Attach files (if available)
  - Submit ticket
  - Verify success message
- [ ] **View ticket history:**
  - All submitted tickets
  - Ticket status (open, in progress, resolved)
  - Ticket responses
- [ ] **Test support chat (if available):**
  - Open live chat
  - Send message
  - Receive response

---

## 🔄 Navigation & UI/UX (Priority: HIGH)

### Header/Navigation
- [ ] **Verify header elements:**
  - Logo visible
  - Navigation menu items
  - Search bar (if available)
  - Notifications icon with badge
  - Profile dropdown
  - Logout button
- [ ] **Test navigation menu:**
  - Dashboard link
  - Projects link
  - Users link
  - Doers link
  - Earnings link
  - Chat link
  - Notifications link
  - Profile link
  - Settings link
  - Resources link
  - Support link
- [ ] **Test responsive behavior:**
  - Mobile menu toggle
  - Navigation drawer
  - Hamburger menu

### Sidebar (if present)
- [ ] Verify sidebar displays correctly
- [ ] Test expand/collapse functionality
- [ ] Verify active page highlighting
- [ ] Test quick links and shortcuts

### Breadcrumbs
- [ ] Verify breadcrumb navigation on detail pages
- [ ] Click breadcrumb links to navigate back
- [ ] Check breadcrumb accuracy

### Loading States
- [ ] Verify loading spinners display
- [ ] Check skeleton screens (if implemented)
- [ ] Verify progress indicators for long operations

### Error Handling
- [ ] Test 404 page (visit invalid URL)
- [ ] Test error page (simulate server error)
- [ ] Check error messages are user-friendly
- [ ] Verify error recovery options

---

## 🧪 Data Integrity Checks (Priority: CRITICAL)

### Database Connection
- [ ] Verify data loads from Supabase correctly
- [ ] Check for console errors related to database
- [ ] Test real-time updates (if using Supabase subscriptions)

### Data Accuracy
- [ ] **Compare displayed data with database:**
  - Project counts match
  - Financial amounts match
  - User/Doer statistics accurate
  - Status badges correct
  - Dates formatted properly
- [ ] **Check calculations:**
  - Commission percentages correct
  - Doer payouts calculated accurately
  - Total earnings sum correct
  - Average ratings computed correctly

### Real-time Features
- [ ] Test real-time message updates
- [ ] Test real-time notification updates
- [ ] Test real-time project status changes
- [ ] Verify multiple user sessions sync correctly

---

## 🔍 Performance Checks (Priority: MEDIUM)

- [ ] **Check page load times:**
  - Dashboard loads in < 3 seconds
  - Project list loads in < 2 seconds
  - Detail pages load in < 2 seconds
- [ ] **Check for memory leaks:**
  - Open Chrome DevTools
  - Monitor memory usage
  - Navigate through pages
  - Check for increasing memory
- [ ] **Check network requests:**
  - No unnecessary API calls
  - Efficient data fetching
  - Proper caching implemented
- [ ] **Check bundle size:**
  - No large unused libraries
  - Code splitting implemented
  - Assets optimized

---

## 🔒 Security Checks (Priority: HIGH)

### Authentication
- [ ] Verify unauthorized access is blocked
- [ ] Test session expiration
- [ ] Check redirect to login on expired session
- [ ] Verify role-based access (supervisor-only features)

### Authorization
- [ ] Test accessing other user's data directly (should be blocked)
- [ ] Verify API endpoint security
- [ ] Check for exposed sensitive data in console/network tab

### Input Validation
- [ ] Test XSS prevention in text inputs
- [ ] Test SQL injection prevention (if using raw queries)
- [ ] Verify file upload restrictions (type, size)

---

## 📱 Responsive Design (Priority: MEDIUM)

### Desktop (1920x1080)
- [ ] Verify layout on large desktop screens
- [ ] Check all tables fit properly
- [ ] Verify charts scale correctly

### Laptop (1366x768)
- [ ] Test on standard laptop resolution
- [ ] Verify no horizontal scrolling
- [ ] Check sidebar doesn't overlap content

### Tablet (768x1024)
- [ ] Test on tablet portrait
- [ ] Test on tablet landscape
- [ ] Verify touch interactions work

### Mobile (375x667)
- [ ] Test on mobile portrait
- [ ] Verify responsive navigation (hamburger menu)
- [ ] Check tables are scrollable or stacked
- [ ] Verify forms are usable
- [ ] Test touch interactions

---

## 🐛 Bug Tracking

### Critical Bugs (Blocking)
| # | Page | Issue | Expected | Actual | Severity |
|---|------|-------|----------|--------|----------|
|   |      |       |          |        |          |

### Major Bugs (Important)
| # | Page | Issue | Expected | Actual | Severity |
|---|------|-------|----------|--------|----------|
|   |      |       |          |        |          |

### Minor Bugs (Nice to Fix)
| # | Page | Issue | Expected | Actual | Severity |
|---|------|-------|----------|--------|----------|
|   |      |       |          |        |          |

---

## ✅ Testing Summary

**Total Test Cases:** ~300+
**Passed:** [ ]
**Failed:** [ ]
**Blocked:** [ ]
**Not Tested:** [ ]

**Overall Status:** [ ] Ready for Production / [ ] Needs Fixes

**Critical Issues Found:** [ ]
**Must Fix Before Release:** [ ]

---

## 📝 Notes & Observations

*Add any additional observations, suggestions, or feedback here:*

---

**Tester:** Claude Code
**Testing Date:** 2026-01-20
**Application Version:** 0.1.0
**Last Updated:** 2026-01-20
