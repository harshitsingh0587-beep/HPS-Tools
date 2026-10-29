import { ThemeConfig } from '../types';

export const STARTER_THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic HPS',
    isDark: false,
    colors: {
      primary: '#142B50', // Deep Navy Blue
      primaryHover: '#0E1F3B',
      accent: '#D4AF37', // Gold
      bg: '#F8FAFC', // Slate 50
      surface: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      text: '#0F172A', // Slate 900
      textMuted: '#475569', // Slate 600
      border: '#E2E8F0', // Slate 200
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    isDark: false,
    colors: {
      primary: '#0284C7', // Sky / Ocean Blue
      primaryHover: '#0369A1',
      accent: '#0D9488', // Teal
      bg: '#F0F9FF',
      surface: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      text: '#0C4A6E',
      textMuted: '#475569',
      border: '#BAE6FD',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    isDark: false,
    colors: {
      primary: '#166534', // Forest Green
      primaryHover: '#14532D',
      accent: '#374151', // Dark Grey
      bg: '#F0FDF4',
      surface: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      text: '#14532D',
      textMuted: '#4B5563',
      border: '#BBF7D0',
    },
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    isDark: false,
    colors: {
      primary: '#6B21A8', // Royal Purple
      primaryHover: '#581C87',
      accent: '#A855F7', // Lavender
      bg: '#FAF5FF',
      surface: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      text: '#3B0764',
      textMuted: '#6B7280',
      border: '#E9D5FF',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    isDark: false,
    colors: {
      primary: '#C2410C', // Rust Orange
      primaryHover: '#9A3412',
      accent: '#F43F5E', // Coral / Rose
      bg: '#FFF7ED',
      surface: '#FFFFFF',
      surfaceCard: '#FFFFFF',
      text: '#431407',
      textMuted: '#78716C',
      border: '#FED7AA',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    isDark: true,
    colors: {
      primary: '#38BDF8', // Sky Cyan
      primaryHover: '#0284C7',
      accent: '#FBBF24', // Amber
      bg: '#0F172A', // Slate 900
      surface: '#1E293B', // Slate 800
      surfaceCard: '#1E293B',
      text: '#F8FAFC', // Slate 50
      textMuted: '#94A3B8', // Slate 400
      border: '#334155', // Slate 700
    },
  },
};

export const PRESET_THEMES = STARTER_THEMES;
export const DEFAULT_THEME = STARTER_THEMES.classic;
