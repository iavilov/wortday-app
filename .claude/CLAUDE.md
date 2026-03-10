# Wortday — Claude Code

## Язык

- **Рассуждения и документация:** русский
- **Код и комментарии:** английский
- **Тон:** Senior Engineer. Кратко. Без воды.

## Контекст

**Wortday** — приложение для изучения немецкого с «Словом дня».

- **Стек:** React Native (Expo SDK 52), Supabase, Zustand, NativeWind
- **Дизайн:** Neobrutalism (IBM Plex Sans, brutal shadows)
- **Платформы:** iOS, Android, Web (PWA — app.wortday.com)

## Карта документации

Читай перед изменениями в соответствующей области:

| Область | Файл |
|---------|------|
| Стандарты кода | `docs/coding-conventions.md` |
| Архитектура | `docs/tech-stack.md` |
| Аутентификация | `docs/auth-flow.md` |
| База данных | `docs/database-schema.md` |
| PWA | `docs/pwa-setup.md` |
| Дорожная карта | `docs/project-status.md` |
| Дизайн-токены | `constants/design-tokens.ts` |
| Переводы | `constants/translations.ts` |
| Типы | `types/*.ts` |

## Команды

```bash
npm start          # Metro bundler
npm run web        # Web/PWA
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run lint       # ESLint
```

## Git

Префиксы: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
