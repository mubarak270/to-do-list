import React from 'react';
import { Download, RefreshCw, Sun, Moon, Cloud, CloudOff } from 'lucide-react';
import { UserSettings } from '../types';

interface AppHeaderProps {
  settings: UserSettings;
  isOnline: boolean;
  isSyncing: boolean;
  onToggleOnline: () => void;
  onManualSync: () => void;
  onToggleTheme: () => void;
  onOpenInstallModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  settings,
  isOnline,
  isSyncing,
  onToggleOnline,
  onManualSync,
  onToggleTheme,
  onOpenInstallModal,
}) => {
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
      {/* Brand & App Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs overflow-hidden">
          <img src="/pwa-192x192.png" alt="Icon" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
            Task Manager
          </h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            Modern To-Do & Planner
          </p>
        </div>
      </div>

      {/* Right Controls: Install APK, Sync, Theme */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Install App / APK Button */}
        <button
          id="header-install-pwa-btn"
          onClick={onOpenInstallModal}
          title="Install App / APK"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-200/80 dark:hover:bg-blue-900/60 text-xs font-bold shadow-2xs transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Install APK</span>
          <span className="xs:hidden">APK</span>
        </button>

        {/* Sync Button */}
        <button
          id="header-sync-btn"
          onClick={onManualSync}
          disabled={isSyncing || !isOnline}
          title="Google Drive Cloud Sync"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-xs font-bold transition-all ${
            isSyncing ? 'opacity-75' : ''
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Online / Offline status badge */}
        <button
          id="header-network-toggle-btn"
          onClick={onToggleOnline}
          title={isOnline ? 'Online mode (click to toggle offline)' : 'Offline mode (click to go online)'}
          className={`p-1.5 rounded-xl text-xs transition-colors ${
            isOnline
              ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          {isOnline ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          id="header-theme-toggle-btn"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
