# Dynamic Step Context - Design Documentation

## Overview
The Dynamic Step Context is an innovative left panel design for the project submission form that provides context-aware guidance that changes with each step, creating a smart companion experience rather than static branding.

## Design Principles

### 1. Context-Aware
- Content changes dynamically based on current step
- Provides relevant guidance and tips for each stage
- Builds user confidence through the process

### 2. Professional & Clean
- Monochromatic color scheme (dark brown #14110F)
- Consistent typography hierarchy
- Minimal, purposeful animations
- No clutter or unnecessary elements

### 3. Distinctly Different from Login
- Features giant artistic step numbers (not in login)
- Dynamic content per step (login is static)
- Circular progress ring (login has simple bars)
- Step-specific tips and guidance
- "What's Next" preview section

---

## Visual Components

### Component 1: Giant Step Number (Hero Element)
**Position:** Center-top of left panel
**Design:**
- Massive outline/stroke typography (200px+ height)
- Number only: 1, 2, 3, or 4
- Stroke style with 2px width
- Color: white with 20% opacity
- Subtle gradient on stroke (brown tints)
- Font: Display/geometric font, very light weight

**Behavior:**
- Fades out when step changes (300ms)
- New number fades in (300ms)
- Slight scale animation (0.95 → 1.0)

---

### Component 2: Step-Specific Content
**Position:** Below giant number, main content area

#### Step 1 - Subject & Topic
```
Icon: 💡 Lightbulb (or Brain icon)
Heading: "Choose Your Focus"
Message: "Select the subject area that matches your project. Our experts cover 50+ academic fields."
Tip: "💡 Pro tip: Not sure? Start broad - you can refine details later."
```

#### Step 2 - Requirements
```
Icon: 📏 Ruler (or Document icon)
Heading: "Set Your Scope"
Message: "Define the length and citation style. We handle everything from 250 to 50,000 words."
Tip: "📊 Pro tip: Average project is 2,500 words with APA7 citations"
```

#### Step 3 - Timeline
```
Icon: ⏰ Clock (or Calendar icon)
Heading: "When Do You Need It?"
Message: "Choose your deadline and urgency. We've delivered 10,000+ projects on time."
Tip: "⚡ Pro tip: Standard delivery gives you the best value"
```

#### Step 4 - Details
```
Icon: ✓ Checkmark (or Upload icon)
Heading: "Final Touches"
Message: "Add any specific instructions or reference materials. The more details, the better we can help."
Tip: "📎 Pro tip: Attach style guides, rubrics, or sample papers for best results"
```

**Typography:**
- Heading: 28px, semibold, white
- Message: 15px, normal, white/70%
- Tip: 13px, normal, white/50%

---

### Component 3: Circular Progress Ring
**Position:** Near the giant step number (top-right corner of number)
**Design:**
- Circular SVG with radius 40px
- Background circle: white/10%
- Progress arc: white/90%
- Stroke width: 3px
- Displays percentage in center (small text)

**Behavior:**
- Animates smoothly when step changes
- Shows completion: 25%, 50%, 75%, 100%
- Clockwise animation with easing

---

### Component 4: Trust Signals (Bottom Section)
**Position:** Bottom of left panel, above "What's Next"
**Design:**
Three inline stats with icons:

```
✓ 15,234 projects completed
★ 4.9/5 average rating
⚡ 98% on-time delivery
```

**Typography:**
- 13px, medium weight
- white/50% opacity
- Icons: white/40%
- Horizontal layout with separators

---

### Component 5: What's Next Preview
**Position:** Very bottom of left panel
**Design:**
```
"Next: Set your timeline →"
```

**Typography:**
- 14px, medium weight
- white/60% opacity
- Arrow icon on right
- Subtle bottom border on top

**Behavior:**
- Changes based on current step
- Step 1: "Next: Set requirements →"
- Step 2: "Next: Choose timeline →"
- Step 3: "Next: Add details →"
- Step 4: "Next: Review & submit →"

---

## Layout Structure

```
┌─────────────────────────────────────┐
│  Logo Badge (top-left)              │
│                                      │
│         ╔═══╗                        │
│         ║ 1 ║  ⭕ 25%               │
│         ╚═══╝                        │
│                                      │
│    💡                                │
│    Choose Your Focus                 │
│    Select the subject area...        │
│                                      │
│    💡 Pro tip: Not sure?...         │
│                                      │
│                                      │
│                                      │
│  [Trust Signals]                     │
│  ✓ 15,234 projects  ★ 4.9/5         │
│                                      │
│  ─────────────────────────           │
│  Next: Set requirements →            │
└─────────────────────────────────────┘
```

---

## Color Palette

### Background
- Primary: #14110F (dark brown)
- Gradient overlays: Subtle brown radial gradients
  - rgba(118,83,65,0.12) at 20%/20%
  - rgba(52,49,45,0.10) at 80%/20%
  - rgba(160,122,101,0.08) at 40%/80%

### Text
- Primary (headings): white 100%
- Secondary (body): white 70%
- Tertiary (tips): white 50%
- Quaternary (stats): white 40%

### Accents
- Progress ring: white 90%
- Icon backgrounds: white 10%
- Borders: white 8%

---

## Animation Specifications

### Step Transition
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)

