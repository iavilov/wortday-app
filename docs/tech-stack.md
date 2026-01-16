# Technology Stack

**Last Updated:** 16.01.2026
**Version:** 1.0.0

---

## Core Framework

### React Native & Expo

**React Native:** 0.81.5
**Expo SDK:** ~54.0.29
**TypeScript:** ~5.9.2

Vocade is built as a Universal App using Expo, supporting iOS, Android, and Web (PWA) from a single codebase.

**Why Expo:**
- Simplified development workflow
- Over-the-air updates
- Managed native modules
- Excellent TypeScript support
- Built-in tools for notifications, fonts, and more

---

## Navigation

### Expo Router

**Version:** ~6.0.19

File-based routing system inspired by Next.js. Routes are automatically generated from the `app/` directory structure.

**Key Features:**
- Type-safe navigation
- Deep linking support
- Layout nesting with `_layout.tsx` files
- Stack, Tabs, and Modal navigation patterns

**Related Dependencies:**
- `@react-navigation/native`: ~7.1.8
- `@react-navigation/bottom-tabs`: ~7.4.0
- `@react-navigation/elements`: ~2.6.3

---

## Backend & Database

### Supabase

**Package:** `@supabase/supabase-js` ^2.90.1

Open-source Firebase alternative providing:
- **Authentication** - Email/Password, Apple, Google OAuth
- **PostgreSQL Database** - With Row Level Security (RLS)
- **Real-time Subscriptions** - Live data updates (planned for v1.2.0)
- **Storage** - File storage for audio (planned for v1.1.0)

**Architecture:**
- Singleton client in `lib/supabase-client.ts`
- Service layer pattern (`lib/auth-service.ts`, `lib/word-service.ts`)
- AsyncStorage adapter for session persistence across platforms

---

## State Management

### Zustand

**Version:** ^5.0.9

Minimal, fast state management library. Chosen for:
- Simple API with hooks
- No boilerplate compared to Redux
- Built-in TypeScript support
- Async action support
- DevTools integration

**Stores:**
- `auth-store.ts` - Authentication state + Supabase sync
- `word-store.ts` - Word content + favorites
- `settings-store.ts` - User preferences with AsyncStorage persistence

**Storage Adapter:** `@react-native-async-storage/async-storage` ^2.2.0

---

## Styling

### NativeWind

**Version:** ^4.2.1
**Tailwind CSS:** ^3.4.19

Tailwind CSS for React Native, enabling utility-first styling with:
- Platform-specific styles
- Responsive design
- Dark mode support (future)
- Type-safe class names

**Design Tokens:**
All design values are centralized in `constants/design-tokens.ts`:
- Colors (Neobrutalism palette)
- Border radius, shadows, spacing
- Typography (IBM Plex Sans)

---

## Animation

### React Native Reanimated

**Version:** ~4.1.1

High-performance animations running on native thread:
- Layout transitions
- Shared element transitions (planned)
- Gesture-based interactions

**Related:**
- `react-native-gesture-handler` ~2.28.0 - Touch gesture support

---

## UI Components & Icons

### Lucide React Native

**Version:** ^0.561.0

Beautifully crafted open-source icons:
- 1000+ icons
- Consistent design
- Tree-shakable
- TypeScript support

**SVG Support:**
- `react-native-svg` ^15.15.1

---

## Typography

### IBM Plex Sans

**Package:** `@expo-google-fonts/ibm-plex-sans` ^0.4.1

Geometric sans-serif font family designed for clarity:
- **Weights Used:** Regular (400), Medium (500), SemiBold (600), Bold (700)
- Excellent readability in small sizes
- Supports Latin, Cyrillic, Greek characters
- Perfect for multilingual app (DE, EN, RU, UK)

**Font Loading:**
- `expo-font` ~14.0.10

---

## Platform-Specific Features

### iOS

**Apple Authentication:**
- `expo-apple-authentication` ^8.0.8
- Currently in mock mode for development
- Requires Apple Developer account for production

### Android & iOS Notifications

**Push Notifications:**
- `expo-notifications` ^0.32.15
- Local daily repeating notifications
- Customizable time settings
- Badge management

### Haptic Feedback

**Package:** `expo-haptics` ~15.0.8
- Touch feedback on buttons
- iOS only (gracefully degrades on Android)

---

## Media & Assets

### Audio (Planned)

**Audio Playback:**
- `expo-av` ^16.0.8
- For word pronunciation (future feature)

### Linear Gradients

**Package:** `expo-linear-gradient` ~15.0.8
- Background gradients
- Card effects

---

## Authentication & OAuth

### OAuth & Web Browser

**Web Browser:**
- `expo-web-browser` ~15.0.10
- For Google OAuth flow on mobile

**Linking:**
- `expo-linking` ~8.0.10
- Deep linking support for OAuth callbacks

---

## System Integration

### System UI

**Expo Packages:**
- `expo-status-bar` ~3.0.9 - Status bar styling
- `expo-system-ui` ~6.0.9 - System UI configuration
- `expo-constants` ~18.0.12 - App constants and config
- `expo-symbols` ~1.0.8 - SF Symbols for iOS

**Safe Areas:**
- `react-native-safe-area-context` ~5.6.0
- Handles notches, home indicators, etc.

**Screens:**
- `react-native-screens` ~4.16.0
- Native navigation performance

---

## Development Tools

### ESLint

**Package:** `eslint` ^9.25.0
**Config:** `eslint-config-expo` ~10.0.0

Expo's recommended ESLint configuration for React Native projects.

**Run Linter:**
```bash
npm run lint
```

### Babel

**Plugin:** `babel-plugin-transform-import-meta` ^2.3.3

Required for certain transformations in Expo projects.

---

## Dependencies Summary

### Production Dependencies (Key Packages)

```json
{
  "@supabase/supabase-js": "^2.90.1",
  "expo": "~54.0.29",
  "expo-router": "~6.0.19",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "zustand": "^5.0.9",
  "nativewind": "^4.2.1",
  "lucide-react-native": "^0.561.0",
  "@expo-google-fonts/ibm-plex-sans": "^0.4.1"
}
```

---

## Architecture Decisions

### Why Zustand over Redux?

- **Simpler API:** No actions, reducers, or dispatch boilerplate
- **Better TypeScript:** Automatic type inference
- **Smaller Bundle:** ~1KB vs 10KB+ for Redux
- **Async Support:** Built-in async actions without middleware

### Why Expo over bare React Native?

- **Faster Development:** Managed workflow with OTA updates
- **Cross-Platform:** Single codebase for iOS, Android, Web
- **Maintenance:** Expo team handles native dependencies
- **Future-Proof:** Easy ejection to bare workflow if needed

### Why Supabase over Firebase?

- **Open Source:** Self-hostable PostgreSQL
- **SQL Database:** Powerful queries vs NoSQL
- **RLS Policies:** Row-level security built-in
- **Better Privacy:** GDPR-compliant, EU hosting options
- **Cost:** More predictable pricing

### Why NativeWind over StyleSheet?

- **Consistency:** Same classes work on Web and Native
- **Productivity:** Utility-first approach speeds up development
- **Design System:** Easy to enforce design tokens
- **Responsive:** Built-in responsive utilities

---

**Last Updated:** 16.01.2026
**Status:** ✅ Production-ready stack
