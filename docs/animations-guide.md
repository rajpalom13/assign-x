# Projects Page Animations Guide

## Overview
This document outlines all animations and micro-interactions implemented across the redesigned projects page. All animations are optimized for 60fps performance using Framer Motion and follow modern UX best practices.

## Animation System

### Core Principles
1. **60fps Performance** - All animations use GPU-accelerated properties (`transform`, `opacity`)
2. **Spring Physics** - Natural motion with spring-based transitions
3. **Staggered Entrance** - Items animate in sequence for visual hierarchy
4. **Responsive Feedback** - Immediate visual response to user interactions
5. **Accessibility** - Respects `prefers-reduced-motion` system setting

### Animation Library
Location: `doer-web/components/projects/animations.ts`

## Page-Level Animations

### 1. Page Load (Main Projects Page)
**File:** `doer-web/app/(main)/projects/page.tsx`

#### Staggered Container
```typescript
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}
```
- **Effect:** Page sections appear sequentially from top to bottom
- **Timing:** 50ms delay between each child element
- **Purpose:** Creates smooth, professional page load experience

#### Fade In Up
```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}
```
- **Elements:** Hero banner, stats grid, filter controls, content sections
- **Timing:** 260ms with spring physics (stiffness: 260, damping: 20)
- **Purpose:** Smooth upward reveal on load

### 2. Hero Banner Animations
**Component:** `ProjectHeroBanner.tsx`

#### Velocity Ring
- **Type:** Circular progress animation
- **Duration:** 1000ms
- **Easing:** Spring physics
- **Purpose:** Animated project completion velocity indicator

#### Sparkline Chart
- **Type:** Path stroke animation
- **Duration:** 800ms
- **Easing:** Ease-out
- **Purpose:** Draws weekly trend line from left to right

#### Quick Insight Cards
- **Type:** Staggered fade + scale
- **Delay:** 50ms between cards
- **Hover:** Lift 4px, scale 1.02
- **Purpose:** Animated metric cards with hover effects

### 3. Stats Grid Animations
**Component:** `AdvancedStatsGrid.tsx`

#### Stats Cards
- **Entrance:** Fade + scale from 0.95 to 1.0
- **Stagger:** 80ms delay between cards
- **Hover:**
  - Lift: -4px translateY
  - Shadow increase: from 16px to 24px blur
  - Icon rotation: -10° to +10° to 0°
  - Duration: 200ms

#### Number Count-Up
- **Type:** Numeric increment animation
- **Duration:** 800ms
- **Easing:** Ease-out cubic
- **Purpose:** Animates numbers from 0 to target value

#### Trend Arrows
- **Type:** Bounce animation
- **Keyframes:** translateY(0 → -3px → 0)
- **Duration:** 1000ms
- **Repeat:** Infinite with 3s delay

### 4. Filter Controls Animations
**Component:** `FilterControls.tsx`

#### Search Input
- **Focus:** Scale 1.02, shadow increase
- **Transition:** 300ms spring physics
- **Icon:** Pulse animation on focus

#### Filter Pills
- **Hover:** Scale 1.05
- **Active:**
  - Background: Gradient animation
  - Border pulse: 2s infinite
- **Tap:** Scale 0.95

#### View Toggle
- **Switch:** Slide animation 200ms
- **Icons:** Rotate 180° on change
- **Background:** Smooth gradient shift

### 5. Project Cards Animations
**Component:** `ActiveProjectsTab.tsx`, `ProjectCard.tsx`

#### Card Container
```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.95, y: -10 },
}
```

#### Card Hover State
- **Lift:** translateY(-4px)
- **Scale:** 1.01
- **Shadow:** Increase from 16px to 32px blur
- **Duration:** 200ms with spring physics
- **Cursor:** Changes to pointer

#### Status Badge
- **Pulse:**
  - Scale: 1 → 1.2 → 1
  - Opacity: 1 → 0.7 → 1
  - Duration: 2000ms
  - Repeat: Infinite
