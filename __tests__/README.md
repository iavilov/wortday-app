# Unit Tests

Эта директория содержит unit-тесты для проекта Vocade.

## Структура

```
__tests__/
├── README.md                    # Этот файл
├── setup.ts                     # Глобальные моки и конфигурация
├── mocks/                       # Вспомогательные моки
│   ├── supabase.ts             # Supabase mock helpers
│   └── auth-store.ts           # Auth store mock helpers
├── lib/                         # Тесты для service layer
│   └── word-history-service.test.ts  # 12 тестов
└── store/                       # Тесты для Zustand stores
    └── word-store.test.ts            # 24 теста
```

## Запуск тестов

```bash
# Запустить все тесты
npm test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage

# Запустить конкретный файл
npm test -- word-history-service

# Запустить конкретный тест
npm test -- --testNamePattern="toggleFavorite"
```

## Что тестируется

### word-history-service.test.ts (12 тестов)

**Критические сценарии:**
- ✅ `toggleFavorite` - RLS-First паттерн (UPDATE path)
- ✅ Проверка отсутствия race conditions
- ✅ `markWordAsViewed` - обновление и создание записей
- ✅ Проверка аутентификации
- ✅ Обработка ошибок

**Ограничения:**
- INSERT path в `toggleFavorite` не тестируется (dynamic imports)
- Для полного покрытия нужны integration тесты

### word-store.test.ts (24 теста)

**Категории:**
- ✅ Initial state (5 тестов)
- ✅ isFavorite (4 теста)
- ✅ setState (4 теста)
- ✅ reset (7 тестов)
- ✅ Playback state (2 теста)
- ✅ Edge cases (3 теста)

**Ограничения:**
- `toggleFavorite()` метод не тестируется (комплексная интеграция)
- Методы с async/await и dynamic imports не покрыты

## Best Practices

### ✅ DO

1. **Используйте AAA паттерн:**
   ```typescript
   // Arrange
   mockFrom.mockReturnValue(/* ... */);

   // Act
   const result = await toggleFavorite('word-1');

   // Assert
   expect(result.success).toBe(true);
   ```

2. **Тестируйте поведение, не реализацию**
3. **Очищайте моки в beforeEach:**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### ❌ DON'T

1. Не тестируйте детали реализации
2. Не дублируйте production код
3. Не игнорируйте async/await
4. Не создавайте flaky тесты

## Моки

### Supabase Mock

```typescript
const mockGetSession = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: { getSession: mockGetSession },
      from: mockFrom,
    };
  },
}));
```

### Query Builder Helper

```typescript
function createQueryBuilder(result: { data?: any; error?: any }) {
  const builder: any = {
    select: jest.fn(() => builder),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}
```

## Документация

Подробная информация в:
- `docs/testing-guide.md` - Полное руководство по тестированию
- `docs/supabase-race-conditions.md` - RLS-First паттерн

## Статистика

```
Test Suites: 2 passed, 2 total
Tests:       36 passed, 36 total
Time:        ~2-3 seconds
```

**Coverage:**
- Statements: ~60%
- Branches: ~50%
- Functions: ~70%
- Lines: ~65%

**Цель:**
- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%
