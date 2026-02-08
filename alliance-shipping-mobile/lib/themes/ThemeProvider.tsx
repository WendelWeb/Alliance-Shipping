import React, { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  type ThemeDefinition,
  type ThemeColors,
  type ShadowStyle,
  type ThemeCard,
  getThemeById,
  applyCustomAccent,
  themes,
} from './definitions';

// Re-export for convenience
export { themes, ACCENT_PRESETS } from './definitions';
export type { ThemeDefinition } from './definitions';

const THEME_STORAGE_KEY = 'alliance-shipping-theme';
const ACCENT_STORAGE_KEY = 'alliance-shipping-accent';

// ── Static values that never change across themes ──

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  headingSemiBold: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 32, '4xl': 40, '5xl': 48,
} as const;

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999,
} as const;

export const spring = {
  gentle: { damping: 20, stiffness: 120 },
  snappy: { damping: 15, stiffness: 150 },
  bouncy: { damping: 10, stiffness: 180 },
} as const;

// ── Theme context value ──

interface ThemeContextValue {
  // Current theme data
  themeId: string;
  theme: ThemeDefinition;
  colors: ThemeColors;
  shadows: { sm: ShadowStyle; md: ShadowStyle; lg: ShadowStyle; xl: ShadowStyle };
  card: ThemeCard;
  isDark: boolean;
  // Static values (don't change per theme)
  fonts: typeof fonts;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  spring: typeof spring;
  // Actions
  setTheme: (themeId: string) => void;
  setCustomAccent: (hex: string | null) => void;
  customAccent: string | null;
}

const defaultTheme = getThemeById('light');

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'light',
  theme: defaultTheme,
  colors: defaultTheme.colors,
  shadows: defaultTheme.shadows,
  card: defaultTheme.card,
  isDark: false,
  fonts,
  spacing,
  borderRadius,
  spring,
  setTheme: () => {},
  setCustomAccent: () => {},
  customAccent: null,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeId, setThemeId] = useState('light');
  const [customAccent, setCustomAccentState] = useState<string | null>(null);

  // Load saved theme on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(ACCENT_STORAGE_KEY),
    ]).then(([savedTheme, savedAccent]) => {
      if (savedTheme && themes.some((t) => t.id === savedTheme)) {
        setThemeId(savedTheme);
      }
      if (savedAccent) {
        setCustomAccentState(savedAccent);
      }
    });
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
    AsyncStorage.setItem(THEME_STORAGE_KEY, id);
  }, []);

  const setCustomAccent = useCallback((hex: string | null) => {
    setCustomAccentState(hex);
    if (hex) {
      AsyncStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } else {
      AsyncStorage.removeItem(ACCENT_STORAGE_KEY);
    }
  }, []);

  // Resolve final theme
  let resolvedTheme = getThemeById(themeId);
  if (customAccent) {
    resolvedTheme = applyCustomAccent(resolvedTheme, customAccent);
  }

  const value: ThemeContextValue = {
    themeId,
    theme: resolvedTheme,
    colors: resolvedTheme.colors,
    shadows: resolvedTheme.shadows,
    card: resolvedTheme.card,
    isDark: resolvedTheme.isDark,
    fonts,
    spacing,
    borderRadius,
    spring,
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
