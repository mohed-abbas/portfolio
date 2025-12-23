'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/**
 * Accent Color Cycling System
 *
 * Behavior:
 * - First load (new tab/session) → Default color (#62b6cb)
 * - Page refresh (same tab) → Random color from array
 * - Menu open → Next color in sequence
 * - Close tab & reopen → Reset to default
 */

// Color palette
const ACCENT_COLORS = [
  '#62b6cb', // Default (teal)
  '#da3036', // Red
  '#ff990a', // Orange
  '#93b99e', // Green
] as const;

const DEFAULT_INDEX = 0;
const STORAGE_KEY = 'portfolio_hasLoaded';
const CSS_VAR_NAME = '--color-accent-purple';

// Context type
interface AccentColorContextType {
  color: string;
  colorIndex: number;
  cycleColor: () => void;
}

// Create context with null default
const AccentColorContext = createContext<AccentColorContextType | null>(null);

// Provider component
export function AccentColorProvider({ children }: { children: ReactNode }) {
  // Initialize with a function to compute initial state
  const [colorIndex, setColorIndex] = useState(() => {
    // Server-side: always return default
    if (typeof window === 'undefined') {
      return DEFAULT_INDEX;
    }

    const hasLoaded = sessionStorage.getItem(STORAGE_KEY);

    if (!hasLoaded) {
      // First load → default color
      sessionStorage.setItem(STORAGE_KEY, 'true');
      return DEFAULT_INDEX;
    }

    // Refresh → random color
    return Math.floor(Math.random() * ACCENT_COLORS.length);
  });

  // Update CSS variable on mount and when color changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      CSS_VAR_NAME,
      ACCENT_COLORS[colorIndex]
    );
  }, [colorIndex]);

  // Cycle to next color (for menu open)
  const cycleColor = useCallback(() => {
    setColorIndex((prev) => (prev + 1) % ACCENT_COLORS.length);
  }, []);

  const value: AccentColorContextType = {
    color: ACCENT_COLORS[colorIndex],
    colorIndex,
    cycleColor,
  };

  return (
    <AccentColorContext.Provider value={value}>
      {children}
    </AccentColorContext.Provider>
  );
}

// Custom hook for consuming context
export function useAccentColor(): AccentColorContextType {
  const context = useContext(AccentColorContext);

  if (!context) {
    throw new Error('useAccentColor must be used within AccentColorProvider');
  }

  return context;
}

// Export colors for direct access if needed
export { ACCENT_COLORS };
