export const COLORS = {
  // Primary accent - subtle blue-purple
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  
  // Dark theme backgrounds
  background: '#0A0A0A',
  backgroundSecondary: '#141414',
  backgroundTertiary: '#1A1A1A',
  
  // Surfaces with subtle glass effect
  surface: '#1E1E1E',
  surfaceHover: '#252525',
  surfaceGlass: 'rgba(255, 255, 255, 0.03)',
  
  // Gradient colors for glossy effect
  gradient: {
    start: '#1A1A1A',
    middle: '#0F0F0F',
    end: '#0A0A0A',
  },
  
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1A1',
    tertiary: '#666666',
    inverse: '#0A0A0A',
    muted: '#525252',
  },
  
  border: {
    light: '#262626',
    medium: '#333333',
    dark: '#404040',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  
  chat: {
    userBubble: '#8B5CF6',
    userText: '#FFFFFF',
    botBubble: '#1E1E1E',
    botText: '#E5E5E5',
  },
  
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
