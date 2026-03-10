# Документация по настройке PWA

## Обзор

Wortday настроен как Progressive Web App (PWA) с полной поддержкой офлайн-режима и возможностью установки на мобильные и настольные устройства.

## Возможности

- **Режим Standalone**: Запуск без элементов интерфейса браузера (адресная строка, кнопки навигации)
- **Поддержка офлайн-режима**: Service Worker кеширует ресурсы и ответы API
- **Установка**: Можно установить на домашний экран или рабочий стол
- **Опыт, как в нативном приложении**: Полноэкранный режим с ощущением нативного приложения
- **Быстрая загрузка**: Агрессивное кеширование для мгновенной загрузки
- **Автообновления**: Автоматическое обновление Service Worker с уведомлением пользователя

## Структура файлов

```
wortday/
├── public/
│   ├── index.html           # Custom HTML with PWA meta tags
│   ├── manifest.json        # PWA manifest configuration
│   ├── service-worker.js    # Service worker for offline support
│   ├── icon-144.png        # App icon 144x144
│   ├── icon-192.png        # App icon 192x192 (minimum for Android)
│   ├── icon-384.png        # App icon 384x384
│   ├── icon-512.png        # App icon 512x512 (for splash screen)
│   └── favicon.png         # Browser favicon
├── lib/
│   └── pwa-utils.ts        # PWA helper functions
├── hooks/
│   └── usePWA.ts           # React hook for PWA functionality
└── components/
    └── PWAInstallBanner.tsx # Install prompt UI component
```

## Конфигурация

### Настройки Manifest

Файл `manifest.json` определяет поведение приложения после установки:

- **Display Mode**: `standalone` (скрывает интерфейс браузера)
- **Orientation**: `portrait` (приоритет мобильных устройств)
- **Theme Color**: `#6BCF7F` (зелёный цвет Wortday)
- **Background Color**: `#FFFAF0` (кремовый фон)
- **Иконки**: Несколько размеров для разных платформ
- **Shortcuts**: Быстрый доступ к «Слову дня» и Истории

### Стратегия Service Worker

Service Worker использует различные стратегии кеширования:

1. **Статические ресурсы** (Cache First):
   - HTML, CSS, JavaScript
   - Изображения, шрифты, иконки
   - Отдаются из кеша, обновляются в фоне

2. **Вызовы API** (Network First):
   - Supabase REST API (`/rest/v1/`)
   - Supabase Auth API (`/auth/v1/`)
   - Предпочтение свежим данным, кеш как запасной вариант

3. **Runtime Cache**:
   - Динамический контент кешируется по мере обращения
   - Очищается при обновлении Service Worker

### Meta-теги

Пользовательский `index.html` включает специфичные для PWA meta-теги:

```html
<!-- Standalone mode -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- Status bar styling -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Theme color -->
<meta name="theme-color" content="#6BCF7F" />

<!-- Prevent pull-to-refresh -->
<style>
  body { overscroll-behavior-y: contain; }
</style>
```

## Использование

### Установка PWA

**iOS (Safari):**
1. Откройте app.wortday.com в Safari
2. Нажмите кнопку «Поделиться» (квадрат со стрелкой)
3. Прокрутите вниз и нажмите «На экран «Домой»»
4. Нажмите «Добавить»

**Android (Chrome):**
1. Откройте app.wortday.com в Chrome
2. Нажмите меню (⋮)
3. Нажмите «Установить приложение» или «Добавить на главный экран»
4. Нажмите «Установить»

**Десктоп (Chrome/Edge):**
1. Откройте app.wortday.com
2. Нажмите иконку установки в адресной строке
3. Или через меню > «Установить Wortday»
4. Нажмите «Установить»

### Использование PWA-компонентов

#### Баннер установки PWA

Добавьте на любой экран для предложения установки:

```tsx
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

export default function HomeScreen() {
  return (
    <View>
      <PWAInstallBanner />
      {/* Rest of your content */}
    </View>
  );
}
```

#### Хук usePWA

Доступ к состоянию и функциям PWA:

```tsx
import { usePWA } from '@/hooks/usePWA';

export default function SettingsScreen() {
  const { isPWA, isInstallable, isOnline, hasUpdate, install, checkForUpdate } = usePWA();

  return (
    <View>
      {isPWA && <Text>Running as installed app</Text>}
      {isInstallable && (
        <Button onPress={install} title="Install App" />
      )}
      {!isOnline && <Text>Offline mode</Text>}
      {hasUpdate && (
        <Button onPress={() => window.location.reload()} title="Update Available" />
      )}
    </View>
  );
}
```

#### Утилиты PWA

Прямые вспомогательные функции:

```tsx
import { isPWA, promptInstall, shareContent, getDisplayMode } from '@/lib/pwa-utils';

// Check if running as PWA
if (isPWA()) {
  console.log('Running in standalone mode');
}

// Share content
await shareContent({
  title: 'Wortday',
  text: 'Check out this German learning app!',
  url: 'https://app.wortday.com'
});

// Get display mode
const mode = getDisplayMode(); // 'standalone', 'browser', etc.
```

