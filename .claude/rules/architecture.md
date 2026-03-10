---
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
  - "components/**/*.tsx"
  - "lib/**/*.ts"
  - "store/**/*.ts"
---

# Правила архитектуры

## Сервисный слой
- Все вызовы Supabase ТОЛЬКО через `lib/*-service.ts`
- Никогда не вызывать Supabase из `app/` или `components/`
- Паттерн ответа: `{ data: T | null, error: string | null }`

## Дизайн-система
- Источник: `constants/design-tokens.ts`
- Запрещено хардкодить цвета, размеры, шрифты
- Использовать: `Colors.*`, `borderRadius.*`, `FontNames.*`

## Состояние (Zustand)
- Сторы: `store/auth-store.ts`, `store/word-store.ts`, `store/settings-store.ts`
- Селективные подписки: `const user = useAuthStore(s => s.user)`
- Запрещено: `const store = useAuthStore()` (лишние ре-рендеры)

## Переводы
- Весь UI текст через `t('key', language)` из `constants/translations.ts`
- Никаких хардкод строк в JSX

## Импорты
- Алиас `@/`: `import { X } from '@/lib/Y'`
- `import type { X }` для импорта только типов

## Платформа
- `Alert.alert` не работает на Web — проверять `Platform.OS`
- Логи с префиксами: `console.log('[ServiceName] ...')`
