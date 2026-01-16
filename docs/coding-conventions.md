# Coding Conventions

**Last Updated:** 16.01.2026
**Version:** 1.0.0

This document defines coding standards and best practices for the Vocade React Native project.

---

## General Principles

### Language

- **Code & Comments:** English only
- **Documentation:** English only
- **Team Communication:** Russian (our internal discussions)
- **User-Facing Text:** Must be translated via `constants/translations.ts`

### Code Style

- Use **TypeScript** for all new files
- Use **functional components** with hooks (no class components)
- Use **arrow functions** for component definitions
- Use **explicit return types** for functions when the type isn't obvious
- Follow **ESLint** rules (`npm run lint`)

---

## File Naming Conventions

### Components

```
PascalCase for React components:
  ✅ BrutalButton.tsx
  ✅ ScreenHeader.tsx
  ✅ WordCard.tsx
  ❌ brutal-button.tsx
  ❌ screen_header.tsx
```

### Utilities & Services

```
kebab-case for utility files:
  ✅ auth-service.ts
  ✅ word-service.ts
  ✅ date-helpers.ts
  ❌ authService.ts
  ❌ DateHelpers.ts
```

### Stores

```
kebab-case with -store suffix:
  ✅ auth-store.ts
  ✅ settings-store.ts
  ✅ word-store.ts
```

### Screens (Expo Router)

```
kebab-case for route files:
  ✅ app/auth/login.tsx
  ✅ app/settings/account.tsx
  ✅ app/(tabs)/index.tsx
```

---

## TypeScript Standards

### Type Definitions

Always define types/interfaces in the appropriate `types/` file:

```typescript
// ✅ Good
// types/word.ts
export interface Word {
  id: string;
  word_de: string;
  article: 'der' | 'die' | 'das' | null;
  translations: Translations;
}

// ❌ Bad - inline types
const word: { id: string; word_de: string } = ...
```

### Type Imports

```typescript
// ✅ Good
import type { Word, Translations } from '@/types/word';
import type { UserProfile } from '@/types/auth';

// ❌ Bad - mixing type and value imports
import { Word, getAllWords } from '@/lib/word-service';
```

### Avoid `any`

```typescript
// ❌ Bad
const data: any = await fetchData();

// ✅ Good
const data: Word | null = await fetchData();

// ✅ Also good for unknowns
const data: unknown = await fetchData();
if (isWord(data)) {
  // Now data is Word
}
```

---

## React Component Patterns

### Functional Components

```typescript
// ✅ Good - arrow function with explicit return type
export const WordCard = ({ word }: { word: Word }): JSX.Element => {
  return (
    <View>
      <Text>{word.word_de}</Text>
    </View>
  );
};

// ❌ Bad - function declaration
export function WordCard({ word }: { word: Word }) {
  return <View>...</View>;
}
```

### Props Interface

```typescript
// ✅ Good - separate interface
interface WordCardProps {
  word: Word;
  onPress?: () => void;
  showFavorite?: boolean;
}

export const WordCard = ({ word, onPress, showFavorite = true }: WordCardProps) => {
  // ...
};

// ❌ Bad - inline props
export const WordCard = ({ word, onPress }: { word: Word; onPress?: () => void }) => {
  // ...
};
```

### State Management

```typescript
// ✅ Good - explicit typing
const [word, setWord] = useState<Word | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ❌ Bad - implicit any
const [word, setWord] = useState(null);
```

---

## Async Patterns

### Data Fetching

Always follow this pattern for async data loading:

```typescript
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await service.fetchData();

    if (error) {
      setError(error);
      setData(null);
    } else {
      setData(data);
    }

    setIsLoading(false);
  };

  loadData();
}, [dependency]);

// Always show loading state
if (isLoading) {
  return <ActivityIndicator />;
}

// Always handle errors
if (error) {
  return <Text>Error: {error}</Text>;
}

// Then render data
return <View>{/* render data */}</View>;
```

### Service Functions

Service functions should return `{ data, error }` pattern:

```typescript
// ✅ Good
export const getTodayWord = async (
  level: LanguageLevel,
  registrationDate: string
): Promise<{ word: Word | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('level', level)
      .single();

    if (error) {
      console.error('[Word Service] Error:', error);
      return { word: null, error: error.message };
    }

    return { word: data, error: null };
  } catch (err) {
    console.error('[Word Service] Unexpected error:', err);
    return { word: null, error: 'Unexpected error occurred' };
  }
};

// ❌ Bad - throwing errors
export const getTodayWord = async (...): Promise<Word> => {
  const { data, error } = await supabase...;
  if (error) throw new Error(error.message); // Don't do this
  return data;
};
```

---

## Styling Standards

### Use Design Tokens

**Never use hardcoded values.** Always use tokens from `constants/design-tokens.ts`:

```typescript
// ✅ Good
import { Colors, borderRadius, shadows } from '@/constants/design-tokens';

<View style={{
  backgroundColor: Colors.primary,
  borderRadius: borderRadius.LARGE,
  boxShadow: shadows.brutal,
}} />

// ❌ Bad
<View style={{
  backgroundColor: '#FFE347',
  borderRadius: 20,
  boxShadow: '4px 4px 0px #121212',
}} />
```

### NativeWind Classes

Use utility classes where possible:

