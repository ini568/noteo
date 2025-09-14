import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.noteo.app',
  appName: 'Noteo',
  webDir: 'dist',
  server: {
    // http (НЕ https), чтобы в деве не ловить mixed content
    androidScheme: 'http',
  },
};

export default config;
