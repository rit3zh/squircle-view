const colors = {
  background: '#f6f6f9',
  surface: '#FFFFFF',
  text: '#0A0A0A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  ink: '#111827',
  blue: '#3B82F6',
  red: '#EF4444',
  orange: '#F97316',
  amber: '#F59E0B',
  green: '#10B981',
  violet: '#7C3AED',
  violetLight: '#EDE9FE',
  highlight: '#DBEAFE',
  muted: '#D1D5DB',
  shadow: '#000000',
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export { colors, spacing };
