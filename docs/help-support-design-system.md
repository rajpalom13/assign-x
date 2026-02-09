# Help & Support Page - Design System Documentation

**Extracted from:** dashboard-client.tsx, projects/page.tsx, resources/page.tsx, globals.css

This document provides a comprehensive design system for implementing the Help & Support page, maintaining visual consistency across the doer-web application.

---

## 1. Color System

### Primary Colors (Blue Gradient Spectrum)

```css
/* Primary Blue Gradients */
--blue-primary: #5A7CFF       /* Main primary blue */
--blue-mid: #5B86FF           /* Mid-point gradient */
--blue-light: #49C5FF         /* Light cyan-blue */
--blue-accent: #4F6CF7        /* Deeper accent */
--blue-darker: #3652F0        /* Hover states */
--blue-purple: #6B5BFF        /* Purple variant */

/* Gradient Combinations */
from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF]    /* Main gradient */
from-[#5B7CFF] via-[#5B86FF] to-[#43D1C5]    /* Teal variant */
from-[#5A7CFF] to-[#49C5FF]                  /* Simple gradient */
from-[#5A7CFF] via-[#5B86FF] to-[#6B5BFF]    /* Purple variant */
```

### Secondary Colors (Slate/Gray System)

```css
/* Text Colors */
--slate-900: #0F172A        /* Headings, primary text */
--slate-800: #1E293B        /* Body text, secondary headings */
--slate-700: #334155        /* Interactive elements */
--slate-600: #475569        /* Secondary interactive */
--slate-500: #64748B        /* Subtle text, descriptions */
--slate-400: #94A3B8        /* Placeholders, disabled */

/* Background Colors */
--slate-100: #F1F5F9        /* Subtle backgrounds */
--slate-50: #F8FAFC         /* Very light backgrounds */
```

### Accent Colors (Task-Specific)

```css
/* Teal/Cyan Accents */
--teal-primary: #43D1C5     /* Success, completion */
--cyan-light: #45C7F3       /* Info, highlights */
--cyan-accent: #4B9BFF      /* Links, interactive */

/* Warning/Alert Colors */
--orange-primary: #FF9B7A   /* CTA buttons, warm actions */
--orange-accent: #FF8B6A    /* Urgent items */
--orange-light: #FFE7E1     /* Urgent backgrounds */

/* Purple Accents */
--purple-accent: #6B5BFF    /* Special features */
```

### Background Tints (Glassmorphism)

```css
/* Base Backgrounds */
bg-[#EEF2FF]                /* Light blue tint */
bg-[#F3F5FF]                /* Very light blue */
bg-[#E9FAFA]                /* Light cyan */
bg-[#F2F5FF]                /* Soft blue */
bg-[#F7F9FF]                /* Near-white blue */

/* Card Backgrounds */
bg-white/85                 /* 85% white (cards) */
bg-white/90                 /* 90% white (inputs) */
bg-white/80                 /* 80% white (overlays) */
bg-white/60                 /* 60% white (glass cards) */

/* Background Overlays */
bg-slate-50/80              /* Light backgrounds */
bg-slate-100                /* Subtle dividers */
```

### Icon Background Colors

```css
/* Blue Tones */
bg-[#E3E9FF] text-[#4F6CF7]    /* Primary blue icons */
bg-[#E6F4FF] text-[#4B9BFF]    /* Cyan blue icons */
bg-[#EEF2FF] text-[#4F6CF7]    /* Light blue icons */

/* Other Tones */
bg-[#FFE7E1] text-[#FF8B6A]    /* Orange/urgent icons */
bg-[#ECE9FF] text-[#6B5BFF]    /* Purple icons */
```

---

## 2. Typography System

### Font Families

```css
/* Primary Font Stack */
font-family: var(--font-geist-sans)    /* Body text */
font-family: var(--font-geist-mono)    /* Code/monospace */

/* Font Features */
font-feature-settings: "rlig" 1, "calt" 1
@apply antialiased
```

### Font Sizes & Weights

```css
/* Headings */
text-3xl font-semibold tracking-tight        /* H1: Main page titles */
text-2xl font-semibold                       /* H2: Section headers */
text-xl font-semibold                        /* H3: Subsection headers */
text-lg font-semibold                        /* H4: Card titles */
text-base font-semibold                      /* H5: Small headers */

/* Body Text */
text-base text-slate-500                     /* Regular body */
text-sm text-slate-500                       /* Small descriptions */
text-xs text-slate-500                       /* Captions, meta */
text-sm leading-relaxed text-slate-500       /* Paragraph text */

/* Interactive Elements */
text-sm font-semibold                        /* Buttons */
text-xs font-semibold uppercase tracking-wide /* Labels */
text-xs font-medium text-slate-500           /* Stats, metrics */

/* Special Text */
text-xs font-semibold uppercase tracking-[0.2em]  /* Feature labels */
text-xs font-semibold uppercase tracking-[0.25em] /* Section tags */
```

