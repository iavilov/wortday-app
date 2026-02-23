# Wortday — Claude Code Project Instructions

## Communication

- **Reasoning & Explanations:** Russian (Русский)
- **Code, Comments, Docs:** English
- **Tone:** Senior Engineer. Concise. No fluff.

## Project Context

**Wortday** — Aesthetic German learning app with "Word of the Day" micro-learning.

- **Stack:** React Native (Expo SDK 52), Supabase, Zustand, NativeWind
- **Design:** Neobrutalism (IBM Plex Sans, brutal shadows)
- **Platforms:** iOS, Android, Web (PWA at app.wortday.com)

## Documentation Map

Read these before making changes to the relevant area:

| Area | File | Purpose |
|------|------|---------|
| Code standards | `docs/coding-conventions.md` | Patterns, naming, typing |
| Architecture | `docs/tech-stack.md` | Stack decisions & rationale |
| Auth | `docs/auth-flow.md` | Apple/Google/Email auth system |
| Database | `docs/database-schema.md` | SQL schema, RLS policies |
| PWA | `docs/pwa-setup.md` | Service Worker, Web config |
| Roadmap | `docs/project-status.md` | Versions, milestones |
| Design tokens | `constants/design-tokens.ts` | Colors, fonts, sizes |
| Translations | `constants/translations.ts` | All UI text |
| Types | `types/*.ts` | Shared interfaces |

## Development Commands

```bash
npm start          # Metro bundler
npm run web        # Web/PWA dev
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run lint       # ESLint check
```

## Git Convention

Prefix: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
