// Simple color utility functions for generating theme color scales

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

function mix(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

/** Generate a 50-900 color scale from a base hex color (used as 500) */
export function generateScale(baseHex: string): Record<number, string> {
  const base = hexToRgb(baseHex);
  const white: [number, number, number] = [255, 255, 255];
  const dark: [number, number, number] = [15, 15, 30];

  return {
    50: rgbToHex(...mix(white, base, 0.05)),
    100: rgbToHex(...mix(white, base, 0.12)),
    200: rgbToHex(...mix(white, base, 0.25)),
    300: rgbToHex(...mix(white, base, 0.42)),
    400: rgbToHex(...mix(white, base, 0.65)),
    500: baseHex,
    600: rgbToHex(...mix(base, dark, 0.15)),
    700: rgbToHex(...mix(base, dark, 0.30)),
    800: rgbToHex(...mix(base, dark, 0.48)),
    900: rgbToHex(...mix(base, dark, 0.65)),
  };
}

export function withOpacity(hex: string, opacity: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}
