import React, { useState } from 'react';
import {
  Bell, Palette, Calendar, Lock, MessageSquare, Shield,
  AlertCircle, RefreshCw, CheckCircle2, ChevronRight,
  ExternalLink, Moon, Sun, Smartphone, Check, Cloud
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenSyncModal: () => void;
  onOpenAppLockSetup: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenSyncModal,
  onOpenAppLockSetup
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'disclaimer' | 'feedback' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleFirstDayChange = (firstDayOfWeek: 'sunday' | 'monday') => {
    onUpdateSettings({ ...settings, firstDayOfWeek });
  };

  const handleNotificationToggle = () => {
    onUpdateSettings({
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setActiveModal(null);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 pb-20">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preferences, backup & security
        </p>
      </div>

      {/* Account Sync Card (matching screenshot 1 top prominent card with cloud sync bubble) */}
      <div
        id="settings-account-sync-btn"
        onClick={onOpenSyncModal}
        className="relative bg-white dark:bg-slate-850 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between group overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Account Sync
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.googleDrive.connected
                ? `Connected: ${settings.googleDrive.email}`
                : 'Sync with Google Drive & backup tasks'}
            </p>
          </div>
        </div>

        {/* Floating Cloud Sync Icon Bubble (matching screenshot 1) */}
        <div className="w-10 h-10 rounded-2xl bg-teal-400/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
          <Cloud className="w-5 h-5" />
        </div>
      </div>

      {/* Customize Section (matching screenshot 1) */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
          Customize
        </h3>

        <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Notification & Reminder */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Notification & Reminder
                </span>
                <p className="text-[10px] text-slate-400">
                  Daily reminders, chime sound & ringtone
                </p>
              </div>
            </div>
            <button
              id="toggle-notifications-btn"
              onClick={handleNotificationToggle}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Theme
                </span>
                <p className="text-[10px] text-slate-400 capitalize">
                  Current: {settings.theme}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  id={`theme-btn-${mode}`}
                  onClick={() => handleThemeChange(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    settings.theme === mode
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* First Day of Week */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  First Day of week
                </span>
                <p className="text-[10px] text-slate-400 capitalize">
                  {settings.firstDayOfWeek}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                id="firstday-sun-btn"
                onClick={() => handleFirstDayChange('sunday')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  settings.firstDayOfWeek === 'sunday'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Sunday
              </button>
              <button
                id="firstday-mon-btn"
                onClick={() => handleFirstDayChange('monday')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  settings.firstDayOfWeek === 'monday'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Monday
              </button>
            </div>
          </div>

          {/* Set App Lock */}
          <div
            id="open-app-lock-setup-btn"
            onClick={onOpenAppLockSetup}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Set app lock
                </span>
                <p className="text-[10px] text-slate-400">
                  {settings.pinLockEnabled ? 'Protected with 4-digit PIN' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>{settings.pinLockEnabled ? 'Enabled' : 'Off'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feedback */}
          <div
            id="open-feedback-modal-btn"
            onClick={() => setActiveModal('feedback')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Feedback
                </span>
                <p className="text-[10px] text-slate-400">
                  Share suggestions or report an issue
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* About Section (matching screenshot 1) */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
          About
        </h3>

        <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Privacy Policy */}
          <div
            id="open-privacy-policy-btn"
            onClick={() => setActiveModal('privacy')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Disclaimer */}
          <div
            id="open-disclaimer-btn"
            onClick={() => setActiveModal('disclaimer')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Disclaimer
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Version (matching screenshot 1: Version: 1.03.15) */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Version: 1.03.15
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Latest
            </span>
          </div>
        </div>
      </div>

      {/* Modals for Privacy, Disclaimer, Feedback */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            {activeModal === 'privacy' && (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Privacy Policy
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-60 overflow-y-auto">
                  Your privacy is of utmost importance. To-Do List & Task Manager stores all your tasks, checklists, notes, attachments, and settings locally on your device or in your personal Google Drive account. We do not sell or track your personal task data. All data transfers to Google Drive are encrypted via HTTPS.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Understood
                  </button>
                </div>
              </>
            )}

            {activeModal === 'disclaimer' && (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Disclaimer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This task manager app is designed to help you organize daily routines, personal schedules, checklists, and reminders. Reminders rely on standard device notifications. Please ensure battery-saving modes allow background notification delivery.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {activeModal === 'feedback' && (
              <form onSubmit={handleFeedbackSubmit}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Send Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Let us know what features or widgets you'd like to see next!
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your feedback here..."
                  rows={4}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-hidden focus:border-blue-500 mb-3"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    {feedbackSent ? 'Sent!' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
