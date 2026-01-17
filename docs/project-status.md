# 📱 Vocade - "Wort des Tages" (Word of the Day)

**Concept:** Aesthetic German language trainer focusing on micro-learning and visual appeal.  
**Target Audience:** Russian-speaking expats and students (A1-C1) who appreciate design.  
**Platforms:** iOS, Android, Web (PWA) — Universal App on React Native + Expo.

---

## 🚀 Current Status: v1.0.1 (Stability & Fixes)
**Last Updated:** 17.01.2026

### Key Achievements v1.0.0:

#### Supabase Words Integration (NEW)
✅ **Real Database Integration:**
- Full migration from mock-data to Supabase `words` table
- Word Service (`lib/word-service.ts`) for database interactions
- Asynchronous word loading with error handling
- Loading states for all screens

✅ **Updated Components:**
- `store/word-store.ts` - uses `word-service` instead of mock-data
- `app/history/[id].tsx` - async loading with loading state
- Fallback to the first word of the level if no word is found for the current day

✅ **Production Ready:**
- Unlimited number of words (sequence_number: 1, 2, 3, ..., ∞)
- Proper error handling and logging
- TypeScript typing for all requests

**📄 Detailed Documentation:** See `docs/supabase-words-integration.md`

---

### Key Achievements v1.0.1:

#### Stability & UI Improvements
✅ **No Data Flickering:**
- Implemented `reset()` methods for all stores
- Proper cleanup on logout prevents showing previous user's data

✅ **Smoother Auth Flow:**
- Improved `AuthGuard` in `_layout.tsx` to wait for profile loading
- Added proper loading indicators during auth initialization

✅ **Optimistic UI:**
- Instant feedback when toggling favorites
- Validated with direct store subscription in components

---

### Key Achievements v0.9.0:

#### Auth Screens & Protected Routes (NEW)
✅ **Login/Register/Reset Screens:**
- Login screen with Email/Password, Apple, Google
- Register screen with password validation
- Password Reset flow with email magic link
- Neobrutalism design (fully based on tokens)

✅ **Auth Guard (Protected Routes):**
- Automatic blocking of unauthorized users
- Redirect to `/auth/login` for all protected routes
- Priority logic: Auth → Onboarding → Main App
- Sign Out → Login screen

✅ **Apple Sign In Mock Mode:**
- Environment variable `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true`
- Testing without an Apple Developer account
- Auto-generated mock users
- Easy migration to production

✅ **Google OAuth:**
- WebBrowser integration for mobile
- OAuth flow for Web
- Deep linking callbacks (ready for configuration)

**📄 Detailed Documentation:** See `docs/auth-flow.md`

**New Files:**
```
app/auth/login.tsx         - Login UI (Email/Apple/Google)
app/auth/register.tsx      - Registration form
app/auth/reset-password.tsx - Password reset flow
.env.example               - Environment variables template
```

---

### Key Achievements v0.8.0:

#### Authorization System (Auth System)
✅ **Multi-Provider Authentication:**
- Email/Password — standard authentication
- Sign in with Apple — iOS (Apple requirement)
- Google Sign-In — OAuth flow

✅ **Supabase Integration:**
- Supabase Client with AsyncStorage for cross-platform sessions
- Automatic token refresh
- Auth State Synchronization via `onAuthStateChange`

✅ **Account Management UI:**
- Cross-platform Settings → Account screen
- Auth Provider Badge (Email/Apple/Google visual indication)
- Platform-specific UI (Security section only for Email on Web)
- Delete Account function (Apple App Store requirement)
- Export Data (GDPR compliance)

✅ **Database Schema:**
- `public.users` table with user profiles
- Auto-create profile trigger on registration
- RLS policies for data security
- RPC function `delete_user_account()` with SECURITY DEFINER

**📄 Detailed Documentation:** See `docs/auth-flow.md`

**Files:**
```
types/auth.ts              - TypeScript types and helpers
lib/supabase-client.ts     - Singleton Supabase client
lib/auth-service.ts        - Auth functions (signIn, signUp, signOut, etc.)
store/auth-store.ts        - Zustand store + onAuthStateChange
app/settings/account.tsx   - Account screen UI
```

---

### Key Achievements v0.7.0:

#### 1. Sequence-Based Words (Linear Word System)
- `sequence_number` (1, 2, 3, ..., ∞) instead of cyclical `day_number`
- Scalability: unlimited number of words

#### 2. Push Notifications (iOS/Android)
- `expo-notifications` with local daily repeating triggers
- Notification time settings
- Settings persistence

