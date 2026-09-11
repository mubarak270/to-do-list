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
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-2xl border border-slate-300 dark:border-slate-700">
        {/* Top title row (matching screenshot 7) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Task Reminder
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder content (matching screenshot 7) */}
        <div className="py-3 flex items-start gap-2.5">
          <span className="text-xl">🎂</span>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {task.title}
            </h4>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              Scheduled for {task.dueTime || 'today'}
            </p>
          </div>
        </div>

        {/* Action buttons (matching screenshot 7: GOT IT, CHECK) */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            id="reminder-got-it-btn"
            onClick={onDismiss}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
          >
            GOT IT
          </button>
          <button
            id="reminder-check-btn"
            onClick={() => onCheckTask(task)}
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-xs"
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
