export const colors = {
  primary: '#2563eb',
  secondary: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#1f2937',
  light: '#f3f4f6',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const theme = {
  colors: {
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.gray[50],
    surface: colors.white,
    text: colors.gray[900],
    disabled: colors.gray[400],
    placeholder: colors.gray[500],
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
};