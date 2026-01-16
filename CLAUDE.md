# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vocade** (also known as **Wort**) is an aesthetic German language learning companion built on the "Word of the Day" concept. It's a cross-platform React Native application (iOS, Android, Web) focused on micro-learning and visual appeal.

**Key Characteristics:**
- Neobrutalism design system with bold colors and sharp shadows
- Supabase backend for authentication and content
- Multilingual UI (English, German, Russian, Ukrainian)
- Level-based content (Beginner, Intermediate, Advanced)

## Documentation Structure

**This file serves as the main router. For detailed information, see:**

- `docs/project-status.md` - Project status, version history, and roadmap
- `docs/auth-flow.md` - Complete authentication system documentation
- `docs/database-schema.md` - Supabase database schema and RLS policies
- `docs/tech-stack.md` - Technology stack and dependencies
- `docs/coding-conventions.md` - React Native coding standards and patterns
- `docs/ai-workflow-guide.md` - Best practices for working with AI assistants

## 🗣️ Communication Rules
- **Chat Language:** Russian (Русский) — always explain your reasoning in Russian.
- **Code/Comments:** English — code, variables, and comments must be in English.
- **Tone:** Professional, concise, focused on solution.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific builds
npm run web       # Web development
npm run ios       # iOS simulator
npm run android   # Android emulator

# Code quality
npm run lint      # Run ESLint
```

## Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router for navigation with a file-based routing structure:

```
app/
├── _layout.tsx              # Root layout with Auth Guard
├── (tabs)/                  # Main tab navigation
│   ├── index.tsx           # Home (Word of the Day)
│   ├── history.tsx         # Learning history
│   └── settings.tsx        # Settings hub
├── auth/                    # Authentication flow
│   ├── login.tsx
│   ├── register.tsx
│   └── reset-password.tsx
├── settings/               # Settings screens
│   ├── account.tsx
│   ├── language.tsx
│   ├── level.tsx
│   └── notifications.tsx
└── onboarding.tsx          # First-time setup
```

### State Management (Zustand)

Three global stores manage application state:

1. **auth-store.ts** - Authentication state with Supabase session sync
   - `onAuthStateChange` listener for real-time updates
   - User profile from `public.users` table
   - Auth guard logic

2. **word-store.ts** - Word content and favorites
   - Integrates with `lib/word-service.ts` for Supabase queries
   - Calculates "today's word" based on registration date and level
   - Manages favorites (persisted to database)

3. **settings-store.ts** - User preferences
   - Language, level, notifications
   - Persisted to AsyncStorage
   - Synced with user profile in database

### Service Layer Pattern

All external data access goes through service layers:

- `lib/auth-service.ts` - Authentication operations (signIn, signUp, signOut, etc.)
- `lib/word-service.ts` - Word fetching from Supabase
- `lib/supabase-client.ts` - Singleton Supabase client with AsyncStorage adapter

**Never access Supabase directly from components** - always use service functions.

### Design System

The app follows a strict Neobrutalism design system defined in `constants/design-tokens.ts`:

- **Colors**: Defined in `palette` object, never use hardcoded hex values
- **Border Radius**: Use `borderRadius.LARGE` (20px) for cards, `borderRadius.MEDIUM` (12px) for buttons
- **Shadows**: Always use `shadows.brutal` variants (4px solid black shadows)
- **Typography**: IBM Plex Sans font family via `FontNames` constants
- **Layout**: `Layout.maxContentWidth = 432px` for all screens

**Key Design Tokens:**
```typescript
Colors.primary          // #FFE347 (yellow)
Colors.accentPink       // #FF6B9D
Colors.accentBlue       // #00D4FF
Colors.background       // #FFFCF4 (cream)
Colors.textMain         // #121212 (ink)
```

### Authentication Flow

**Auth Guard** in `app/_layout.tsx` enforces navigation rules:

1. Unauthenticated users → `/auth/login`
2. Authenticated users → Onboarding (if not completed)
3. After onboarding → Main app `/(tabs)`

**Supported Auth Methods:**
- Email/Password
- Sign in with Apple (currently in mock mode for development)
- Google OAuth

**Important:** Apple Sign In only provides `fullName` on first authentication. The app handles this with delayed profile updates (see `docs/auth-flow.md`).

## Key Technical Patterns

### Async Data Loading

All data fetching follows this pattern:

```typescript
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    const { data, error } = await service.fetchData();
    if (error) {
      setError(error);
    } else {
      setData(data);
    }
    setIsLoading(false);
  };
  loadData();
}, [dependency]);
```

Always show loading states with `ActivityIndicator` and handle errors gracefully.

### Platform-Specific Code

Use `Platform.OS` for platform-specific logic:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code (e.g., localStorage, window.confirm)
} else {
  // Mobile-specific code (e.g., AsyncStorage, Alert.alert)
}
```

