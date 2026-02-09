import { generateScale } from './colorUtils';

// ==================== TYPE DEFINITIONS ====================

export interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string;
}

export interface PartialColorScale {
  50?: string; 100?: string; 500: string; 600: string;
}

export interface ThemeColors {
  primary: ColorScale;
  gray: ColorScale;
  green: PartialColorScale;
  red: PartialColorScale;
  yellow: PartialColorScale;
  purple: PartialColorScale;
  emerald: { 500: string; 600: string };
  orange: { 500: string; 600: string };
  white: string;
  black: string;
  background: string;
  surface: string;
  surfaceSolid: string;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeCard {
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  nameKey: string; // i18n key
  category: 'style' | 'color';
  preview: { bg: string; accent: string; card: string; text: string };
  isDark: boolean;
  defaultAccent: string; // base hex for primary scale
  colors: ThemeColors;
  shadows: { sm: ShadowStyle; md: ShadowStyle; lg: ShadowStyle; xl: ShadowStyle };
  card: ThemeCard;
}

// ==================== SHARED COLOR PALETTES ====================

const semanticColors = {
  green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626' },
  yellow: { 50: '#fefce8', 100: '#fef9c3', 500: '#eab308', 600: '#ca8a04' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#8b5cf6', 600: '#7c3aed' },
  emerald: { 500: '#10b981', 600: '#059669' },
  orange: { 500: '#f97316', 600: '#ea580c' },
};

// Light gray scale
const lightGray: ColorScale = {
  50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af',
  500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
};

// Dark gray scale (inverted semantics - gray[900] = light text, gray[50] = dark bg)
const darkGray: ColorScale = {
  50: '#0f1117', 100: '#1a1d27', 200: '#252a36', 300: '#363c4a', 400: '#6b7280',
  500: '#9ca3af', 600: '#d1d5db', 700: '#e5e7eb', 800: '#f3f4f6', 900: '#f9fafb',
};


// ==================== SHADOW PRESETS ====================

const lightShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
};

const darkShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8 },
};


// ==================== BLUE PRIMARY (DEFAULT) ====================

const bluePrimary: ColorScale = {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
  500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
};

// ==================== HELPER ====================

function makeColorScale(hex: string): ColorScale {
  const s = generateScale(hex);
  return { 50: s[50], 100: s[100], 200: s[200], 300: s[300], 400: s[400], 500: s[500], 600: s[600], 700: s[700], 800: s[800], 900: s[900] };
}

// ==================== THEME DEFINITIONS ====================

