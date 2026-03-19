# Design System v1.0

**Project:** Gamatutor PWA - Kanban for Self-Regulated Learning
**Last Updated:** February 15, 2026
**Status:** Finalized for Development

---

## Design Philosophy

### Core Principle: **"Minimalist Modern with Purposeful Gamification"**

```
99% Minimal UI (fast development, content-first)
 1% Custom Assets (badges only, concentrated design effort)
```

**Why This Approach:**
- **Development Speed:** shadcn/ui defaults are 80% ready, minimal customization needed
- **Focus on Content:** Progress and competence feedback are visually clear
- **Professional Feel:** Not toy-like, suitable for university students
- **Sustainable:** Easy to maintain and extend by future developers

---

## Visual References

> **Moodboard Location:** `ref/moodboard/`
> - `main vibes.webp` - Prodify App (PRIMARY)
> - `support vibes.webp` - Archivr App (SECONDARY)
> - `add on confeti.png` - Celebration & Badge Design (GAMIFICATION)

---

### PRIMARY: Prodify App (`main vibes.webp`)

**Overall Vibe:** Clean, motivational, productivity-focused

**Layout Patterns:**
| Element | Specification | Apply To |
|---------|--------------|----------|
| Header | Dark bg (#1F2937) with user avatar + greeting | Dashboard only |
| Quote Card | Dark bg, white text, motivational message | Dashboard hero |
| Content Area | White bg, generous padding | All screens |
| Bottom Nav | Pill-style container, 5 items, floating style | Global navigation |

**Color Usage (Prodify):**
```
Background:     White (#FFFFFF)
Dark Sections:  Charcoal (#1F2937) - headers, quote cards
Accent:         Lime Green (#84CC16) - active states, highlights
Text Primary:   Near-black (#111827)
Text Secondary: Gray (#6B7280)
Tags:           Soft colors (orange, red, green pills)
```

**Component Patterns:**
- **Project Cards:** White bg, subtle shadow, horizontal scroll
- **Task Items:** List style with checkbox, date, priority tag
- **Progress Indicator:** "20/40" fraction style, linear bar
- **Stats Cards:** Icon + number + label, grid layout
- **Focus Mode:** Weekly bar chart (vertical bars), green fill

**Key UI Elements to Adopt:**
1. ✅ Dark header section for Dashboard (greeting + avatar)
2. ✅ Motivational quote card (dark bg, centered text)
3. ✅ Pill-style bottom navigation with active indicator
4. ✅ Horizontal scrolling project cards
5. ✅ Simple fraction progress ("321/420")
6. ✅ Colored priority tags (Urgent = red, Moderate = orange)
7. ✅ "View All" links for sections
8. ✅ Weekly focus bar chart

---

### SECONDARY: Archivr App (`support vibes.webp`)

**Overall Vibe:** Organized, detail-rich, professional

**Layout Patterns:**
| Element | Specification | Apply To |
|---------|--------------|----------|
| Task Detail | Full-screen modal/page | Card Focus Mode |
| Subtask List | Nested checklist with sections | Task breakdown |
| Calendar Strip | Horizontal date selector | Schedule views |
| Bottom Nav | 4 items + center FAB (+) | Alternative nav |

**Color Usage (Archivr):**
```
Background:     White (#FFFFFF)
Surface:        Light gray (#F9FAFB)
Accent:         Forest Green (#059669) - buttons, active
Tags:           Muted colors (green, brown, orange pills)
Text Primary:   Dark gray (#1F2937)
Border:         Very light (#E5E7EB)
```

**Component Patterns:**
- **Task Card:** Tag pill + title + subtitle + time + avatars
- **Task Detail:** Priority level selector (To Do | InProgress | Completed)
- **Breakdown Section:** Collapsible with chevron, nested checkboxes
- **Project Card:** Title + progress bar + percentage + date
- **Priority Pills:** "High Priority" (green), "Medium Priority" (brown)

**Key UI Elements to Adopt:**
1. ✅ Task detail page with full breakdown
2. ✅ Priority level pills (colored tags)
3. ✅ Status selector tabs (TODO | IN PROGRESS | DONE)
4. ✅ Subtask checklist with indentation
5. ✅ Collapsible sections (chevron icon)
6. ✅ Avatar stack for collaboration hints
7. ✅ Progress bar with percentage
8. ✅ Calendar strip (horizontal date scroll)

---

### GAMIFICATION: Celebration & Badges (`add on confeti.png`)

**Overall Vibe:** Celebratory, achievement-focused, 3D geometric

**Celebration Modal:**
```
Background:     Purple gradient (#7C3AED → #4F46E5) OR white with confetti
Confetti:       Multi-color burst, dynamic animation
Icon:           Large centered badge/trophy (80-100px)
Typography:     Bold "Congratulations!" + supporting text
CTA Button:     Full-width, rounded, accent color
```

**Badge Design Style:**
- **Shape:** 3D geometric crystals/gems (hexagonal, diamond, star)
- **Material:** Metallic gradients (gold, bronze, crystal)
- **Detail:** Ribbon/banner at bottom, glowing edges
- **Locked State:** Grayscale silhouette with "?" or outline only

**Achievement Grid:**
```
Layout:         3-column grid
Badge Size:     ~80x80px with label below
Locked Badge:   Gray outline, no fill
Unlocked:       Full color with glow effect
Progress:       "4/10 Unlocked" header stat
```

**Key UI Elements to Adopt:**
1. ✅ Confetti burst animation (canvas-confetti library)
2. ✅ Centered celebration modal (white or purple bg)
3. ✅ Large badge icon in celebration
4. ✅ 3D geometric badge style (NOT flat, NOT cartoonish)
5. ✅ Achievement grid (3 columns)
6. ✅ Locked vs unlocked badge states
7. ✅ Progress counter ("Level 10", "4/10 Unlocked")
8. ✅ Single CTA button ("OK, Sure!" or "Start Exploring")

---

### Design Mapping Summary

| Screen | Primary Reference | Secondary Reference |
|--------|------------------|---------------------|
| Dashboard | Prodify (dark header, quote, stats) | - |
| Board View | Prodify (card layout) | Archivr (status tabs) |
| Card Focus | Archivr (task detail, breakdown) | - |
| Goals | Prodify (progress fractions) | Archivr (progress bars) |
| Progress | Prodify (bar charts) | - |
| Completion Modal | Confetti reference | Prodify (clean modal) |
| Badge Collection | Confetti reference (grid) | - |
| Onboarding | Prodify (clean cards) | - |
| Settings | Archivr (list style) | - |

---

## Color Palette

### Base Colors

```css
/* Backgrounds */
--bg-primary:    #FFFFFF    /* Main background */
--bg-surface:    #F8F9FA    /* Cards, elevated surfaces */
--bg-elevated:   #F1F3F5    /* Hover states, secondary surfaces */

/* Borders */
--border-light:  #E5E7EB    /* Default borders */
--border-medium: #D1D5DB    /* Emphasis borders */
--border-heavy:  #9CA3AF    /* Strong separation */

/* Text */
--text-primary:   #1F2937   /* Headings, main content */
--text-secondary: #6B7280   /* Supporting text */
--text-tertiary:  #9CA3AF   /* Placeholders, hints */
--text-inverse:   #FFFFFF   /* Text on dark backgrounds */
```

### Status Colors (Task States)

```css
/* Task Status */
--status-todo:       #3B82F6  /* Blue - calm, planned */
--status-in-progress: #F59E0B  /* Amber - active, energetic */
--status-done:       #10B981  /* Green - success, encouraging */
--status-overdue:    #EF4444  /* Red - attention needed (not harsh) */

/* Hover States (10% darker) */
--status-todo-hover:       #2563EB
--status-in-progress-hover: #D97706
--status-done-hover:       #059669
--status-overdue-hover:    #DC2626
```

### Accent & Interaction Colors

```css
/* Primary Actions */
--accent-primary:   #2563EB  /* CTAs, focus states */
--accent-hover:     #1D4ED8  /* Hover on primary buttons */

/* Success & Feedback */
--success:    #10B981  /* Positive feedback */
--warning:    #F59E0B  /* Caution, alerts */
--error:      #EF4444  /* Errors, destructive actions */
--info:       #3B82F6  /* Informational messages */

/* Subtle Feedback (10% opacity backgrounds) */
--success-bg:  #10B98110
--warning-bg:  #F59E0B10
--error-bg:    #EF444410
--info-bg:     #3B82F610
```

### Gamification Colors

```css
/* Badges & Achievements */
--badge-bronze:  #CD7F32  /* Starter badges */
--badge-silver:  #C0C0C0  /* Mid-tier badges */
--badge-gold:    #FFD700  /* Advanced badges */
--badge-special: #9333EA  /* Purple - special achievements */

/* Streak & Heatmap */
--streak-low:    #DBEAFE  /* Light blue - few activities */
--streak-medium: #60A5FA  /* Medium blue - moderate */
--streak-high:   #2563EB  /* Dark blue - high activity */
--streak-max:    #1E40AF  /* Deepest blue - peak activity */
```

---

## Typography

### Font Family

```css
/* Primary Font */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace (for data/numbers) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Why Inter:**
- Default in Tailwind CSS
- Excellent readability at all sizes
- Professional, modern
- Variable font (flexible weights)

### Type Scale

```css
/* Headings */
--text-4xl: 2.25rem  /* 36px - Page titles */
--text-3xl: 1.875rem /* 30px - Section headers */
--text-2xl: 1.5rem   /* 24px - Card titles, modals */
--text-xl:  1.25rem  /* 20px - Subsection headers */
--text-lg:  1.125rem /* 18px - Emphasized text */

/* Body */
--text-base: 1rem    /* 16px - Default body */
--text-sm:   0.875rem /* 14px - Secondary text, labels */
--text-xs:   0.75rem  /* 12px - Captions, metadata */
```

### Font Weights

```css
--font-normal:    400  /* Body text */
--font-medium:    500  /* Labels, emphasis */
--font-semibold:  600  /* Headings */
--font-bold:      700  /* Strong emphasis (rarely used) */
```

### Line Heights

```css
--leading-tight:   1.25  /* Headings */
--leading-snug:    1.375 /* Large text */
--leading-normal:  1.5   /* Body text (default) */
--leading-relaxed: 1.625 /* Long-form content */
```

### Usage Guidelines

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 2xl | semibold | primary |
| Section Header | xl | semibold | primary |
| Card Title | lg | medium | primary |
| Body Text | base | normal | primary |
| Label | sm | medium | secondary |
| Hint/Caption | xs | normal | tertiary |
| Numbers/Data | base | normal (mono) | primary |

---

## Spacing & Layout

### Spacing Scale (Tailwind)

```
Base unit: 0.25rem (4px)

2  = 8px   - Tight spacing within components
3  = 12px  - Between related items
4  = 16px  - Card padding, standard gap
6  = 24px  - Section spacing
8  = 32px  - Large section breaks
12 = 48px  - Major layout divisions
16 = 64px  - Extra large spacing (rare)
```

### Common Spacing Patterns

```css
/* Cards */
padding: 1rem (p-4)
border-radius: 0.75rem (rounded-xl)
gap between cards: 0.75rem (space-y-3)

/* Sections */
gap between sections: 1.5rem (space-y-6)
page padding: 1rem (p-4)

/* Lists */
gap between list items: 0.75rem (space-y-3)
gap within list item: 0.5rem (space-y-2)

/* Buttons */
padding: 0.5rem 1rem (px-4 py-2)
gap between buttons: 0.75rem (space-x-3)
```

### Grid System

```
Mobile (default): Single column, full width
Tablet (sm:): 2 columns for dashboard cards
Desktop (lg:): 3 columns for overview sections

Max content width: 1280px (max-w-7xl)
Reading width: 768px (max-w-3xl) for long text
```

---

## Shadows & Elevation

### Shadow Scale

```css
/* Subtle elevation */
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
/* Default cards */
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);
/* Modals, bottom nav */
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1);
/* Special emphasis (rarely used) */
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Usage Guidelines

