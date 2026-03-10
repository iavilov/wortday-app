# Система аутентификации — реализация

**Версия:** 0.9.0
**Последнее обновление:** 14.01.2026

---

## Обзор

Полная документация системы аутентификации Wortday с поддержкой Email/Password, Sign in with Apple (с mock-режимом) и Google Sign-In. Включает защищённые маршруты (Auth Guard), экраны аутентификации и полный процесс управления аккаунтом.

---

## Архитектура

### Компоненты системы

```
types/auth.ts              → TypeScript-типы и вспомогательные функции
lib/supabase-client.ts     → Supabase-клиент с AsyncStorage
lib/auth-service.ts        → Функции авторизации (signIn, signUp, Apple mock и т.д.)
store/auth-store.ts        → Zustand store + onAuthStateChange
app/_layout.tsx            → Auth Guard + setupAuthListener()
app/auth/login.tsx         → Экран входа (Email/Apple/Google)
app/auth/register.tsx      → Экран регистрации
app/auth/reset-password.tsx → Восстановление пароля
app/settings/account.tsx   → Интерфейс управления аккаунтом
```

---

## Поддерживаемые провайдеры

### 1. Email/Password

**Регистрация:**
```typescript
import { signUpWithEmail } from '@/lib/auth-service';

const { user, error } = await signUpWithEmail({
  email: 'user@example.com',
  password: 'secure-password',
  displayName: 'John Doe', // optional
});
```

**Вход:**
```typescript
import { signInWithEmail } from '@/lib/auth-service';

const { user, error } = await signInWithEmail({
  email: 'user@example.com',
  password: 'secure-password',
});
```

**Сброс пароля:**
```typescript
import { sendPasswordResetEmail } from '@/lib/auth-service';

const { success, error } = await sendPasswordResetEmail('user@example.com');
```

---

### 2. Sign in with Apple

**ВАЖНО: Apple предоставляет `fullName` ТОЛЬКО при первой аутентификации!**

**Mock-режим:** доступен для тестирования без Apple Developer аккаунта.

**Реализация:**
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from '@/lib/auth-service';

// 1. Get credential from Apple
const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});

// 2. Sign in via Supabase
const { user, error } = await signInWithApple({
  identityToken: credential.identityToken,
  fullName: credential.fullName,
  email: credential.email,
});
```

**Сохранение displayName (критически важно!):**
```typescript
// In lib/auth-service.ts
if (displayName && data.user) {
  // Delay to facilitate profile creation via trigger
  setTimeout(async () => {
    await supabase
      .from('users')
      .update({ display_name: displayName })
      .eq('id', data.user!.id);
    console.log('[Auth] Saved Apple display name:', displayName);
  }, 1000);
}
```

**Apple Private Relay:**
- Email выглядит как `***@privaterelay.appleid.com`
- Флаг `is_private_email` устанавливается автоматически через триггер
- В интерфейсе отображается бейдж «Private Email»

---

### 3. Google Sign-In

**OAuth-процесс:**
```typescript
import { signInWithGoogle } from '@/lib/auth-service';

// Get OAuth URL
const { url, error } = await signInWithGoogle();

if (url) {
  // Open browser for OAuth
  await WebBrowser.openAuthSessionAsync(url, redirectUrl);
}
```

**Deep Linking:**
Redirect URL настроены в Supabase Dashboard:
- `wortday://auth/callback` (мобильное приложение)
- `http://localhost:8081` (разработка)
- `https://wortday.com` (продакшн)

**Mock-режим (для разработки):**
```typescript
// .env
EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true

// lib/auth-service.ts
export const isAppleMockEnabled = () => {
  return process.env.EXPO_PUBLIC_APPLE_SIGN_IN_MOCK === 'true';
};

// When mock is enabled, a test user is created:
// Email: mock-apple-{timestamp}@privaterelay.appleid.com
// Password: auto-generated
// Display Name: 'Mock Apple User'
```

**Переход на продакшн:**
1. Получить Apple Developer аккаунт
2. Настроить App ID с возможностью Sign in with Apple
3. Добавить учётные данные в Supabase Dashboard
4. Установить `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=false`

---

## Экраны аутентификации

### Экран входа (`app/auth/login.tsx`)

