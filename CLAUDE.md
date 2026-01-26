# CLAUDE.md

## 🚨 SESSION STARTUP PROTOCOL
**CRITICAL:** On every session start:
1. Check if `docs/memory.md` was provided in system prompt
2. If NOT → **IMMEDIATELY READ** `docs/memory.md` to understand project status
3. Use this context to inform your first response

## 🧠 Memory Persistence Protocol
**WHEN** user says "Финиш", "Done", "Save", or `/memory-save`:
1. **READ** current `docs/memory.md`
2. **SUMMARIZE** current session progress
3. **OVERWRITE** `docs/memory.md` with updated status
4. **CONFIRM** with: "✅ Memory updated. You can exit."

**Format:** Bullet points. Structure: "Latest Session", "Pending Tasks". Keep 2-3 recent sessions.

---

## 📁 Project Overview

**Wortday** - Aesthetic German learning app with "Word of the Day" micro-learning.

**Stack:**
- React Native (Expo SDK 52) + Web PWA
- Supabase (Auth, DB, Storage)
- Zustand (State), NativeWind (Styling)
- Neobrutalism design (IBM Plex Sans, brutal shadows)

**Platforms:** iOS, Android, Web (PWA at app.wortday.com)

---

## 🗣️ Communication Rules

- **Reasoning & Explanations:** Russian (Русский)
- **Code, Comments, Docs:** English
- **Tone:** Senior Engineer. Concise. No fluff.

---

## 📚 Documentation Map (Read for Details)

**Router docs (this file)** → Specialized docs:

| Doc | Purpose |
|-----|---------|
| `docs/memory.md` | Session history & pending tasks |
| `docs/project-status.md` | Roadmap & versioning |
| `docs/coding-conventions.md` | Code standards & patterns |
| `docs/auth-flow.md` | Auth system (Apple/Google/Email) |
| `docs/database-schema.md` | SQL schema & RLS policies |
| `docs/tech-stack.md` | Dependencies & versions |
| `docs/design-system.md` | UI patterns (Neobrutalism) |
| `docs/pwa-setup.md` | Service Worker & Web config |
| `docs/ai-workflow-guide.md` | Effective prompting patterns |

---

## 🏗️ Architecture Rules

### Service Layer (CRITICAL)
- **ALL** Supabase calls → `lib/*-service.ts` ONLY
- **NEVER** call Supabase directly from `app/` or `components/`
- **NEVER** expose `service_role` keys in client code
- Return pattern: `{ data: T | null, error: string | null }`

### Design System (CRITICAL)
- **Source of Truth:** `constants/design-tokens.ts`
- **NEVER** use hardcoded values: `#FFE347`, `borderRadius: 20`, `fontSize: 16`
- **ALWAYS** use: `Colors.primary`, `borderRadius.LARGE`, `FontNames.bold`

### State Management
- **Zustand stores:** `store/auth-store.ts`, `store/word-store.ts`, `store/settings-store.ts`
- **Selective subscriptions:** `const user = useAuthStore(s => s.user)` ✅
- **Avoid:** `const store = useAuthStore()` ❌ (causes unnecessary re-renders)

### Translations
- **ALL user-facing text** → `t('key', language)` from `constants/translations.ts`
- **NO hardcoded strings** in JSX/components

---

## ⚙️ Custom Skills (Slash Commands)

Use these for common workflows:

- `/memory-save` - Update docs/memory.md with current session
- `/project-status` - Show project overview & recent progress
- `/code-audit [file]` - Verify code follows conventions

Built-in Claude Code skills:
- `/plan` - Enter planning mode for complex features
- `/code-review` - Review recent changes
- `/tdd` - Test-driven development workflow

---

## 🛠️ Development Workflows

### Feature Development
```bash
npm start          # Metro bundler
npm run web        # Web/PWA dev
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

### Before Committing
```bash
npm run lint       # ESLint check
npm run typecheck  # TypeScript validation (if configured)
```

### Git Commits
- Prefix: `feat:`, `fix:`, `chore:`, `docs:`
- Example: `feat: add favorites to word history screen`

---

## 🚨 Critical Constraints

**DO NOT:**
- ❌ Hardcode colors, sizes, fonts (use design tokens)
- ❌ Call Supabase directly from components (use services)
- ❌ Use `any` type (use proper types or `unknown`)
- ❌ Add hardcoded English text (use translations)
- ❌ Use `Alert.alert` on Web (check `Platform.OS`)
- ❌ Create inline interfaces (define in `types/`)
- ❌ Skip loading/error states

**ALWAYS:**
- ✅ Read `docs/coding-conventions.md` before writing code
- ✅ Use `@/` import alias (`import { X } from '@/lib/Y'`)
- ✅ Add console logs with prefixes: `console.log('[Service Name] Message')`
- ✅ Handle loading states: `isLoading`, `error`, `data`
- ✅ Check platform differences: iOS vs Android vs Web
- ✅ Update `docs/memory.md` at end of session

---

## 📋 Quick Reference Links

**Before making changes, check:**
- `constants/design-tokens.ts` - Before styling
- `constants/translations.ts` - Before adding text
- `types/*.ts` - Before creating interfaces
- `docs/coding-conventions.md` - Before writing code

**After completing work:**
- Run `npm run lint`
- Update `docs/memory.md` (use `/memory-save`)
- Test on iOS, Android, Web

---

## 🎯 Success Metrics

You're following best practices when:
- ✅ AI-generated code passes lint without changes
- ✅ No hardcoded values (all use design tokens)
- ✅ All text uses translations
- ✅ Service layer consistently used
- ✅ TypeScript strict mode satisfied
- ✅ Documentation stays up-to-date

---

**Version:** 2.0
**Last Updated:** 2026-01-26
**Status:** ✅ Optimized for Claude Code workflow