---

### Project Architecture (Current)

```
vocade/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx            # Word of the Day (Home)
│   │   ├── history.tsx          # History/Word Library
│   │   ├── settings.tsx         # Main Settings
│   │   └── _layout.tsx          # Tab Bar configuration
│   ├── settings/
│   │   ├── account.tsx          # Account (NEW v0.8.0)
│   │   ├── language.tsx         # Interface Language Selection
│   │   ├── level.tsx            # Difficulty Level Selection
│   │   ├── notifications.tsx    # Notification Settings
│   │   └── _layout.tsx          # Transition Animations
│   ├── onboarding.tsx           # Initial Setup
│   └── _layout.tsx              # Root Stack + AuthStateListener
├── components/ui/
│   ├── brutal-button.tsx        # Buttons with Neobrutalism style
│   ├── screen-header.tsx        # Screen Header
│   ├── screen-layout.tsx        # Screen Wrapper
│   └── ...
├── constants/
│   ├── design-tokens.ts         # Colors, shadows, radii
│   └── translations.ts          # UI Translations + account section
├── lib/
│   ├── supabase-client.ts       # Supabase client
│   ├── auth-service.ts          # Auth functions
│   ├── word-service.ts          # Word functions for DB (NEW v1.0.0)
│   ├── storage.ts               # Universal storage wrapper
│   ├── notifications.ts         # Push notifications
│   └── ...
├── store/
│   ├── auth-store.ts            # Auth state
│   ├── settings-store.ts        # User settings
│   └── word-store.ts            # Words + Favorites (UPDATED v1.0.0)
├── types/
│   ├── auth.ts                  # Auth types
│   ├── word.ts                  # Word interface
│   └── settings.ts              # Settings types
├── docs/
│   ├── project-status.md        # Project Documentation (UPDATED v1.0.0)
│   ├── auth-flow.md             # Auth Documentation
│   ├── supabase-words-integration.md # Words integration guide (NEW v1.0.0)
│   ├── database-schema.md       # Supabase DB Schema
│   ├── tech-stack.md            # Technology stack (NEW v1.0.0)
│   └── coding-conventions.md    # React Native coding standards (NEW v1.0.0)
└── .env                         # Environment variables
```

---

## 🛠️ What Works (v1.0.0)

### Functionality:
✅ **Supabase Words** — real data from DB (NEW v1.0.0)  
✅ **Word Service** — asynchronous word loading (NEW v1.0.0)  
✅ **Unlimited Content** — unlimited number of words (NEW v1.0.0)  
✅ **Supabase Auth** — Email, Apple, Google  
✅ **Account Management** — profile, sign out, delete account  
✅ **Auth State Sync** — automatic state updates  
✅ **Onboarding Flow** — initial setup  
✅ **Level System** — word difficulty selection (beginner/intermediate/advanced)  
✅ **Multilingualism** — full localization in RU, UK, EN, DE  
✅ **Push Notifications** — iOS/Android daily reminders  
✅ **Favorites** — add/remove words  

### UI/UX:
✅ **Auth Provider Badge** — visual indication for Email/Apple/Google (NEW v0.8.0)  
✅ **Platform-specific UI** — different elements for Web/iOS (NEW v0.8.0)  
✅ **Neobrutalism Design** — consistent style  
✅ **Animations** — smooth transitions  
✅ **Haptic Feedback** — tactile feedback on iOS  

### Technical:
✅ **Word Service** — service layer for DB interactions (NEW v1.0.0)  
✅ **Async Data Loading** — loading states for all screens (NEW v1.0.0)  
✅ **Supabase Client** — with AsyncStorage for sessions  
✅ **Auth Store** — Zustand with onAuthStateChange  
✅ **Word Store** — Zustand with real-time database sync (UPDATED v1.0.0)  
✅ **TypeScript** — full typing  
✅ **Expo Router** — file-based navigation  
✅ **NativeWind v4** — Tailwind CSS for RN  

---

## 🐛 Known Issues

### Current Limitations:
✅ ~~Mock Data~~ — **SOLVED in v1.0.0**: Integration with Supabase  
⚠️ **Apple Sign In** — mock mode (Apple Developer account required for production)  
⚠️ **Google OAuth** — requires configuration in Google Cloud Console  
⚠️ **Email Confirmation** — disabled in Supabase for quick testing  
⚠️ **No Audio** — word pronunciation not implemented  
⚠️ **No Offline Cache** — internet required to load words  

