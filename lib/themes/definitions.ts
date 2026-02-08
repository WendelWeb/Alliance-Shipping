import { generateScale } from './colorUtils';

// ==================== TYPE DEFINITIONS ====================

export interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string;
}

export interface ThemeColors {
  primary: ColorScale;
  gray: ColorScale;
  white: string;
  black: string;
  background: string;
  surface: string;
  surfaceSolid: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  category: 'style' | 'color';
  preview: { bg: string; accent: string; card: string; text: string };
  isDark: boolean;
  defaultAccent: string;
  colors: ThemeColors;
  card: { bg: string; border: string; borderWidth: string };
  shadow: { sm: string; md: string; lg: string; xl: string };
}

// ==================== SHARED COLOR PALETTES ====================

const lightGray: ColorScale = {
  50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af',
  500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
};

const darkGray: ColorScale = {
  50: '#0f1117', 100: '#1a1d27', 200: '#252a36', 300: '#363c4a', 400: '#6b7280',
  500: '#9ca3af', 600: '#d1d5db', 700: '#e5e7eb', 800: '#f3f4f6', 900: '#f9fafb',
};

const neuGray: ColorScale = {
  50: '#e8ecf1', 100: '#dfe3e8', 200: '#cdd2d9', 300: '#b8bfc8', 400: '#8e97a3',
  500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
};

const darkNeuGray: ColorScale = {
  50: '#1a1a2e', 100: '#222238', 200: '#2d2d44', 300: '#3d3d56', 400: '#6b7280',
  500: '#9ca3af', 600: '#d1d5db', 700: '#e5e7eb', 800: '#f0f0f5', 900: '#fafafe',
};

// ==================== SHADOW PRESETS (CSS box-shadow) ====================

const lightShadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 2px 4px rgba(0,0,0,0.1)',
  lg: '0 4px 8px rgba(0,0,0,0.15)',
  xl: '0 8px 16px rgba(0,0,0,0.2)',
};

const darkShadows = {
  sm: '0 1px 2px rgba(0,0,0,0.3)',
  md: '0 2px 4px rgba(0,0,0,0.4)',
  lg: '0 4px 8px rgba(0,0,0,0.5)',
  xl: '0 8px 16px rgba(0,0,0,0.6)',
};

const neuShadows = {
  sm: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
  md: '5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff',
  lg: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
  xl: '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
};

const darkNeuShadows = {
  sm: '3px 3px 6px #0a0a15, -3px -3px 6px #2a2a42',
  md: '5px 5px 10px #0a0a15, -5px -5px 10px #2a2a42',
  lg: '8px 8px 16px #0a0a15, -8px -8px 16px #2a2a42',
  xl: '12px 12px 24px #0a0a15, -12px -12px 24px #2a2a42',
};