export const themes: ThemeDefinition[] = [
  // ──────────── STYLE THEMES ────────────

  // 1. LIGHT (Default)
  {
    id: 'light',
    name: 'Light',
    nameKey: 'themes.light',
    category: 'style',
    preview: { bg: '#f8fafc', accent: '#3b82f6', card: '#ffffff', text: '#111827' },
    isDark: false,
    defaultAccent: '#3b82f6',
    colors: {
      primary: bluePrimary,
      gray: lightGray,
      ...semanticColors,
      white: '#ffffff',
      black: '#000000',
      background: '#f8fafc',
      surface: 'rgba(255,255,255,0.8)',
      surfaceSolid: '#ffffff',
    },
    shadows: lightShadows,
    card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f3f4f6' },
  },

  // 2. DARK
  {
    id: 'dark',
    name: 'Dark',
    nameKey: 'themes.dark',
    category: 'style',
    preview: { bg: '#0f1117', accent: '#60a5fa', card: '#1a1d27', text: '#f9fafb' },
    isDark: true,
    defaultAccent: '#60a5fa',
    colors: {
      primary: { ...bluePrimary, 500: '#60a5fa', 600: '#3b82f6', 400: '#93c5fd' },
      gray: darkGray,
      ...semanticColors,
      white: '#ffffff',
      black: '#000000',
      background: '#0f1117',
      surface: 'rgba(26,29,39,0.9)',
      surfaceSolid: '#1a1d27',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#1a1d27', borderWidth: 1, borderColor: '#252a36' },
  },

  // ──────────── COLOR THEMES (Dark-based, polished) ────────────

  // 5. OCEAN BLUE
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    nameKey: 'themes.oceanBlue',
    category: 'color',
    preview: { bg: '#0a1628', accent: '#0ea5e9', card: '#0f2035', text: '#e0f2fe' },
    isDark: true,
    defaultAccent: '#0ea5e9',
    colors: {
      primary: makeColorScale('#0ea5e9'),
      gray: { 50: '#0a1628', 100: '#0f2035', 200: '#163152', 300: '#1e4976', 400: '#6b9cc4', 500: '#94b8d4', 600: '#bdd4e8', 700: '#dbeafe', 800: '#e8f4fc', 900: '#f0f9ff' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#0a1628', surface: 'rgba(15,32,53,0.95)', surfaceSolid: '#0f2035',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#0f2035', borderWidth: 1, borderColor: '#163152' },
  },

  // 6. ROYAL GOLD
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameKey: 'themes.royalGold',
    category: 'color',
    preview: { bg: '#1a1408', accent: '#d4a017', card: '#251e0e', text: '#fef3c7' },
    isDark: true,
    defaultAccent: '#d4a017',
    colors: {
      primary: makeColorScale('#d4a017'),
      gray: { 50: '#1a1408', 100: '#251e0e', 200: '#362c15', 300: '#4d3f20', 400: '#a08a50', 500: '#c4a96e', 600: '#e0cc98', 700: '#f0e4c0', 800: '#faf3de', 900: '#fefce8' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#1a1408', surface: 'rgba(37,30,14,0.95)', surfaceSolid: '#251e0e',
    },
    shadows: { ...darkShadows, md: { ...darkShadows.md, shadowColor: '#d4a017', shadowOpacity: 0.15 } },
    card: { backgroundColor: '#251e0e', borderWidth: 1, borderColor: '#362c15' },
  },

  // 7. EMERALD GREEN
  {
    id: 'emerald-green',
    name: 'Emerald',
    nameKey: 'themes.emeraldGreen',
    category: 'color',
    preview: { bg: '#0a1f15', accent: '#10b981', card: '#0f2e20', text: '#d1fae5' },
    isDark: true,
    defaultAccent: '#10b981',
    colors: {
      primary: makeColorScale('#10b981'),
      gray: { 50: '#0a1f15', 100: '#0f2e20', 200: '#16402e', 300: '#1f5c42', 400: '#6ba88e', 500: '#94c4ae', 600: '#bddece', 700: '#dcf0e5', 800: '#ecfbf3', 900: '#f0fdf4' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#0a1f15', surface: 'rgba(15,46,32,0.95)', surfaceSolid: '#0f2e20',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#0f2e20', borderWidth: 1, borderColor: '#16402e' },
  },

  // 8. ROSE PINK
  {
    id: 'rose-pink',
    name: 'Rose',
    nameKey: 'themes.rosePink',
    category: 'color',
    preview: { bg: '#1f0a1a', accent: '#f472b6', card: '#2e0f25', text: '#fce7f3' },
    isDark: true,
    defaultAccent: '#f472b6',
    colors: {
      primary: makeColorScale('#f472b6'),
      gray: { 50: '#1f0a1a', 100: '#2e0f25', 200: '#401835', 300: '#5c2050', 400: '#a86b93', 500: '#c494b2', 600: '#debdce', 700: '#f0dce6', 800: '#fbecf3', 900: '#fef2f8' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#1f0a1a', surface: 'rgba(46,15,37,0.95)', surfaceSolid: '#2e0f25',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#2e0f25', borderWidth: 1, borderColor: '#401835' },
  },

  // 9. MIDNIGHT PURPLE
  {
    id: 'midnight-purple',
    name: 'Midnight',
    nameKey: 'themes.midnightPurple',
    category: 'color',
    preview: { bg: '#13091f', accent: '#a78bfa', card: '#1c1030', text: '#ede9fe' },
    isDark: true,
    defaultAccent: '#a78bfa',
    colors: {
      primary: makeColorScale('#a78bfa'),
      gray: { 50: '#13091f', 100: '#1c1030', 200: '#291844', 300: '#3b2460', 400: '#8b6bb5', 500: '#ac94cc', 600: '#cdbde0', 700: '#e6dcf0', 800: '#f3ecfb', 900: '#faf5ff' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#13091f', surface: 'rgba(28,16,48,0.95)', surfaceSolid: '#1c1030',
    },
    shadows: { ...darkShadows, md: { ...darkShadows.md, shadowColor: '#a78bfa', shadowOpacity: 0.12 } },
    card: { backgroundColor: '#1c1030', borderWidth: 1, borderColor: '#291844' },
  },

  // 10. CRIMSON RED
  {
    id: 'crimson-red',
    name: 'Crimson',
    nameKey: 'themes.crimsonRed',
    category: 'color',
    preview: { bg: '#1a0808', accent: '#ef4444', card: '#2b0f0f', text: '#fee2e2' },
    isDark: true,
    defaultAccent: '#ef4444',
    colors: {
      primary: makeColorScale('#ef4444'),
      gray: { 50: '#1a0808', 100: '#2b0f0f', 200: '#3d1818', 300: '#562424', 400: '#a86b6b', 500: '#c49494', 600: '#debebe', 700: '#f0dcdc', 800: '#fbecec', 900: '#fef2f2' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#1a0808', surface: 'rgba(43,15,15,0.95)', surfaceSolid: '#2b0f0f',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#2b0f0f', borderWidth: 1, borderColor: '#3d1818' },
  },

  // 11. SUNSET ORANGE
  {
    id: 'sunset-orange',
    name: 'Sunset',
    nameKey: 'themes.sunsetOrange',
    category: 'color',
    preview: { bg: '#1a1008', accent: '#f97316', card: '#2b1c0f', text: '#ffedd5' },
    isDark: true,
    defaultAccent: '#f97316',
    colors: {
      primary: makeColorScale('#f97316'),
      gray: { 50: '#1a1008', 100: '#2b1c0f', 200: '#3d2918', 300: '#564024', 400: '#a88d6b', 500: '#c4aa88', 600: '#dec8a8', 700: '#f0e2d0', 800: '#fbf0e4', 900: '#fff7ed' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#1a1008', surface: 'rgba(43,28,15,0.95)', surfaceSolid: '#2b1c0f',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#2b1c0f', borderWidth: 1, borderColor: '#3d2918' },
  },

  // 12. ARCTIC SILVER
  {
    id: 'arctic-silver',
    name: 'Arctic',
    nameKey: 'themes.arcticSilver',
    category: 'color',
    preview: { bg: '#0f1318', accent: '#5eadb0', card: '#181e26', text: '#e2e8f0' },
    isDark: true,
    defaultAccent: '#5eadb0',
    colors: {
      primary: makeColorScale('#5eadb0'),
      gray: { 50: '#0f1318', 100: '#181e26', 200: '#232b36', 300: '#334155', 400: '#7c8fa6', 500: '#94a3b8', 600: '#cbd5e1', 700: '#e2e8f0', 800: '#f1f5f9', 900: '#f8fafc' },
      ...semanticColors,
      white: '#ffffff', black: '#000000',
      background: '#0f1318', surface: 'rgba(24,30,38,0.95)', surfaceSolid: '#181e26',
    },
    shadows: darkShadows,
    card: { backgroundColor: '#181e26', borderWidth: 1, borderColor: '#232b36' },
  },
];

export function getThemeById(id: string): ThemeDefinition {
  return themes.find((t) => t.id === id) || themes[0];
}

/** Apply a custom accent color to a theme, regenerating the primary scale */
export function applyCustomAccent(theme: ThemeDefinition, accentHex: string): ThemeDefinition {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: makeColorScale(accentHex) as ColorScale,
    },
  };
}

export const ACCENT_PRESETS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0ea5e9' },
];