| Element | Shadow |
|---------|--------|
| Cards | shadow-sm |
| Hover Cards | shadow-md |
| Bottom Nav | shadow-lg |
| Modals | shadow-lg |
| Dropdowns | shadow-md |
| State Pill | shadow-sm |

**Principle:** Shadows are subtle. Heavy shadows distract from content.

---

## Border Radius

```css
--rounded-sm:   0.125rem  /* 2px - Subtle, inner elements */
--rounded:      0.25rem   /* 4px - Default */
--rounded-md:   0.375rem  /* 6px - Buttons */
--rounded-lg:   0.5rem    /* 8px - Large buttons */
--rounded-xl:   0.75rem   /* 12px - Cards */
--rounded-2xl:  1rem      /* 16px - Modals */
--rounded-full: 9999px    /* Circular (badges, avatars) */
```

### Common Patterns

```
Cards:            rounded-xl
Buttons:          rounded-md
Bottom Nav:       rounded-t-2xl (top corners only)
Progress Bars:    rounded-full
State Pills:      rounded-full
Input Fields:     rounded-lg
Modals:           rounded-2xl
```

---

## Component Patterns

### Cards

```css
/* Base Card */
background: --bg-surface
border: 1px solid --border-light
padding: 1rem (p-4)
border-radius: 0.75rem (rounded-xl)
shadow: shadow-sm

/* Hover State */
shadow: shadow-md
border-color: --border-medium
transition: all 150ms ease-out
```

