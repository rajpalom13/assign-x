# Doers Page Redesign - Implementation Plan

## Executive Summary
Redesign the Doers page so it matches the dashboard visual hierarchy while giving it a distinct layout and structure, aligned with the Projects and Users pages.

---

## 1. Design Analysis (Dashboard Reference)

### Typography + Hierarchy
- Display: `text-4xl lg:text-5xl font-bold tracking-tight`
- Subhead: `text-lg text-gray-500`
- Section title: `text-lg font-semibold text-[#1C1C1C]`
- Labels: `text-xs font-medium text-gray-500`
- Data: `text-lg/2xl font-bold text-[#1C1C1C]`

### Color System
- Primary text: `#1C1C1C`
- Accent: `#F97316` (hover `#EA580C`)
- Background: `bg-gray-50`
- Cards: `bg-white` with `border-gray-200`
- Icon tiles: `bg-orange-100 text-orange-600`, `bg-emerald-50 text-emerald-600`, `bg-amber-50 text-amber-600`

### Interaction Style
- Rounded: `rounded-2xl` to `rounded-3xl`
- Hover: subtle lift + shadow, `hover:-translate-y-0.5` + `hover:shadow-md`
- Motion: staggered entrance with Framer Motion

---

## 2. New Page Layout (Unique Identity)

```
┌──────────────────────────────────────────────────────────────┐
│ HERO CARD                                                    │
│  Left: Title, description, CTAs, stat tiles                  │
│  Right: New network illustration + availability snapshot     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TWO-COLUMN STUDIO                                            │
│  Sidebar: Filters + Availability Board + Top Performers      │
│  Main: Directory header + Spotlight + Doer list              │
└──────────────────────────────────────────────────────────────┘
```

Distinct from dashboard by using a studio layout (left control rail + right directory), similar to Projects/Users page structure.

---

## 3. Component Redesign

### 3.1 Hero Card
- New hero container (rounded-3xl) with soft background glow
- Left: "Expert Network" heading, CTA, quick stat tiles
- Right: redesigned illustration + small "Availability Snapshot" card

### 3.2 Sidebar Control Rail
- Search + filters in a stacked card (status chips + rating chips + sort select)
- Availability Board with progress bars (available/busy/blacklisted)
- Top Performers mini-list (top ratings + quick view action)

### 3.3 Doer Card (Wide Layout)
- Replace small grid cards with wide cards (1-2 columns)
- Sections: avatar + name + rating, skills row, compact stats, action column
- Status badge moved to action column for clarity

### 3.4 Empty + Loading States
- Skeletons updated to match wide card layout
- Empty state becomes a centered, calm card with CTA

### 3.5 Illustration
- Replace current people illustration with a "Network Radar" style SVG
- Still uses dashboard palette but a distinct visual motif

---

## 4. File Changes

### Update
1. `superviser-web/app/(dashboard)/doers/page.tsx`
2. `superviser-web/components/doers/doer-illustration.tsx`

### No New Files
- Keep existing `DoerDetails` and data hooks unchanged

---

## 5. Implementation Tasks

1. Redesign hero to include stat tiles and a right-side snapshot
2. Replace top pills row with hero-embedded stats
3. Build the control rail (filters + availability + top performers)
4. Redesign DoerCard into a wide card layout
5. Update loading and empty states to match new layout
6. Replace illustration with a network/radar motif

---

## 6. QA Checklist

### Visual QA
- Typography hierarchy matches dashboard
- Orange/charcoal palette used consistently
- Cards, borders, and spacing align with existing UI
- Layout clearly different from dashboard

### Functional QA
- Search, status, rating, and sort all still work
- Stat tiles and quick chips change filters
- Doer details sheet opens correctly
- Responsive layout for mobile/tablet/desktop

---

## 7. Success Criteria
1. Matches dashboard hierarchy but looks structurally unique
2. Feels as polished as Projects/Users pages
3. Components are visually distinct from the dashboard layout
