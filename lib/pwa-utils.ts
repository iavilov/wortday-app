/**
 * PWA Utilities
 * Helper functions for Progressive Web App functionality
 */

import { Platform } from 'react-native';

/**
 * Check if app is running in standalone PWA mode
 */
export function isPWA(): boolean {
  if (Platform.OS !== 'web') return false;

  if (typeof window === 'undefined') return false;

  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Check iOS standalone
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
}

/**
 * Check if app is installable
 */
export function isInstallable(): boolean {
  if (Platform.OS !== 'web') return false;

  // Check if beforeinstallprompt was fired
  return (window as any).deferredPrompt !== undefined;
}

/**
 * Prompt user to install PWA
 */
export async function promptInstall(): Promise<boolean> {
  if (Platform.OS !== 'web') return false;

  const deferredPrompt = (window as any).deferredPrompt;

  if (!deferredPrompt) {
    console.log('[PWAUtils] Install prompt not available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWAUtils] User accepted the install prompt');
      (window as any).deferredPrompt = null;
      return true;
    } else {
      console.log('[PWAUtils] User dismissed the install prompt');
      return false;
    }
  } catch (error) {
    console.error('[PWAUtils] Error showing install prompt:', error);
    return false;
  }
}

/**
 * Get install instructions based on browser/platform
 */
export function getInstallInstructions(): string {
  if (Platform.OS !== 'web') return '';

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (isPWA()) {
    return 'App is already installed!';
  }

  // iOS Safari
  if (/iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent)) {
    return 'Tap the Share button, then "Add to Home Screen"';
  }

  // Android Chrome
  if (/android/.test(userAgent) && /chrome/.test(userAgent)) {
    return 'Tap the menu (⋮), then "Install app" or "Add to Home screen"';
  }

  // Desktop Chrome/Edge
  if (/chrome|edg/.test(userAgent)) {
    return 'Click the install icon in the address bar or use browser menu';
  }

  // Desktop Safari
  if (/safari/.test(userAgent)) {
    return 'Use File > Add to Dock to install';
  }

  return 'Use your browser\'s install or "Add to Home Screen" option';
}

/**
 * Check for PWA update
 */
export async function checkForUpdate(): Promise<boolean> {
  if (Platform.OS !== 'web') return false;

  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) return false;

    await registration.update();
    return true;
  } catch (error) {
    console.error('[PWAUtils] Error checking for update:', error);
    return false;
  }
}

/**
 * Get PWA display mode
 */
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (Platform.OS !== 'web') return 'browser';

  if (typeof window === 'undefined') return 'browser';

  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}