### Translations

All user-facing text must be translated. Use the `t()` helper from `lib/i18n-helpers.ts`:

```typescript
import { t } from '@/lib/i18n-helpers';

const text = t('settings.account.title', userLanguage);
```

Translation keys are defined in `constants/translations.ts`.

## Database Schema

The app uses Supabase with the following key tables:

- `words` - German words with translations (JSONB), examples, etymology
- `users` - User profiles (linked to `auth.users`)
- `user_words_history` - Learning history and favorites
- `user_streaks` - Gamification data (future)

**Row Level Security (RLS)** is enabled on all tables. Users can only access their own data.

**Critical:** The `public.users` table is separate from `auth.users`. A trigger automatically creates user profiles on signup.

## Common Tasks

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/new-screen.tsx`)
2. Use `ScreenLayout` component for consistent styling
3. Add navigation in `app/_layout.tsx` if needed
4. Follow established patterns for loading states and error handling

### Adding a New Translation

1. Add key to all language objects in `constants/translations.ts`
2. Use `t()` helper function to access translations
3. Test in all supported languages

### Working with Supabase

1. Add types to appropriate file in `types/`
2. Create service function in `lib/word-service.ts` or `lib/auth-service.ts`
3. Update store if needed
4. Handle loading and error states in components

### Modifying the Database Schema

1. Update schema in Supabase Dashboard SQL Editor
2. Document changes in `docs/database-schema.md`
3. Update TypeScript types
4. Update service functions

## Critical Gotchas

1. **Apple Sign In fullName**: Only available on first auth. Must be saved immediately with delayed update pattern.

2. **Auth State Sync**: The `setupAuthListener()` must be initialized in `app/_layout.tsx`. Don't create multiple listeners.

3. **Word Sequencing**: Words are fetched by `level` + `sequence_number`, calculated from user's registration date. Not by calendar date.

4. **Platform Storage**: Web uses `localStorage`, mobile uses `AsyncStorage`. The Supabase client adapter handles this automatically.

5. **Design Tokens**: Never use raw hex colors or pixel values. Always use tokens from `constants/design-tokens.ts`.

6. **RLS Policies**: All database queries are subject to RLS. Test thoroughly with different users.

7. **Mock Mode**: Apple Sign In is currently in mock mode (`EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true`). Requires Apple Developer account for production.

## Environment Variables

Required environment variables (see `.env`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true  # Set to false in production
```

## Testing Notes

- Test authentication flows on all platforms (Web, iOS, Android)
- Verify Auth Guard redirects work correctly
- Test with different language levels and UI languages
- Check RLS policies by testing as different users
- Verify offline behavior (app should show errors gracefully)

## Current Status

**Version:** 1.0.0 (Supabase Words Integration)
**Status:** Production-ready with mock auth providers

**Next Priorities:**
1. Production Apple Sign In setup (requires Apple Developer account)
2. Google OAuth credentials configuration
3. Content population (1095+ words across 3 levels)
4. Audio pronunciation features

---

For detailed technical documentation, see files in `docs/` directory.
