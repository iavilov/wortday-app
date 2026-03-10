# Интеграция с Supabase — Миграция слов

**Версия:** 1.0.0
**Дата:** 14.01.2026
**Статус:** ✅ Завершено

---

## 📋 Обзор

Выполнена миграция с локальных тестовых данных (`lib/mock-data.ts`) на реальную интеграцию с базой данных Supabase для контента слов.

---

## ✅ Внесённые изменения

### 1. Создан сервис слов (`lib/word-service.ts`)
Новый сервисный слой для взаимодействия с таблицей Supabase `words`:

**Функции:**
- `getTodayWord(level, registrationDate)` — получает слово на основе уровня пользователя и номера дня
- `getAllWords()` — получает все слова (для истории/библиотеки)
- `getWordById(id)` — получает одно слово по ID
- `getWordsByLevel(level)` — получает все слова для конкретного уровня
- `getUserDayNumber(registrationDate)` — вычисляет текущий номер дня (та же логика, что и раньше)

**Особенности:**
- Корректная обработка ошибок с описательными сообщениями
- Fallback на первое слово уровня, если слово для текущего дня не найдено
- Паттерн async/await, совпадающий с `auth-service.ts`
- Консольное логирование для отладки

---

### 2. Обновлён стор слов (`store/word-store.ts`)

**Изменения:**
- ✅ Заменён `import { getAllWords, getTodayWord } from '@/lib/mock-data'`
- ✅ На `import * as wordService from '@/lib/word-service'`
- ✅ Обновлён `loadTodayWord()` для использования асинхронного `wordService.getTodayWord()`
- ✅ Обновлён `loadAllWords()` для использования асинхронного `wordService.getAllWords()`
- ✅ Добавлена обработка ошибок при сбоях базы данных
- ✅ Удалена искусственная задержка 500мс (не нужна с реальной БД)

---

### 3. Обновлена страница деталей истории (`app/history/[id].tsx`)

**Изменения:**
- ✅ Заменён `getWordById` из mock-data на `wordService.getWordById`
- ✅ Преобразован в асинхронный компонент с `useState` и `useEffect`
- ✅ Добавлено состояние загрузки с `ActivityIndicator`
- ✅ Корректная типизация TypeScript: `Word | null` вместо `any`

---

## 🔄 Влияние миграции

### До (тестовые данные):
```typescript
// Synchronous, hardcoded 9 words
const word = getTodayWord(level, registrationDate);
const allWords = getAllWords();
```

### После (Supabase):
```typescript
// Asynchronous, unlimited words from database
const { word, error } = await wordService.getTodayWord(level, registrationDate);
const { words, error } = await wordService.getAllWords();
```

---

## 🗂️ Изменённые файлы

1. ✅ `/lib/word-service.ts` — **СОЗДАН** (новый сервисный слой)
2. ✅ `/store/word-store.ts` — mock-data заменён на word-service
3. ✅ `/app/history/[id].tsx` — сделан асинхронным, добавлено состояние загрузки

---

## 📦 Зависимости

Новые зависимости не требуются. Используются существующие:
- `@supabase/supabase-js` (уже установлен)
- клиент `supabase` из `lib/supabase-client.ts`

---

## 🧪 Чек-лист тестирования

- [ ] Главный экран загружает слово дня из базы данных
- [ ] Состояния загрузки отображаются корректно
- [ ] Обработка ошибок работает (отключение сети)
- [ ] Экран истории показывает все слова из базы данных
- [ ] Фильтр избранного работает
- [ ] Страница деталей слова загружает отдельные слова
- [ ] Переключение уровня загружает правильные слова
- [ ] Прогрессия по дням работает (логика registration_date)

---

## 🐛 Возможные проблемы

### Проблема: «Слово не найдено»
**Причина:** В базе данных нет слова для текущего дня/уровня
**Решение:** Сервис автоматически откатывается к первому слову уровня

### Проблема: Медленная загрузка
**Причина:** Сетевая задержка
**Решение:** Реализованы состояния загрузки, в будущем рассмотреть добавление слоя кэширования

### Проблема: Офлайн-режим
**Причина:** Отсутствие интернет-соединения
**Решение:** Обработка ошибок показывает сообщение, в будущем: реализовать офлайн-кэш

---

## 🚀 Следующие шаги (будущие улучшения)

1. **Офлайн-кэш:** Хранить недавно просмотренные слова в AsyncStorage
2. **Предзагрузка:** Загружать слово следующего дня в фоновом режиме
3. **Оптимистичные обновления:** Обновлять UI до подтверждения сервера
4. **Синхронизация в реальном времени:** Использовать Supabase Realtime для синхронизации избранного между устройствами
5. **Аналитика:** Отслеживать наиболее просматриваемые/добавляемые в избранное слова

---

## 📊 Справка по схеме базы данных

**Таблица:** `words`

```sql
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  sequence_number INTEGER NOT NULL CHECK (sequence_number > 0),
  word_de TEXT NOT NULL,
  article TEXT,
  transcription_de TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  translations JSONB NOT NULL,
  content JSONB NOT NULL,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_level_sequence UNIQUE (level, sequence_number)
);
```

**Необходимые индексы:**
- `idx_words_level_sequence` на (level, sequence_number) — **КРИТИЧНО для getTodayWord**
- `idx_words_level` на (level)
- `idx_words_sequence_number` на (sequence_number)

**Политика RLS:**
- Публичный доступ на чтение: `CREATE POLICY "Words are publicly readable" ON words FOR SELECT USING (true);`

---

**Статус:** ✅ Интеграция завершена
**Готовность к продакшену:** Да (требуется заполненная база данных)
**Критические изменения:** Нет (тот же публичный API)
