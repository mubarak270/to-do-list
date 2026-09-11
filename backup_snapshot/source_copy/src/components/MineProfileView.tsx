import React, { useRef } from 'react';
import {
  User, Cloud, RefreshCw, Download, Upload, Shield, Cake,
  Award, CheckCircle2, ChevronRight, Settings, Plus, Sparkles, Smartphone
} from 'lucide-react';
import { Task, BirthdayCountdown, UserSettings } from '../types';
import { storage } from '../utils/storage';
import { getDaysRemaining } from '../utils/dateUtils';

interface MineProfileViewProps {
  settings: UserSettings;
  tasks: Task[];
  countdowns: BirthdayCountdown[];
  onOpenSyncModal: () => void;
  onNavigateToSettings: () => void;
  onOpenAddCountdown: () => void;
  onDataImported: () => void;
  onOpenInstallModal?: () => void;
}

export const MineProfileView: React.FC<MineProfileViewProps> = ({
  settings,
  tasks,
  countdowns,
  onOpenSyncModal,
  onNavigateToSettings,
  onOpenAddCountdown,
  onDataImported,
  onOpenInstallModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && storage.importBackupJson(content)) {
        alert('Data successfully restored from backup!');
        onDataImported();
      } else {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 pb-20">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-5 shadow-sm border border-slate-300 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={settings.googleDrive.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-850">
              ✓
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {settings.googleDrive.name || 'Android User'}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {settings.googleDrive.email || 'mhshow79@gmail.com'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-300 dark:border-blue-800">
                Google Account Active
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onNavigateToSettings}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Open Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Google Drive Cloud Sync Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/25 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold">Google Drive Cloud Sync</h3>
              <p className="text-xs font-medium text-blue-100">
                {settings.googleDrive.lastSyncTime
                  ? `Last synced: ${settings.googleDrive.lastSyncTime}`
                  : 'Automatic backup active'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSyncModal}
            className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold shadow-xs active:scale-95 transition-all"
          >
            Sync Now
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold backdrop-blur-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold backdrop-blur-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportBackup}
          />
        </div>
      </div>

      {/* Install App / APK Card */}
      {onOpenInstallModal && (
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-sm border border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Install Mobile App (APK)
              </h4>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Install directly on your phone as a standalone app
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInstallModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      )}

      {/* Birthday & Important Date Countdowns */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-sm border border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Cake className="w-4 h-4 text-rose-500" />
            Important Date Countdowns
          </h3>
          <button
            onClick={onOpenAddCountdown}
            className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="space-y-2">
          {countdowns.map((cd) => {
            const daysLeft = getDaysRemaining(cd.date);
            return (
              <div
                key={cd.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎂</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {cd.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{cd.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {daysLeft >= 0 ? `${daysLeft} D` : `${Math.abs(daysLeft)} D ago`}
                  </span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                    {daysLeft === 0 ? 'Today!' : daysLeft > 0 ? 'Remaining' : 'Passed'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-3.5 shadow-xs border border-slate-300 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
            ✓
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {completedCount}
            </span>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Completed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-2xl p-3.5 shadow-xs border border-slate-300 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              7 Days
            </span>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Productivity Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};
