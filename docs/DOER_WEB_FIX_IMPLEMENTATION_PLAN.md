# Doer Web - Bug Fix Implementation Plan

**Date:** January 20, 2026
**Status:** 🚀 READY TO IMPLEMENT
**Priority:** CRITICAL
**Estimated Time:** 45-60 minutes

---

## Executive Summary

This plan addresses all bugs found during comprehensive Chrome testing of the doer web application. The primary issue is a critical authentication bug that blocks 100% of data loading functionality. Secondary issues include missing pages and a minor avatar loading issue.

**Total Bugs Found:** 3 critical issues
**Fixes Required:** 5 implementation tasks
**Testing Required:** 8 verification steps

---

## Bugs Summary

### 🔴 Critical Priority
1. **Session Synchronization Bug** - Client cannot access server auth cookies
   - Impact: Blocks all data loading
   - Severity: CRITICAL
   - File: `doer-web/lib/supabase/client.ts`

### 🟡 Medium Priority
2. **Missing Help & Support Page** - /support returns 404
   - Impact: Poor UX, broken navigation link
   - Severity: MEDIUM
   - File: `doer-web/app/(main)/support/page.tsx` (missing)

3. **Missing Settings Page** - /settings returns 404
   - Impact: Poor UX, broken navigation link
   - Severity: MEDIUM
   - File: `doer-web/app/(main)/settings/page.tsx` (missing)

### 🟢 Low Priority
4. **Missing Default Avatar** - /avatars/default.jpg returns 404
   - Impact: Console errors, minor UX issue
   - Severity: LOW
   - File: `doer-web/public/avatars/default.jpg` (missing)

---

## Implementation Strategy

### Phase 1: Critical Bug Fix (Priority 1)
**Goal:** Fix authentication to enable data loading
**Time:** 10 minutes

1. Update `doer-web/lib/supabase/client.ts`
2. Add cookie handling configuration
3. Test with Chrome browser
4. Verify auth hook completes

### Phase 2: Missing Pages (Priority 2)
**Goal:** Implement all navigation pages
**Time:** 20 minutes

1. Create Help & Support page
2. Create Settings page
3. Test navigation to both pages
4. Verify no 404 errors

### Phase 3: Minor Fixes (Priority 3)
**Goal:** Fix avatar loading
**Time:** 5 minutes

1. Add default avatar image
2. Verify image loads correctly
3. Check for 404 errors

### Phase 4: Comprehensive Testing (Priority 4)
**Goal:** Verify all fixes work together
**Time:** 20 minutes

1. Test all pages with Chrome
2. Verify data loading
3. Test with Supabase MCP
4. Create verification report

---

## Detailed Implementation Plan

---

## FIX 1: Session Synchronization Bug ⚡ CRITICAL

### Problem Statement
The Supabase browser client cannot access server-set authentication cookies, causing the `useAuth()` hook to never complete initialization. This blocks all data loading in the application.

### Root Cause
**File:** `doer-web/lib/supabase/client.ts`

The browser client uses default `createBrowserClient()` without custom cookie handlers. Unlike the server client which has explicit `getAll()` and `setAll()` methods, the browser client cannot read httpOnly cookies set during OAuth callback.

