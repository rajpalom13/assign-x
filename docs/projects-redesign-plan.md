# Projects Page Redesign - Implementation Plan

## Dashboard Analysis (Reference)

**Palette and tone**
- Primary text: `#1C1C1C` (charcoal)
- Accent: `#F97316` with hover `#EA580C`
- Background: `bg-gray-50`
- Cards: `bg-white` with `border-gray-200`
- Support colors: emerald/amber/blue for status

**Typography hierarchy**
- Hero title: `text-4xl lg:text-5xl font-bold tracking-tight`
- Section headers: `text-lg font-semibold`
- Body copy: `text-sm text-gray-500`
- Labels: `text-xs font-medium text-gray-500`
- Value emphasis: `text-lg font-bold`

**UI patterns**
- Rounded cards (`rounded-2xl`) with subtle borders
- Soft hover lift and shadows
- Framer-motion entry animations with stagger
- Icon containers in rounded tiles

## Redesign Goals

1. Keep dashboard font hierarchy and palette intact.
2. Create a distinct Projects layout and information architecture.
3. Redesign every component on the page for a unique identity.
4. Add richer layout structure and visual rhythm without copying dashboard.

## New Page Structure (Unique Layout)

```
┌──────────────────────────────────────────────────────────────┐
│  Hero: Title + action cluster + pipeline snapshot card       │
├──────────────────────────────────────────────────────────────┤
│  Two-column body                                             │
│  ┌───────────────┐  ┌───────────────────────────────────────┐ │
│  │ Status rail   │  │ Control deck (search/sort/filters)    │ │
│  │ + micro stats │  │ Project grid with section header       │ │
│  │ + quick tips  │  │ Empty states or cards                  │ │
│  └───────────────┘  └───────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Component Redesign Plan

### 1) Projects Hero
- Left: title, dynamic subtitle, two actions (primary + secondary)
- Right: new "Pipeline Snapshot" card with progress bars
- Subtle gradient background and decorative shapes

### 2) Status Rail (ProjectStatusPills)
- Convert pills into stacked status cards
- Each card shows icon, label, count, and micro progress line
- Active state uses dark charcoal surface with orange accent line

### 3) Stats (ProjectStatCard)
- Rebuild card layout: icon tile + value + label + trend micro-bar
- Use colored accents for status emphasis, same palette

### 4) Control Deck (ProjectsSearchBar)
- Create a single "control deck" card with grouped input areas
- Add filter tags + clear action when filters are active
- Keep same functionality: search, subject filter, sort

### 5) Project Card (ProjectCardV2)
- Restructure content into header band, details row, and action shelf
- Add subtle card gradient and hierarchy separators
- Keep actions per status variant but redesign styling

### 6) Empty States (ProjectsEmptyState)
- New container layout with soft background panel
- Consistent icon badge + CTA for search

### 7) Illustration (ProjectsIllustration)
- Refresh illustration to match new "Pipeline" and "Queue" theme
- Maintain orange/charcoal palette and similar stroke weight

## Implementation Steps

1. Update `ProjectStatusPills` to the new stacked status rail.
2. Redesign `ProjectStatCard` visual structure and spacing.
3. Rebuild `ProjectsSearchBar` into a control deck layout.
4. Redesign `ProjectCardV2` layout and action shelf.
5. Refresh `ProjectsEmptyState` and `ProjectsIllustration`.
6. Rewrite `superviser-web/app/(dashboard)/projects/page.tsx` layout.
7. Verify responsive behavior for mobile and wide screens.

## QA Checklist

- Palette and typography match dashboard hierarchy.
- Layout and components are visually distinct from dashboard.
- All filters/search/sort still work.
- Empty states render correctly for all variants.
- Motion and hover effects feel consistent with dashboard.