1. Current content fades out (opacity 1 → 0)
2. Giant number scales down (1 → 0.95) and fades
3. New number scales up (0.95 → 1) and fades in
4. New content fades in (opacity 0 → 1)
5. Progress ring animates to new value
```

### Micro-interactions
```
Icon pulse: Subtle breathing animation (scale 1 → 1.05 → 1)
Duration: 2000ms
Delay: Per-step (random offset)
```

---

## Responsive Behavior

### Desktop (lg+)
- Full layout as described
- Giant number: 220px height
- Comfortable spacing

### Tablet (md)
- Slightly reduced giant number: 180px
- Adjusted padding

### Mobile (sm and below)
- Hidden entirely (right panel becomes full-width)
- Mobile logo badge shown on right panel instead

---

## Content Strategy

### Tone
- Helpful and guiding (not salesy)
- Professional but friendly
- Confidence-building
- Educational micro-copy

### Structure
Each step includes:
1. **Icon**: Visual anchor for the step
2. **Heading**: Clear, action-oriented title
3. **Message**: Explains what to do and why
4. **Tip**: Pro advice to optimize the step

---

## Implementation Notes

### React Components
```typescript
<FormLayout>
  <DynamicStepContext
    currentStep={0-3}
    totalSteps={4}
  />
  <FormContent>
    {/* Step forms */}
  </FormContent>
</FormLayout>
```

### Data Structure
```typescript
interface StepContextData {
  icon: React.ReactNode;
  heading: string;
  message: string;
  tip: string;
  nextStepLabel: string;
}

const stepContexts: StepContextData[] = [
  { /* Step 1 data */ },
  { /* Step 2 data */ },
  { /* Step 3 data */ },
  { /* Step 4 data */ },
];
```

---

## Accessibility

- Proper ARIA labels for progress indicators
- Screen reader announcements for step changes
- Keyboard navigation support
- Focus management between steps
- Sufficient color contrast (white on dark brown)

---

## Performance Considerations

- CSS transforms for animations (GPU accelerated)
- Framer Motion for orchestrated transitions
- Lazy load icons
- Memoize step content to prevent re-renders
- Use `will-change` for animated elements

---

## Success Metrics

1. **User Confidence**: Does the guidance reduce form abandonment?
2. **Completion Rate**: Does step-specific help improve completion?
3. **Error Reduction**: Do tips reduce form errors?
4. **Time to Complete**: Does guidance speed up or slow down submission?

---

## Future Enhancements

1. **Personalization**: Customize tips based on user history
2. **A/B Testing**: Test different messaging strategies
3. **Animations**: Add more sophisticated transitions
4. **Illustrations**: Replace icons with custom illustrations
5. **Video Tips**: Embed short tutorial videos per step

---

## Comparison with Login Page

| Feature | Login Page | Dynamic Step Context |
|---------|-----------|---------------------|
| Layout | Static content | Dynamic per step |
| Hero Element | Large heading | Giant step number |
| Visual Focus | Typography | Number + Icon |
| Progress | Simple bars | Circular ring |
| Content | Brand messaging | Contextual guidance |
| Animation | Fade in on load | Transitions per step |
| Purpose | Brand & trust | Guide & assist |

---

## Design Files

- Figma mockups: `/design/dynamic-step-context.fig`
- Icon assets: `/assets/icons/step-context/`
- Animation specs: `/design/animations.md`

---

**Created:** 2026-01-23
**Version:** 1.0
**Status:** Ready for Implementation
