# Projects Page - Bugs to Fix

**Priority:** Critical → High → Medium → Low
**Test Report:** `projects-ux-animation-test-report.md`

---

## 🔴 CRITICAL (Must Fix Before Deployment)

### Bug #1: FilterControls Component - Missing Required Props
**File:** `doer-web/app/(main)/projects/page.tsx` (line 317)
**Severity:** CRITICAL - Runtime Error
**Impact:** Component expects props that are not provided

**Current Code:**
```typescript
<FilterControls
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  filters={filters}
  onFiltersChange={setFilters}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  // ❌ MISSING: totalProjects
  // ❌ MISSING: filteredProjects
/>
```

**Fix:**
```typescript
<FilterControls
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  filters={filters}
  onFiltersChange={setFilters}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  totalProjects={allProjects.length}
  filteredProjects={
    filteredActiveProjects.length +
    filteredReviewProjects.length +
    filteredCompletedProjects.length
  }
/>
```

**Time to Fix:** 5 minutes

---

### Bug #2: Number Counter Animations Not Working
**File:** `doer-web/components/projects/redesign/ProjectHeroBanner.tsx`
**Severity:** HIGH - UX Issue
**Impact:** Stats feel static, no visual feedback on value changes

**Current Code:**
```typescript
// Line 305
<p className="text-xl font-bold text-white">{formatCurrency(weeklyEarnings)}</p>

// Line 346
<p className="text-2xl font-semibold text-slate-900">{value}</p>
```

**Problem:** Numbers render instantly without animation.

**Fix:** Create AnimatedCounter component
```typescript
// Create: doer-web/components/ui/animated-counter.tsx
'use client'

import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (value: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  format = (v) => Math.round(v).toString(),
  className,
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) => format(current))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}
```

**Usage in ProjectHeroBanner:**
```typescript
import { AnimatedCounter } from '@/components/ui/animated-counter'

// Replace line 305
<AnimatedCounter
  value={weeklyEarnings}
  format={(v) => formatCurrency(Math.round(v))}
  className="text-xl font-bold text-white"
/>

// Replace line 346
<AnimatedCounter
  value={parseInt(value)}
  className="text-2xl font-semibold text-slate-900"
/>
```

**Time to Fix:** 1-2 hours

---

### Bug #3: Timeline View Not Implemented
**Files:**
- `doer-web/app/(main)/projects/page.tsx` (line 333-428)
- `doer-web/components/projects/redesign/TimelineView.tsx` (exists but not used)

**Severity:** HIGH - Broken Feature
**Impact:** Timeline button exists but clicking it does nothing

**Current Code:**
```typescript
// FilterControls button exists (line 224-233)
<Button onClick={() => onViewModeChange('timeline')}>
  <Calendar className="h-4 w-4" />
</Button>

// But no rendering logic in page.tsx
// Only shows tabs regardless of viewMode
```

**Fix:** Add conditional rendering based on viewMode
```typescript
// In page.tsx, replace lines 333-428 with:

{/* Main content - conditional on view mode */}
{viewMode === 'grid' || viewMode === 'list' ? (
  <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
    {/* LEFT SIDE: Project Cards Grid (65%) */}
    <div className="space-y-6">
      {/* Existing tab content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ... existing tab content ... */}
      </Tabs>
    </div>

    {/* RIGHT SIDE: Insights Sidebar */}
    <motion.div variants={fadeInUp}>
      <InsightsSidebar
        activeProjects={activeProjects}
        reviewProjects={reviewProjects}
        completedProjects={completedProjects}
        onProjectClick={handleProjectClick}
      />
    </motion.div>
  </div>
) : (
  <div className="space-y-6">
    <TimelineView
      projects={[
        ...filteredActiveProjects,
        ...filteredReviewProjects,
        ...filteredCompletedProjects,
      ]}
      onProjectClick={handleProjectClick}
    />
  </div>
)}
```

**Time to Fix:** 4-6 hours (including testing)

---

## 🟡 HIGH PRIORITY (Should Fix Soon)

