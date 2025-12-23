# Welcome Screen Implementation Plan

## End Goal
Create a sophisticated, high-end "Travel" reveal for the portfolio website. 
Instead of a simple fade-out, the Welcome Screen will guide the user through a sequence of greetings, introduce the brand initials ("MA"), and then physically transition these initials to become part of the main `Hero` section.

## Detailed Flow

1.  **Phase 1: Sequential Greetings**
    *   **Content:** "Hello", "Bonjour", "Ola", "سلام".
    *   **Timing:** 1 second per greeting.
    *   **Animation:** Smooth fade-in/fade-out or cross-dissolve.
    *   **Typography:** Large, centered, using the primary brand font (`PP Neue Montreal`).

2.  **Phase 2: Initials Reveal**
    *   **Content:** "M" and "A".
    *   **Styling:**
        *   "M": `--color-accent-purple` (#62B6CB)
        *   "A": `--color-primary-text` (#1b2028)
    *   **Layout:** Centered on the blank screen.

3.  **Phase 3: The "Travel" (Transition)**
    *   **Action:** The centered "M" and "A" animate (scale and translate) to match the *exact* position and size of the first letters in the `Hero` section ("**M**OHED" and "**A**BBAS").
    *   **Technique:** GSAP FLIP (First, Last, Invert, Play) concept.
        *   Measure the "Welcome" position (Start).
        *   Measure the "Hero" position (End).
        *   Animate `x`, `y`, and `scale`.

4.  **Phase 4: Handoff**
    *   Once the "M" and "A" land, the Welcome Screen overlay disappears (opacity: 0).
    *   The real `Hero` section is revealed underneath.
    *   The standard Hero animations (rest of the letters revealing) trigger.

## Technical Implementation Plan

### 1. Preparation (`HeroText.tsx`)
*   **Goal:** Make the destination letters discoverable by the Welcome Screen component.
*   **Action:** Add unique IDs to the specific letters in the `HeroText` component.
    *   First 'M' of MOHED -> `id="target-m"`
    *   First 'A' of ABBAS -> `id="target-a"`

### 2. Component Logic (`WelcomeScreen.tsx`)
*   **State Management:**
    *   `greetingIndex`: To track which greeting to show.
    *   `phase`: To track the current stage (`greetings`, `initials`, `travel`, `complete`).
*   **Structure:**
    *   Container: `fixed`, `z-index: 9999`, `bg-white`.
    *   Text Elements: Absolute positioned for precise control.
*   **Animation Sequence (GSAP Timeline):**
    1.  **Greetings Loop:**
        *   Show greeting `i`, wait 1s, hide, show `i+1`.
    2.  **Initials:**
        *   Fade in "M" and "A" at center.
        *   Wait briefly.
    3.  **Travel Calculation (The tricky part):**
        *   Get `getBoundingClientRect()` of `#target-m` and `#target-a`.
        *   Get `getBoundingClientRect()` of the Welcome "M" and "A".
        *   Calculate `deltaX`, `deltaY`, and `scaleRatio`.
    4.  **Travel Animation:**
        *   Animate Welcome "M" and "A" to the calculated deltas.
        *   Simultaneously fade out the white background.
    5.  **Cleanup:**
        *   Unmount or hide Welcome Screen.
        *   Unlock body scroll.

### 3. Styling
*   Use `styles/variables.css` for all colors and fonts to ensure a perfect visual match between the "fake" Welcome letters and the "real" Hero letters.

## Visual Reference (ASCII)

```
[Sequence] -> [Center MA] -> [Travel] -> [Hero]

   +---------------------------+       +---------------------------+
   |                           |       |   [M]OHED                 |
   |      (Purple) (Dark)      |       |    ^                      |
   |         M       A         |  ==>  |    | (Path)               |
   |                           |       |   [A]BBAS                 |
   +---------------------------+       +---------------------------+
       (Welcome Screen)                    (Hero Section)
```