**Возможности:**
- Поля Email/Password с валидацией
- Переключатель «Показать/Скрыть пароль»
- «Забыли пароль?» — переход к сбросу пароля
- «Continue with Apple» (только iOS, поддержка mock-режима)
- «Continue with Google» (OAuth-процесс)
- «Создать аккаунт» — переход на экран регистрации
- Дизайн в стиле Neobrutalism (borderRadius.LARGE для карточки)

**Валидация:**
```typescript
- Email: regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Password: minimum 6 characters
- Auto-redirect after successful login (Auth Guard)
```

### Экран регистрации (`app/auth/register.tsx`)

**Возможности:**
- Email/Password/Подтверждение пароля
- Валидация сложности пароля
- Проверка совпадения паролей
- Сообщение об успехе — переход на экран входа
- Ссылка «Уже есть аккаунт?»

**Валидация:**
```typescript
- Email format validation
- Password ≥ 6 characters
- Passwords must match
- Supabase email confirmation (optional)
```

### Сброс пароля (`app/auth/reset-password.tsx`)

**Процесс:**
1. Пользователь вводит email
2. Supabase отправляет magic link
3. Экран успеха с инструкциями
4. Пользователь нажимает на ссылку
5. Форма сброса пароля Supabase

**Платформозависимые редиректы:**
- Web: `{origin}/auth/reset-password`
- Mobile: `wortday://auth/reset-password`

---

## Auth Guard (защищённые маршруты)

### Реализация в `app/_layout.tsx`

**Логика приоритетов:**
```typescript
// Priority 1: Auth Guard
if (!isAuthenticated && !inAuthFlow) {
  router.replace('/auth/login'); // Block access
  return;
}

// Priority 2: Authenticated users shouldn't see auth screens
if (isAuthenticated && inAuthFlow) {
  router.replace('/(tabs)'); // Redirect to app
  return;
}

// Priority 3: Onboarding flow
if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
  router.replace('/onboarding');
  return;
}
```

**Конфигурация маршрутов:**
```typescript
<Stack>
  <Stack.Screen name="auth/login" />
  <Stack.Screen name="auth/register" />
  <Stack.Screen name="auth/reset-password" />
  <Stack.Screen name="onboarding" />
  <Stack.Screen name="(tabs)" />      // Protected
  <Stack.Screen name="settings" />    // Protected
  <Stack.Screen name="history" />     // Protected
</Stack>
```

**Автоматические редиректы:**
- Неавторизованный пользователь — `/auth/login`
- После входа — `/onboarding` (если не пройден)
- После onboarding — `/(tabs)`
- После выхода — `/auth/login`

---

## Схема базы данных

### Таблица `public.users`

**Важно:** это НЕ `auth.users`, а публичная таблица профилей.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK, связь с `auth.users.id` |
| `email` | TEXT | Может быть NULL (Apple) |
| `display_name` | TEXT | Имя пользователя (Apple — только 1 раз!) |
| `auth_provider` | TEXT | 'email' \| 'apple' \| 'google' |
| `is_private_email` | BOOLEAN | Apple Private Relay |
| `translation_language` | TEXT | 'ru' \| 'uk' \| 'en' \| 'de' |
| `language_level` | TEXT | 'beginner' \| 'intermediate' \| 'advanced' |
| `registration_date` | DATE | Дата регистрации |
| `notifications_enabled` | BOOLEAN | Уведомления включены |
| `notification_time` | TIME | Время уведомлений |

### Триггер: автоматическое создание профиля

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, display_name, is_private_email)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE WHEN NEW.email LIKE '%@privaterelay.appleid.com' THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Что делает триггер:**
1. Автоматически создаёт запись в `public.users` при регистрации
2. Извлекает `auth_provider` из `raw_app_meta_data`
3. Извлекает `display_name` из `raw_user_meta_data` (при наличии)
4. Определяет `is_private_email` по домену email

---

## Синхронизация состояния аутентификации

### Слушатель onAuthStateChange

**Инициализация в `app/_layout.tsx`:**
```typescript
import { setupAuthListener } from '@/store/auth-store';

useEffect(() => {
  const subscription = setupAuthListener();
  return () => subscription.unsubscribe();
}, []);
```

