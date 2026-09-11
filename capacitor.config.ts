import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanager.app',
  appName: 'To-Do List & Task Manager',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_name',
      iconColor: '#3B82F6',
      sound: 'beep.wav',
    },
  },
};

export default config;
