import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mewdoku.app',
  appName: 'MewDoku',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
