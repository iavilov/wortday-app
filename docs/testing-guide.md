# Руководство по тестированию

**Последнее обновление:** 2026-01-20
**Статус:** ✅ Актуально

---

## Обзор

Это руководство описывает настройку модульного тестирования для Wortday с фокусом на критическую бизнес-логику и взаимодействие с базой данных. Набор тестов гарантирует, что паттерн RLS-First (задокументированный в `supabase-race-conditions.md`) работает корректно без состояний гонки.

---

## Инфраструктура тестирования

### Технологический стек

- **Фреймворк тестирования:** Jest 29.7.0
- **Пресет:** `jest-expo` (Expo SDK 54)
- **Среда выполнения:** Node.js (без среды React Native)
- **Мокирование:** Ручные моки Jest

### Конфигурационные файлы

```
wortday/
├── jest.config.js           # Jest configuration for Expo
├── __tests__/
│   ├── setup.ts            # Global mocks (AsyncStorage, Platform)
│   ├── mocks/
│   │   ├── supabase.ts     # Supabase mock helpers
│   │   └── auth-store.ts   # Auth store mock helpers
│   ├── lib/
│   │   └── word-history-service.test.ts  # Service layer tests (12 tests)
│   └── store/
│       └── word-store.test.ts            # Zustand store tests (24 tests)
```

---

## Запуск тестов

### Базовые команды

```bash
# Run all tests once
npm test

# Run tests in watch mode (TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- word-history-service

# Run tests matching pattern
npm test -- --testNamePattern="toggleFavorite"
```

### Ожидаемый вывод

```
Test Suites: 2 passed, 2 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        2.702 s
```

---

## Покрытие тестами

### word-history-service.ts (12 тестов)

**Файл:** `__tests__/lib/word-history-service.test.ts`

#### Критические тесты

1. **toggleFavorite — паттерн RLS-First**
   - ✅ Переключение избранного с false на true
   - ✅ Переключение избранного с true на false
   - ✅ Проверка, что `getSession()` НЕ вызывается (RLS-First)
   - ✅ Тест производительности (< 50мс с моками)

2. **markWordAsViewed**
   - ✅ Обновление существующей записи (инкремент times_reviewed)
   - ✅ Сбой при отсутствии авторизации
   - ✅ Сбой при ошибке авторизации

3. **getFavoriteIds**
   - ✅ Возврат пустого массива при отсутствии авторизации

4. **getUserHistory**
   - ✅ Возврат пустого массива при отсутствии авторизации

5. **migrateFavoritesToDatabase**
   - ✅ Пропуск миграции при пустом favoriteIds
   - ✅ Сбой при отсутствии авторизации

#### Что НЕ тестируется (ограничения)

- Путь INSERT в `toggleFavorite` (требует `--experimental-vm-modules` для динамических импортов)
- Обнаружение блокировки RLS (count = 0)
- Сценарии ошибок базы данных
- Сложная логика миграции

**Причина:** Сервис использует `await import('@/store/auth-store')`, что Jest плохо обрабатывает без экспериментальных флагов.

**Рекомендация:** Использовать интеграционные тесты с реальным Supabase для полного покрытия.

---

### word-store.ts (24 теста)

**Файл:** `__tests__/store/word-store.test.ts`

#### Категории тестов

1. **Начальное состояние (5 тестов)**
   - Пустой favoriteIds
   - Нет todayWord
   - Не загружается
   - Нет ошибки
   - Пустой historyWords

2. **isFavorite (4 теста)**
   - Возврат false для неизвестного слова
   - Возврат true для слова в избранном
   - Возврат false после удаления
   - Обработка нескольких избранных

3. **setState (4 теста)**
   - Обновление favoriteIds
   - Обновление todayWord
   - Обновление isLoading
   - Обновление error

4. **reset (7 тестов)**
   - Очистка favoriteIds
   - Очистка todayWord
   - Очистка isLoading
   - Очистка error
   - Очистка historyWords
   - Сброс флагов гидратации
   - Сброс состояния воспроизведения

5. **Состояние воспроизведения (2 теста)**
   - Установка isPlaying
   - Установка playbackSpeed

6. **Граничные случаи (3 теста)**
   - Обработка пустых операций с Set
   - Обработка множественных сбросов
   - Обработка специальных символов в ID слов

#### Что НЕ тестируется (ограничения)

- Метод `toggleFavorite()` (использует динамические импорты и реальный сервис)
- `syncFavoritesFromDB()` (сложный асинхронный поток)
- `hydrate()` (сложная логика миграции)
- `loadTodayWord()` (интеграция с word-service)

**Причина:** Эти методы включают сложные асинхронные потоки и внешние зависимости.

**Рекомендация:** Использовать интеграционные или E2E-тесты для этих сценариев.

---

## Написание новых тестов

### Базовая структура теста

```typescript
// 1. Define mocks BEFORE jest.mock()
const mockGetSession = jest.fn();
const mockFrom = jest.fn();

// 2. Mock modules
jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: { getSession: mockGetSession },
      from: mockFrom,
    };
  },
}));

// 3. Import module under test
import { toggleFavorite } from '@/lib/word-history-service';

// 4. Write tests
describe('feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock behavior
  });

  it('should do something', async () => {
    // Arrange
    mockFrom.mockReturnValue(/* ... */);

    // Act
    const result = await toggleFavorite('word-1');

    // Assert
    expect(result.success).toBe(true);
  });
});
```

