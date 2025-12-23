# Animation Jitter Issues Analysis

**Date**: 2025-12-23
**Component**: WelcomeScreen → HeroText Handoff

## Problem Description

At the end of the welcome screen animation, there is a visual jitter where the letters (M and A) appear to be placed slightly below their final position, then adjust/snap upward. This occurs during the cross-dissolve handoff between flying letters and static target letters.

---

## Root Cause Analysis

### Primary Issue: Line-Height Mismatch

| Component | File | Line-Height |
|-----------|------|-------------|
| WelcomeScreen | `WelcomeScreen.module.css:61-62` | `1` |
| HeroText | `HeroText.module.css:17` | `0.85` |

**Impact**: ~15% vertical offset between flying and static letter positions.

#### WelcomeScreen Styling
```css
/* WelcomeScreen.module.css:58-67 */
.letterM, .letterA {
  color: var(--color-primary-text);
  display: inline-block;
  line-height: 1;  /* ← Issue */
}
```

#### HeroText Styling
```css
/* HeroText.module.css:13-20 */
.heroText {
  font-size: var(--font-size-hero);
  font-weight: 700;
  line-height: 0.85;  /* ← Different value */
}
```

### Secondary Issue: Transform Properties

| Property | WelcomeScreen | HeroText |
|----------|---------------|----------|
| `transform-style` | Not set | `preserve-3d` |
| `transform-origin` | Default (center) | `center bottom` |
| `perspective` | Not set | `1000px` |

These differences affect how `getBoundingClientRect()` reports element positions.

---

## Technical Explanation

### Animation Flow

```
1. Flying letters use line-height: 1
   ↓
2. getBoundingClientRect() calculates delta to target
   ↓
3. Delta based on target's line-height: 0.85 position
   ↓
4. Flying letter animates to calculated position
   ↓
5. Cross-dissolve: flying fades OUT, static fades IN
   ↓
6. JITTER: Static letter has different line-box height
```

### Position Calculation (WelcomeScreen.tsx:134-145)

```typescript
const rects = {
  targetM: targetM.getBoundingClientRect(),
  targetA: targetA.getBoundingClientRect(),
  currentM: mRef.current.getBoundingClientRect(),
  currentA: aRef.current.getBoundingClientRect()
};

const deltaMy = rects.targetM.top - rects.currentM.top;
// ^ This calculation doesn't account for line-height differences
```

---

## Recommended Fixes

### Option A: Match Line-Heights (Simplest)

```css
/* WelcomeScreen.module.css */
.letterM, .letterA {
  color: var(--color-primary-text);
  display: inline-block;
  line-height: 0.85;  /* Match HeroText */
}
```

### Option B: Use Bottom Alignment

```typescript
// WelcomeScreen.tsx - Use bottom instead of top for Y calculation
const deltaMy = rects.targetM.bottom - rects.currentM.bottom;
const deltaAy = rects.targetA.bottom - rects.currentA.bottom;
```

### Option C: Full CSS Property Match

```css
/* WelcomeScreen.module.css */
.letterM, .letterA {
  color: var(--color-primary-text);
  display: inline-block;
  line-height: 0.85;
  transform-style: preserve-3d;
  transform-origin: center bottom;
}
```

---

## Issue Severity Matrix

| Issue | Severity | Visual Impact |
|-------|----------|---------------|
| Line-height mismatch (1 vs 0.85) | HIGH | ~15% vertical offset |
| Transform-origin difference | MEDIUM | Affects animation pivot point |
| Perspective stacking context | LOW | Minor rect calculation variance |

---

## Files Involved

- `components/ui/WelcomeScreen/WelcomeScreen.tsx` - Animation logic
- `components/ui/WelcomeScreen/WelcomeScreen.module.css` - Flying letter styles
- `components/sections/Hero/HeroText.tsx` - Target animation logic
- `components/sections/Hero/HeroText.module.css` - Target letter styles

---

## Status

- [x] Issue identified
- [x] Root cause analyzed
- [x] Fix implemented (Option A: line-height matched to 0.85)
- [x] Verified fix resolves jitter