**Обрабатываемые события:**
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      setSession(session);
      // Delay for successful profile creation
      setTimeout(() => fetchProfile(), 500);
      break;

    case 'SIGNED_OUT':
      setSession(null);
      setProfile(null);
      break;

    case 'TOKEN_REFRESHED':
      setSession(session);
      break;

    case 'USER_UPDATED':
      setSession(session);
      await fetchProfile();
      break;

    case 'INITIAL_SESSION':
      if (session) {
        setSession(session);
        await fetchProfile();
      }
      break;
  }
});
```

### Структура хранилища

```typescript
interface AuthStore {
  user: User | null;              // Mapped from Supabase user
  session: Session | null;        // Supabase session
  profile: UserProfile | null;    // From public.users table
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}
```

---

## Удаление аккаунта (требование Apple)

**Требование Apple App Store:** приложение ОБЯЗАНО предоставлять возможность удаления аккаунта внутри приложения.

### RPC-функция

```sql
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete data in correct order
  DELETE FROM user_words_history WHERE user_id = current_user_id;
  DELETE FROM user_streaks WHERE user_id = current_user_id;
  DELETE FROM users WHERE id = current_user_id;

  -- Delete auth record (invalidates ALL tokens)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**SECURITY DEFINER** позволяет функции удалять запись из `auth.users` (в обход RLS).

### Реализация на клиенте

```typescript
const handleDeleteAccount = async () => {
  Alert.alert(
    t('account.deleteAccountConfirm', translationLanguage),
    t('account.deleteAccountWarning', translationLanguage),
    [
      { text: t('account.cancel', translationLanguage), style: 'cancel' },
      {
        text: t('account.delete', translationLanguage),
        style: 'destructive',
        onPress: async () => {
          const result = await deleteAccount();
          if (result.success) {
            router.replace('/onboarding');
          }
        },
      },
    ]
  );
};
```

---

## UI-компоненты

### AuthProviderBadge

Визуальная индикация провайдера аутентификации:

```typescript
function AuthProviderBadge({ provider, isPrivateEmail }: {
  provider: string;
  isPrivateEmail?: boolean
}) {
  const badgeConfig = {
    email: { Icon: Mail, bg: Colors.accentBlue, text: 'Email' },
    apple: { Icon: Apple, bg: '#000000', text: 'Apple ID' },
    google: { Icon: Chrome, bg: Colors.accentPink, text: 'Google' },
  };

  return (
    <View style={{ backgroundColor: config.bg }}>
      <config.Icon />
      <Text>{config.text}</Text>
      {isPrivateEmail && <Shield />}
    </View>
  );
}
```

### Платформозависимый интерфейс

```typescript
// Security section only for Email auth on Web
{canChangePassword(authProvider) && Platform.OS === 'web' && (
  <View>
    <BrutalButton onPress={handleChangePassword}>
      Change Password
    </BrutalButton>
    <BrutalButton onPress={handleChangeEmail}>
      Change Email
    </BrutalButton>
  </View>
)}

// Info for Apple/Google
{authProvider !== 'email' && (
  <Text>
    {authProvider === 'apple'
      ? 'Managed via Apple ID'
      : 'Managed via Google'}
  </Text>
)}
```

---

## Управление аккаунтом

### Процесс выхода из аккаунта

**Реализация в `app/settings/account.tsx`:**
```typescript
const handleSignOut = async () => {
  // Web: window.confirm (Alert.alert supports buttons only on mobile)
  if (Platform.OS === 'web') {
    const confirmed = window.confirm('Are you sure?');
    if (confirmed) {
      await signOut();
      router.replace('/auth/login');
    }
    return;
  }

  // iOS/Android: Native Alert
  Alert.alert('Sign Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign Out',
      onPress: async () => {
        await signOut();
        router.replace('/auth/login'); // Auth Guard will intercept
      },
    },
  ]);
};
```

**Что происходит:**
1. Пользователь нажимает «Выйти»
2. Подтверждение (зависит от платформы)
3. `supabase.auth.signOut()` — очистка сессии
4. `onAuthStateChange` — событие 'SIGNED_OUT'
5. Auth Guard — редирект на `/auth/login`

### Процесс удаления аккаунта

**Аналогичная логика с RPC:**
```typescript
const result = await deleteAccount(); // RPC: delete_user_account()
if (result.success) {
  router.replace('/auth/login');
}
```

---

## Row Level Security (RLS)

### Политики таблицы Users