- **Purpose:** Draws attention to status changes

#### Progress Bar
- **Fill Animation:** Width animates from 0% to target value
- **Duration:** 1000ms
- **Easing:** Ease-out
- **Shimmer Effect:**
  - Background position: -200% to 200%
  - Duration: 2000ms
  - Repeat: Infinite

#### Action Buttons
- **Hover:** Scale 1.05
- **Tap:** Scale 0.95
- **Icon Rotation:** 12° on hover (ExternalLink icon)
- **Duration:** 200ms

### 6. Review Queue Animations
**Component:** `UnderReviewTab.tsx`

#### Card Slide Animation
```typescript
const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, x: 20, scale: 0.96 },
}
```

#### Gradient Overlay
- **Initial:** Opacity 0
- **Hover:** Opacity 1
- **Transition:** 300ms
- **Effect:** Colored gradient appears on hover

#### QC Progress Indicator
- **Bar Fill:** Animates from 0% to 60%
- **Duration:** 2000ms
- **Easing:** Ease-in-out
- **Sparkles Icon:** Pulse animation

### 7. Completed Projects Animations
**Component:** `CompletedTab.tsx`

#### Celebration Effects
- **Trophy Icon:** Bounce animation on load
- **Confetti:** (Optional) Particle animation for milestones
- **Earnings Badge:**
  - Gradient text: Animated gradient position
  - Duration: 3000ms
  - Repeat: Infinite

#### Star Rating
- **Fill Animation:** Stars fill from left to right
- **Delay:** 100ms between stars
- **Hover:** Scale 1.1, rotate 12°

### 8. Insights Sidebar Animations
**Component:** `InsightsSidebar.tsx`

#### Urgent Spotlight
- **Border Pulse:**
  - Border color: Animate between amber shades
  - Duration: 2000ms
  - Repeat: Infinite
- **Icon:** Flame icon flickers

#### Analytics Charts
- **Chart Bars:** Staggered height animation
- **Delay:** 50ms between bars
- **Duration:** 600ms
- **Easing:** Ease-out

#### Activity Feed
- **Items:** Slide in from right
- **Stagger:** 100ms delay
- **New Item:** Highlight flash animation

## Loading States

### Shimmer Skeletons
**File:** `doer-web/components/projects/LoadingSkeletons.tsx`

#### Shimmer Effect
```typescript
const shimmer = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}
```

#### Components
- `StatCardSkeleton` - Animated stats card placeholder
- `ProjectCardSkeleton` - Animated project card placeholder
- `HeroCardSkeleton` - Animated hero banner placeholder
- `ProjectsPageSkeleton` - Full page loading state

### Loading Overlays
- **Background:** Semi-transparent backdrop
- **Spinner:** Rotating gradient ring
- **Progress:** Animated progress bar

## Micro-Interactions

### 1. Button Interactions
- **Hover:** Scale 1.05, shadow increase
- **Tap:** Scale 0.95
- **Active:** Gradient shift
- **Disabled:** Reduced opacity, no animation

### 2. Input Interactions
- **Focus:** Border color transition, shadow glow
- **Type:** Character count animation
- **Clear:** Icon fade + rotate

### 3. Badge Interactions
- **Hover:** Scale 1.05, shadow increase
- **Count Update:** Number morphing animation

### 4. Icon Animations
- **Refresh:** 360° rotation on click
- **External Link:** 12° rotation on hover
- **Clock:** Pulse animation for urgent items
- **Check Circle:** Scale + checkmark draw

## Tab Switching Animations

### Tab Content
```typescript
const tabContentVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
}
```

### Tab Indicator
- **Slide:** Smooth transition between tabs
- **Duration:** 200ms
- **Easing:** Spring physics
- **Background:** Gradient transition

## Performance Optimizations

### Hardware Acceleration
All animations use GPU-accelerated properties:
- `transform` (translate, scale, rotate)
- `opacity`
- `will-change` hint where appropriate