```typescript
// ✅ Good
<View className="bg-primary rounded-large border-3 border-ink">
  <Text className="font-w-bold text-xl text-ink">Title</Text>
</View>

// ❌ Bad - inline styles when utilities exist
<View style={{ backgroundColor: Colors.primary, borderRadius: 20 }}>
  <Text style={{ fontFamily: FontNames.bold, fontSize: 20 }}>Title</Text>
</View>
```

### Platform-Specific Styles

```typescript
import { Platform } from 'react-native';

// ✅ Good - Platform.select
const styles = {
  container: {
    padding: Platform.select({
      ios: 20,
      android: 16,
      web: 24,
    }),
  },
};

// ✅ Also good - conditional
if (Platform.OS === 'web') {
  // Web-specific code
}
```

---

## Component Structure

### File Organization

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

// 2. Types
import type { Word } from '@/types/word';

// 3. Constants & Helpers
import { Colors } from '@/constants/design-tokens';
import { t } from '@/lib/i18n-helpers';

// 4. Components
import { BrutalButton } from '@/components/ui/brutal-button';

// 5. Props Interface
interface WordDetailProps {
  word: Word;
}

// 6. Component
export const WordDetail = ({ word }: WordDetailProps): JSX.Element => {
  // State
  const [isFavorite, setIsFavorite] = useState(false);

  // Hooks
  const router = useRouter();

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handlePress = () => {
    // ...
  };

  // Render
  return (
    <View>
      {/* ... */}
    </View>
  );
};
```

---

## Store Patterns (Zustand)

### Store Structure

```typescript
import { create } from 'zustand';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session,
      isLoading: false
    });
  },
}));
```

### Using Stores

```typescript
// ✅ Good - selective subscription
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const signOut = useAuthStore((state) => state.signOut);

// ❌ Bad - subscribing to entire store
const authStore = useAuthStore();
// This causes re-renders on ANY state change
```

---

## Translation Pattern

### Adding Translations

1. Add keys to all languages in `constants/translations.ts`:

```typescript
export const translations = {
  en: {
    settings: {
      account: {
        title: 'Account',
        signOut: 'Sign Out',
      },
    },
  },
  de: {
    settings: {
      account: {
        title: 'Konto',
        signOut: 'Abmelden',
      },
    },
  },
  ru: {
    settings: {
      account: {
        title: 'Аккаунт',
        signOut: 'Выйти',
      },
    },
  },
  uk: {
    settings: {
      account: {
        title: 'Акаунт',
        signOut: 'Вийти',
      },
    },
  },
};
```

2. Use with the `t()` helper:

```typescript
import { t } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';

const translationLanguage = useSettingsStore((state) => state.translationLanguage);

<Text>{t('settings.account.title', translationLanguage)}</Text>
```

---

## Error Handling

### User-Facing Errors

```typescript
// ✅ Good - user-friendly messages
if (error) {
  Alert.alert(
    t('common.error', translationLanguage),
    t('errors.failedToLoad', translationLanguage)
  );
}

// ❌ Bad - technical messages
if (error) {
  Alert.alert('Error', error.message); // Shows "PGRST116: ..."
}
```

### Console Logging

Use prefixes for easy filtering:

```typescript
// ✅ Good
console.log('[Auth Service] User signed in:', user.id);
console.error('[Word Store] Failed to load words:', error);

// ❌ Bad
console.log('User signed in');
console.log(error);
```

### Try-Catch Patterns

```typescript
// ✅ Good - specific error handling
try {
  const result = await riskyOperation();
  return { data: result, error: null };
} catch (err) {
  console.error('[Service] Error:', err);
  return { data: null, error: 'Operation failed' };
}

// ❌ Bad - silent failures
try {
  await riskyOperation();
} catch {
  // Nothing
}
```

---

## Navigation

### Using Router

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// ✅ Good - type-safe routes
router.push('/(tabs)');
router.replace('/auth/login');
router.back();

// ❌ Bad - non-existent routes
router.push('/non-existent'); // TypeScript error
```

### Route Parameters

```typescript
// In app/history/[id].tsx
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Testing Checklist

When adding new features:

- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on Web browser
- [ ] Test with all UI languages (EN, DE, RU, UK)
- [ ] Test with all levels (beginner, intermediate, advanced)
- [ ] Test loading states
- [ ] Test error states (disconnect network)
- [ ] Test authentication flows
- [ ] Run `npm run lint`

---

## Common Pitfalls

### 1. Platform-Specific APIs

```typescript
// ❌ Bad - Alert.alert doesn't work on Web
Alert.alert('Title', 'Message');

// ✅ Good - platform check
if (Platform.OS === 'web') {
  window.confirm('Message');
} else {
  Alert.alert('Title', 'Message');
}
```

### 2. AsyncStorage on Web

```typescript
// ✅ Good - use the storage adapter
import { supabase } from '@/lib/supabase-client';
// Handles web/mobile automatically
```

### 3. Apple Sign In Mock Mode

```typescript
// Remember to disable mock mode in production
// .env:
EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=false
```

### 4. RLS Policies

```typescript
// Always test with authenticated users
// Queries fail without proper auth
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // Requires auth.uid() = userId
```

---

## Code Review Checklist

Before submitting code:

- [ ] No hardcoded colors/sizes (use design tokens)
- [ ] All text is translated (no hardcoded strings)
- [ ] Types are defined (no `any`)
- [ ] Loading and error states are handled
- [ ] Console logs use prefixes
- [ ] Platform differences are handled
- [ ] ESLint passes
- [ ] File naming follows conventions
- [ ] Comments are in English

---

**Last Updated:** 16.01.2026
**Status:** ✅ Active conventions