### Bug #4: Card Hover Missing Shadow Animation
**File:** `doer-web/components/projects/redesign/ProjectCard.tsx` (line 209)
**Severity:** MEDIUM - UX Polish
**Impact:** Hover effect feels incomplete

**Current Code:**
```typescript
whileHover={{ y: -4 }}
transition={{ duration: 0.2 }}
```

**Fix:**
```typescript
whileHover={{
  y: -4,
  boxShadow: '0 24px 60px rgba(30, 58, 138, 0.12)',
  transition: { duration: 0.2 },
}}
whileTap={{ scale: 0.98 }}
```

**Time to Fix:** 5 minutes

---

### Bug #5: No Network Error Retry Logic
**File:** `doer-web/app/(main)/projects/page.tsx` (line 88-111)
**Severity:** MEDIUM - UX Issue
**Impact:** Poor experience on slow/unstable connections

**Current Code:**
```typescript
catch (error) {
  console.error('Error loading projects:', error)
  toast.error('Failed to load projects')
}
```

**Fix:** Add retry mechanism
```typescript
const loadProjectsWithRetry = useCallback(
  async (showRefresh = false, retries = 3) => {
    if (!doer?.id) return

    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const [active, review, completed] = await Promise.all([
          getProjectsByCategory(doer.id, 'active'),
          getProjectsByCategory(doer.id, 'review'),
          getProjectsByCategory(doer.id, 'completed'),
        ])

        setActiveProjects(active)
        setReviewProjects(review)
        setCompletedProjects(completed)
        return // Success
      } catch (error) {
        const isLastAttempt = attempt === retries - 1

        if (isLastAttempt) {
          console.error('Error loading projects:', error)
          toast.error('Failed to load projects after multiple attempts')
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt))
          )
          toast.info(`Retrying... (${attempt + 1}/${retries})`)
        }
      }
    }

    setIsLoading(false)
    setIsRefreshing(false)
  },
  [doer?.id]
)
```

**Time to Fix:** 1-2 hours

---

### Bug #6: No Loading Timeout Warning
**File:** `doer-web/app/(main)/projects/page.tsx`
**Severity:** MEDIUM - UX Issue
**Impact:** Users don't know if slow load is normal or stuck

**Fix:** Add timeout warning
```typescript
const loadProjects = useCallback(async (showRefresh = false) => {
  if (!doer?.id) return

  if (showRefresh) setIsRefreshing(true)
  else setIsLoading(true)

  // Show warning after 5 seconds
  const timeoutId = setTimeout(() => {
    toast.warning('Loading is taking longer than usual...')
  }, 5000)

  try {
    // ... existing load logic
  } catch (error) {
    // ... existing error handling
  } finally {
    clearTimeout(timeoutId)
    setIsLoading(false)
    setIsRefreshing(false)
  }
}, [doer?.id])
```

**Time to Fix:** 15 minutes

---

## 🟢 MEDIUM PRIORITY (Performance Optimization)

### Bug #7: No Virtualization for Large Project Lists
**File:** `doer-web/components/projects/ActiveProjectsTab.tsx` (line 249-363)
**Severity:** LOW - Performance Issue
**Impact:** Laggy scroll with 100+ projects

**Current Code:**
```typescript
{sortedProjects.map((project) => (
  <motion.div key={project.id}>
    {/* Card content */}
  </motion.div>
))}
```

**Fix:** Implement virtualization
```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

// In component
const parentRef = useRef<HTMLDivElement>(null)

const rowVirtualizer = useVirtualizer({
  count: sortedProjects.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120,
  overscan: 5,
})

// Only render if 50+ projects
const shouldVirtualize = sortedProjects.length > 50

{shouldVirtualize ? (
  <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          {/* Render project card */}
        </div>
      ))}
    </div>
  </div>
) : (
  /* Existing non-virtualized rendering */
)}
```

**Time to Fix:** 3-4 hours

---

## 🔵 LOW PRIORITY (Nice to Have)

