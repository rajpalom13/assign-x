# Supervisor Web Login Redesign Plan

## Goals
- Create a distinct visual identity from the user web login.
- Make the supervisor login feel premium and production-ready.
- Use a different palette, layout structure, card hierarchy, and motion.
- Arrange cards with varied shapes, sizes, and treatments so they are not visually similar.
- Keep the flow fast, accessible, and mobile-ready.

## Visual Direction
- Theme: "Coastal Copper" (deep teal + seafoam + sand + clay accents).
- Mood: confident, calm, quality-control focused.
- Typography: keep existing global font to avoid broad refactor, but emphasize tight tracking and weight contrast.
- Background: layered gradients, diagonal shapes, and subtle texture.

## Color System (Local)
- Deep Teal: #0F2A2E
- Ocean Teal: #1C4B4F
- Seafoam: #72B7AD
- Sand: #F2E9DA
- Clay: #C77B4E
- Ink: #122022
- Mist: #E6F0EE

## Layout Structure
- Overall: split layout with a left visual storytelling panel and right form stack.
- Left panel: full-height, angled layered background with asymmetric card cluster.
- Right panel: soft sand background with a centered column containing two distinct cards:
  - Primary login card (clean white, soft shadow, rounded 2xl).
  - Secondary info card (tinted gradient, different radius and border style).

## Card Arrangement (Distinct Treatments)
- Visual panel cards (3 cards):
  - Card A: tall stat card with dark background, small label, large value.
  - Card B: wide insight banner with gradient border and small icon.
  - Card C: square card with border-only and subtle glow.
- Form side cards:
  - Login card: clean, elevated, normal border.
  - Info card: tinted background, dashed border, different radius and padding.

## Motion
- Page load: staggered fade-in-up for the cards and hero text.
- Ambient: slow float on one visual card only (avoid over-animation).
- Reduced motion respected via existing utilities.

## Component-Level Changes
- `superviser-web/app/(auth)/layout.tsx`
  - Replace current purple/indigo visual panel with teal/sand palette.
  - Implement asymmetric card cluster using absolute positioning.
  - Update hero content and badges to match new tone.
  - Adjust footer links styling to match the new palette.
- `superviser-web/app/(auth)/login/page.tsx`
  - Replace single card stack with a two-card composition.
  - Update mobile logo and headings to match new palette.
  - Add small helper copy and trust indicators styled in the new system.
- `superviser-web/components/auth/login-form.tsx`
  - Update button and link styles to align with teal/copper palette.
  - Keep existing logic intact.

## Responsive Strategy
- Mobile: visual panel hidden; add compact brand lockup.
- Tablet: left panel visible, cards scaled down; right panel spacing tightened.
- Desktop: full split layout, cards in asymmetric cluster.

## Accessibility & UX
- Maintain contrast ratios for text on dark backgrounds.
- Ensure focus states remain visible on buttons/links.
- Keep primary CTA at the top of the form and visible without scroll.

## Implementation Steps
1. Update auth layout with new palette and visual panel structure.
2. Redesign login page layout into a two-card right panel stack.
3. Re-skin login form button and link styles.
4. Verify layout at mobile, tablet, desktop breakpoints.
5. Confirm no color or layout collisions with the rest of the app.
