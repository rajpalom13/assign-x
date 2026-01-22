# Supervisor Website Testing Guide

**Testing Status:** ✅ Ready to Test
**Dev Server:** 🟢 Running on http://localhost:3000
**Database:** ✅ Connected with Real Data

---

## 📋 Quick Start

### 1. Access the Application
Open Chrome and navigate to:
```
http://localhost:3000
```

### 2. Login Credentials

Use one of these test supervisor accounts:

| Supervisor | Email | Projects | Rating | Earnings |
|-----------|-------|----------|--------|----------|
| **Dr. Arun Mehta** (CS) | supervisor.cs@assignx.com | 245 | 4.90⭐ | ₹485,000 |
| **Prof. Kavita Reddy** (Business) | supervisor.business@assignx.com | 189 | 4.80⭐ | ₹378,000 |
| **Dr. Suresh Nair** (Engineering) | supervisor.engineering@assignx.com | 312 | 4.95⭐ | ₹624,000 |

**Password:** You'll need to either:
- Use your existing test password
- Reset password via "Forgot Password" link
- Ask the admin to provide test passwords

---

## 📊 Available Test Data

The database contains **real test data**:

### Projects: 60 Total
| Status | Count | Description |
|--------|-------|-------------|
| **Submitted** | 11 | Awaiting supervisor assignment |
| **Paid** | 7 | Payment received, ready for assignment |
| **In Progress** | 15 | Currently being worked on by doers |
| **Assigned** | 2 | Assigned to doer but not started |
| **Submitted for QC** | 2 | Ready for supervisor quality review |
| **QC Approved** | 1 | Passed quality check |
| **Delivered** | 3 | Delivered to user |
| **Completed** | 14 | Fully completed projects |
| **In Revision** | 1 | Undergoing revision |
| **Revision Requested** | 1 | Revision needed |
| **Analyzing** | 1 | Being analyzed |
| **Payment Pending** | 1 | Awaiting payment |
| **Cancelled** | 1 | Cancelled project |

### Users: 22 Students
All active users with various projects and histories.

### Doers: 52 Professionals
Active doers available for project assignment.

---

## 🧪 Testing Workflow

### Phase 1: Authentication (5 mins)
1. Go to http://localhost:3000
2. If redirected to login, use supervisor credentials
3. Verify successful login and redirect to dashboard
4. Check profile information displays correctly
5. Test logout and re-login

### Phase 2: Dashboard Overview (10 mins)
1. Verify all statistics cards show correct numbers:
   - Total Projects
   - Active Projects
   - Pending QC Reviews
   - Total Earnings
   - This Month Earnings
   - Average Rating
2. Check charts display properly
3. Verify recent activity feed shows latest updates
4. Test quick action buttons

### Phase 3: Projects Management (20 mins)

#### View Projects List
1. Navigate to **Projects** page
2. **Check all columns display:**
   - Project Number (PRJ-2024-xxx)
   - Title
   - User Name
   - Doer Name (if assigned)
   - Subject
   - Service Type
   - Status badge with correct color
   - Deadline
   - Financial amounts (user quote, doer payout, supervisor commission)
   - Created Date

#### Filter Projects
Test each status filter:
- All Projects
- Submitted (should show 11)
- Assigned (should show 2)
- In Progress (should show 15)
- Submitted for QC (should show 2)
- QC Approved (should show 1)
- Delivered (should show 3)
- Completed (should show 14)
- Others...

#### Search Projects
- Search by project number: "PRJ-2024-001"
- Search by title keywords
- Search by user name
- Verify results match search criteria

#### Sort Projects
- Sort by date (newest/oldest)
- Sort by deadline (urgent first)
- Sort by amount
- Verify sorting works correctly

#### View Project Details
1. Click on any project (try PRJ-2024-001 or PRJ-2024-004)
2. **Verify all information displays:**
   - Project header with number, title, status
   - User information (name, email, contact)
   - Doer information (if assigned)
   - Service details
   - Timeline dates
   - Financial breakdown
   - Deadline countdown
3. **Check file sections:**
   - Uploaded files visible
   - Download files works
   - File types display correctly
4. **Test chat/messaging:**
   - Open chat with user
   - Open chat with doer
   - Send a test message
   - Verify message appears