## Тестирование

### Локальное тестирование

1. Соберите веб-версию:
   ```bash
   npm run build:web
   ```

2. Запустите с HTTPS (обязательно для Service Worker):
   ```bash
   npx serve dist -s -l 8080 --ssl-cert cert.pem --ssl-key key.pem
   ```

3. Откройте в браузере и проверьте:
   - Регистрацию Service Worker в DevTools > Application
   - Manifest в DevTools > Application > Manifest
   - Появление предложения установки
   - Работу офлайн-режима (DevTools > Network > Offline)

### Тестирование на продакшене

1. Разверните на app.wortday.com (Vercel обеспечивает HTTPS)
2. Откройте в различных браузерах и на устройствах
3. Протестируйте установку на каждой платформе
4. Проверьте работу в офлайн-режиме
5. Проверьте обновления Service Worker

### DevTools

**Chrome DevTools > Application:**
- Service Workers: просмотр активного воркера, принудительное обновление
- Manifest: валидация manifest.json
- Storage: просмотр кешированных ресурсов
- Clear Site Data: сброс состояния PWA

**Lighthouse:**
- Запуск PWA-аудита
- Проверка критериев устанавливаемости
- Верификация поддержки офлайн-режима
- Валидация manifest

## Устранение неполадок

### Предложение установки не появляется

**Причины:**
- Приложение уже установлено
- Сайт не обслуживается по HTTPS
- Невалидный manifest
- Service Worker не зарегистрирован
- Пользователь недавно отклонил предложение

**Решения:**
- Проверьте DevTools > Console на наличие ошибок
- Провалидируйте manifest.json
- Очистите данные браузера и перезагрузите страницу
- Протестируйте в режиме инкогнито

### Service Worker не обновляется

**Причины:**
- Браузер кеширует старый воркер
- Не вызван skipWaiting()
- Пользователь не перезагрузил страницу

**Решения:**
- Принудительная перезагрузка (Ctrl+Shift+R)
- Снятие регистрации воркера в DevTools
- Обновление CACHE_NAME в service-worker.js
- Использование «Update on reload» в DevTools

### Офлайн-режим не работает

**Причины:**
- Service Worker не зарегистрирован
- Ресурсы не добавлены в precache
- Неправильная стратегия кеширования

**Решения:**
- Проверьте статус Service Worker в DevTools
- Убедитесь в корректности списка PRECACHE_ASSETS
- Протестируйте через DevTools > Network > Offline
- Проверьте кеш в разделе Application

### Иконки не отображаются

**Причины:**
- Некорректные пути в manifest
- Иконки отсутствуют в папке public/
- Неправильные размеры иконок

**Решения:**
- Убедитесь, что пути к иконкам указаны относительно корня (/)
- Проверьте наличие иконок в public/
- Используйте корректные размеры (192x192, 512x512)
- Провалидируйте через DevTools > Manifest

## Производительность

### Влияние стратегии кеширования

- **Первая загрузка**: ~2-3 сек (сеть)
- **Последующие загрузки**: <500 мс (кеш)
- **Офлайн**: <100 мс (только кеш)

### Размер кеша

- **Precache**: ~5-10 МБ (бандл приложения + ресурсы)
- **Runtime Cache**: максимум ~50 МБ
- **Очистка при обновлении**: старые кеши удаляются автоматически

### Лучшие практики

1. **Минимизируйте Precache**: кешируйте только критические ресурсы
2. **Используйте Runtime Cache**: кеширование по запросу
3. **Установите лимиты кеша**: предотвращение неконтролируемого роста
4. **Регулярные обновления**: поддерживайте Service Worker актуальным

## Безопасность

### Требование HTTPS

Функции PWA требуют HTTPS (кроме localhost):
- Service Workers
- Push Notifications
- Geolocation API
- Доступ к камере/микрофону

### Content Security Policy

При необходимости добавьте в index.html:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               connect-src 'self' https://gsobjkutscaubnbiffsn.supabase.co">
```

### Область действия Service Worker

Service Worker привязан к корню (`/`):
- Контролирует все страницы
- Не может контролировать родительские директории
- Может быть ограничен параметром `scope` при регистрации

## Планы на будущее

### Push Notifications

1. Добавить запрос разрешения Push API
2. Сохранить подписку на push-уведомления в базе данных
3. Отправлять уведомления с бэкенда
4. Обработать клики по уведомлениям в Service Worker

### Background Sync

1. Ставить в очередь неудавшиеся API-запросы
2. Повторять при восстановлении соединения
3. Показывать уведомления об успехе/неудаче

### Periodic Background Sync

1. Обновлять кеш слов в фоне
2. Предзагружать слово на завтра
3. Синхронизировать прогресс обучения

### Share Target

Возможность делиться контентом с приложением Wortday:

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

## Ресурсы

- [Документация PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox) — продвинутая библиотека для Service Worker
- [PWA Builder](https://www.pwabuilder.com/) — тестирование и валидация PWA
