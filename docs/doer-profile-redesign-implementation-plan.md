# Doer Profile Page Redesign Implementation Plan

## Objectives
- Redesign the Doer profile page UI/UX with a new layout and structure while preserving existing font hierarchy.
- Update every profile-related component to align with the refreshed visual system.
- Maintain current functionality and data flow while improving hierarchy and scannability.

## Current Design Snapshot (For Alignment)
- Typeface: Geist Sans (primary), Geist Mono (numeric + code-like details).
- Theme: Teal/Emerald primary palette with soft neutrals and gradient utilities.
- Components: Card-based layout, tab-based navigation, dense grids.

## New Layout Direction
- **Page Shell**: Two-column dashboard shell (left rail navigation + main content).
- **Hero Area**: Profile spotlight with action cluster and status chips.
- **Overview**: Performance snapshot, earnings trend, ratings capsule, skills verification progress.
- **Utilities**: Contextual action cards and payout callouts on the right column (desktop).

## Component Redesign Scope
- `doer-web/app/(main)/profile/page.tsx`
  - Replace tab-heavy layout with a dashboard shell.
  - Introduce a left navigation panel and a structured overview grid.
  - Update hero and quick-action treatments.

- `doer-web/components/profile/Scorecard.tsx`
  - New stat card layout with stronger hierarchy and consistent icon treatments.

- `doer-web/components/profile/EditProfile.tsx`
  - Rework form layout to a two-column editor with clearer sectioning and sticky actions.

- `doer-web/components/profile/PaymentHistory.tsx`
  - Redesign balance summary, filters, and table header styling.

- `doer-web/components/profile/BankSettings.tsx`
  - Update verification block, account display, and edit dialog layout.

- `doer-web/components/profile/RequestPayout.tsx`
  - Make payout dialog steps more visual and scannable.

- `doer-web/components/profile/EarningsGraph.tsx`
  - Improve chart card layout and stat chips for quick reading.

- `doer-web/components/profile/RatingBreakdown.tsx`
  - Refresh rating overview layout and review cards.

- `doer-web/components/profile/SkillVerification.tsx`
  - Convert skill list into modern list rows with status pills and info panel.

- `doer-web/components/profile/SupportSection.tsx`
  - Redesign support options into a more compact help hub.

## Implementation Steps
1. Update the profile page layout (new shell, navigation, hero, overview grid).
2. Restyle the Scorecard and stat treatments to match the new layout.
3. Redesign each profile subcomponent to fit the new visual system.
4. Validate spacing, typography, and color contrast in light theme.
5. Verify responsive behavior for mobile and tablet layouts.

## QA Checklist
- Layout is visibly different from the previous design.
- Typography hierarchy remains consistent with the rest of the site.
- All components render without layout shifts or overflow.
- All CTAs remain functional and accessible.
- Mobile layout stacks correctly and remains scannable.