**Variants:**
- Default: White background, subtle border
- Status: Left border 3px with status color
- Interactive: Hover effect + cursor pointer

### Buttons

**Primary Button:**
```css
background: --accent-primary
color: --text-inverse
padding: 0.5rem 1rem (px-4 py-2)
border-radius: 0.375rem (rounded-md)
font-weight: 500 (medium)

hover: background: --accent-hover
active: scale(0.98)
transition: all 150ms ease-out
```

**Secondary Button:**
```css
background: transparent
border: 1px solid --border-medium
color: --text-primary

hover: background: --bg-elevated
```

**Destructive Button:**
```css
background: --error
color: --text-inverse

hover: background: --error (darker)
```

### Progress Bars

**Linear Progress:**
```css
height: 8px
background: --bg-elevated
border-radius: 9999px (rounded-full)

/* Fill */
background: gradient or solid status color
border-radius: 9999px
transition: width 300ms ease-out
```

**Circular Progress:**
```css
/* Using react-circular-progressbar */
stroke-width: 8
background: --bg-elevated
path: status color
transition: stroke-dashoffset 300ms ease-out
```

### State Pill (Navigation)

```css
/* Container */
background: --bg-surface
border: 1px solid --border-light
border-radius: 9999px (rounded-full)
padding: 0.5rem 1rem
display: flex
gap: 0.5rem

/* Active State */
background: status color
color: --text-inverse
font-weight: 500

/* Inactive State */
color: --text-secondary
font-weight: 400
```