5. **Test QC functionality (for projects with status "submitted_for_qc"):**
   - View QC scores (plagiarism, AI, grammar)
   - Test approve button
   - Test reject button
   - Test request revision
6. **Test doer assignment:**
   - View available doers list
   - Filter by skills/subjects
   - Assign doer to unassigned project
   - Verify assignment successful

### Phase 4: Users Management (15 mins)

#### Users List
1. Navigate to **Users** page
2. **Verify all columns display:**
   - Full Name
   - Email
   - Phone
   - College/University
   - Course & Year
   - Total Projects
   - Active Projects
   - Completed Projects
   - Total Spent
   - Average Project Value
   - Joined Date
   - Verification status

#### User Details
1. Click on any user
2. **Verify information:**
   - Profile details
   - Statistics (total projects, spending, etc.)
   - Projects list for this user
   - Activity timeline
3. **Test actions:**
   - View user's projects
   - Send message to user
   - Edit user profile (if permitted)

### Phase 5: Doers Management (15 mins)

#### Doers List
1. Navigate to **Doers** page (should show 52 doers)
2. **Verify all columns display:**
   - Full Name
   - Email
   - Qualification
   - Years of Experience
   - Skills list
   - Subjects expertise
   - Rating (stars)
   - Total Projects
   - Success Rate %
   - Availability status
   - Verification status

#### Doer Details
1. Click on any doer
2. **Verify information:**
   - Profile details (bio, qualifications, experience)
   - Skills and subjects
   - Statistics (earnings, rating, delivery rate)
   - Projects list
   - Reviews and ratings
3. **Test actions:**
   - View doer's projects
   - Assign project to doer
   - Verify/unverify doer
   - Blacklist/unblacklist
   - Send message

### Phase 6: Earnings & Financials (10 mins)

