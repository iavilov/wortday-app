# Wortday — AI Assistant Instructions

## Project

German learning app with "Word of the Day" micro-learning.
Stack: React Native (Expo SDK 52), Supabase, Zustand, NativeWind.
Platforms: iOS, Android, Web (PWA).

## Communication

- Reasoning & Explanations: Russian
- Code, Comments, Docs: English

## Key Constraints

- **No hardcoded values** — use `constants/design-tokens.ts` for colors/sizes/fonts
- **No direct Supabase** — use `lib/*-service.ts` service layer
- **No hardcoded text** — use `t('key', lang)` from `constants/translations.ts`
- **No `any` types** — use proper types from `types/`
- **No inline interfaces** — define in `types/` directory
- **Always handle** loading/error states
- **Always check** platform differences (iOS/Android/Web)
- **Always use** `@/` import alias

## Documentation

| Area | File |
|------|------|
| Coding standards | `docs/coding-conventions.md` |
| Auth system | `docs/auth-flow.md` |
| Database schema | `docs/database-schema.md` |
| Tech stack | `docs/tech-stack.md` |
| PWA setup | `docs/pwa-setup.md` |
| Project roadmap | `docs/project-status.md` |

Read the relevant doc before making changes to that area.
