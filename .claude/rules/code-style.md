---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Стиль кода

## Именование файлов
- Компоненты: `PascalCase.tsx` (BrutalButton.tsx, WordCard.tsx)
- Сервисы/утилиты: `kebab-case.ts` (auth-service.ts, date-helpers.ts)
- Сторы: `kebab-case-store.ts` (auth-store.ts)
- Роуты: `kebab-case.tsx` (app/auth/login.tsx)

## Структура файла
1. React/RN импорты
2. Импорты типов (`import type`)
3. Константы и хелперы
4. Импорты компонентов
5. Props интерфейс
6. Компонент (State -> Hooks -> Effects -> Handlers -> Render)