const glassShadows = {
  sm: '0 2px 4px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.12)',
  lg: '0 8px 20px rgba(0,0,0,0.18)',
  xl: '0 12px 30px rgba(0,0,0,0.25)',
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
    category: 'style',
    preview: { bg: '#f8fafc', accent: '#3b82f6', card: '#ffffff', text: '#111827' },
    isDark: false,
    defaultAccent: '#3b82f6',
    colors: {
      primary: bluePrimary,
      gray: lightGray,
      white: '#ffffff', black: '#000000',
      background: '#f8fafc',
      surface: 'rgba(255,255,255,0.8)',
      surfaceSolid: '#ffffff',
    },
    card: { bg: '#ffffff', border: '#f3f4f6', borderWidth: '1px' },
    shadow: lightShadows,
  },

  // 2. DARK
  {
    id: 'dark',
    name: 'Dark',
    category: 'style',
    preview: { bg: '#0f1117', accent: '#60a5fa', card: '#1a1d27', text: '#f9fafb' },
    isDark: true,
    defaultAccent: '#60a5fa',
    colors: {
      primary: { ...bluePrimary, 500: '#60a5fa', 600: '#3b82f6', 400: '#93c5fd' },
      gray: darkGray,
      white: '#ffffff', black: '#000000',
      background: '#0f1117',
      surface: 'rgba(26,29,39,0.9)',
      surfaceSolid: '#1a1d27',
    },
    card: { bg: '#1a1d27', border: '#252a36', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 3. NEUMORPHISM
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    category: 'style',
    preview: { bg: '#e0e5ec', accent: '#3b82f6', card: '#e0e5ec', text: '#2d3748' },
    isDark: false,
    defaultAccent: '#3b82f6',
    colors: {
      primary: bluePrimary,
      gray: neuGray,
      white: '#ffffff', black: '#000000',
      background: '#e0e5ec',
      surface: 'rgba(224,229,236,0.9)',
      surfaceSolid: '#e0e5ec',
    },
    card: { bg: '#e0e5ec', border: 'transparent', borderWidth: '0px' },
    shadow: neuShadows,
  },

  // 4. BLACK NEUMORPHISM
  {
    id: 'black-neumorphism',
    name: 'Black Neumorphic',
    category: 'style',
    preview: { bg: '#1a1a2e', accent: '#818cf8', card: '#1a1a2e', text: '#e2e8f0' },
    isDark: true,
    defaultAccent: '#818cf8',
    colors: {
      primary: makeColorScale('#818cf8'),
      gray: darkNeuGray,
      white: '#ffffff', black: '#000000',
      background: '#1a1a2e',
      surface: 'rgba(26,26,46,0.95)',
      surfaceSolid: '#1a1a2e',
    },
    card: { bg: '#1a1a2e', border: 'transparent', borderWidth: '0px' },
    shadow: darkNeuShadows,
  },

  // 5. WHITE NEUMORPHISM
  {
    id: 'white-neumorphism',
    name: 'White Neumorphic',
    category: 'style',
    preview: { bg: '#f0f0f3', accent: '#6366f1', card: '#f0f0f3', text: '#1e293b' },
    isDark: false,
    defaultAccent: '#6366f1',
    colors: {
      primary: makeColorScale('#6366f1'),
      gray: { ...neuGray, 50: '#f0f0f3', 100: '#e6e6eb' },
      white: '#ffffff', black: '#000000',
      background: '#f0f0f3',
      surface: 'rgba(240,240,243,0.95)',
      surfaceSolid: '#f0f0f3',
    },
    card: { bg: '#f0f0f3', border: 'transparent', borderWidth: '0px' },
    shadow: neuShadows,
  },

  // 6. GLASSMORPHISM
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    category: 'style',
    preview: { bg: '#667eea', accent: '#764ba2', card: 'rgba(255,255,255,0.15)', text: '#ffffff' },
    isDark: true,
    defaultAccent: '#764ba2',
    colors: {
      primary: makeColorScale('#a78bfa'),
      gray: darkGray,
      white: '#ffffff', black: '#000000',
      background: '#1a1033',
      surface: 'rgba(255,255,255,0.08)',
      surfaceSolid: '#2a1f4e',
    },
    card: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.18)', borderWidth: '1px' },
    shadow: glassShadows,
  },

  // 7. WHITE GLASSMORPHISM
  {
    id: 'white-glassmorphism',
    name: 'White Glass',
    category: 'style',
    preview: { bg: '#f0f4ff', accent: '#6366f1', card: 'rgba(255,255,255,0.6)', text: '#1e293b' },
    isDark: false,
    defaultAccent: '#6366f1',
    colors: {
      primary: makeColorScale('#6366f1'),
      gray: lightGray,
      white: '#ffffff', black: '#000000',
      background: '#eef2ff',
      surface: 'rgba(255,255,255,0.55)',
      surfaceSolid: '#ffffff',
    },
    card: { bg: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.8)', borderWidth: '1px' },
    shadow: glassShadows,
  },

  // 8. BLACK GLASSMORPHISM
  {
    id: 'black-glassmorphism',
    name: 'Black Glass',
    category: 'style',
    preview: { bg: '#0a0a0f', accent: '#22d3ee', card: 'rgba(255,255,255,0.06)', text: '#f0f9ff' },
    isDark: true,
    defaultAccent: '#22d3ee',
    colors: {
      primary: makeColorScale('#22d3ee'),
      gray: { ...darkGray, 50: '#0a0a0f', 100: '#111118' },
      white: '#ffffff', black: '#000000',
      background: '#0a0a0f',
      surface: 'rgba(255,255,255,0.04)',
      surfaceSolid: '#111118',
    },
    card: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', borderWidth: '1px' },
    shadow: glassShadows,
  },

  // ──────────── COLOR THEMES (Dark-based, polished) ────────────

  // 9. OCEAN BLUE
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    category: 'color',
    preview: { bg: '#0a1628', accent: '#0ea5e9', card: '#0f2035', text: '#e0f2fe' },
    isDark: true,
    defaultAccent: '#0ea5e9',
    colors: {
      primary: makeColorScale('#0ea5e9'),
      gray: { 50: '#0a1628', 100: '#0f2035', 200: '#163152', 300: '#1e4976', 400: '#6b9cc4', 500: '#94b8d4', 600: '#bdd4e8', 700: '#dbeafe', 800: '#e8f4fc', 900: '#f0f9ff' },
      white: '#ffffff', black: '#000000',
      background: '#0a1628', surface: 'rgba(15,32,53,0.95)', surfaceSolid: '#0f2035',
    },
    card: { bg: '#0f2035', border: '#163152', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 10. ROYAL GOLD
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    category: 'color',
    preview: { bg: '#1a1408', accent: '#d4a017', card: '#251e0e', text: '#fef3c7' },
    isDark: true,
    defaultAccent: '#d4a017',
    colors: {
      primary: makeColorScale('#d4a017'),
      gray: { 50: '#1a1408', 100: '#251e0e', 200: '#362c15', 300: '#4d3f20', 400: '#a08a50', 500: '#c4a96e', 600: '#e0cc98', 700: '#f0e4c0', 800: '#faf3de', 900: '#fefce8' },
      white: '#ffffff', black: '#000000',
      background: '#1a1408', surface: 'rgba(37,30,14,0.95)', surfaceSolid: '#251e0e',
    },
    card: { bg: '#251e0e', border: '#362c15', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 11. EMERALD GREEN
  {
    id: 'emerald-green',
    name: 'Emerald',
    category: 'color',
    preview: { bg: '#0a1f15', accent: '#10b981', card: '#0f2e20', text: '#d1fae5' },
    isDark: true,
    defaultAccent: '#10b981',
    colors: {
      primary: makeColorScale('#10b981'),
      gray: { 50: '#0a1f15', 100: '#0f2e20', 200: '#16402e', 300: '#1f5c42', 400: '#6ba88e', 500: '#94c4ae', 600: '#bddece', 700: '#dcf0e5', 800: '#ecfbf3', 900: '#f0fdf4' },
      white: '#ffffff', black: '#000000',
      background: '#0a1f15', surface: 'rgba(15,46,32,0.95)', surfaceSolid: '#0f2e20',
    },
    card: { bg: '#0f2e20', border: '#16402e', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 12. ROSE PINK
  {
    id: 'rose-pink',
    name: 'Rose',
    category: 'color',
    preview: { bg: '#1f0a1a', accent: '#f472b6', card: '#2e0f25', text: '#fce7f3' },
    isDark: true,
    defaultAccent: '#f472b6',
    colors: {
      primary: makeColorScale('#f472b6'),
      gray: { 50: '#1f0a1a', 100: '#2e0f25', 200: '#401835', 300: '#5c2050', 400: '#a86b93', 500: '#c494b2', 600: '#debdce', 700: '#f0dce6', 800: '#fbecf3', 900: '#fef2f8' },
      white: '#ffffff', black: '#000000',
      background: '#1f0a1a', surface: 'rgba(46,15,37,0.95)', surfaceSolid: '#2e0f25',
    },
    card: { bg: '#2e0f25', border: '#401835', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 13. MIDNIGHT PURPLE
  {
    id: 'midnight-purple',
    name: 'Midnight',
    category: 'color',
    preview: { bg: '#13091f', accent: '#a78bfa', card: '#1c1030', text: '#ede9fe' },
    isDark: true,
    defaultAccent: '#a78bfa',
    colors: {
      primary: makeColorScale('#a78bfa'),
      gray: { 50: '#13091f', 100: '#1c1030', 200: '#291844', 300: '#3b2460', 400: '#8b6bb5', 500: '#ac94cc', 600: '#cdbde0', 700: '#e6dcf0', 800: '#f3ecfb', 900: '#faf5ff' },
      white: '#ffffff', black: '#000000',
      background: '#13091f', surface: 'rgba(28,16,48,0.95)', surfaceSolid: '#1c1030',
    },
    card: { bg: '#1c1030', border: '#291844', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 14. CRIMSON RED
  {
    id: 'crimson-red',
    name: 'Crimson',
    category: 'color',
    preview: { bg: '#1a0808', accent: '#ef4444', card: '#2b0f0f', text: '#fee2e2' },
    isDark: true,
    defaultAccent: '#ef4444',
    colors: {
      primary: makeColorScale('#ef4444'),
      gray: { 50: '#1a0808', 100: '#2b0f0f', 200: '#3d1818', 300: '#562424', 400: '#a86b6b', 500: '#c49494', 600: '#debebe', 700: '#f0dcdc', 800: '#fbecec', 900: '#fef2f2' },
      white: '#ffffff', black: '#000000',
      background: '#1a0808', surface: 'rgba(43,15,15,0.95)', surfaceSolid: '#2b0f0f',
    },
    card: { bg: '#2b0f0f', border: '#3d1818', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 15. SUNSET ORANGE
  {
    id: 'sunset-orange',
    name: 'Sunset',
    category: 'color',
    preview: { bg: '#1a1008', accent: '#f97316', card: '#2b1c0f', text: '#ffedd5' },
    isDark: true,
    defaultAccent: '#f97316',
    colors: {
      primary: makeColorScale('#f97316'),
      gray: { 50: '#1a1008', 100: '#2b1c0f', 200: '#3d2918', 300: '#564024', 400: '#a88d6b', 500: '#c4aa88', 600: '#dec8a8', 700: '#f0e2d0', 800: '#fbf0e4', 900: '#fff7ed' },
      white: '#ffffff', black: '#000000',
      background: '#1a1008', surface: 'rgba(43,28,15,0.95)', surfaceSolid: '#2b1c0f',
    },
    card: { bg: '#2b1c0f', border: '#3d2918', borderWidth: '1px' },
    shadow: darkShadows,
  },

  // 16. ARCTIC SILVER
  {
    id: 'arctic-silver',
    name: 'Arctic',
    category: 'color',
    preview: { bg: '#0f1318', accent: '#5eadb0', card: '#181e26', text: '#e2e8f0' },
    isDark: true,
    defaultAccent: '#5eadb0',
    colors: {
      primary: makeColorScale('#5eadb0'),
      gray: { 50: '#0f1318', 100: '#181e26', 200: '#232b36', 300: '#334155', 400: '#7c8fa6', 500: '#94a3b8', 600: '#cbd5e1', 700: '#e2e8f0', 800: '#f1f5f9', 900: '#f8fafc' },
      white: '#ffffff', black: '#000000',
      background: '#0f1318', surface: 'rgba(24,30,38,0.95)', surfaceSolid: '#181e26',
    },
    card: { bg: '#181e26', border: '#232b36', borderWidth: '1px' },
    shadow: darkShadows,
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