### Letter Spacing

```css
tracking-tight              /* Headings */
tracking-wide              /* Small labels */
tracking-[0.2em]           /* Wide spacing for emphasis */
tracking-[0.25em]          /* Extra-wide for tags */
```

---

## 3. Spacing System

### Padding

```css
/* Card Padding */
p-4                        /* Small cards (16px) */
p-5                        /* Medium cards (20px) */
p-6                        /* Standard cards (24px) */
p-8                        /* Large sections (32px) */
px-3 py-2                  /* Compact items */
px-4 py-3                  /* Medium items */
px-5 py-4                  /* Standard items */
px-6 py-6                  /* Large items */

/* Section Padding */
py-6                       /* Top bars */
p-6 lg:p-8                 /* Responsive large cards */
```

### Margins & Gaps

```css
/* Vertical Spacing */
space-y-1                  /* Tight (4px) */
space-y-2                  /* Compact (8px) */
space-y-3                  /* Small (12px) */
space-y-4                  /* Medium (16px) */
space-y-6                  /* Large (24px) */
space-y-8                  /* Extra-large (32px) */
space-y-12                 /* Huge (48px) */

/* Grid Gaps */
gap-2                      /* 8px */
gap-3                      /* 12px */
gap-4                      /* 16px */
gap-5                      /* 20px */
gap-6                      /* 24px */
gap-8                      /* 32px */

/* Flex Gaps */
flex items-center gap-2    /* Icon + text */
flex items-center gap-3    /* Button groups */
```

### Margin Top (Component Spacing)

```css
mt-1                       /* 4px */
mt-2                       /* 8px */
mt-3                       /* 12px */
mt-4                       /* 16px */
mt-6                       /* 24px */
```

---

## 4. Border Radius (Rounded Corners)

### Standard Radius Values

```css
/* Cards & Containers */
rounded-[28px]             /* Hero cards, major sections */
rounded-[24px]             /* Medium cards */
rounded-[32px]             /* Extra-large hero sections */

/* Standard Components */
rounded-2xl                /* Large cards (16px) */
rounded-xl                 /* Medium cards (12px) */
rounded-full               /* Pills, buttons, search */

/* Small Elements */
rounded-2xl                /* Icon containers */
```

### Component-Specific Radius

```css
/* Buttons */
rounded-full               /* Primary CTA buttons */
rounded-2xl                /* Icon-only buttons */

/* Input Fields */
rounded-2xl                /* Search inputs */
rounded-full               /* Pill-style inputs */

/* Cards */
rounded-[28px]             /* Main content cards */
rounded-2xl                /* Stat cards */

/* Progress Bars */
rounded-full               /* Progress indicators */
```

---

## 5. Shadows & Depth

### Box Shadows (Light to Heavy)

```css
/* Subtle Shadows */
shadow-[0_4px_20px_rgba(148,163,184,0.08)]     /* Light card elevation */
shadow-[0_10px_20px_rgba(148,163,184,0.12)]    /* Input fields */
shadow-[0_10px_22px_rgba(30,58,138,0.08)]      /* Small cards */
shadow-[0_12px_28px_rgba(30,58,138,0.08)]      /* Medium cards */

/* Medium Shadows */
shadow-[0_14px_28px_rgba(30,58,138,0.08)]      /* Tab lists */
shadow-[0_16px_35px_rgba(30,58,138,0.08)]      /* Standard cards */
shadow-[0_18px_40px_rgba(30,58,138,0.08)]      /* Tab content */
shadow-[0_20px_50px_rgba(30,58,138,0.1)]       /* Summary panels */

/* Heavy Shadows */
shadow-[0_24px_60px_rgba(30,58,138,0.12)]      /* Hero sections */
shadow-[0_28px_70px_rgba(30,58,138,0.12)]      /* Resources hero */

/* Gradient Button Shadows */
shadow-[0_8px_30px_rgba(90,124,255,0.35)]      /* Primary buttons */
shadow-[0_12px_40px_rgba(90,124,255,0.45)]     /* Button hover */
shadow-[0_12px_28px_rgba(255,155,122,0.35)]    /* Orange buttons */
shadow-[0_14px_28px_rgba(91,124,255,0.25)]     /* Purple buttons */
shadow-[0_16px_35px_rgba(91,124,255,0.35)]     /* CTA buttons */
```

### Focus Ring Shadows

```css
/* Focus States */
focus:ring-4 focus:ring-[#E7ECFF]              /* Blue focus ring */
focus:ring-4 focus:ring-[#B8C4FF]              /* Darker focus ring */
```

