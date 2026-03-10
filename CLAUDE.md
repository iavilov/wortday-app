# Wortday

## Проект

Приложение для изучения немецкого — «Слово дня».
Стек: React Native (Expo SDK 52), Supabase, Zustand, NativeWind.
Платформы: iOS, Android, Web (PWA).

## Язык

- Рассуждения и документация: русский
- Код и комментарии: английский

## Ключевые правила

- **Дизайн-токены** — `constants/design-tokens.ts` (цвета, размеры, шрифты)
- **Сервисный слой** — `lib/*-service.ts` (без прямых вызовов Supabase)
- **Переводы UI** — `t('key', lang)` из `constants/translations.ts`
- **Типы** — определять в `types/` (без inline интерфейсов)
- **Импорты** — алиас `@/`

## Документация

| Область | Файл |
|---------|------|
| Стандарты кода | `docs/coding-conventions.md` |
| Аутентификация | `docs/auth-flow.md` |
| Схема БД | `docs/database-schema.md` |
| Технический стек | `docs/tech-stack.md` |
| PWA | `docs/pwa-setup.md` |
| Дорожная карта | `docs/project-status.md` |

Читай соответствующий документ перед изменениями.
