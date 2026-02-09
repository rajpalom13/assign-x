# Visual Design QA Checklist
**For Agent 9: Visual Design QA**
**Date:** 2026-02-09
**Prepared By:** Agent 8 - Integration & Feature Tester

---

## Overview

This checklist guides the visual design QA process for the redesigned projects page. All functionality has been tested and works correctly - this phase focuses on visual consistency, design polish, and user experience refinement.

**Application URL:** http://localhost:3002/projects (when running doer-web)

---

## 1. Design System Consistency

### Color Palette Verification
- [ ] Primary gradient: `#5A7CFF` → `#49C5FF` used consistently
- [ ] Secondary colors match design tokens
- [ ] Status badge colors are distinct and accessible
- [ ] Urgent indicators use consistent red tones
- [ ] Background overlays use specified opacity values

**Reference Gradients:**
```css
Primary: from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF]
Background: radial-gradient(circle_at_top, rgba(90,124,255,0.18), transparent_55%)
```

### Typography
- [ ] Font sizes consistent across components
- [ ] Font weights appropriate (400/500/600/700)
- [ ] Line heights comfortable for reading
- [ ] Letter spacing (tracking) on uppercase labels: `0.25em`
- [ ] Text truncation works (`line-clamp-1`, `line-clamp-2`)

