import { LinearGradient } from 'expo-linear-gradient';

export const colors = {
  // Official Blue palette (replaces Indigo/Purple)
  primary: '#2563EB',       // Blue-600
  primaryLight: '#60A5FA',  // Blue-400
  primaryDark: '#1E40AF',   // Blue-800
  primaryGhost: 'rgba(37, 99, 235, 0.08)',
  
  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  
  dark: '#0F172A',      // Slate-900
  light: '#F8FAFC',     // Slate-50
  white: '#FFFFFF',
  black: '#000000',
  
  // Rich gray scale (slate)
  gray: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Gradient presets
  gradients: {
    primary: ['#2563EB', '#1D4ED8'], // Deep Blue gradient
    warm: ['#F59E0B', '#EF4444'],
    cool: ['#06B6D4', '#2563EB'],
    dark: ['#1E293B', '#0F172A'],
    card: ['#FFFFFF', '#F8FAFC'],
  },
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};