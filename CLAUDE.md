# Wortday

## Проект

Мобильное приложение для изучения немецкого — «Слово дня».
Целевые платформы: App Store (iOS) и Play Market (Android).
Сейчас Web (PWA) используется для тестирования.

- **Стек:** React Native (Expo SDK 52), Supabase, Zustand, NativeWind
- **Дизайн:** Neobrutalism (IBM Plex Sans, brutal shadows)
- **Платформы:** iOS, Android, Web (PWA — app.wortday.com)

## Язык

- Рассуждения и документация: русский
- Код и комментарии: английский
- Тон: Senior Engineer. Кратко. Без воды.

## Ключевые правила

- **Дизайн-токены** — `constants/design-tokens.ts` (цвета, размеры, шрифты)
- **Сервисный слой** — `lib/*-service.ts` (без прямых вызовов Supabase)
- **Переводы UI** — `t('key', lang)` из `constants/translations.ts`
- **Типы** — определять в `types/` (без inline интерфейсов)
- **Импорты** — алиас `@/`
- **Mobile-first** — ориентироваться на мобилки, Web для тестирования

## Документация

Читай перед изменениями в соответствующей области:

| Область | Файл |
|---------|------|
| Стандарты кода | `.claude/docs/coding-conventions.md` |
| Архитектура | `.claude/docs/tech-stack.md` |
| Аутентификация | `.claude/docs/auth-flow.md` |
| База данных | `.claude/docs/database-schema.md` |
| PWA | `.claude/docs/pwa-setup.md` |
| Дорожная карта | `.claude/docs/project-status.md` |
| Дизайн-токены | `constants/design-tokens.ts` |
| Переводы | `constants/translations.ts` |
| Типы | `types/*.ts` |

## Workflow

Следовать автоматически при работе над задачами:

| Этап | Файл | Когда |
|------|------|-------|
| Декомпозиция | `.claude/docs/workflow/writing-plans.md` | Новая фича, 3+ файлов |
| Ревью | `.claude/docs/workflow/review.md` | После плана, перед PR |
| Верификация | `.claude/docs/workflow/verification.md` | Перед коммитом фичи |

## Команды

```bash
npm start          # Metro bundler
npm run web        # Web/PWA
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run lint       # ESLint
npm test           # Jest unit tests
```

## Git

Префиксы: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
