# Users Page Redesign Plan

## Design Analysis Summary

### Dashboard Design System
**Color Palette:**
- Background: `bg-gray-50` (light gray)
- Primary text: `#1C1C1C` (charcoal/near black)
- Accent: `#F97316` (vibrant orange)
- Secondary accent: `#EA580C` (darker orange)
- Secondary text: `text-gray-500`
- Cards: `bg-white` with `border-gray-200`
- Active state: `bg-[#1C1C1C]`
- Success: `#10B981` (emerald)
- Purple accent: `text-purple-600`

**Typography Hierarchy:**
- Hero title: `text-4xl lg:text-5xl font-bold tracking-tight`
- Section title: `text-lg font-semibold`
- Card label: `text-xs font-medium`
- Card value: `text-lg font-bold` or `text-2xl font-bold`
- Body text: `text-sm`
- Monospace: `font-mono text-xs`

**Visual Elements:**
- Border radius: `rounded-2xl` for cards, `rounded-xl` for icons
- Icon containers: colored backgrounds (`bg-orange-100`)
- Shadows: `shadow-lg shadow-orange-500/20` for buttons
- Transitions: `transition-all duration-200`
- Hover effects: `hover:-translate-y-0.5`, `hover:shadow-md`
- Framer Motion animations

**Layout Patterns:**
1. Hero section (greeting + illustration)
2. Status pills row (responsive grid)
3. Asymmetric grid (analytics + quick actions)
4. Data table with card wrapper

---

## Users Page Redesign Components

### 1. Hero Section (NEW)
- **Left:** Personalized greeting + subtitle + CTA button
- **Right:** Custom users/community illustration
- Colors match dashboard (charcoal text, orange accent)

### 2. Status Pills Row (REDESIGN)
Replace current stat cards with dashboard-style pills:
- Total Users (with icon)
- Active Users (with indicator)
- New This Month (trending)
- Total Revenue (wallet icon)

### 3. Main Content Grid (NEW LAYOUT)
**Left Column (wider):**
- User Insights card with mini analytics
- User cards in 2-column grid

**Right Column (sidebar):**
- Quick Actions (View Active, Inactive, Export)
- Recent Activity timeline

### 4. User Cards (COMPLETE REDESIGN)
New card design:
- Avatar with status indicator
- Name with verified badge
- Email in muted text
- 2-column stats grid (Projects, Spent)
- Footer with last active + status badge
- Hover lift effect with orange border glow

### 5. Search & Filter Bar (REDESIGN)
- Inline with white card wrapper
- Search input with orange focus ring
- Filter dropdowns styled consistently
- Active filters as removable badges

### 6. Empty State (REDESIGN)
- Custom illustration
- Charcoal text
- Orange accent button

### 7. User Details Sheet (REDESIGN)
- Match dashboard card styling
- Orange accent for primary actions
- Cleaner tab navigation
- Better project cards

### 8. Custom Illustration
New SVG illustration featuring:
- People/community theme
- Orange accent elements
- Charcoal and gray tones
- Floating UI elements
- Matching dashboard style

---

## File Changes Required

### New Files to Create:
1. `superviser-web/components/users/v2/users-illustration.tsx`
2. `superviser-web/components/users/v2/user-card-v2.tsx`
3. `superviser-web/components/users/v2/user-insights-card.tsx`
4. `superviser-web/components/users/v2/quick-actions-sidebar.tsx`
5. `superviser-web/components/users/v2/search-filter-bar.tsx`
6. `superviser-web/components/users/v2/user-details-v2.tsx`
7. `superviser-web/components/users/v2/empty-state.tsx`
8. `superviser-web/components/users/v2/activity-timeline.tsx`
9. `superviser-web/components/users/v2/status-pills.tsx`
10. `superviser-web/components/users/v2/index.ts`
11. `superviser-web/app/(dashboard)/users/page-v2.tsx` (new main page)

### Files to Update:
- Eventually replace `superviser-web/app/(dashboard)/users/page.tsx`

---

## Implementation Tasks

### Phase 1: Foundation Components
1. Create users illustration SVG component
2. Create status pills component
3. Create user insights card with mini chart

### Phase 2: Core Components
4. Create redesigned user card
5. Create search/filter bar component
6. Create quick actions sidebar
7. Create activity timeline

### Phase 3: Page Assembly
8. Create empty state component
9. Create redesigned user details sheet
10. Assemble main page with new layout

### Phase 4: QA & Polish
11. Test responsiveness
12. Verify animations
13. Check accessibility
14. Performance optimization
15. Final visual polish

---

## Design Specifications

### Spacing
- Page padding: `p-8 lg:p-10`
- Max width: `max-w-[1400px]`
- Card padding: `p-6`
- Gap between cards: `gap-6`
- Gap between sections: `mb-8`

### Breakpoints
- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

### Animation Timing
- Fade in: `duration: 0.4`
- Stagger: `delay: 0.1 * index`
- Hover: `duration: 0.2`
- Scale: `whileHover: { y: -4 }`

### Color Variables (CSS Custom Properties)
```css
--users-bg: #F9FAFB;          /* gray-50 */
--users-text-primary: #1C1C1C; /* charcoal */
--users-text-secondary: #6B7280; /* gray-500 */
--users-accent: #F97316;       /* orange */
--users-accent-dark: #EA580C;
--users-card-bg: #FFFFFF;
--users-card-border: #E5E7EB;  /* gray-200 */
```