---

## 6. Gradients & Overlays

### Background Gradients

```css
/* Card Gradients */
bg-gradient-to-br from-[#EEF2FF] via-[#F3F5FF] to-[#E9FAFA]
bg-gradient-to-br from-[#F2F5FF] via-[#F7F9FF] to-[#EAF6FF]
bg-gradient-to-br from-[#F1F7FF] via-[#F6FAFF] to-[#E8F9FF]
bg-gradient-to-br from-[#FFF4F0] via-[#FFF7F4] to-[#FFEFE9]
bg-gradient-to-br from-[#EEF2FF] via-[#F5F6FF] to-[#E9EDFF]
bg-gradient-to-br from-[#F7F9FF] via-[#F2F6FF] to-[#EEF2FF]
bg-gradient-to-br from-[#EEF2FF] to-[#E6F4FF]

/* Hero Section Gradients */
bg-gradient-to-br from-[#EEF2FF] via-[#F3F5FF] to-[#E9FAFA]
```

### Button Gradients

```css
/* Primary Buttons */
bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF]
bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#6B5BFF]
bg-gradient-to-r from-[#5A7CFF] to-[#49C5FF]

/* Highlight Gradients */
bg-gradient-to-r from-[#5B7CFF] via-[#5B86FF] to-[#43D1C5]
```

### Radial Overlay Gradients

```css
/* Page Background Overlays */
bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(67,209,197,0.16),transparent_50%)]

bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(109,99,255,0.14),transparent_50%)]

/* Card Overlay Gradients */
bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_55%)]

bg-[radial-gradient(circle_at_top_left,rgba(90,124,255,0.2),transparent_60%)]

bg-[radial-gradient(circle_at_left,rgba(79,108,247,0.08),transparent_50%)]
```

### Text Gradients

```css
/* Gradient Text */
bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF] bg-clip-text text-transparent
```

---

## 7. Layout & Grid Patterns

### Container Layouts

```css
/* Main Content Grid */
grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]     /* Dashboard hero */
grid gap-6 xl:grid-cols-[1fr_420px]               /* Projects page */
grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]     /* Resources hero */

/* Stats Grid */
grid gap-4 sm:grid-cols-2 lg:grid-cols-4          /* 4-column stats */
grid gap-4 lg:grid-cols-3                         /* 3-column cards */
grid gap-4 sm:grid-cols-2 lg:grid-cols-3          /* Responsive 3-col */

/* Tab Lists */
grid w-full grid-cols-2 max-w-md                  /* 2-tab layout */
grid w-full max-w-2xl grid-cols-3                 /* 3-tab layout */
```

### Flexbox Patterns

```css
/* Header Bars */
flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between

/* Icon + Text */
flex items-center gap-2
flex items-start gap-4
flex items-center justify-between

/* Button Groups */
flex flex-wrap items-center gap-3
flex flex-col gap-3 sm:flex-row sm:items-center
```

### Responsive Breakpoints

```css
/* Mobile First */
sm:flex-row              /* ≥640px */
lg:grid-cols-3           /* ≥1024px */
xl:grid-cols-[...]       /* ≥1280px */
lg:p-8                   /* Responsive padding */
```

---

## 8. Animation & Motion (Framer Motion)

### Fade In Up Variants

```javascript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}
```

### Stagger Container

```javascript
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}
```

### AnimatePresence Patterns

```javascript
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

### Hover Transitions

```css
/* Button Hover */
transition hover:-translate-y-0.5
transition-all

/* Card Hover */
transition hover:shadow-[0_14px_28px_rgba(30,58,138,0.12)]
```

---

## 9. Icon Treatment

### Icon Sizes

```css
h-4 w-4                    /* Small icons (16px) - inline */
h-5 w-5                    /* Medium icons (20px) - standard */
h-6 w-6                    /* Large icons (24px) - emphasis */
```

### Icon Containers

```css
/* Standard Pattern */
h-9 w-9 rounded-2xl flex items-center justify-center
h-11 w-11 rounded-2xl flex items-center justify-center
h-12 w-12 rounded-2xl flex items-center justify-center

