---
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
  - "components/**/*.tsx"
  - "lib/**/*.ts"
  - "store/**/*.ts"
---

# Architecture Rules

## Service Layer (CRITICAL)
- ALL Supabase calls go through `lib/*-service.ts` ONLY
- NEVER call Supabase directly from `app/` or `components/`
- NEVER expose `service_role` keys in client code
- Return pattern: `{ data: T | null, error: string | null }`

## Design System (CRITICAL)
- Source of truth: `constants/design-tokens.ts`
- NEVER hardcode: `#FFE347`, `borderRadius: 20`, `fontSize: 16`
- ALWAYS use: `Colors.primary`, `borderRadius.LARGE`, `FontNames.bold`

## State Management
- Zustand stores: `store/auth-store.ts`, `store/word-store.ts`, `store/settings-store.ts`
- Selective subscriptions: `const user = useAuthStore(s => s.user)`
- NEVER: `const store = useAuthStore()` (causes unnecessary re-renders)

## Translations
- ALL user-facing text uses `t('key', language)` from `constants/translations.ts`
- NO hardcoded strings in JSX/components

## Imports
- Use `@/` alias: `import { X } from '@/lib/Y'`
- Use `import type { X }` for type-only imports

## Error Handling
- Always handle loading states: `isLoading`, `error`, `data`
- Console logs with prefixes: `console.log('[Service Name] Message')`
- Platform check before `Alert.alert` (not available on Web)

## Types
- Define interfaces in `types/` directory, not inline
- Never use `any` — use proper types or `unknown`
