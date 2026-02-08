'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import { hexToChannels } from './colorUtils';
import {
  type ThemeDefinition,
  getThemeById,
  applyCustomAccent,
  themes,
} from './definitions';

export { themes, ACCENT_PRESETS } from './definitions';
export type { ThemeDefinition } from './definitions';

const THEME_STORAGE_KEY = 'alliance-shipping-theme';
const ACCENT_STORAGE_KEY = 'alliance-shipping-accent';

interface ThemeContextValue {
  themeId: string;
  theme: ThemeDefinition;
  isDark: boolean;
  setTheme: (themeId: string) => void;
  setCustomAccent: (hex: string | null) => void;
  customAccent: string | null;
}

const defaultTheme = getThemeById('light');

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'light',
  theme: defaultTheme,
  isDark: false,
  setTheme: () => {},
  setCustomAccent: () => {},
  customAccent: null,
});

/** Apply a resolved theme's colors as CSS custom properties on :root */
function applyThemeToDOM(theme: ThemeDefinition) {
  const root = document.documentElement;
  const { colors, card, shadow, isDark } = theme;

  // Primary scale (as RGB channels for Tailwind opacity support)
  const primaryKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  for (const key of primaryKeys) {
    root.style.setProperty(`--primary-${key}`, hexToChannels(colors.primary[key]));
  }
  // 950 fallback (darken 900 further)
  root.style.setProperty('--primary-950', hexToChannels(colors.primary[900]));

  // Gray scale (as RGB channels)
  const grayKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  for (const key of grayKeys) {
    root.style.setProperty(`--gray-${key}`, hexToChannels(colors.gray[key]));
  }

  // Semantic colors (full values)
  root.style.setProperty('--theme-bg', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-surface-solid', colors.surfaceSolid);
  root.style.setProperty('--theme-card-bg', card.bg);
  root.style.setProperty('--theme-card-border', card.border);
  root.style.setProperty('--theme-card-border-width', card.borderWidth);

  // Shadows
  root.style.setProperty('--shadow-sm', shadow.sm);
  root.style.setProperty('--shadow-md', shadow.md);
  root.style.setProperty('--shadow-lg', shadow.lg);
  root.style.setProperty('--shadow-xl', shadow.xl);

  // Data attribute for CSS selectors
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-dark', isDark ? 'true' : 'false');

  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', colors.background);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('light');
  const [customAccent, setCustomAccentState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);

    if (savedTheme && themes.some((t) => t.id === savedTheme)) {
      setThemeId(savedTheme);
    }
    if (savedAccent) {
      setCustomAccentState(savedAccent);
    }
    setMounted(true);
  }, []);

  // Resolve final theme
  let resolvedTheme = getThemeById(themeId);
  if (customAccent) {
    resolvedTheme = applyCustomAccent(resolvedTheme, customAccent);
  }

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    if (mounted) {
      applyThemeToDOM(resolvedTheme);
    }
  }, [mounted, themeId, customAccent]);

  // Also apply on initial mount with the default theme
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }, []);

  const setCustomAccent = useCallback((hex: string | null) => {
    setCustomAccentState(hex);
    if (hex) {
      localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } else {
      localStorage.removeItem(ACCENT_STORAGE_KEY);
    }
  }, []);

  const value: ThemeContextValue = {
    themeId,
    theme: resolvedTheme,
    isDark: resolvedTheme.isDark,
    setTheme,
    setCustomAccent,
    customAccent,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