### Current Code
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
```

### Fix Required
Add cookie handling methods to browser client configuration:

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : null
          },
          set(name: string, value: string, options: any) {
            let cookie = `${name}=${encodeURIComponent(value)}`

            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`
            }
            if (options?.path) {
              cookie += `; path=${options.path}`
            }
            if (options?.domain) {
              cookie += `; domain=${options.domain}`
            }
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            }
            if (options?.secure) {
              cookie += '; secure'
            }

            document.cookie = cookie
          },
          remove(name: string, options: any) {
            this.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
  }
  return supabaseClient
}
```

### Testing Steps
1. Apply the fix
2. Restart Next.js dev server
3. Open Chrome to http://localhost:3000
4. Check console for auth completion logs
5. Verify dashboard shows data instead of loading skeletons
6. Check user profile shows "Om Rajpal / om@agiready.io"

### Success Criteria
- ✅ Console shows: `[Auth] User: Found`
- ✅ Console shows: `[Auth] Profile: Found`
- ✅ Console shows: `[Auth] Doer: Found`
- ✅ Console shows: `[Auth] Init complete`
- ✅ Dashboard displays actual data
- ✅ User profile shows real information

---

## FIX 2: Missing Help & Support Page 📄

### Problem Statement
Navigation link "Help & Support" leads to 404 error because the page doesn't exist.

### Implementation

**File to Create:** `doer-web/app/(main)/support/page.tsx`

**Code:**
```typescript
'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Book, FileQuestion, ExternalLink } from 'lucide-react'

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq')

  const faqs = [
    {
      question: 'How do I get paid for completed projects?',
      answer: 'Payments are processed within 2-3 business days after project approval. Funds are credited to your wallet, and you can request withdrawal to your bank account.',
    },
    {
      question: 'What happens if I miss a deadline?',
      answer: 'Missing deadlines affects your performance rating. If you anticipate delays, communicate with the supervisor immediately through the project chat.',
    },
    {
      question: 'How do I update my bank details?',
      answer: 'Go to Settings > Payment Information to update your bank account details. Verification may take 24-48 hours.',
    },
    {
      question: 'Can I work on multiple projects simultaneously?',
      answer: 'Yes, you can work on up to 3 projects concurrently based on your activation level and performance rating.',
    },
    {
      question: 'How is the quality of my work evaluated?',
      answer: 'Work is evaluated by supervisors using AI-powered plagiarism detection, originality checks, and manual quality review.',
    },
  ]

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of accepting and completing projects',
      icon: Book,
      link: '#',
    },
    {
      title: 'Writing Guidelines',
      description: 'Best practices for academic writing and research',
      icon: FileQuestion,
      link: '#',
    },
    {
      title: 'Payment & Earnings',
      description: 'Understanding payments, withdrawals, and taxes',
      icon: ExternalLink,
      link: '#',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Help & Support
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Get help with your account, projects, and payments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'faq'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Frequently Asked Questions
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'contact'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Contact Support
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'resources'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Resources
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <Mail className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get help via email within 24 hours
                </p>
                <a
                  href="mailto:support@assignx.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  support@assignx.com
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <MessageCircle className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Live Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Chat with us in real-time
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Start Chat
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Support Hours
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                Saturday: 10:00 AM - 4:00 PM IST<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <Icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  <a
                    href={resource.link}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More →
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Testing Steps
1. Create the file
2. Navigate to http://localhost:3000/support
3. Verify page loads without 404
4. Test all 3 tabs (FAQ, Contact, Resources)
5. Check responsive design

### Success Criteria
- ✅ No 404 error
- ✅ Page renders correctly
- ✅ All tabs work
- ✅ Navigation link works

---

## FIX 3: Missing Settings Page ⚙️

### Problem Statement
Navigation link "Settings" leads to 404 error because the page doesn't exist.

### Implementation

**File to Create:** `doer-web/app/(main)/settings/page.tsx`

**Code:**
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Bell, Lock, User, CreditCard, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { doer } = useAuth()
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'security' | 'payment' | 'preferences'>('profile')

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={doer?.profile?.full_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={doer?.profile?.email || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue={doer?.profile?.phone || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', description: 'Receive email updates about your projects' },
                  { label: 'Project assignments', description: 'Get notified when assigned to new projects' },
                  { label: 'Payment updates', description: 'Notifications about payments and withdrawals' },
                  { label: 'Chat messages', description: 'Real-time notifications for new messages' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Security Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Payment Settings
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your bank account details for receiving payments
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Bank Details
                </button>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option>System Default</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Testing Steps
1. Create the file
2. Navigate to http://localhost:3000/settings
3. Verify page loads without 404
4. Test all 5 sections (Profile, Notifications, Security, Payment, Preferences)
5. Check responsive design

### Success Criteria
- ✅ No 404 error
- ✅ Page renders correctly
- ✅ All sections accessible
- ✅ Forms display properly

---

## FIX 4: Missing Default Avatar 🖼️

### Problem Statement
Server logs show repeated 404 errors for `/avatars/default.jpg`, indicating the default avatar image is missing.

### Implementation

**Directory to Create:** `doer-web/public/avatars/`

**Option 1: Create SVG Avatar (Recommended)**
**File:** `doer-web/public/avatars/default.svg`

```svg
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#3B82F6"/>
  <circle cx="50" cy="35" r="18" fill="#FFFFFF"/>
  <path d="M 20 80 Q 20 60, 50 60 Q 80 60, 80 80 L 80 100 L 20 100 Z" fill="#FFFFFF"/>
</svg>
```

**Option 2: Use Data URL in Code**
Update avatar references to use a data URL if file is missing.

### Alternative: Update Avatar References
If creating images is not preferred, update the code to handle missing avatars gracefully.

**File:** Components that use avatar_url

Add fallback logic:
```typescript
const avatarSrc = doer?.profile?.avatar_url || '/avatars/default.svg'
```

### Testing Steps
1. Create the avatar file or implement fallback
2. Restart dev server
3. Check server logs for 404 errors
4. Verify avatar displays in UI

### Success Criteria
- ✅ No 404 errors in server logs
- ✅ Avatar displays correctly
- ✅ Fallback works if user has no custom avatar

---

## Testing & Verification Plan

### Phase 1: Individual Fix Testing
After each fix, verify:
1. No errors in terminal
2. No console errors in browser
3. Feature works as expected
4. No regressions in other features

### Phase 2: Integration Testing with Chrome
1. Open http://localhost:3000 in Chrome
2. Test all navigation links
3. Verify data loading on Dashboard
4. Check Projects page shows assigned project
5. Verify user profile displays correctly
6. Test all new pages (Support, Settings)
7. Check avatar loading

### Phase 3: Supabase MCP Verification
1. Query doer profile
2. Query assigned projects
3. Verify notifications
4. Check wallet data
5. Confirm all database relationships work

### Phase 4: Complete Flow Test
1. Login flow (if needed)
2. Dashboard data loading
3. Navigate to all pages
4. Test interactive elements
5. Verify real-time updates (if any)

---

## Success Criteria

### Critical Bug Fixed
- ✅ Auth hook completes successfully
- ✅ Console shows: `[Auth] Init complete`
- ✅ Dashboard displays real data
- ✅ User profile shows: "Om Rajpal / om@agiready.io"
- ✅ Projects page shows: "Climate Change Impact Analysis (PRJ-2024-TEST-001)"

### All Pages Working
- ✅ Dashboard loads with data
- ✅ My Projects shows assigned projects
- ✅ Resources page accessible
- ✅ My Profile displays correctly
- ✅ Reviews page accessible
- ✅ Statistics shows data
- ✅ Help & Support page works (no 404)
- ✅ Settings page works (no 404)

### No Errors
- ✅ No 404 errors in browser
- ✅ No console JavaScript errors
- ✅ No server errors in logs
- ✅ No missing image errors

### Database Integration
- ✅ User data loads from database
- ✅ Projects load from database
- ✅ Wallet data accessible
- ✅ Notifications display

---

## Rollback Plan

If any fix causes issues:

1. **Auth Fix Rollback**
   - Revert `lib/supabase/client.ts` to original
   - Restart dev server

2. **Pages Rollback**
   - Delete created page files
   - Navigation will return to 404 (previous state)

3. **Avatar Rollback**
   - Remove created avatar file
   - Will return to 404 errors (previous state)

---

## Timeline

### Estimated Time per Fix
- Fix 1 (Auth): 10 minutes (critical)
- Fix 2 (Support): 10 minutes
- Fix 3 (Settings): 10 minutes
- Fix 4 (Avatar): 5 minutes
- Testing: 20 minutes

**Total: 55 minutes**

### Order of Execution
1. **Auth fix first** (blocks everything else)
2. **Test auth fix immediately**
3. **Create missing pages** (parallel if possible)
4. **Add avatar** (quick fix)
5. **Comprehensive testing**
6. **Create verification report**

---

## Risk Assessment

### Low Risk
- Missing pages implementation (new files, no changes to existing)
- Avatar addition (cosmetic fix)

### Medium Risk
- Auth fix (changes critical authentication code)
- Mitigation: Test immediately, keep rollback ready

### High Risk
None - all fixes are straightforward with clear rollback paths

---

## Post-Implementation Checklist

After all fixes complete:
- [ ] All 12 todos marked as completed
- [ ] Chrome browser test passed
- [ ] Supabase MCP verification passed
- [ ] No errors in console
- [ ] No 404 errors
- [ ] All navigation links work
- [ ] Data loading verified
- [ ] Final report created

---

## Notes

- Auth fix is the KEY to everything - must be done first
- Test each fix individually before moving to next
- Keep dev server running between fixes when possible
- Document any unexpected issues
- Take screenshots of working features for final report

---

**Plan Status:** ✅ READY TO EXECUTE
**Next Action:** START WITH FIX 1 (AUTH BUG)
