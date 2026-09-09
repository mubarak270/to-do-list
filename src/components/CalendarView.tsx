import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Cake } from 'lucide-react';
import { Task, Category } from '../types';
import { TaskCard } from './TaskCard';
import {
  MONTH_NAMES,
  DAYS_OF_WEEK_SUN,
  DAYS_OF_WEEK_MON,
  formatDateToYMD,
  getDaysInMonth,
  getFirstDayOfMonth,
  parseYMD
} from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  firstDayOfWeek: 'sunday' | 'monday';
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskForDate: (dateYmd: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  firstDayOfWeek,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskForDate
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateToYMD(today));

  const daysOfWeek = firstDayOfWeek === 'sunday' ? DAYS_OF_WEEK_SUN : DAYS_OF_WEEK_MON;

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Days calculations
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonthIndex);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonthIndex, firstDayOfWeek);

  // Previous month days for padding
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevMonthYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const calendarCells: {
    dayNumber: number;
    isCurrentMonth: boolean;
    dateYmd: string;
    hasTasks: boolean;
    hasBirthday: boolean;
    taskCount: number;
  }[] = [];

  // Padding from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = String(prevMonthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateYmd = `${prevMonthYear}-${m}-${d}`;
    const dateTasks = tasks.filter((t) => t.dueDate === dateYmd);
    calendarCells.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateYmd,
      hasTasks: dateTasks.length > 0,
      hasBirthday: dateTasks.some((t) => t.isImportantDate || t.title.toLowerCase().includes('birthday')),
      taskCount: dateTasks.length
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const m = String(currentMonthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateYmd = `${currentYear}-${m}-${d}`;
    const dateTasks = tasks.filter((t) => t.dueDate === dateYmd);
    calendarCells.push({
      dayNumber: day,
      isCurrentMonth: true,
      dateYmd,
      hasTasks: dateTasks.length > 0,
      hasBirthday: dateTasks.some((t) => t.isImportantDate || t.title.toLowerCase().includes('birthday')),
      taskCount: dateTasks.length
    });
  }

  // Remaining cells to fill grid (42 cells = 6 rows)
  const remainingCells = 42 - calendarCells.length;
  const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
  const nextMonthYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= remainingCells; day++) {
    const m = String(nextMonthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateYmd = `${nextMonthYear}-${m}-${d}`;
    const dateTasks = tasks.filter((t) => t.dueDate === dateYmd);
    calendarCells.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateYmd,
      hasTasks: dateTasks.length > 0,
      hasBirthday: dateTasks.some((t) => t.isImportantDate || t.title.toLowerCase().includes('birthday')),
      taskCount: dateTasks.length
    });
  }

  // Tasks for selected date
  const tasksForSelectedDate = tasks.filter((t) => t.dueDate === selectedDateStr);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      {/* Calendar Top Header matching screenshot 4 */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="cal-prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
              {MONTH_NAMES[currentMonthIndex]}, {currentYear}
            </h2>
            <button
              id="cal-next-month-btn"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            id="jump-to-today-btn"
            onClick={() => {
              const now = new Date();
              setCurrentYear(now.getFullYear());
              setCurrentMonthIndex(now.getMonth());
              setSelectedDateStr(formatDateToYMD(now));
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100"
          >
            Today
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center select-none bg-white dark:bg-slate-850/80 rounded-2xl p-2 shadow-xs border border-slate-200/60 dark:border-slate-800">
          {calendarCells.slice(0, 35).map((cell, idx) => {
            const isSelected = cell.dateYmd === selectedDateStr;
            const isToday = cell.dateYmd === formatDateToYMD(today);

            return (
              <button
                key={idx}
                id={`cal-date-${cell.dateYmd}`}
                onClick={() => setSelectedDateStr(cell.dateYmd)}
                className={`relative h-10 flex flex-col items-center justify-center rounded-full transition-all group ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                    : cell.isCurrentMonth
                    ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                <span className="text-xs">{cell.dayNumber}</span>

                {/* Cake icon for birthdays (matching screenshot 4) */}
                {cell.hasBirthday && !isSelected && (
                  <span className="absolute -top-1 right-1 text-[10px]" title="Birthday">
                    🎂
                  </span>
                )}

                {/* Task Indicator Dot */}
                {cell.hasTasks && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}

                {/* Ring highlight for today */}
                {isToday && !isSelected && (
                  <span className="absolute inset-0 rounded-full border border-blue-400 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Task List */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-16">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tasks for {selectedDateStr} ({tasksForSelectedDate.length})
          </h3>
          <button
            id="add-task-for-date-btn"
            onClick={() => onAddTaskForDate(selectedDateStr)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        {tasksForSelectedDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No tasks scheduled for this day
            </p>
            <button
              id="empty-schedule-add-btn"
              onClick={() => onAddTaskForDate(selectedDateStr)}
              className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Create a task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasksForSelectedDate.map((task) => {
              const category = categories.find((c) => c.id === task.categoryId);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={category}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        id="cal-fab-btn"
        onClick={() => onAddTaskForDate(selectedDateStr)}
        className="absolute bottom-16 right-5 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center active:scale-95 transition-all z-20"
        title="Add task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