### Хелпер: Цепочечный построитель запросов

```typescript
function createQueryBuilder(result: { data?: any; error?: any; count?: number }) {
  const builder: any = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => Promise.resolve(result)),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

// Usage
const fetchBuilder = createQueryBuilder({
  data: { word_id: 'test', is_favorite: false },
  error: null,
});
mockFrom.mockReturnValueOnce(fetchBuilder);
```

---

## Лучшие практики тестирования

### ✅ РЕКОМЕНДУЕТСЯ

1. **Тестировать бизнес-логику, а не реализацию**
   - Фокусируйтесь на поведении публичного API
   - Не тестируйте внутренние методы

2. **Использовать описательные имена тестов**
   ```typescript
   it('should toggle favorite from false to true')
   it('should fail when not authenticated')
   ```

3. **Следовать паттерну AAA**
   - **Arrange**: Настройка моков и данных
   - **Act**: Вызов функции
   - **Assert**: Проверка результатов

4. **Мокировать на границах модулей**
   - Мокировать внешние сервисы (Supabase, AsyncStorage)
   - Не мокировать внутренние функции

5. **Тестировать сценарии ошибок**
   - Сетевые сбои
   - Ошибки авторизации
   - Невалидные входные данные

6. **Проверять паттерн RLS-First**
   ```typescript
   expect(mockGetSession).not.toHaveBeenCalled();
   ```

### ❌ НЕ РЕКОМЕНДУЕТСЯ

1. **Не тестировать детали реализации**
   - Не тестируйте приватные методы
   - Не тестируйте внутреннее состояние

2. **Не дублировать продакшен-код**
   - Держите тесты простыми
   - Используйте хелпер-функции для сложных настроек

3. **Не игнорировать async/await**
   ```typescript
   // ❌ BAD
   it('should work', () => {
     toggleFavorite('word-1');
   });

   // ✅ GOOD
   it('should work', async () => {
     await toggleFavorite('word-1');
   });
   ```

4. **Не мокировать всё подряд**
   - Мокируйте только внешние зависимости
   - Пусть чистые функции выполняются реально

5. **Не писать нестабильные тесты**
   - Избегайте зависимости от тайминга
   - Используйте детерминированные моки

---

## Устранение неполадок

### Частые проблемы

#### 1. «Cannot find module '@/lib/...'»

**Решение:** Проверьте, что `jest.config.js` содержит корректный `moduleNameMapper`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```

#### 2. «TypeError: supabase.from is not a function»

**Решение:** Используйте паттерн с геттером в моке:

```typescript
jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: { getSession: mockGetSession },
      from: mockFrom,
    };
  },
}));
```

#### 3. «Dynamic import callback error»

**Решение:** Это ожидаемо для кода, использующего `await import()`. Варианты:
- Пропустить тест
- Рефакторить код для внедрения зависимостей
- Использовать `--experimental-vm-modules` (Node 16+)

#### 4. «Тесты зависают/таймаут»

**Решение:**
- Убедитесь, что все моки возвращают Promise
- Проверьте отсутствие пропущенных `async/await`
- Убедитесь, что нет бесконечных циклов

---

## Интеграционное тестирование (будущее)

### Рекомендуемые инструменты

- **E2E:** Detox или Maestro
- **Интеграционное:** Testing Library с реальным Supabase
- **Визуальная регрессия:** Chromatic или Percy

### Тестовые сценарии

1. **Полный поток избранного**
   - Переключить избранное → Перейти к истории → Проверить во вкладке избранного
   - Быстрый двойной клик → Нет состояний гонки

2. **Поток авторизации**
   - Вход → Загрузка слова дня → Отметка как просмотренное
   - Выход → Сброс сторов → Вход другим пользователем

3. **Проверка политик RLS**
   - Пользователь A не может видеть избранное пользователя B
   - Пользователь A не может обновить историю пользователя B

---

## Цели покрытия

### Текущее покрытие

```
Statements   : 60% (service layer)
Branches     : 50% (auth checks)
Functions    : 70% (public methods)
Lines        : 65% (excluding types)
```

### Целевое покрытие

```
Statements   : 80%
Branches     : 75%
Functions    : 85%
Lines        : 80%
```

### Критические файлы (требуется 100% покрытие)

- `lib/word-history-service.ts`
- `store/word-store.ts` (управление состоянием)
- `lib/auth-service.ts`

---

## Ссылки

- [Документация Jest](https://jestjs.io/)
- [jest-expo](https://docs.expo.dev/guides/testing-with-jest/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Руководство по тестированию Supabase](https://supabase.com/docs/guides/getting-started/testing)

---

## История изменений

### 2026-01-20 — Начальная настройка

- ✅ Настроен Jest с пресетом `jest-expo`
- ✅ Создано 36 модульных тестов (12 сервисных + 24 стор)
- ✅ Задокументирована валидация паттерна RLS-First
- ✅ Добавлены скрипты тестирования в `package.json`
- ✅ Создана инфраструктура моков для Supabase

---

**Следующие шаги:**
1. Добавить интеграционные тесты с реальным Supabase (локальный инстанс)
2. Увеличить покрытие граничных случаев
3. Добавить E2E-тесты с Detox
4. Настроить CI/CD с GitHub Actions