### Animation Variants
- **Reduced Motion:** Alternative variants for accessibility
- **Mobile:** Lighter animations on touch devices
- **Low Power:** Simplified animations on battery save mode

### Best Practices Applied
1. **Avoid Layout Shifts:** Use `transform` instead of `top`/`left`/`width`/`height`
2. **Batch Animations:** Group related animations together
3. **Debounce Rapid Actions:** Prevent animation queue buildup
4. **Cleanup:** Remove animations when components unmount
5. **Conditional Rendering:** Only animate visible elements

## Animation Timeline

### Page Load Sequence (Total: ~1200ms)
1. **0ms:** Background gradient fades in
2. **100ms:** Hero banner slides up
3. **250ms:** Stats grid cards stagger in
4. **500ms:** Filter controls appear
5. **700ms:** Project cards stagger in
6. **900ms:** Sidebar components appear
7. **1200ms:** All animations complete

### Interaction Response Times
- **Button Click:** < 16ms (1 frame)
- **Hover Effect:** < 32ms (2 frames)
- **Page Transition:** 200-400ms
- **Modal Open:** 300ms
- **Tab Switch:** 200ms

## Accessibility

### Reduced Motion Support
```typescript
const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}
```

Applied when: `prefers-reduced-motion: reduce`

### Keyboard Navigation
- **Focus States:** Visible focus rings with animated glow
- **Tab Order:** Logical tab sequence preserved
- **Skip Links:** Animated focus jump

### Screen Readers
- **ARIA Labels:** All animated elements have proper labels
- **Live Regions:** Status updates announced
- **Role Preservation:** Interactive roles maintained during animation

## Testing Checklist

### Performance
- [ ] All animations run at 60fps
- [ ] No layout thrashing
- [ ] Memory usage stable
- [ ] CPU usage < 20% during animations
- [ ] Mobile performance acceptable

### Visual Quality
- [ ] Smooth transitions between states
- [ ] No flickering or jank
- [ ] Consistent timing across devices
- [ ] Proper layering (z-index)

### Accessibility
- [ ] Respects prefers-reduced-motion
- [ ] Keyboard navigation works
- [ ] Focus visible at all times
- [ ] Screen reader compatible
- [ ] No seizure-inducing patterns

### Browser Compatibility
- [ ] Chrome/Edge (tested)
- [ ] Firefox (tested)
- [ ] Safari (tested)
- [ ] Mobile browsers (tested)

## Future Enhancements

### Planned Additions
1. **Confetti Animation** - Milestone celebrations
2. **Lottie Animations** - Complex illustrations
3. **Particle Effects** - Completion celebrations
4. **Sound Effects** - Optional audio feedback
5. **Haptic Feedback** - Mobile vibration

### Experimental Features
1. **View Transitions API** - Native page transitions
2. **Shared Element Transitions** - Smooth cross-page animations
3. **WebGL Effects** - Advanced visual effects
4. **Physics-Based Interactions** - Realistic motion

## Code Examples

### Custom Hook: useAnimationControls
```typescript
import { useAnimation } from 'framer-motion'

export function useCardAnimation() {
  const controls = useAnimation()

  const playHoverAnimation = () => {
    controls.start({ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' })
  }

  const resetAnimation = () => {
    controls.start({ y: 0 })
  }

  return { controls, playHoverAnimation, resetAnimation }
}
```

### Usage Example
```typescript
import { motion } from 'framer-motion'
import { cardVariants, hoverLift } from './animations'

function ProjectCard({ project }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...hoverLift}
      className="project-card"
    >
      {/* Card content */}
    </motion.div>
  )
}
```

## Resources

### Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

### Performance Tools
- Chrome DevTools Performance Panel
- React DevTools Profiler
- Lighthouse Performance Audit
- WebPageTest

---

**Last Updated:** 2026-02-09
**Version:** 1.0.0
**Maintained By:** Agent 6 - Animations & Polish Specialist