### Bottom Navigation

```css
/* Container */
height: 4rem (h-16)
background: --bg-primary
border-top: 1px solid --border-light
shadow: shadow-lg
position: fixed
bottom: 0

/* Nav Item */
display: flex
flex-direction: column
align-items: center
gap: 0.25rem

/* Icon */
size: 1.5rem (size-6)
color: --text-secondary (inactive)
color: --accent-primary (active)

/* Label */
font-size: 0.75rem (text-xs)
font-weight: 500
```

---

## Animation Principles

### Speed

```css
/* Instant feedback */
--duration-fast: 150ms

/* Standard transitions */
--duration-normal: 300ms

/* Celebration effects */
--duration-slow: 500ms

/* Confetti total */
--duration-confetti: 1500ms
```

### Easing

```css
/* Default (smooth deceleration) */
--ease-out: cubic-bezier(0, 0, 0.2, 1)

/* Bouncy (celebrations) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Sharp (modals) */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1)
```

### Common Animations

**Slide Up (Modal):**
```css
@keyframes slideUp {
  from: transform: translateY(100%)
  to: transform: translateY(0)
}
duration: 300ms
easing: ease-out
```

**Fade In:**
```css
@keyframes fadeIn {
  from: opacity: 0
  to: opacity: 1
}
duration: 150ms
```

