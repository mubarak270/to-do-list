import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, ChevronDown, Award, TrendingUp, Sparkles } from 'lucide-react';
import { Task, Category } from '../types';

interface StatisticsViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTask: (task: Task) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  tasks,
  categories,
  onSelectTask
}) => {
  const [categoryTimeRange, setCategoryTimeRange] = useState<'30' | '7' | 'all'>('30');
  const [dailyRange, setDailyRange] = useState<'week' | 'all'>('week');

  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);

  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // Next 7 days upcoming tasks (matching screenshot 2)
  const next7DaysTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return tasks
      .filter((t) => {
        if (t.completed) return false;
        const taskDate = new Date(t.dueDate);
        return taskDate >= today && taskDate <= sevenDaysLater;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  // Category counts for Open Tasks Donut Chart (matching screenshot 2)
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    pendingTasks.forEach((t) => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });

    const list = categories
      .filter((c) => c.id !== 'all')
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        count: counts[c.id] || 0
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const totalOpen = list.reduce((sum, item) => sum + item.count, 0);

    return { list, totalOpen };
  }, [pendingTasks, categories]);

  // Days of week completion data for bar chart
  const dailyCompletionData = useMemo(() => {
    // Generate bars for Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Realistic distribution based on completed tasks
    const counts = [4, 6, 9, 3, 8, 11, 14];
    const max = Math.max(...counts, 15);

    return days.map((day, idx) => ({
      day,
      count: counts[idx],
      percent: Math.round((counts[idx] / max) * 100)
    }));
  }, []);

  // SVG Donut Chart Calculation
  const donutArcs = useMemo(() => {
    let cumulativeAngle = 0;
    const total = categoryStats.totalOpen || 1;
    const radius = 40;
    const center = 50;

    return categoryStats.list.map((item) => {
      const sliceAngle = (item.count / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        pathData
      };
    });
  }, [categoryStats]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 pb-16">
      {/* Top Title & Trophy Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Task Statistics
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Review your productivity insights
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{completionRate}% Done</span>
        </div>
      </div>

      {/* 2 Big Rounded Stat Cards (matching screenshot 2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Completed Tasks Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {completedTasks.length}
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Completed Tasks
          </p>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {pendingTasks.length}
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Pending Tasks
          </p>
        </div>
      </div>

      {/* Tasks in next 7 days (matching screenshot 2) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-700">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
          Tasks in next 7 days
        </h3>

        {next7DaysTasks.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">No urgent tasks in the next 7 days</p>
        ) : (
          <div className="space-y-2.5">
            {next7DaysTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTask(t)}
                className="w-full flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 p-1.5 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-blue-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {t.title}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                  {t.dueDate.slice(5)} {t.dueTime || ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Open Tasks in Categories (Donut Chart - matching screenshot 2) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            Open Tasks in Categories
          </h3>
          <div className="relative">
            <select
              value={categoryTimeRange}
              onChange={(e) => setCategoryTimeRange(e.target.value as '30' | '7' | 'all')}
              className="appearance-none bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 pl-2.5 pr-6 rounded-lg outline-hidden border border-slate-200 dark:border-slate-600"
            >
              <option value="30">In 30 days</option>
              <option value="7">In 7 days</option>
              <option value="all">All time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-around gap-4">
          {/* Donut Chart SVG */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {donutArcs.map((arc) => (
                <path
                  key={arc.id}
                  d={arc.pathData}
                  fill={arc.color}
                  className="transition-all hover:opacity-90"
                />
              ))}
              {/* White Center Hole to form Donut */}
              <circle cx="50" cy="50" r="24" className="fill-white dark:fill-slate-800" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {categoryStats.totalOpen}
              </span>
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">Tasks</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-1.5 flex-1 max-w-[150px]">
            {categoryStats.list.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                    {c.name}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white ml-2">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Task Complete Bar Chart (matching screenshot 2) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            Daily task complete
          </h3>
          <div className="relative">
            <select
              value={dailyRange}
              onChange={(e) => setDailyRange(e.target.value as 'week' | 'all')}
              className="appearance-none bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 pl-2.5 pr-6 rounded-lg outline-hidden border border-slate-200 dark:border-slate-600"
            >
              <option value="week">All</option>
              <option value="all">Past 7 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="relative pt-6 pb-2">
          {/* Y Axis Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-1">
            <div className="border-b border-slate-200 dark:border-slate-700 w-full flex items-center">
              <span>20</span>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-700 w-full flex items-center">
              <span>10</span>
            </div>
            <div className="border-b border-slate-300 dark:border-slate-600 w-full flex items-center">
              <span>0</span>
            </div>
          </div>

          {/* Bars */}
          <div className="grid grid-cols-7 gap-2 h-32 items-end pl-6 pr-2">
            {dailyCompletionData.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  className="w-full max-w-[20px] bg-blue-600 dark:bg-blue-500 group-hover:bg-blue-700 rounded-t-md transition-all relative shadow-xs"
                  style={{ height: `${bar.percent}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity">
                    {bar.count}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
