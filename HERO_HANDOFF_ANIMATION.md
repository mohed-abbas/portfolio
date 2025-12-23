# Hero Handoff Animation Plan

This document outlines the "Seamless Expansion" animation flow between the `WelcomeScreen` and the `Hero` section.

## 1. ASCII Visualization: The Flight

The Initials `M` and `A` start at the center (Welcome Screen) and fly to their specific destinations in the Hero layout.

```text
       [ SCREEN CENTER ]
           M     A
           /      \
          /        \
         v          v
  [Line 1 Target]  [Line 2 Target]
```

## 2. ASCII Visualization: The Landing & Expansion

Once the flight completes, the initials "anchor" the names, and the remaining letters unroll from them.

```text
TIMESTAMP: T + 0.0s (Flight Impacts)
---------------------------------------------------
  Line 1:  M  _  _  _  _   (OHED is invisible)
  Line 2:  A  _  _  _  _   (BBAS is invisible)

TIMESTAMP: T + 0.2s (Expansion Start)
---------------------------------------------------
  Line 1:  M -> O  _  _  _
  Line 2:  A -> B  _  _  _

TIMESTAMP: T + 0.5s (Expansion Complete)
---------------------------------------------------
  Line 1:  M    O    H    E    D
  Line 2:  A    B    B    A    S
```

## 3. ASCII Visualization: Final Hero Layout

The final state maintains the two-line staggered hierarchy.

```text
+-------------------------------------------------------------+
|                                                             |
|   [ LINE 1 ]                                                |
|   M  O  H  E  D                                             |
|   ^  ^--------^
|   |      |
|   |      +--- Revealed via staggered expansion              |
|   |           from left to right.                           |
|   |                                                         |
|   +---------- Landed here from Welcome Screen flight.       |
|                                                             |
|                                                             |
|               [ LINE 2 ]                                    |
|               A  B  B  A  S                                 |
|               ^  ^--------^
|               |      |
|               |      +--- Revealed via staggered expansion  |
|               |           immediately after 'A' lands.      |
|               |                                             |
|               +---------- Landed here from Welcome Screen.  |
|                                                             |
|                                                             |
|   [ TAGLINE ]                                               |
|   Creative Developer & Designer                             |
|                                                             |
+-------------------------------------------------------------+
```

## 4. Implementation Strategy

1.  **HeroText.tsx Structure:**
    *   Split "MOHED" into `<span id="target-m">M</span>` and `<span class="reveal-m">OHED</span>`.
    *   Split "ABBAS" into `<span id="target-a">A</span>` and `<span class="reveal-a">BBAS</span>`.
2.  **Initial CSS State:**
    *   `.reveal-m` and `.reveal-a` will have `opacity: 0` and `visibility: hidden`.
3.  **GSAP Trigger:**
    *   `WelcomeScreen` dispatches `welcome-complete`.
    *   `HeroText` listens and triggers a stagger on the individual characters of `OHED` and `BBAS`.

```