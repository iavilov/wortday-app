# Authentication System Implementation

**Version:** 0.9.0  
**Last Updated:** 14.01.2026

---

## 📋 Overview

Complete documentation of the Vocade authentication system supporting Email/Password, Sign in with Apple (with mock mode), and Google Sign-In. Includes protected routes (Auth Guard), auth UI screens, and a full account management flow.

---

## 🏗️ Architecture

### System Components

```
types/auth.ts              → TypeScript types and helpers
lib/supabase-client.ts     → Supabase client with AsyncStorage
lib/auth-service.ts        → Auth functions (signIn, signUp, Apple mock, etc.)
store/auth-store.ts        → Zustand store + onAuthStateChange
app/_layout.tsx            → Auth Guard + setupAuthListener()
app/auth/login.tsx         → Login screen (Email/Apple/Google)
app/auth/register.tsx      → Registration screen
app/auth/reset-password.tsx → Password reset flow
app/settings/account.tsx   → Account management UI
```

---

## 🔐 Supported Providers

### 1. Email/Password

**Registration:**
```typescript
import { signUpWithEmail } from '@/lib/auth-service';

const { user, error } = await signUpWithEmail({
  email: 'user@example.com',
  password: 'secure-password',
  displayName: 'John Doe', // optional
});
```

**Login:**
```typescript
import { signInWithEmail } from '@/lib/auth-service';

const { user, error } = await signInWithEmail({
  email: 'user@example.com',
  password: 'secure-password',
});
```

**Password Reset:**
```typescript
import { sendPasswordResetEmail } from '@/lib/auth-service';

const { success, error } = await sendPasswordResetEmail('user@example.com');
```

---

### 2. Sign in with Apple

**⚠️ CRITICAL FEATURE: Apple provides `fullName` ONLY on first authentication!**

**🧪 MOCK MODE:** A mock mode is available for testing without an Apple Developer account.

**Implementation:**
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

**Saving displayName (critical!):**
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
- Email looks like `***@privaterelay.appleid.com`
- `is_private_email` flag is automatically set by the trigger
- UI shows "Private Email" badge

---

### 3. Google Sign-In

**OAuth Flow:**
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
Redirect URLs configured in Supabase Dashboard:
- `vocade://auth/callback` (mobile)
- `http://localhost:8081` (dev)
- `https://vocade.app` (production)

**Mock Mode (for development):**
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

**Migration to Production:**
1. Get Apple Developer account
2. Configure App ID with Sign in with Apple
3. Add credentials to Supabase Dashboard
4. Set `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=false`

---

## 🎨 Auth Screens UI

### Login Screen (`app/auth/login.tsx`)

**Features:**
- Email/Password inputs with validation
- "Show/Hide Password" toggle
- "Forgot Password?" → Password Reset
- "Continue with Apple" (iOS only, mock support)
- "Continue with Google" (OAuth flow)
- "Create Account" → Register screen
- Neobrutalism design (borderRadius.LARGE for card)

**Validation:**
```typescript
- Email: regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Password: minimum 6 characters
- Auto-redirect after successful login (Auth Guard)
```

### Register Screen (`app/auth/register.tsx`)

**Features:**
- Email/Password/Confirm Password
- Password strength validation
- Passwords match check
- Success message → Login screen
- "Already have an account?" link

**Validation:**
```typescript
- Email format validation
- Password ≥ 6 characters
- Passwords must match
- Supabase email confirmation (optional)
```

### Password Reset (`app/auth/reset-password.tsx`)

**Flow:**
1. User enters email
2. Supabase sends magic link
3. Success screen with instructions
4. User clicks link
5. Supabase password reset form

**Platform-specific redirects:**
- Web: `{origin}/auth/reset-password`
- Mobile: `vocade://auth/reset-password`

---

## 🛡️ Auth Guard (Protected Routes)

### Implementation in `app/_layout.tsx`

**Priority Logic:**
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

**Route Configuration:**
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

**Automatic Redirects:**
- Unauthorized → `/auth/login`
- After login → `/onboarding` (if not completed)
- After onboarding → `/(tabs)`
- After logout → `/auth/login`

---

## 🗄️ Database Schema

### Table `public.users`

**Important:** This is NOT `auth.users`, but a public profiles table.

| Field | Type | Description |
|------|-----|----------|
| `id` | UUID | PK, link to `auth.users.id` |
| `email` | TEXT | Can be NULL (Apple) |
| `display_name` | TEXT | User name (Apple only 1 time!) |
| `auth_provider` | TEXT | 'email' \| 'apple' \| 'google' |
| `is_private_email` | BOOLEAN | Apple Private Relay |
| `translation_language` | TEXT | 'ru' \| 'uk' \| 'en' \| 'de' |
| `language_level` | TEXT | 'beginner' \| 'intermediate' \| 'advanced' |
| `registration_date` | DATE | Registration date |
| `notifications_enabled` | BOOLEAN | Notifications enabled |
| `notification_time` | TIME | Notification time |

### Trigger: Auto-create profile

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

