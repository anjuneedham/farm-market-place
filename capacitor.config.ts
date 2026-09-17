import type { CapacitorConfig } from '@capacitor/cli';

/**
 * AgriLoop loads its live, fully server-rendered deployment remotely rather
 * than bundling a static export. The app uses Server Actions, cookie-based
 * sessions and per-request dynamic rendering throughout (marketplace search,
 * dashboards, admin) — none of that survives `next export`, so `server.url`
 * pointing at the real deployment is the only viable mode here, the same
 * mechanism a Trusted Web Activity uses under the hood. See
 * docs/PLAY_STORE_TESTING.md before building a release.
 *
 * AGRILOOP_APP_URL must be set to the real HTTPS deployment before building
 * — there is no fallback default on purpose, so a misconfigured build fails
 * loudly instead of silently shipping a placeholder.
 */
const deploymentUrl = process.env.AGRILOOP_APP_URL;
if (!deploymentUrl) {
  throw new Error(
    'AGRILOOP_APP_URL is not set. Export it to your live deployment URL ' +
      '(e.g. AGRILOOP_APP_URL=https://agriloop.example.com) before running ' +
      'any `cap` command. See docs/PLAY_STORE_TESTING.md.',
  );
}

const config: CapacitorConfig = {
  appId: 'com.agriloop.app',
  appName: 'AgriLoop',
  webDir: 'www',
  server: {
    url: deploymentUrl,
    androidScheme: 'https',
    // Session cookies must round-trip to the real domain — do not add a
    // custom scheme or a different host here.
    allowNavigation: [new URL(deploymentUrl).hostname],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#0d5138',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