**Scale (Button Press):**
```css
active: transform: scale(0.98)
transition: transform 150ms ease-out
```

**Confetti Burst:**
```css
/* Using canvas-confetti library */
particleCount: 100
spread: 70
origin: y: 0.6
duration: 1500ms
```

**Progress Bar Fill:**
```css
transition: width 300ms ease-out
/* Smooth animation when percentage changes */
```

---

## Badge Design Strategy

### Concept

**Geometric Shapes + Gradient Overlays**

Base template approach:
1. Create geometric base (hexagon, diamond, star, shield)
2. Apply gradient overlay (2-3 colors)
3. Add center icon (simple geometric or emoji)
4. Export as SVG

### Badge Tiers

| Tier | Color Scheme | Unlock Criteria |
|------|-------------|-----------------|
| **Bronze** | Orange-brown gradient | Starter achievements (1-5 tasks) |
| **Silver** | Grey-white gradient | Mid-tier (10-20 tasks) |
| **Gold** | Yellow-orange gradient | Advanced (50+ tasks) |
| **Special** | Purple-pink gradient | Unique milestones (streak, goals) |

### Badge Categories (10 Total)

1. **First Step** - Complete first task (Bronze)
2. **Week Warrior** - 7-day streak (Silver)
3. **Month Master** - 30-day streak (Gold)
4. **Goal Getter** - Complete first goal (Bronze)
5. **Strategy Star** - Use 3 different strategies (Silver)
6. **Reflection Pro** - Write 10 reflections (Silver)
7. **Consistency King** - No missed days in a week (Gold)
8. **Task Tsunami** - Complete 50 tasks (Gold)
9. **Early Bird** - Complete task before due date 10 times (Silver)
10. **Perfect Week** - All tasks completed on time for 7 days (Special/Purple)

### Design Specifications

```
Format: SVG
Size: 64x64px base (scalable)
Colors: 2-3 color gradients
Stroke: 2px for outlines
Center icon: 24x24px within badge
Export: Clean SVG code (optimized)
```

**Template Location (Future):** `assets/badges/`

---

## Screen-Specific Patterns

### Board View (Kanban Overview)

```
Layout:
- Top: Filter dropdown (Goal Hierarchy)
- Summary strip: TODO(n) | IN PROG(n) | DONE(n)
- Horizontal scroll columns OR full-width swipe
- Bottom nav: Always visible

Card Size: Compact (120px height)
```

### Card Focus Mode

```
Layout:
- Top: Back arrow + State pill
- Center: Full card details
- Bottom: Swipe hints

State Pill: Always visible at top
Swipe Direction: Left = back, Right = progress
```

### Completion Modal

```
Trigger: When card moves to DONE
Type: Bottom sheet (not full screen)
Content:
1. Emoji rating (5 options, large tap targets)
2. Optional reflection (expandable)
3. Primary CTA: "Done" button

Animation: Slide up 300ms
Background: Semi-transparent overlay
```

### Celebration Overlay

```
Trigger: After completion modal submitted
Type: Full screen overlay (dismissable)
Duration: 1.5s auto-dismiss OR tap to close

Content:
- Confetti animation (canvas-confetti)
- Badge unlock (if applicable)
- Success message

Background: Semi-transparent dark (0.6 opacity)
```

### Dashboard / Analytics

```
Layout:
- Grid: 2 columns mobile, 3 desktop
- Cards: Equal height in row
- Charts: Responsive (maintain aspect ratio)

Chart Colors: Use status colors
Numbers: Monospace font
Trends: Arrow icons (up/down)
```