**What the trigger does:**
1. Automatically creates a record in `public.users` upon registration
2. Extracts `auth_provider` from `raw_app_meta_data`
3. Extracts `display_name` from `raw_user_meta_data` (if available)
4. Determines `is_private_email` by email domain

---

## 🔄 Auth State Synchronization

### onAuthStateChange Listener

**Initialization in `app/_layout.tsx`:**
```typescript
import { setupAuthListener } from '@/store/auth-store';

useEffect(() => {
  const subscription = setupAuthListener();
  return () => subscription.unsubscribe();
}, []);
```

**Handled Events:**
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

### Store Structure

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

## 🗑️ Delete Account (Apple Requirement)

**Apple App Store Requirement:** The app MUST provide an option to delete the account within the app.

### RPC Function

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

**SECURITY DEFINER** allows the function to delete a record from `auth.users` (bypassing RLS).

### Client Implementation

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

## 🎨 UI Components

### AuthProviderBadge

Visual indication of the auth provider:

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

### Platform-Specific UI

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

## 🎯 Account Management

### Sign Out Flow

**Implementation in `app/settings/account.tsx`:**
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

**What happens:**
1. User presses "Sign Out"
2. Confirmation (platform-specific)
3. `supabase.auth.signOut()` → session clearance
4. `onAuthStateChange` → event 'SIGNED_OUT'
5. Auth Guard → redirect to `/auth/login`

### Delete Account Flow

**Similar logic with RPC:**
```typescript
const result = await deleteAccount(); // RPC: delete_user_account()
if (result.success) {
  router.replace('/auth/login');
}
```

---

## 🔒 Row Level Security (RLS)

### Users Table Policies

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

## 🧪 Testing

### Test User Creation

```typescript
// In Supabase Dashboard → Authentication → Users → Add User
// Email: test@vocade.app
// Password: test1234
```

### Test Scenarios

1. **Email Registration:**
   - Registration → check profile creation
   - Login → check session retrieval
   - Logout → check state clearance

2. **Apple Sign In:**
   - First login → `fullName` must be saved
   - Second login → `fullName` already in DB
   - Private Relay → badge is displayed

3. **Profile Update:**
   - Change `translation_language`
   - Change `language_level`
   - Check persistence in DB

4. **Delete Account:**
   - Delete → check cascade deletion
   - Login attempt → should error

---

## 🐛 Troubleshooting

### Apple fullName is not saving

**Issue:** `display_name` in DB remains NULL after Apple Sign In.

**Solution:**
1. Verify `AppleAuthenticationScope.FULL_NAME` is requested
2. Increase delay in `setTimeout()` to 1500ms
3. Check logs: `console.log('[Auth] Saved Apple display name')`

### Session does not update automatically

**Issue:** UI does not update after login/logout.

**Solution:**
1. Verify `setupAuthListener()` is called in `app/_layout.tsx`
2. Verify subscription does not unsubscribe prematurely
3. Check logs: `console.log('[Auth Event]:', event)`

### RLS blocks requests

**Issue:** `new row violates row-level security policy`

**Solution:**
1. Verify `auth.uid()` returns correct UUID
2. Verify policies are created correctly
3. Temporarily disable RLS for testing: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`

### DELETE account not working

**Issue:** Error when calling `delete_user_account()`

**Solution:**
1. Verify function created with `SECURITY DEFINER`
2. Verify user authenticated: `auth.uid()` not NULL
3. Verify cascade constraints in tables

---

## 📋 Production Checklist

### Auth Screens & UI ✅
- [x] Login screen (Email/Apple/Google)
- [x] Register screen with validation
- [x] Password reset flow
- [x] Neobrutalism design tokens
- [x] Platform-specific UI (Web/iOS/Android)
- [x] Loading states
- [x] Error handling
- [x] Translations (RU/UK/EN/DE)

### Auth Guard & Routing ✅
- [x] Protected routes in `_layout.tsx`
- [x] Automatic redirects
- [x] Auth state synchronization
- [x] Sign Out → `/auth/login`
- [x] Delete Account → `/auth/login`

### Apple Sign In 🔶
- [x] Mock mode for development
- [x] Environment variable `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK`
- [ ] Apple Developer account ($99/year)
- [ ] App ID with Sign in with Apple capability
- [ ] Credentials in Supabase Dashboard
- [ ] Production mode (`MOCK=false`)

### Google OAuth 🔶
- [x] OAuth flow implementation
- [x] WebBrowser for mobile
- [ ] Google Cloud Console credentials
- [ ] Authorized redirect URIs
- [ ] Credentials in Supabase Dashboard

### Database & Security ✅
- [x] RLS policies
- [x] Delete Account RPC function
- [x] Auto-create profile trigger
- [ ] Email Confirmation (currently disabled)

### Production Deploy ⏳
- [ ] Deep Linking tested on real devices
- [ ] Analytics events (signUp, signIn, signOut)
- [ ] Privacy Policy and Terms of Service links
- [ ] Production builds (iOS/Android)

---

## 🔗 Useful Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Apple Sign In Guidelines](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

---

**Last Updated:** 14.01.2026  
**Version:** 0.9.0 (Auth Screens + Auth Guard)  
**Status:** ✅ Ready for testing, ⏳ Pending Apple/Google credentials for production
