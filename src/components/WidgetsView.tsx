import React, { useState } from 'react';
import { Sparkles, Cake, Check, Sun, Paperclip, Flower2, Plus, ArrowRight, Smartphone } from 'lucide-react';
import { Task, BirthdayCountdown } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

interface WidgetsViewProps {
  tasks: Task[];
  countdowns: BirthdayCountdown[];
  onToggleTask: (taskId: string) => void;
}

export const WidgetsView: React.FC<WidgetsViewProps> = ({
  tasks,
  countdowns,
  onToggleTask
}) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'gallery' | 'preview'>('gallery');
  const todayTasks = tasks.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Home-Screen Widgets
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              40+
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive Android widgets for quick home screen access
          </p>
        </div>

        <button
          onClick={() => setActiveWidgetTab(activeWidgetTab === 'gallery' ? 'preview' : 'gallery')}
          className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center gap-1 border border-blue-200 dark:border-blue-800"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{activeWidgetTab === 'gallery' ? 'Home Preview' : 'Widget Styles'}</span>
        </button>
      </div>

      {activeWidgetTab === 'preview' ? (
        /* Simulated Android Home Screen with widgets on wallpaper */
        <div className="relative rounded-3xl p-4 min-h-[480px] bg-gradient-to-b from-sky-400 via-indigo-300 to-amber-100 shadow-inner flex flex-col justify-between overflow-hidden">
          {/* Home screen clock */}
          <div className="text-center text-white pt-2 drop-shadow-md">
            <h1 className="text-4xl font-light tracking-tighter">08:09</h1>
            <p className="text-xs font-medium opacity-90">Wednesday, September 9</p>
          </div>

          {/* Placed Widgets on Desktop */}
          <div className="space-y-3 my-auto">
            {/* Widget 1: Birthday Countdown Widget */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎂</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">My birthday</h4>
                  <p className="text-[10px] text-slate-500">2026/09/21</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-rose-500 tracking-tight">-12 D</span>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Days Left</p>
              </div>
            </div>

            {/* Widget 2: Compact Sticky Checklist Widget */}
            <div className="bg-amber-100/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-amber-200 text-slate-800">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/60">
                <span className="text-xs font-bold flex items-center gap-1">
                  📌 Today's Focus
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">Live Widget</span>
              </div>
              <div className="space-y-1.5">
                {todayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onToggleTask(t.id)}
                    className="w-full flex items-center justify-between text-left text-xs"
                  >
                    <span className={`truncate flex items-center gap-1.5 ${t.completed ? 'line-through text-amber-700/60' : 'text-slate-800'}`}>
                      <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${t.completed ? 'bg-amber-600 border-amber-600 text-white' : 'border-amber-400 bg-white'}`}>
                        {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      {t.title}
                    </span>
                    <span className="text-[10px] text-amber-700 ml-1">{t.dueTime}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Android Home Screen App Dock */}
          <div className="flex items-center justify-around bg-white/30 backdrop-blur-md rounded-2xl py-2 px-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">✓</div>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">📞</div>
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-md">💬</div>
            <div className="w-9 h-9 rounded-2xl bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-md">🌐</div>
          </div>
        </div>
      ) : (
        /* Widget Gallery matching screenshot 6 */
        <div className="space-y-4">
          {/* Widget 1: Grid Paper Style (matching screenshot 6 top left) */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
              <h3 className="text-xs font-bold tracking-wide text-slate-800 dark:text-slate-100 uppercase">
                Today (Grid Paper Widget)
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">4x2 Medium</span>
            </div>

            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((t, idx) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className="flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-all ${
                      t.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 bg-white dark:bg-slate-900'
                    }`}>
                      {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className={`truncate font-medium ${t.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {idx + 1}. {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {t.dueTime || 'All Day'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Yellow Sticky Note with Paperclip (matching screenshot 6 top right) */}
          <div className="relative bg-[#FEF08A] text-slate-900 rounded-3xl p-4 shadow-sm border border-yellow-300">
            {/* Paperclip top decoration */}
            <div className="absolute top-2 right-6 text-rose-500">
              <Paperclip className="w-5 h-5 -rotate-45" />
            </div>

            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2">
              Sticky Note Widget
            </h3>

            <div className="space-y-1.5 text-xs font-medium">
              {todayTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className="flex items-center justify-between cursor-pointer py-0.5"
                >
                  <span className={`truncate ${t.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    • {t.title}
                  </span>
                  <span className="text-[10px] text-yellow-800 shrink-0 ml-1">
                    {t.dueTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Birthday Countdown Widget (matching screenshot 6 middle) */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-2xl border border-rose-200 dark:border-rose-900">
                🎂
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  My birthday
                </h3>
                <p className="text-xs text-slate-400">2026/09/21</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                -12 D
              </span>
              <p className="text-[10px] text-rose-500 font-bold uppercase">Countdown</p>
            </div>
          </div>

          {/* Widget 4: Pastel Rainbow Gradient Widget (matching screenshot 6 bottom left) */}
          <div className="rounded-3xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden bg-gradient-to-b from-blue-100 via-teal-50 to-pink-100 dark:from-slate-800 dark:to-slate-850">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Gradient List Widget
            </h3>
            <div className="space-y-1 text-xs font-semibold">
              <div className="bg-blue-200/60 dark:bg-blue-900/40 p-1.5 rounded-lg flex justify-between">
                <span>Have a glass of water</span>
                <span className="text-[10px] opacity-70">07:00</span>
              </div>
              <div className="bg-teal-200/60 dark:bg-teal-900/40 p-1.5 rounded-lg flex justify-between">
                <span>Morning jogging</span>
                <span className="text-[10px] opacity-70">07:30</span>
              </div>
              <div className="bg-amber-200/60 dark:bg-amber-900/40 p-1.5 rounded-lg flex justify-between">
                <span>Have lunch with Jenny</span>
                <span className="text-[10px] opacity-70">12:00</span>
              </div>
            </div>
          </div>

          {/* Widget 5: Sunny Day with Sun/Flower Decoration (matching screenshot 6 bottom right) */}
          <div className="relative bg-[#EEF2FF] dark:bg-indigo-950/30 rounded-3xl p-4 shadow-sm border border-indigo-200/80 dark:border-indigo-800/40">
            <div className="absolute top-2 right-3 text-amber-400">
              <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase mb-2">
              Sunny Day Checklist
            </h3>

            <div className="space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200">
              {todayTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <span className="truncate">▫ {t.title}</span>
                  <span className="text-[10px] opacity-75 ml-1">{t.dueTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
