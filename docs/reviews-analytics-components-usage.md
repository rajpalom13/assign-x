# Reviews Analytics Components Usage Guide

## Components Created by Agent 2

### 1. CategoryRatingCard

**Location:** `doer-web/components/reviews/CategoryRatingCard.tsx`

**Purpose:** Displays a single category rating with icon, rating number, stars, and description.

**Props:**
```typescript
interface CategoryRatingCardProps {
  category: string          // Category name (e.g., "Quality", "Timeliness")
  rating: number           // Rating value (0-5)
  description: string      // Description text
  icon: LucideIcon        // Lucide icon component
  color: 'blue' | 'cyan' | 'orange'  // Color variant
  className?: string      // Optional additional styling
}
```

**Example Usage:**
```tsx
import { CategoryRatingCard } from '@/components/reviews'
import { Target } from 'lucide-react'

<CategoryRatingCard
  category="Quality"
  rating={4.8}
  description="Consistent high-quality deliverables"
  icon={Target}
  color="blue"
/>
```

**Design System:**
- Blue variant: `bg-[#E3E9FF]` background, `text-[#4F6CF7]` text
- Cyan variant: `bg-[#E6F4FF]` background, `text-[#4B9BFF]` text
- Orange variant: `bg-[#FFE7E1]` background, `text-[#FF8B6A]` text
- Card: `bg-white/85`, `border-white/70`, `shadow-[0_16px_35px_rgba(30,58,138,0.08)]`

---

### 2. RatingAnalyticsDashboard

**Location:** `doer-web/components/reviews/RatingAnalyticsDashboard.tsx`

**Purpose:** Comprehensive two-section dashboard showing rating distribution and category performance.

**Props:**
```typescript
interface RatingAnalyticsDashboardProps {
  ratingDistribution: RatingDistributionItem[]  // Array of star counts
  categoryAverages: CategoryAverages            // Average ratings per category
  className?: string                            // Optional additional styling
}

interface RatingDistributionItem {
  stars: number    // Star rating (1-5)
  count: number    // Number of reviews with this rating
}

interface CategoryAverages {
  quality: number
  timeliness: number
  communication: number
}
```

**Example Usage:**
```tsx
import { RatingAnalyticsDashboard } from '@/components/reviews'

<RatingAnalyticsDashboard
  ratingDistribution={[
    { stars: 5, count: 28 },
    { stars: 4, count: 12 },
    { stars: 3, count: 3 },
    { stars: 2, count: 1 },
    { stars: 1, count: 1 },
  ]}
  categoryAverages={{
    quality: 4.8,
    timeliness: 4.6,
    communication: 4.7,
  }}
/>
```

**Layout:**
- **Section 1 (35% width):** Rating Distribution
  - Progress bars with color gradients (green → red)
  - Count badges on the right
  - Total reviews summary

- **Section 2 (65% width):** Category Performance
  - Grid of 3 CategoryRatingCard components
  - Quality (Target icon, blue)
  - Timeliness (Clock icon, cyan)
  - Communication (MessageSquare icon, orange)

**Responsive Behavior:**
- Desktop: Two-column layout (35% / 65%)
- Mobile: Stacks vertically

---

## Animation Features

Both components use Framer Motion for smooth animations:

- **CategoryRatingCard:** Fade-in and slide-up animation on mount
- **RatingAnalyticsDashboard:** Staggered children animation pattern
- **Progress bars:** Animated width transitions

---

## Integration with Reviews Page

To integrate into the main reviews page:

```tsx
import {
  RatingAnalyticsDashboard,
  CategoryRatingCard
} from '@/components/reviews'

// In your reviews page component
<RatingAnalyticsDashboard
  ratingDistribution={reviewData.distribution}
  categoryAverages={{
    quality: reviewData.avgQuality,
    timeliness: reviewData.avgTimeliness,
    communication: reviewData.avgCommunication,
  }}
/>
```

---

## Dependencies

- `framer-motion` - Animation library
- `lucide-react` - Icon library (Target, Clock, MessageSquare, Star)
- `@/components/ui/progress` - Shadcn Progress component
- `@/lib/utils` - cn utility for class merging

---

## Files Created

1. `doer-web/components/reviews/CategoryRatingCard.tsx` - Single category card
2. `doer-web/components/reviews/RatingAnalyticsDashboard.tsx` - Analytics dashboard
3. `doer-web/components/reviews/index.ts` - Updated with new exports

---

## Status: ✅ Completed

Task #2 completed successfully. All components follow the design system specifications and are ready for integration.
