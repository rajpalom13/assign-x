# ProfileHero Component

A premium hero section component for the profile page that matches the dashboard's design system with blue gradient styling.

## Location

`doer-web/components/profile/redesign/ProfileHero.tsx`

## Features

- **Large Avatar with Gradient Border**: 24x24 avatar with animated blue gradient border effect
- **Gradient Text Highlighting**: User name with blue gradient text (colors: #5A7CFF, #5B86FF, #49C5FF)
- **Verification Badges**: Blue themed badges for verified status and qualifications
- **4 Inline Stat Cards**: Displays total earnings, projects done, rating, and on-time rate
- **Profile Completion Progress Bar**: Visual progress indicator with blue gradient
- **Quick Action Buttons**: Premium styled buttons with blue gradient and hover effects
- **Premium Rounded Design**: Consistent use of rounded corners (rounded-2xl, rounded-[28px])
- **Shadow Effects**: Layered shadow effects matching dashboard visual hierarchy

## Design System Colors

- Primary Blue: `#5A7CFF`
- Secondary Blue: `#5B86FF`
- Tertiary Blue: `#4F6CF7`
- Accent Cyan: `#49C5FF`
- Light Blue Background: `#EEF2FF`

## Props

```typescript
type ProfileHeroProps = {
  profile: {
    full_name: string
    email: string
    avatar_url?: string | null
  }
  doer: {
    is_activated: boolean
    qualification?: string | null
    experience_level?: string | null
  }
  stats: {
    totalEarnings: number
    completedProjects: number
    averageRating: number
    onTimeDeliveryRate: number
    totalReviews: number
  }
  profileCompletion: number
  onEditProfile?: () => void
  onViewPayouts?: () => void
  onViewEarnings?: () => void
}
```

## Usage

### Basic Example

```tsx
import { ProfileHero } from '@/components/profile/redesign'

function ProfilePage() {
  const profile = {
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://example.com/avatar.jpg'
  }

  const doer = {
    is_activated: true,
    qualification: 'bachelors_degree',
    experience_level: 'expert'
  }

  const stats = {
    totalEarnings: 125000,
    completedProjects: 42,
    averageRating: 4.8,
    onTimeDeliveryRate: 95.5,
    totalReviews: 38
  }

  return (
    <ProfileHero
      profile={profile}
      doer={doer}
      stats={stats}
      profileCompletion={92}
      onEditProfile={() => setActiveTab('edit')}
      onViewPayouts={() => setActiveTab('payments')}
      onViewEarnings={() => setActiveTab('earnings')}
    />
  )
}
```

### Integration with Profile Page

Replace the existing hero section in `doer-web/app/(main)/profile/page.tsx` (lines 335-426):

```tsx
// Before
<Card className="relative overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient...]" />
  <CardContent className="relative space-y-6 p-6">
    {/* Old hero content */}
  </CardContent>
</Card>

// After
import { ProfileHero } from '@/components/profile/redesign'

<ProfileHero
  profile={profile}
  doer={doer}
  stats={stats}
  profileCompletion={profileCompletion}
  onEditProfile={() => setActiveTab('edit')}
  onViewPayouts={() => setActiveTab('payments')}
  onViewEarnings={() => setActiveTab('earnings')}
/>
```

## Component Structure

```
ProfileHero
├── Background Gradient Overlay
├── Top Section
│   ├── Avatar with Gradient Border
│   ├── Name & Email
│   ├── Verification Badges
│   └── Quick Action Buttons
├── Stats Grid (4 cards)
│   ├── Total Earnings
│   ├── Projects Done
│   ├── Rating
│   └── On-time Rate
└── Profile Completion
    ├── Progress Bar
    └── Achievement Badges
```

## Styling Details

### Avatar
- Size: 24x24 (96px × 96px)
- Border: 4px white border
- Gradient border effect using absolute positioning and blur
- Fallback shows user initials with gradient background

### Stat Cards
- Layout: Grid with 4 columns on large screens, 2 on small screens
- Background: `bg-white/85` with shadow
- Border radius: `rounded-2xl`
- Hover effect: Increased shadow intensity

### Action Buttons
- Primary: Blue gradient background with shadow and lift on hover
- Secondary: White background with outline, changes to blue on hover
- Tertiary: Ghost style with white/60 background

### Progress Bar
- Custom gradient indicator: `from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF]`
- Height: 2.5 (10px)
- Background: `bg-slate-200/80`

## Design Patterns from Dashboard

This component follows the same design patterns used in:
- `dashboard-client.tsx` (lines 107-151) - Top bar and hero section
- QuickStatCard component - Stat card styling
- HeroWorkspaceCard - Overall layout and gradient backgrounds
- Button styles - Gradient and shadow effects

## Accessibility

- All interactive elements have proper aria-labels
- Avatar has alt text
- Semantic HTML structure
- Keyboard navigable buttons
- Focus states on interactive elements

## Dependencies

- `@/components/ui/avatar` - Avatar component from shadcn/ui
- `@/components/ui/badge` - Badge component
- `@/components/ui/button` - Button component
- `@/components/ui/progress` - Progress bar with custom indicator support
- `lucide-react` - Icons (BadgeCheck, Star, Edit2, Wallet, TrendingUp, Award)
- `@/lib/utils` - cn utility for class merging

## Browser Support

- Modern browsers with CSS Grid support
- Flexbox for responsive layout
- CSS gradients and backdrop-filter
- Responsive breakpoints: sm, lg

## Performance

- No client-side state management
- Pure presentational component
- Efficient re-renders (only when props change)
- Optimized gradients and shadows
- No heavy computations

## Related Components

- `ProfileInsights` - Additional profile metrics
- `ProfileTabs` - Tab navigation for profile sections
- Dashboard components - Share same design system

## Future Enhancements

- [ ] Add animation on mount using framer-motion
- [ ] Add skeleton loading state
- [ ] Make stat cards clickable with drill-down actions
- [ ] Add tooltip for truncated email addresses
- [ ] Support for custom badge types
- [ ] Add profile picture upload functionality
- [ ] Add share profile button
- [ ] Add download profile as PDF

## References

- Dashboard design: `doer-web/app/(main)/dashboard/dashboard-client.tsx`
- Original profile: `doer-web/app/(main)/profile/page.tsx`
- Design system colors: Blue gradient palette (#5A7CFF family)
