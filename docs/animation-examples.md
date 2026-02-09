# Animation Examples & Code Snippets

## Quick Reference Guide for Implemented Animations

This document provides copy-paste examples of all animations implemented in the projects page redesign.

---

## 1. Page Load Animations

### Staggered Container
```tsx
import { motion } from 'framer-motion'

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {/* Children will animate in sequence */}
</motion.div>
```

### Fade In Up
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

<motion.div variants={fadeInUp}>
  {/* Content fades in from bottom */}
</motion.div>
```

---

## 2. Card Animations

### Card with Hover Lift
```tsx
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  whileHover={{ y: -4, scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
  className="card"
>
  {/* Card content */}
</motion.div>
```

### Card with Shadow Increase
```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 },
  }}
  className="card"
>
  {/* Content */}
</motion.div>
```

---

## 3. Button Animations

### Scale Button
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Click Me
</motion.button>
```

### Rotating Refresh Button
```tsx
const [isRefreshing, setIsRefreshing] = useState(false)

<motion.button onClick={handleRefresh}>
  <motion.div
    animate={{ rotate: isRefreshing ? 360 : 0 }}
    transition={{
      duration: 1,
      repeat: isRefreshing ? Infinity : 0,
      ease: 'linear',
    }}
  >
    <RefreshCw />
  </motion.div>
  Refresh
</motion.button>
```

---

## 4. List Animations

### Staggered List Items
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
}

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 5. Badge & Indicator Animations

### Pulsing Badge
```tsx
<motion.span
  className="badge"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  New
</motion.span>
```

### Count-Up Number
```tsx
import { useEffect, useState } from 'react'

function CountUpNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 800
    const increment = target / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {count}
    </motion.span>
  )
}
```

---

## 6. Progress Bar Animations

### Animated Progress Fill
```tsx
<div className="progress-bar">
  <motion.div
    className="progress-fill"
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ duration: 1, ease: 'easeOut' }}
  />
</div>
```

### Shimmer Effect on Progress
```tsx
<div className="relative">
  <Progress value={percentage} />
  <motion.div
    animate={{ x: ['-100%', '200%'] }}
    transition={{
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1,
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
  />
</div>
```

---

## 7. Input Animations

### Focus Animation
```tsx
<motion.input
  whileFocus={{ scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="input"
/>
```

### Search Input with Icon
```tsx
<div className="relative">
  <Search className="icon" />
  <motion.input
    whileFocus={{
      borderColor: '#5A7CFF',
      boxShadow: '0 0 0 3px rgba(90, 124, 255, 0.1)',
    }}
    transition={{ duration: 0.2 }}
    className="input"
  />
</div>
```

---

## 8. Tab Switching

### Tab Content Transition
```tsx
const tabContentVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    variants={tabContentVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {tabContent}
  </motion.div>
</AnimatePresence>
```

---

## 9. Loading Skeletons

### Shimmer Skeleton
```tsx
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

<div className="relative overflow-hidden rounded bg-gray-200 h-8 w-full">
  <motion.div
    variants={shimmer}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
  />
</div>
```

### Pulsing Skeleton
```tsx
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{
    duration: 1.5,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
  className="rounded bg-gray-200 h-8 w-full"
/>
```

---

## 10. Modal Animations

### Modal with Backdrop
```tsx
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
}

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="backdrop"
        onClick={onClose}
      />
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="modal"
      >
        {/* Modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## 11. Icon Animations

### Rotating Icon
```tsx
<motion.div
  whileHover={{ rotate: 180 }}
  transition={{ duration: 0.3 }}
>
  <Icon />
</motion.div>
```

### Bouncing Icon
```tsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
>
  <Icon />
</motion.div>
```

### Wiggle Icon
```tsx
<motion.div
  animate={{ rotate: isHovered ? [-10, 10, 0] : 0 }}
  transition={{ duration: 0.5 }}
>
  <Icon />
</motion.div>
```

---

## 12. Chart Animations

### Staggered Bar Chart
```tsx
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const barVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

<motion.div variants={containerVariants} initial="initial" animate="animate">
  {data.map((item, index) => (
    <motion.div
      key={index}
      variants={barVariants}
      className="bar"
      style={{ height: `${item.value}%` }}
    />
  ))}
</motion.div>
```

---

## 13. Gradient Animations

### Animated Gradient Background
```tsx
<motion.div
  animate={{
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  }}
  transition={{
    duration: 3,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
  style={{
    background: 'linear-gradient(90deg, #5A7CFF, #49C5FF, #5A7CFF)',
    backgroundSize: '200% 100%',
  }}
>
  {/* Content */}
</motion.div>
```

---

## 14. Hover Effects Collection

### Lift + Shadow
```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  }}
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.div>
```

### Scale + Rotate
```tsx
<motion.div
  whileHover={{ scale: 1.05, rotate: 2 }}
  whileTap={{ scale: 0.95, rotate: 0 }}
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.div>
```

### Border Glow
```tsx
<motion.div
  whileHover={{
    borderColor: '#5A7CFF',
    boxShadow: '0 0 0 3px rgba(90, 124, 255, 0.2)',
  }}
  transition={{ duration: 0.2 }}
  className="border border-gray-200"
>
  {/* Content */}
</motion.div>
```

---

## 15. Accessibility - Reduced Motion

### Conditional Animation
```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 260, damping: 20 },
        },
      }

  return <motion.div variants={variants}>Content</motion.div>
}
```

---

## 16. Performance Optimization

### Will Change Hint
```tsx
<motion.div
  style={{ willChange: 'transform, opacity' }}
  whileHover={{ y: -4 }}
>
  {/* Content */}
</motion.div>
```

### Layout Animation
```tsx
<motion.div layout layoutId="unique-id">
  {/* Content that changes size/position */}
</motion.div>
```

---

## Common Patterns

### Spring Physics (Default)
```tsx
const springConfig = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
}
```

### Fast Spring
```tsx
const fastSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
}
```

### Smooth Spring
```tsx
const smoothSpring = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
}
```

---

## Usage Tips

1. **Always use GPU-accelerated properties**: `transform`, `opacity`
2. **Add `will-change` sparingly**: Only for frequently animated elements
3. **Use `layout` for changing dimensions**: Smooth size/position transitions
4. **Implement reduced motion**: Respect user preferences
5. **Cleanup animations**: Use `AnimatePresence` for exit animations
6. **Batch animations**: Group related animations together
7. **Test performance**: Monitor with DevTools Performance panel

---

## Animation Duration Guide

- **Micro-interactions**: 100-200ms (button clicks, hover)
- **UI transitions**: 200-300ms (tabs, dropdowns)
- **Page transitions**: 300-500ms (route changes)
- **Loading states**: 1-2s (infinite shimmer)
- **Celebrations**: 500-1000ms (confetti, badges)

---

## Easing Functions

```typescript
// Framer Motion easings
ease: 'linear'        // Constant speed
ease: 'easeIn'        // Slow start
ease: 'easeOut'       // Slow end
ease: 'easeInOut'     // Slow start and end
ease: [0.4, 0, 0.2, 1] // Custom bezier

// Spring physics (recommended)
type: 'spring'
stiffness: 260
damping: 20
```

---

**Ready to use!** Copy any of these examples into your components.

*Last Updated: 2026-02-09*
*Agent 6 - Animations & Polish Specialist*