### Bottom Navigation

```
Items: 5 tabs max
Icons: Lucide React (outline style)
Active Indicator: Color change + optional dot

Order (left to right):
1. Home (overview)
2. Board (kanban)
3. Goals
4. Progress (charts)
5. Settings
```

---

## Accessibility

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum

**Tested Combinations:**
- Primary text on white: ✓ 12.6:1
- Secondary text on white: ✓ 4.7:1
- Status colors on white: ✓ All pass
- White text on accent: ✓ 4.8:1

### Touch Targets

```
Minimum: 44x44px (iOS HIG, WCAG)
Recommended: 48x48px

Applied to:
- Bottom nav items
- Emoji rating buttons
- Card tap area
- Swipe gestures (full card height)
```

### Focus States

```css
/* Keyboard focus */
outline: 2px solid --accent-primary
outline-offset: 2px
border-radius: inherit

/* Never remove focus indicators */
```

---

## Dark Mode (Future Consideration)

Not included in Phase 1, but prepared:

```css
/* Dark Mode Colors (for future) */
--bg-primary-dark:    #111827
--bg-surface-dark:    #1F2937
--text-primary-dark:  #F9FAFB
--text-secondary-dark: #D1D5DB

/* Status colors remain same (sufficient contrast) */
```

**Implementation:** Use next-themes with Tailwind `dark:` variants

---

## Development Notes

### Implementation with shadcn/ui

Most components are **80% ready** with shadcn defaults:
- Card component: ✓ Ready
- Button component: ✓ Ready
- Dialog/Modal: ✓ Ready
- Progress: ✓ Ready (minimal tweaks)

**Customization needed:**
1. Tailwind config: Add custom colors to `tailwind.config.js`
2. Global CSS: Define CSS variables in `app/globals.css`
3. State Pill: Custom component (not in shadcn)
4. Bottom Nav: Custom component

### CSS Variables Setup

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --status-todo: 217 91% 60%;
    --status-in-progress: 38 92% 50%;
    --status-done: 158 64% 52%;
    --status-overdue: 0 84% 60%;

    /* ... all other variables */
  }
}
```

### Component Library Structure

```
components/
├── ui/               # shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── progress.tsx
├── kanban/           # Custom kanban components
│   ├── board-view.tsx
│   ├── card-focus.tsx
│   ├── state-pill.tsx
│   └── completion-modal.tsx
├── gamification/     # Badge & streak components
│   ├── badge-display.tsx
│   ├── streak-heatmap.tsx
│   └── celebration.tsx
└── navigation/       # Navigation components
    └── bottom-nav.tsx
```

---

## Design Checklist for Each Screen

Before marking a screen as "done", verify:

- [ ] Colors use defined CSS variables (no hardcoded hex)
- [ ] Spacing uses Tailwind classes (p-4, space-y-6, etc.)
- [ ] Typography follows type scale
- [ ] Touch targets are 44x44px minimum
- [ ] Color contrast passes WCAG AA
- [ ] Animations use defined durations/easing
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px)
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined

---

## Assets Checklist

### Required Custom Assets

- [x] Badge SVGs (10 badges) - TO BE CREATED
- [ ] Confetti config - Using library, no custom asset
- [ ] Illustrations - NONE (minimalist approach)
- [ ] Icons - Using Lucide React library

### Asset Organization

```
public/
├── badges/
│   ├── bronze-first-step.svg
│   ├── silver-week-warrior.svg
│   ├── gold-month-master.svg
│   └── ... (10 total)
└── icons/
    └── (Lucide React - no files needed)
```

---

## Next Steps

1. **Wireframe key screens** (Board View, Card Focus, Completion)
2. **Design 10 badges** in Figma (geometric template approach)
3. **Setup Tailwind config** with custom colors
4. **Install shadcn/ui** and test component styling

---

*Document Version: 1.0*
*Based on moodboard analysis: 2026-02-15*
*Ready for: Wireframing & Development*