---

## 🎯 Roadmap

### v0.8.0 — Auth System + Account Management ✅ COMPLETED
- [x] Supabase Client with AsyncStorage
- [x] Auth Store with onAuthStateChange listener
- [x] Auth Service (signIn, signUp, signOut, deleteAccount)
- [x] Types for auth (User, UserProfile, AuthProvider)
- [x] Account Screen with platform-specific UI
- [x] Delete Account (Apple requirement)
- [x] Auth Provider Badge component
- [x] Translations for account section
- [x] Updated DB schema (docs/database-schema.md)

---

### v0.9.0 — Auth Screens ✅ COMPLETED
- [x] Login screen (Email/Password, Apple, Google)
- [x] Register screen with validation
- [x] Password reset flow
- [x] Protected routes (auth guard in `_layout.tsx`)
- [x] Apple Sign In mock mode
- [x] Google OAuth integration
- [x] Sign Out/Delete Account → `/auth/login`
- [x] Translations for auth section (RU/UK/EN/DE)
- [x] Platform-specific UI (Web: window.confirm, Mobile: Alert)
- [x] Deep linking structure for OAuth callbacks

---

### v1.0.0 — Supabase Words Integration ✅ COMPLETED
- [x] Word Service for DB interaction
- [x] Migration mock-data → Supabase
- [x] Async loading with error handling
- [x] Loading states for all screens
- [x] TypeScript typing for all requests
- [x] Fallback logic (first word of the level)
- [x] Updated documentation

---

### v1.0.1 — Stability & Fixes ✅ COMPLETED
- [x] Fixed "Auth session missing" error on login screen
- [x] Fixed user data flickering on logout/login (store reset)
- [x] Implemented proper loading state during auth initialization
- [x] Added Optimistic UI updates for Favorites (instant heart toggle)

---

### v1.1.0 — Production Auth Setup (Priority 1)
- [ ] Apple Developer account + setup
- [ ] Google Cloud Console OAuth credentials
- [ ] Email Confirmation in Supabase
- [ ] Populated database: 1095+ words (365+ × 3 levels)

---

### v1.2.0 — Enhanced Features
- [ ] Real-time favorites sync via Supabase Realtime
- [ ] Offline mode with local cache (AsyncStorage)
- [ ] Prefetching the next word
- [ ] User words history (user_words_history table)

---

### v1.1.0 — Audio & Media
- [ ] TTS integration for pronunciation
- [ ] Caching audio files
- [ ] Supabase Storage for media

---

### v1.2.0 — Gamification
- [ ] Streak system
- [ ] Achievements (badges)
- [ ] Progress statistics

---

## 🔧 Development

### Environment Variables:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Apple Sign In Mock (for testing)
EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true  # false in production
```

### Running the project:
```bash
npm install
npm run web    # Web
npm run ios    # iOS
npm run android # Android
```

### Creating tables in Supabase:
1. Open Supabase Dashboard → SQL Editor
2. Execute SQL from `docs/database-schema.md` in order:
   - Step 1: Tables
   - Step 2: Indexes
   - Step 3: RLS Policies
   - Step 4: Functions & Triggers

---

## 🔗 Technologies

**Core:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.2

**Backend:**
- Supabase (Auth, Database, RLS)
- @supabase/supabase-js 2.x

**State:**
- Zustand 5.0.9 (auth-store, settings-store, word-store)
- @react-native-async-storage/async-storage

**UI:**
- NativeWind v4 (Tailwind CSS)
- react-native-reanimated 4.1.1
- lucide-react-native (icons)

**Navigation:**
- Expo Router 6.0.19

---

**Last Updated:** 17.01.2026
**Version:** 1.0.1 (Stability & Fixes)
**Status:** ✅ Production ready - highly stable
**Next Milestone:** v1.1.0 — Apple/Google OAuth production credentials + Content population

---

## 📚 Documentation Structure

The project documentation is organized in the following files:

- **CLAUDE.md** (root) - Main router for Claude Code with quick reference
- **docs/project-status.md** - This file: project history, status, and roadmap
- **docs/auth-flow.md** - Complete authentication system documentation
- **docs/database-schema.md** - Supabase database schema and RLS policies
- **docs/tech-stack.md** - Technology stack and architecture decisions
- **docs/coding-conventions.md** - React Native coding standards and patterns
- **docs/supabase-words-integration.md** - Words service integration guide
- **docs/ai-workflow-guide.md** - Best practices for AI collaboration