```sql
-- SELECT: Only own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Only for self
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Only own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- DELETE: Only own profile
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);
```

---

## Тестирование

### Создание тестового пользователя

```typescript
// In Supabase Dashboard → Authentication → Users → Add User
// Email: test@wortday.com
// Password: test1234
```

### Тестовые сценарии

1. **Регистрация по Email:**
   - Регистрация — проверить создание профиля
   - Вход — проверить получение сессии
   - Выход — проверить очистку состояния

2. **Apple Sign In:**
   - Первый вход — `fullName` должен быть сохранён
   - Повторный вход — `fullName` уже в базе данных
   - Private Relay — бейдж отображается

3. **Обновление профиля:**
   - Изменить `translation_language`
   - Изменить `language_level`
   - Проверить сохранение в БД

4. **Удаление аккаунта:**
   - Удалить — проверить каскадное удаление
   - Попытка входа — должна вернуть ошибку

---

## Устранение неполадок

### fullName от Apple не сохраняется

**Проблема:** `display_name` в БД остаётся NULL после Apple Sign In.

**Решение:**
1. Убедиться, что запрашивается `AppleAuthenticationScope.FULL_NAME`
2. Увеличить задержку в `setTimeout()` до 1500 мс
3. Проверить логи: `console.log('[Auth] Saved Apple display name')`

### Сессия не обновляется автоматически

**Проблема:** интерфейс не обновляется после входа/выхода.

**Решение:**
1. Убедиться, что `setupAuthListener()` вызывается в `app/_layout.tsx`
2. Убедиться, что подписка не отменяется преждевременно
3. Проверить логи: `console.log('[Auth Event]:', event)`

### RLS блокирует запросы

**Проблема:** `new row violates row-level security policy`

**Решение:**
1. Убедиться, что `auth.uid()` возвращает корректный UUID
2. Убедиться, что политики созданы правильно
3. Временно отключить RLS для тестирования: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`

### Удаление аккаунта не работает

**Проблема:** ошибка при вызове `delete_user_account()`

**Решение:**
1. Убедиться, что функция создана с `SECURITY DEFINER`
2. Убедиться, что пользователь аутентифицирован: `auth.uid()` не NULL
3. Проверить каскадные ограничения в таблицах

---

## Чеклист для продакшна

### Экраны аутентификации и интерфейс
- [x] Экран входа (Email/Apple/Google)
- [x] Экран регистрации с валидацией
- [x] Процесс сброса пароля
- [x] Дизайн-токены Neobrutalism
- [x] Платформозависимый интерфейс (Web/iOS/Android)
- [x] Состояния загрузки
- [x] Обработка ошибок
- [x] Переводы (RU/UK/EN/DE)

### Auth Guard и маршрутизация
- [x] Защищённые маршруты в `_layout.tsx`
- [x] Автоматические редиректы
- [x] Синхронизация состояния аутентификации
- [x] Выход — `/auth/login`
- [x] Удаление аккаунта — `/auth/login`

### Apple Sign In
- [x] Mock-режим для разработки
- [x] Переменная окружения `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK`
- [ ] Apple Developer аккаунт ($99/год)
- [ ] App ID с возможностью Sign in with Apple
- [ ] Учётные данные в Supabase Dashboard
- [ ] Продакшн-режим (`MOCK=false`)

### Google OAuth
- [x] Реализация OAuth-процесса
- [x] WebBrowser для мобильных устройств
- [ ] Учётные данные Google Cloud Console
- [ ] Авторизованные redirect URI
- [ ] Учётные данные в Supabase Dashboard

### База данных и безопасность
- [x] Политики RLS
- [x] RPC-функция удаления аккаунта
- [x] Триггер автоматического создания профиля
- [ ] Подтверждение Email (в данный момент отключено)

### Развёртывание в продакшн
- [ ] Deep Linking протестирован на реальных устройствах
- [ ] События аналитики (signUp, signIn, signOut)
- [ ] Ссылки на Политику конфиденциальности и Условия использования
- [ ] Продакшн-сборки (iOS/Android)

---

## Полезные ссылки

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Apple Sign In Guidelines](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

---

**Последнее обновление:** 14.01.2026
**Версия:** 0.9.0 (Экраны аутентификации + Auth Guard)
**Статус:** Готово к тестированию, ожидаются учётные данные Apple/Google для продакшна