### Bug #8: No Reduced Motion Support
**File:** `doer-web/components/projects/animations.ts`
**Severity:** LOW - Accessibility
**Impact:** Motion-sensitive users may experience discomfort

**Current Code:**
```typescript
// reducedMotion variant exists but is not used
export const reducedMotion: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}
```

**Fix:** Create utility to respect user preferences
```typescript
// Add to animations.ts
export const getAnimationVariants = (variant: Variants): Variants => {
  if (typeof window === 'undefined') return variant

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  return prefersReducedMotion ? reducedMotion : variant
}

// Usage
<motion.div variants={getAnimationVariants(fadeInUp)}>
```

**Time to Fix:** 30 minutes

---

### Bug #9: Empty State Animation Too Subtle
**File:** `doer-web/components/projects/ActiveProjectsTab.tsx` (line 225-233)
**Severity:** LOW - UX Polish
**Impact:** Empty state could be more engaging

**Current Code:**
```typescript
<motion.div animate={{ y: [0, -10, 0] }}>
  <FolderOpen className="h-12 w-12" />
</motion.div>
```

**Fix:** Add rotation for personality
```typescript
<motion.div
  animate={{
    y: [0, -10, 0],
    rotate: [0, 5, 0, -5, 0],
  }}
  transition={{
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
>
  <FolderOpen className="h-12 w-12" />
</motion.div>
```

**Time to Fix:** 5 minutes

---

### Bug #10: Unused Animations in animations.ts
**File:** `doer-web/components/projects/animations.ts`
**Severity:** LOW - Code Quality
**Impact:** Dead code, larger bundle size

**Unused Animations:**
- `rotateOnHover` (line 243-248)
- `bounceAnimation` (line 253-262)
- `floatingAnimation` (line 267-277)

**Fix:** Either use them or remove them
```typescript
// Option 1: Remove unused exports
// Option 2: Add examples of where to use them
// Option 3: Keep for future use (document why)
```

**Time to Fix:** 15 minutes

---

## 📊 Bug Statistics

**Total Bugs Found:** 10

**By Severity:**
- 🔴 Critical: 3
- 🟡 High: 3
- 🟢 Medium: 1
- 🔵 Low: 3

**By Category:**
- Missing Features: 3
- UX Issues: 3
- Performance: 2
- Code Quality: 1
- Accessibility: 1

**Estimated Total Fix Time:** 14-20 hours

---

## 🎯 Recommended Fix Order

### Sprint 1 (This Week) - 2-3 hours
1. ✅ Bug #1: FilterControls props (5 min)
2. ✅ Bug #4: Card hover shadow (5 min)
3. ✅ Bug #6: Loading timeout (15 min)
4. ✅ Bug #9: Empty state animation (5 min)
5. ✅ Bug #2: Number counter animations (2 hours)

### Sprint 2 (Next Week) - 6-8 hours
6. ✅ Bug #3: Timeline view implementation (6 hours)
7. ✅ Bug #5: Network retry logic (2 hours)

### Sprint 3 (Future) - 4-5 hours
8. ✅ Bug #7: List virtualization (4 hours)
9. ✅ Bug #8: Reduced motion support (30 min)
10. ✅ Bug #10: Clean up unused code (15 min)

---

## ✅ Testing Checklist (After Fixes)

### Functional Testing
- [ ] FilterControls renders without errors
- [ ] Number counters animate smoothly
- [ ] Timeline view displays correctly
- [ ] Card hover shows shadow animation
- [ ] Network retry works on slow connection
- [ ] Loading timeout shows warning

### Performance Testing
- [ ] 60fps maintained with animations
- [ ] Large lists (100+) scroll smoothly
- [ ] Memory usage stays reasonable
- [ ] No console errors/warnings

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Reduced motion respected
- [ ] Focus indicators visible

### Cross-Browser Testing
- [ ] Chrome 120+ works
- [ ] Firefox 120+ works
- [ ] Safari 17+ works
- [ ] Edge 120+ works

---

**Document Version:** 1.0
**Last Updated:** 2026-02-09
**Related:** `projects-ux-animation-test-report.md`
