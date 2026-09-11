import React, { useState } from 'react';
import { X, Cloud, RefreshCw, CheckCircle2, Shield, Smartphone, HardDrive, Check, AlertCircle } from 'lucide-react';
import { GoogleDriveSyncState } from '../types';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: GoogleDriveSyncState;
  onTriggerSync: () => void;
  onToggleAutoSync: () => void;
  isOnline: boolean;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
  onToggleAutoSync,
  isOnline
}) => {
  if (!isOpen) return null;

  const [simulatedAccount, setSimulatedAccount] = useState({
    email: syncState.email || 'mhshow79@gmail.com',
    name: syncState.name || 'Android User',
    avatar: syncState.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Google Drive Sync
              </h3>
              <p className="text-[11px] text-slate-400">Cloud backup & multi-device sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connected Google Account */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={simulatedAccount.avatar}
              alt="Google Avatar"
              className="w-10 h-10 rounded-full border border-blue-400 object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {simulatedAccount.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {simulatedAccount.email}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            Linked
          </span>
        </div>

        {/* Offline warning if offline */}
        {!isOnline && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>You are currently offline. Changes will auto-sync once internet returns.</span>
          </div>
        )}

        {/* Sync Status Info */}
        <div className="space-y-3 text-xs mb-4">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Sync Status:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              {syncState.status === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  <span>Syncing with Drive...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Up to date</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Last Synced:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {syncState.lastSyncTime || 'Just now'}
            </span>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Automatic Cross-Device Sync
              </span>
              <p className="text-[10px] text-slate-400">
                Sync immediately when edits are made
              </p>
            </div>
            <button
              onClick={onToggleAutoSync}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                syncState.autoSync ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  syncState.autoSync ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="trigger-drive-sync-btn"
          onClick={onTriggerSync}
          disabled={syncState.status === 'syncing' || !isOnline}
          className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
          <span>{syncState.status === 'syncing' ? 'Syncing to Google Drive...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
};
