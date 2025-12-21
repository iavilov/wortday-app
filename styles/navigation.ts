import { Colors } from '@/constants/design-tokens';
import { Platform } from 'react-native';

export const TAB_BAR_SCREEN_OPTIONS = {
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textMuted,
  headerShown: false,
  tabBarShowLabel: true,

  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '700' as const,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
  },

  tabBarStyle: {
    backgroundColor: Colors.surface,
    borderTopWidth: 3,
    borderTopColor: Colors.border,
    position: 'absolute' as const,
    bottom: 0,
    height: 60,
    left: 0,
    right: 0,
    width: '100%' as const,
    maxWidth: 480,
    alignSelf: 'center' as const,
  },
};