### Spacing & Layout
- [ ] Consistent padding/margins across cards
- [ ] Grid gaps uniform: `gap-4`, `gap-6`
- [ ] Border radius consistent: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-[28px]`
- [ ] Component alignment looks balanced
- [ ] Whitespace enhances readability

---

## 2. Component-Specific Visual Checks

### ProjectHeroBanner
**Location:** Top of page, full width

- [ ] Background gradient visible and smooth
- [ ] Hero text readable against background
- [ ] Stat cards aligned properly
- [ ] Trend chart displays correctly
- [ ] CTA buttons prominent and clickable
- [ ] Responsive layout works on mobile

**Expected Appearance:**
- Height: ~256px (`h-64`)
- Rounded corners: 28px
- Shadow: `0_18px_40px_rgba(30,58,138,0.12)`

---

### AdvancedStatsGrid
**Location:** Below hero banner, 5 columns

- [ ] Five columns on desktop (xl breakpoint)
- [ ] Collapses to 2-3 columns on tablet
- [ ] Single column on mobile
- [ ] Icons render correctly
- [ ] Numbers formatted with proper locale
- [ ] Card shadows subtle but visible
- [ ] Hover effects smooth

**Visual Metrics:**
- Cards: White background, rounded-xl
- Icons: Gradient backgrounds matching theme
- Shadows: `0_10px_22px_rgba(30,58,138,0.08)`

---

### FilterControls (Sticky Bar)
**Location:** Above project cards, sticky

- [ ] Sticks to top when scrolling
- [ ] View mode toggle buttons clear
- [ ] Active view mode has gradient background
- [ ] Filter pills have proper spacing
- [ ] Active filters show gradient background
- [ ] Clear all button appears when filters active
- [ ] Sort dropdown renders correctly
- [ ] Results count visible and accurate

**Key Visual Elements:**
- Pill buttons: Rounded-full
- Active state: Gradient + shadow
- Badge count: Small circle with number
- Backdrop blur: `backdrop-blur-md`

---

### Project Cards (All Tabs)
**Location:** Active, Review, Completed tabs

#### ActiveProjectsTab Cards
- [ ] Status dot color matches status
- [ ] Status badge colors correct
- [ ] Urgent flame icon displays
- [ ] Progress bar fills correctly
- [ ] Hover effect lifts card slightly (y: -4px)
- [ ] Revision cards have rose border
- [ ] Payout displayed prominently
- [ ] Open button has correct styling

#### UnderReviewTab Cards
- [ ] Similar styling to active cards
- [ ] "Under Review" indicators clear
- [ ] Time submitted displays correctly

#### CompletedProjectsTab Cards
- [ ] Checkmark/completed indicators
- [ ] Completion date visible
- [ ] Download invoice button appears
- [ ] Muted styling for completed state

**Card Specifications:**
- Border: `border-border/70`
- Background: `bg-background/80`
- Padding: `p-4`
- Rounded: `rounded-2xl`
- Shadow: `0_8px_20px_rgba(148,163,184,0.08)`

---

### TimelineView
**Location:** When timeline view mode selected

- [ ] Horizontal scrollable layout
- [ ] Timeline nodes connected with lines
- [ ] Node icons match status
- [ ] Pulse animation on active nodes
- [ ] Project cards display under nodes
- [ ] Deadline dates formatted correctly
- [ ] Gradient fade at scroll edges
- [ ] Legend at bottom shows status colors
- [ ] Responsive on mobile (cards stack)

**Node Styling:**
- Size: 40px × 40px circles
- Icons: 20px inside circles
- Lines: 1px height connecting nodes
- Pulse: Opacity 75% animation

---

### InsightsSidebar
**Location:** Right side, 35% width on desktop

- [ ] Sticky positioning works
- [ ] Quick action cards distinct colors
- [ ] Urgent spotlight highlights critical project
- [ ] Earnings forecast chart renders
- [ ] Project distribution donut chart displays
- [ ] Activity summary cards aligned
- [ ] Collapsible on mobile with smooth animation
- [ ] All badges use consistent styling

**Card Colors:**
- Default: `bg-[#E3E9FF]` (blue)
- Warning: `bg-[#FFE7E1]` (orange)
- Success: `bg-[#E6F4FF]` (light blue)

---

## 3. Responsive Design Testing

### Desktop (1920px)
- [ ] Full 5-column stats grid
- [ ] 65/35 split between main content and sidebar
- [ ] All elements spaced comfortably
- [ ] No horizontal scroll

### Tablet (1024px)
- [ ] Stats grid collapses to 3 columns
- [ ] Sidebar moves below main content
- [ ] Filter controls remain usable
- [ ] Cards maintain readability

### Mobile (375px)
- [ ] Stats grid single column
- [ ] Sidebar collapsible with toggle
- [ ] Filter pills wrap properly
- [ ] Cards stack vertically
- [ ] Touch targets large enough (44px min)

---

## 4. Animation & Interaction Polish

### Page Load Animations
- [ ] Staggered fade-in of sections
- [ ] Hero banner animates first
- [ ] Stats cards appear with delay
- [ ] Project cards stagger in (0.08s each)
- [ ] No janky or abrupt movements

**Animation Specs:**
- Duration: 200-500ms
- Easing: `spring` physics
- Stagger: 50-80ms between elements

### Hover Effects
- [ ] Cards lift on hover (scale 1.01-1.02)
- [ ] Buttons show visual feedback
- [ ] Color transitions smooth (transition-all)
- [ ] Shadow increases on hover
- [ ] Cursor changes to pointer

### Click/Tap Effects
- [ ] Scale down slightly on click (scale 0.95-0.98)
- [ ] Ripple effect on buttons (if applicable)
- [ ] Instant visual feedback
- [ ] No delay in interaction

### Loading States
- [ ] Skeleton loaders match component layouts
- [ ] Shimmer animation on skeletons
- [ ] Smooth transition to loaded content
- [ ] Refresh button shows spinner

---

## 5. Accessibility Visual Checks

### Focus States
- [ ] Visible focus ring on all interactive elements
- [ ] Focus ring color: `ring-[#5A7CFF]`
- [ ] Focus ring offset: 2px
- [ ] Tab order logical and sequential

### Color Contrast
- [ ] Text meets WCAG AA standards (4.5:1 for body, 3:1 for large)
- [ ] Status badges have sufficient contrast
- [ ] Links distinguishable from body text
- [ ] Disabled states clearly indicated

### Icon Usage
- [ ] Icons have descriptive aria-labels
- [ ] Icons not sole means of conveying information
- [ ] Icon size minimum 16px for clarity
- [ ] Icon color distinct from background

---

## 6. Cross-Browser Visual Testing

Test in these browsers:

### Chrome/Edge (Chromium)
- [ ] Gradients render smoothly
- [ ] Backdrop blur works
- [ ] Animations perform well
- [ ] Layout matches design

### Firefox
- [ ] CSS Grid layout correct
- [ ] Rounded corners render properly
- [ ] Shadow effects visible
- [ ] Framer Motion animations work

### Safari
- [ ] Backdrop blur supported
- [ ] Webkit prefixes applied
- [ ] Touch interactions smooth
- [ ] Gradients display correctly

---

## 7. Dark Mode Considerations (Future)

Note: Dark mode not currently implemented, but check these for preparation:

- [ ] Color variables used instead of hardcoded colors
- [ ] Contrast ratios maintained in dark theme
- [ ] Images/icons work on dark backgrounds
- [ ] Shadows adjusted for dark mode

---

## 8. Visual Bug Checklist

### Common Issues to Look For
- [ ] Text overflow/clipping
- [ ] Misaligned icons or badges
- [ ] Inconsistent spacing between similar elements
- [ ] Borders appearing thicker/thinner than expected
- [ ] Colors slightly off from design tokens
- [ ] Shadows cut off by parent overflow
- [ ] Animations stuttering or janky
- [ ] Loading states flickering
- [ ] Empty states not styled properly

### Performance Visual Issues
- [ ] Large images causing layout shift
- [ ] Fonts loading causing FOUT/FOIT
- [ ] Animations causing repaints
- [ ] Scroll performance smooth (60fps)

---

## 9. Edge Cases Visual Testing

### Empty States
- [ ] No projects: Friendly empty state with icon
- [ ] No active projects: Tab shows empty message
- [ ] No urgent projects: Sidebar adjusts layout
- [ ] Search no results: Clear feedback message

### Maximum Data
- [ ] Very long project titles: Truncate with ellipsis
- [ ] Many projects: Scroll works smoothly
- [ ] Large numbers: Format with commas/compact notation
- [ ] Many filters active: Pills wrap properly

### Error States
- [ ] Failed to load: Error message styled
- [ ] API error: Toast notification appears
- [ ] Network offline: Graceful degradation

---

## 10. Final Polish Checklist

### Pixel Perfect Details
- [ ] All borders exactly 1px (no subpixel rendering)
- [ ] Icons vertically centered in containers
- [ ] Text baseline aligned across rows
- [ ] Consistent use of rem vs px
- [ ] No random font weights (stick to 400/500/600/700)

### Micro-interactions
- [ ] Button press feedback immediate
- [ ] Hover states distinct but not distracting
- [ ] Transitions smooth, not jarring
- [ ] Loading spinners centered and sized correctly
- [ ] Toast notifications positioned consistently

### Print Stylesheet (Bonus)
- [ ] Page layout reasonable for printing
- [ ] Unnecessary elements hidden (sidebars, animations)
- [ ] Colors optimized for grayscale

---

## Testing Tools Recommendations

### Browser DevTools
- **Lighthouse:** Check accessibility score
- **Coverage:** Identify unused CSS
- **Performance:** Monitor FPS during animations
- **Network:** Check asset sizes

### Visual Regression
- **Percy:** Screenshot comparison
- **Chromatic:** Storybook visual testing
- **BackstopJS:** Automated visual regression

### Accessibility
- **axe DevTools:** Scan for accessibility issues
- **WAVE:** Web accessibility evaluation tool
- **Color Contrast Analyzer:** Check WCAG compliance

---

## Sign-off Criteria

Before approving visual design, confirm:

- ✅ All components match design specifications
- ✅ Responsive layouts work on all breakpoints
- ✅ Animations smooth and purposeful
- ✅ Color contrast meets accessibility standards
- ✅ Interactive elements have clear hover/focus states
- ✅ No visual bugs or glitches
- ✅ Loading and error states styled properly
- ✅ Typography consistent throughout

---

## Notes for Agent 9

**Key Files to Review:**
- `doer-web/app/(main)/projects/page.tsx` - Main page layout
- `doer-web/components/projects/redesign/*` - All redesign components
- `doer-web/components/projects/ActiveProjectsTab.tsx` - Tab content
- `doer-web/components/projects/animations.ts` - Animation configurations

**Design References:**
- Primary gradient: `#5A7CFF` → `#49C5FF`
- Spacing scale: 4px, 8px, 12px, 16px, 20px, 24px
- Border radius: 12px (xl), 16px (2xl), 28px (custom)
- Shadow depths: Small (8-10px), Medium (14-18px), Large (20-40px)

**Screenshots Locations:**
Take comparison screenshots and save to: `docs/visual-qa-screenshots/`

---

**Prepared By:** Agent 8 - Integration & Feature Tester
**Status:** Ready for Agent 9 Visual QA
**Date:** 2026-02-09
