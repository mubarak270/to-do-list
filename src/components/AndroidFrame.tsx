import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Monitor, Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  onToggleOnline: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  onBackPress?: () => void;
  onHomePress?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  theme,
  isOnline,
  onToggleOnline,
  isSyncing,
  onManualSync,
  onBackPress,
  onHomePress
}) => {
  const [useFrame, setUseFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('8:09');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-800'} flex flex-col items-center justify-start p-0 md:py-6 md:px-4`}>
      {/* Top Desktop Controls Bar (for web preview switching) */}
      <header className="w-full max-w-md hidden md:flex items-center justify-between py-2 px-4 mb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold tracking-tight text-slate-700 dark:text-slate-200">Android 14 Material UI</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline toggle */}
          <button
            id="toggle-network-status-btn"
            onClick={onToggleOnline}
            title={isOnline ? "Online (Click to simulate Offline mode)" : "Offline (Click to go Online)"}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${
              isOnline ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
            }`}
          >
            {isOnline ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {/* Sync status */}
          <button
            id="quick-sync-btn"
            onClick={onManualSync}
            disabled={isSyncing || !isOnline}
            title="Google Drive Sync"
            className={`flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 ${
              isSyncing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Device frame switch */}
          <button
            id="toggle-frame-mode-btn"
            onClick={() => setUseFrame(!useFrame)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80"
          >
            {useFrame ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Monitor className="w-3.5 h-3.5 text-blue-500" />}
            <span>{useFrame ? 'Mobile' : 'Full'}</span>
          </button>
        </div>
      </header>

      {/* Main Container / Phone Bezel */}
      <div
        className={`w-full transition-all duration-300 ${
          useFrame
            ? 'max-w-[430px] sm:h-[890px] h-[100dvh] rounded-none sm:rounded-[44px] shadow-2xl border-0 sm:border-[8px] sm:border-slate-800/90 dark:sm:border-slate-700/60 overflow-hidden flex flex-col relative'
            : 'max-w-4xl min-h-[90vh] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden'
        } ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      >
        {/* Android Status Bar (Shown in both modes for authentic app look) */}
        <div className={`w-full flex items-center justify-between px-5 pt-2.5 pb-1 text-[13px] font-semibold select-none z-30 ${
          isDark ? 'text-slate-200 bg-slate-900' : 'text-slate-700 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <span>{currentTime}</span>
            <span className="text-[10px] opacity-70 bg-slate-200/50 dark:bg-slate-800/60 px-1 py-0.5 rounded">4G</span>
          </div>

          {/* Camera Notch on Mobile Bezel */}
          <div className="hidden sm:block w-3.5 h-3.5 rounded-full bg-black/40 border border-white/10"></div>

          <div className="flex items-center gap-1.5 text-xs">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-medium">44%</span>
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dynamic App Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android 3-Button Navigation Bar at bottom (matching screenshot) */}
        {useFrame && (
          <div className={`w-full h-8 flex items-center justify-around px-8 select-none z-30 transition-colors ${
            isDark ? 'bg-slate-900 border-t border-slate-800/50 text-slate-400' : 'bg-slate-50 border-t border-slate-200/60 text-slate-400'
          }`}>
            <button
              id="android-nav-recent-btn"
              onClick={onHomePress}
              className="p-2 hover:text-blue-500 active:scale-95 transition-transform"
              title="Recent apps"
            >
              {/* Android Recents III icon */}
              <div className="flex items-center gap-[3px]">
                <span className="w-[3px] h-3.5 bg-current rounded-xs"></span>
                <span className="w-[3px] h-3.5 bg-current rounded-xs"></span>
                <span className="w-[3px] h-3.5 bg-current rounded-xs"></span>
              </div>
            </button>

            <button
              id="android-nav-home-btn"
              onClick={onHomePress}
              className="p-2 hover:text-blue-500 active:scale-95 transition-transform"
              title="Home"
            >
              {/* Android Home Circle icon */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current"></div>
            </button>

            <button
              id="android-nav-back-btn"
              onClick={onBackPress}
              className="p-2 hover:text-blue-500 active:scale-95 transition-transform"
              title="Back"
            >
              {/* Android Back chevron icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
