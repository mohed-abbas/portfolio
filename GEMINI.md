# Project Context: Portfolio Website

## Project Overview
This is a personal portfolio website built with **Next.js 16 (App Router)** and **TypeScript**. It features a highly interactive and visual design, utilizing **GSAP** for animations and **Lenis** for smooth scrolling. The project implements a custom design system with fluid typography and precise animation timings.

## Tech Stack
*   **Framework:** Next.js 16.0.10 (App Router)
*   **Language:** TypeScript
*   **Styling:** CSS Modules (`*.module.css`) + Global CSS Variables
*   **Animations:** GSAP 3 (including ScrollTrigger), @gsap/react
*   **Scrolling:** Lenis
*   **Fonts:**
    *   **PP Neue Montreal** (Local, stored in `public/fonts`, defined in `styles/fonts.css`) - Primary font.
    *   **Doppio One** (Google Fonts, loaded in `app/layout.tsx`) - Navbar/Accent font.

## Project Structure
*   **`app/`**: Contains the App Router setup.
    *   `page.tsx`: The main entry point (Home).
    *   `layout.tsx`: Root layout, includes `CustomCursor` and font setup.
    *   `globals.css`: Global styles imports.
*   **`components/`**: React components organized by functionality.
    *   `layout/`: Structural components (e.g., `Navbar`).
    *   `sections/`: Page sections (e.g., `Hero`, `Portrait`, `SkillsBar`).
    *   `ui/`: Reusable UI elements (e.g., `CustomCursor`).
*   **`lib/`**: Utility functions and configurations.
    *   `gsap.ts`: Centralized GSAP configuration and exports.
*   **`public/`**: Static assets.
    *   `fonts/`: Local font files.
    *   `images/`: Images and SVGs.
*   **`styles/`**: Global CSS files.
    *   `variables.css`: **Source of Truth** for design tokens (Colors, Fluid Typography, Spacing, Animation timing).
    *   `fonts.css`: `@font-face` definitions.
    *   `animations.css`: Global CSS keyframe animations.

## Key Commands
*   **Development Server:** `npm run dev` (Runs on http://localhost:3000)
*   **Build:** `npm run build`
*   **Start Production:** `npm run start`
*   **Lint:** `npm run lint`

## Design System & Conventions
*   **CSS Variables:** Always use variables from `styles/variables.css` for consistency.
    *   **Colors:** `--color-background`, `--color-primary-text`, `--color-accent-purple`, etc.
    *   **Typography:** `--font-primary`, `--font-navbar`, `--font-size-hero`, etc.
    *   **Z-Index:** Use the `--z-*` scale (e.g., `--z-nav`, `--z-cursor`) to manage stacking contexts.
*   **Responsiveness:** The project heavily uses `clamp()` for fluid font sizes and spacing (e.g., `clamp(48px, 16vw, 24vw)`).
*   **Animations:**
    *   Use `lib/gsap.ts` for consistent easing (`power3.out` default) and configuration.
    *   Refer to `ANIMATION_CONFIG` in `lib/gsap.ts` or CSS variables like `--duration-normal`, `--ease-out-expo`.
*   **Component Styling:** Prefer CSS Modules for component-specific styles to avoid collisions.