1. Navigate to **Earnings** page
2. **Verify displays:**
   - Total earnings (should match supervisor's total)
   - This month earnings
   - Pending payouts
   - Average commission per project
3. **Check charts:**
   - Monthly earnings trend
   - Earnings by service type
   - Earnings by subject
4. **Check earnings table:**
   - All transactions listed
   - Correct project details
   - Accurate amounts
   - Proper status badges
5. **Test filtering:**
   - Filter by date range
   - Filter by service type
   - Filter by status
6. **Test export (if available):**
   - Export earnings report
   - Download statements

### Phase 7: Chat & Messaging (10 mins)

1. Navigate to **Chat** page
2. **Verify chat rooms list:**
   - All conversations listed
   - Project details shown
   - Participant names
   - Last message preview
   - Unread count badges
3. **Open a chat room:**
   - Click on any conversation
   - Verify all messages load
   - Test sending a message
   - Test uploading a file
   - Check timestamps
   - Verify message status indicators

### Phase 8: Notifications (5 mins)

1. Navigate to **Notifications** page
2. **Check notifications:**
   - All notification types display
   - Notification details (title, description, timestamp)
   - Read/unread status
   - Action buttons work
3. **Test actions:**
   - Click notification to navigate
   - Mark as read
   - Mark all as read
   - Delete notification
4. **Check header notification badge:**
   - Unread count displays
   - Badge updates on new notification

### Phase 9: Profile & Settings (10 mins)

#### Profile
1. Navigate to **Profile** page
2. **Verify information:**
   - Full name
   - Email
   - Phone
   - Avatar
   - Bio
   - Join date
   - Account statistics
3. **Test editing:**
   - Edit name
   - Edit phone
   - Update bio
   - Upload profile picture
   - Save changes
   - Verify changes persist

#### Settings
1. Navigate to **Settings** page
2. **Test all sections:**
   - Notification preferences
   - Privacy settings
   - Security settings
   - Theme toggle (dark/light)
   - Email preferences
3. **Test password change:**
   - Enter current password
   - Enter new password
   - Submit and verify

### Phase 10: Navigation & UI/UX (5 mins)

1. **Test navigation menu:**
   - Click each menu item
   - Verify correct page loads
   - Check active page highlighting
2. **Test header:**
   - Logo clicks to home
   - Profile dropdown works
   - Notifications icon functional
   - Search bar (if present)
3. **Test responsive behavior:**
   - Resize browser window
   - Check mobile view (toggle device toolbar)
   - Verify hamburger menu on mobile
   - Test touch interactions
4. **Check loading states:**
   - Look for loading spinners
   - Check skeleton screens
5. **Test error handling:**
   - Visit invalid URL (test 404 page)
   - Check error messages are clear

---

## 🐛 Bug Reporting Template

When you find an issue, document it using this format:

```markdown
### Bug #X: [Short Description]

**Page:** [Page name/URL]
**Severity:** Critical / Major / Minor
**Browser:** Chrome [version]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
[Check browser console for errors]
```

---

## 📸 Screenshots to Capture

Take screenshots of:
1. Dashboard with all statistics
2. Projects list (full view)
3. Project detail page (full page)
4. Users list
5. Doers list
6. Earnings page with charts
7. Chat interface
8. Notifications page
9. Profile page
10. Any bugs or issues found

---

## ✅ Testing Checklist

Use the comprehensive checklist at:
📄 **D:\assign-x\docs\SUPERVISOR_TESTING_CHECKLIST.md**

This contains 300+ detailed test cases for thorough testing.

---

## 🔍 Key Focus Areas

### Data Integrity (CRITICAL)
- [ ] All project data displays correctly
- [ ] Financial calculations are accurate
- [ ] User statistics match database
- [ ] Doer statistics match database
- [ ] Earnings totals are correct
- [ ] Status badges show correct status

### Functionality (HIGH)
- [ ] Projects can be assigned to doers
- [ ] QC approval/rejection works
- [ ] Chat messages send and receive
- [ ] File uploads work
- [ ] Search and filters work
- [ ] Sorting works correctly
- [ ] Pagination works

### UI/UX (MEDIUM)
- [ ] All pages load without errors
- [ ] Navigation is intuitive
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Responsive design works
- [ ] Theme toggle works

### Performance (MEDIUM)
- [ ] Pages load quickly (< 3 seconds)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Fast interactions

---

## 📊 Expected Results

After testing, you should verify:

1. **Dashboard shows:**
   - Total Projects: 60
   - Projects by various statuses
   - Financial data for the logged-in supervisor
   - Recent activity updates

2. **Projects page shows:**
   - All 60 projects (or subset for specific supervisor)
   - Correct filtering by status
   - Accurate search results
   - Working sort functionality

3. **Users page shows:**
   - All 22 students/users
   - Complete user information
   - User statistics
   - User project history

4. **Doers page shows:**
   - All 52 doers
   - Complete doer profiles
   - Doer statistics
   - Availability status

5. **Earnings page shows:**
   - Accurate financial data
   - Correct commission calculations
   - Proper chart visualizations
   - Transaction history

---

## 🚨 Critical Issues to Watch For

1. **Authentication Issues:**
   - Unable to login
   - Session expires too quickly
   - Logout doesn't work

2. **Data Not Displaying:**
   - Empty tables/lists
   - Missing information
   - Incorrect data
   - Broken images/avatars

3. **Functionality Broken:**
   - Buttons don't work
   - Forms don't submit
   - Chat messages don't send
   - Files don't upload
   - Search returns no results

4. **Console Errors:**
   - JavaScript errors
   - API call failures
   - 404 errors
   - Authentication errors

5. **Performance Issues:**
   - Slow page loads
   - Frozen UI
   - Memory leaks
   - Excessive API calls

---

## 💡 Testing Tips

1. **Open Browser DevTools:**
   - Press F12
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Monitor API calls

2. **Test Different Scenarios:**
   - Try edge cases
   - Test with empty data
   - Test with large datasets
   - Test error conditions

3. **Test User Flows:**
   - Complete end-to-end workflows
   - Assign project → QC review → Approve → Deliver
   - Create message thread with user
   - Filter → Search → Sort → View details

4. **Document Everything:**
   - Take notes of issues
   - Screenshot problems
   - Copy error messages
   - Note browser console errors

---

## 📝 After Testing

Once testing is complete:

1. **Fill out bug tracking section** in SUPERVISOR_TESTING_CHECKLIST.md
2. **Document results** with screenshots
3. **Prioritize issues** (Critical → Major → Minor)
4. **Create summary report** with findings
5. **Share results** for fixing

---

**Happy Testing! 🎉**

For detailed test cases, refer to: `D:\assign-x\docs\SUPERVISOR_TESTING_CHECKLIST.md`
