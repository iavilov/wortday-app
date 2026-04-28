import { palette } from './colors';

export const articleColors = {
  der: {
    bg: palette.articleDer,
    text: palette.ink,
    border: palette.ink,
    accent: palette.articleDer,
  },
  die: {
    bg: palette.articleDie,
    text: palette.ink,
    border: palette.ink,
    accent: palette.articleDie,
  },
  das: {
    bg: palette.articleDas,
    text: palette.ink,
    border: palette.ink,
    accent: palette.articleDas,
  },
  none: {
    bg: palette.cardBg,
    text: palette.ink,
    border: palette.ink,
    accent: palette.gray[500],
  },
} as const;

export const transcriptionColor = {
  bg: palette.gray[300],
  text: palette.ink,
} as const;


export const partOfSpeechColors = {
  verb: {
    bg: palette.yellow,
    text: palette.ink,
    border: palette.ink,
  },
  adjective: {
    bg: palette.purple,
    text: palette.ink,
    border: palette.ink,
  },
} as const;


export const languageColors = {
  ru: palette.vibrantGreen,
  uk: palette.articleDer,
  en: palette.articleDie,
  de: palette.yellow,
} as const;

export const levelColors = {
  beginner: palette.vibrantGreen,
  intermediate: palette.articleDer,
  advanced: palette.articleDie,
} as const;


export const Colors = {
  background: palette.bgMain,
  surface: palette.cardBg,

  primary: palette.primary,
  primaryForeground: palette.ink,
  secondary: palette.yellow,
  secondaryForeground: palette.ink,

  accentYellow: palette.yellow,
  accentPink: palette.pink,
  accentBlue: palette.blue,

  destructive: palette.destructive,

  lightGreen: palette.lightGreen,
  lightBlue: palette.lightBlue,
  lightYellow: palette.lightYellow,

  textMain: palette.ink,
  textMuted: palette.gray[600],
  textInverted: palette.cardBg,

  border: palette.ink,
  borderMuted: palette.borderMuted,

  gray50: palette.gray[50],
  gray100: palette.gray[100],
  gray200: palette.gray[200],
  gray300: palette.gray[300],
  gray400: palette.gray[400],
  gray500: palette.gray[500],
  gray600: palette.gray[600],
  gray700: palette.gray[700],
  gray800: palette.gray[800],
  gray900: palette.gray[900],

  articleColors,
  partOfSpeechColors,
  transcriptionColor,
  languageColors,
  levelColors,
} as const;

export const colors = {
  background: Colors.background,
  surface: Colors.surface,

  primary: {
    DEFAULT: Colors.primary,
    foreground: Colors.primaryForeground,
  },

  secondary: {
    DEFAULT: Colors.secondary,
    foreground: Colors.secondaryForeground,
  },

  accent: {
    yellow: Colors.accentYellow,
    pink: Colors.accentPink,
    blue: Colors.accentBlue,
  },

  text: {
    main: Colors.textMain,
    muted: Colors.textMuted,
    inverted: Colors.textInverted,
  },

  border: {
    DEFAULT: Colors.border,
  },

  gray: palette.gray,
} as const;

export const borderRadius = {
  SHARP: 0,
  SMALL: 4,
  MEDIUM: 12,
  LARGE: 20,
  ROUND: 999,
};

export const borderWidth = {
  DEFAULT: '2px',
  '3': '3px',
  thick: '3px',
};

export const shadows = {
  brutal: '4px 4px 0px 0px #121212',
  'brutal-sm': '2px 2px 0px 0px #121212',
  'brutal-lg': '6px 6px 0px 0px #121212',
  'brutal-hover': '6px 6px 0px 0px #121212',
  'brutal-active': '0px 0px 0px 0px #121212',
};

export const Layout = {
  maxContentWidth: 432,
  screenPadding: 24,
  cardPadding: 20,
};

export const Border = {
  primary: 3,
  secondary: 2,
  thin: 1,
} as const;


export const FontNames = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',
} as const;

export const fontFamily = {
  'w-regular': [FontNames.regular, 'sans-serif'],
  'w-medium': [FontNames.medium, 'sans-serif'],
  'w-semibold': [FontNames.semibold, 'sans-serif'],
  'w-bold': [FontNames.bold, 'sans-serif'],
};
