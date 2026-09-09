import React from 'react';
import { Bell, CheckSquare, X } from 'lucide-react';
import { Task } from '../types';

interface ReminderPopupProps {
  task: Task | null;
  onDismiss: () => void;
  onCheckTask: (task: Task) => void;
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({
  task,
  onDismiss,
  onCheckTask
}) => {
  if (!task) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in slide-in-from-top duration-300">
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-2xl border border-blue-200/80 dark:border-slate-700">
        {/* Top title row (matching screenshot 7) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Task Reminder
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder content (matching screenshot 7) */}
        <div className="py-3 flex items-start gap-2.5">
          <span className="text-xl">🎂</span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {task.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled for {task.dueTime || 'today'}
            </p>
          </div>
        </div>

        {/* Action buttons (matching screenshot 7: GOT IT, CHECK) */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            id="reminder-got-it-btn"
            onClick={onDismiss}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg"
          >
            GOT IT
          </button>
          <button
            id="reminder-check-btn"
            onClick={() => onCheckTask(task)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60"
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
