import { Colors } from '@/constants/design-tokens';
import { Platform } from 'react-native';

export const TAB_BAR_SCREEN_OPTIONS = {
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textMuted,
  headerShown: false,
  tabBarShowLabel: true,

  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
  },

  tabBarStyle: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
    position: 'absolute' as const,
    bottom: 0,
    height: 'auto',
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center' as const,
    marginHorizontal: 'auto' as const,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px -5px 20px rgba(0,0,0,0.05)',
      } as any,
    }),
  },
};