/* Icon + Background Examples */
<div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E3E9FF] text-[#4F6CF7]">
  <Icon className="h-5 w-5" />
</div>
```

### Icon Colors & Backgrounds

```css
/* Blue Theme */
bg-[#E3E9FF] text-[#4F6CF7]
bg-[#E6F4FF] text-[#4B9BFF]
bg-[#EEF2FF] text-[#4F6CF7]

/* Orange Theme */
bg-[#FFE7E1] text-[#FF8B6A]

/* Purple Theme */
bg-[#ECE9FF] text-[#6B5BFF]
```

### Icon with Shadow

```css
shadow-lg                  /* For icon containers */
```

---

## 10. Component Patterns

### Card Component (Base)

```tsx
<Card className="relative overflow-hidden border-none bg-white/85 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
  <CardContent className="p-5">
    {/* Content */}
  </CardContent>
</Card>
```

### Hero Section Card

```tsx
<div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#EEF2FF] via-[#F3F5FF] to-[#E9FAFA] p-6 shadow-[0_24px_60px_rgba(30,58,138,0.12)]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_55%)]" />
  <div className="relative">
    {/* Content */}
  </div>
</div>
```

### Search Input

```tsx
<div className="relative w-full sm:max-w-md">
  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  <input
    className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-11 pr-4 text-sm text-slate-700 shadow-[0_4px_20px_rgba(148,163,184,0.08)] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#5A7CFF] focus:bg-white focus:ring-4 focus:ring-[#E7ECFF]"
    placeholder="Search..."
    type="search"
  />
</div>
```

### Primary Button (Gradient)

```tsx
<button
  className="h-12 rounded-2xl bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF] px-6 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(90,124,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(90,124,255,0.45)]"
  type="button"
>
  Button Text
</button>
```

### Tab List

```tsx
<TabsList className="grid w-full grid-cols-2 max-w-md h-12 rounded-full bg-white/85 p-1 shadow-[0_14px_28px_rgba(30,58,138,0.08)]">
  <TabsTrigger
    value="tab1"
    className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5A7CFF] data-[state=active]:to-[#49C5FF] data-[state=active]:text-white transition-all"
  >
    Tab 1
  </TabsTrigger>
</TabsList>
```

### Badge Component

```tsx
<Badge className="bg-[#E6F4FF] text-[#4B9BFF] border-0">
  Label Text
</Badge>
```

### Stat Card (Small)

```tsx
<div className="rounded-2xl bg-white/85 p-4 shadow-[0_12px_28px_rgba(30,58,138,0.08)]">
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</p>
  <p className="mt-2 text-2xl font-semibold text-slate-900">Value</p>
</div>
```

---

## 11. Loading States

### Skeleton Pattern

```tsx
<Skeleton className="h-32 w-full rounded-[28px] bg-[#EEF2FF]" />
<Skeleton className="h-64 rounded-xl bg-[#EEF2FF]" />
```

### Loading Spinner Icon

```tsx
<RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
```

---

## 12. Utility Classes (from globals.css)

### Glassmorphism

```css
.glass {
  @apply bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl;
}

.glass-card {
  @apply bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-white/10;
}
```

### Card Effects

```css
.card-interactive {
  @apply transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5;
}
```

---

## 13. Page Background Pattern

### Standard Background Overlay

```tsx
<div className="relative">
  <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(67,209,197,0.16),transparent_50%)]" />

  <div className="space-y-8">
    {/* Page Content */}
  </div>
</div>
```

---

## 14. Recommended Component Structure for Help & Support Page

```tsx
// Hero Section
<div className="rounded-[32px] bg-gradient-to-br from-[#F7F9FF] via-[#F2F6FF] to-[#EEF2FF] p-8 shadow-[0_28px_70px_rgba(30,58,138,0.12)]">
  {/* Hero content */}
</div>

// Search Bar
<div className="relative w-full max-w-md">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  <input className="h-11 w-full rounded-full border border-white/80 bg-white/85 pl-10 pr-4 text-sm text-slate-700 shadow-[0_10px_20px_rgba(148,163,184,0.12)] outline-none transition focus:border-[#B8C4FF] focus:ring-4 focus:ring-[#E7ECFF]" />
</div>

// FAQ/Help Card
<div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(30,58,138,0.08)]">
  {/* FAQ content */}
</div>

// Contact CTA Button
<Button className="h-11 rounded-full bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF] text-white shadow-[0_14px_28px_rgba(91,124,255,0.25)] hover:-translate-y-0.5 transition-all">
  Contact Support
</Button>
```

---

## 15. Icon Library (from imports)

```tsx
import {
  Bell,
  Search,
  Briefcase,
  Sparkles,
  Clock,
  IndianRupee,
  RefreshCw,
  Target,
  Layers,
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
```

---

## Summary

This design system ensures:
- **Visual Consistency**: All components use the same color palette, spacing, and typography
- **Glassmorphism Theme**: Semi-transparent cards with backdrop blur
- **Blue-Cyan Gradient Identity**: Primary brand colors throughout
- **Smooth Animations**: Framer Motion for page transitions
- **Responsive Design**: Mobile-first breakpoints
- **Depth & Shadow**: Layered shadows for visual hierarchy
- **Accessibility**: High contrast text, focus states

Use this document as the **single source of truth** when building the Help & Support page.
