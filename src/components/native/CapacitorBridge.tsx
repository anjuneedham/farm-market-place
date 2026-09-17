'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Native-shell-only wiring, gated on `Capacitor.isNativePlatform()` so none
 * of it runs for a normal browser visitor — the same deployed pages serve
 * both (capacitor.config.ts loads the live site remotely rather than a
 * bundled build). Mounted once in the root layout.
 *
 * - Status bar colour matches the brand background instead of the OS default.
 * - The Android hardware/gesture back button follows the WebView's own
 *   navigation history (Next.js client-side routes push real history
 *   entries, so this "just works" for in-app navigation) and exits the app
 *   only once there is nowhere left to go back to.
 */
export function CapacitorBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setBackgroundColor({ color: '#0d5138' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return null;
}
