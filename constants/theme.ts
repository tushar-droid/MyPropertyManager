import { Platform } from 'react-native';

const tintColorLight = '#4F46E5';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FAFC',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Compatibility export for components expecting the old 'Theme' object
export const Theme = {
  colors: {
    primary: '#4F46E5',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    white: '#FFFFFF',
    status: {
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B'
    }
  },
  shadows: {
    light: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2
    },
    medium: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4
    },
    premium: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 6
    }
  }
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
