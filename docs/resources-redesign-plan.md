# Resources Page Redesign - Doer Web Implementation Plan

## Design System Analysis (Dashboard Alignment)

### Color Palette
- Primary Accent: #4F6CF7, #5B7CFF
- Secondary Accent: #49C5FF, #45C7F3
- Warm Accent: #FF9B7A, #FF8B6A
- Background: #EEF2FF, #F3F5FF, #E9FAFA
- Surface: white with glass tint (bg-white/85)
- Text: slate-900, slate-600, slate-500
- Borders: white/70, slate-100

### Typography Hierarchy (Match Dashboard)
- Page Title: text-3xl font-semibold tracking-tight
- Section Title: text-lg font-semibold
- Card Title: text-base font-semibold
- Body: text-sm text-slate-500
- Meta: text-xs uppercase tracking-wide

### Visual Patterns
- Rounded panels: 24-28px radius with soft shadow
- Gradient washes behind hero sections
- Icon chips with colored backgrounds
- Buttons: rounded-full, primary gradient or warm accent
- Motion: staggered reveal and gentle lift on hover

## Redesign Strategy

### New Page Structure (Unique Layout)
1. Hero command center with search, CTA, and resource stats
2. Split discovery section: featured tools + quick outcomes panel
3. Resource grid reworked into a staggered, asymmetric layout
4. Tool detail pages redesigned to match the new glass + gradient system

### UX Intent
- Emphasize next-best-action resources
- Make training and tools feel curated and premium
- Keep interaction density high without clutter

## Implementation Plan

### Files to Update
- `doer-web/app/(main)/resources/page.tsx`
- `doer-web/components/resources/ResourcesGrid.tsx`
- `doer-web/components/resources/TrainingCenter.tsx`
- `doer-web/components/resources/AIReportGenerator.tsx`
- `doer-web/components/resources/CitationBuilder.tsx`
- `doer-web/components/resources/FormatTemplates.tsx`

### Step-by-Step
1. Replace the resources page header with a hero command center panel.
2. Add a split layout for featured resources + learning pulse summary.
3. Redesign ResourcesGrid into staggered cards with new visual hierarchy.
4. Update each tool component to align with dashboard colors, spacing, and motion.
5. Validate responsive layouts and preserve transitions.

## Success Criteria
- Visual hierarchy matches dashboard typography and spacing.
- Layout structure is unique from dashboard while consistent in style.
- All resource components use the new color system and glass panels.
- Responsive behavior preserved for mobile and desktop.
