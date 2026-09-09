import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, ChevronDown, ChevronUp, CheckCircle2,
  Calendar, Clock, AlertTriangle, Layers, X, Sparkles, Tag
} from 'lucide-react';
import { Task, Category, TaskFilter, TaskSort } from '../types';
import { TaskCard } from './TaskCard';
import { formatDateToYMD } from '../utils/dateUtils';

interface TasksMainViewProps {
  tasks: Task[];
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: () => void;
  onAddCategory: (categoryName: string) => void;
}

export const TasksMainView: React.FC<TasksMainViewProps> = ({
  tasks,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
  onAddCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSort>('dueDate');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const todayStr = formatDateToYMD(new Date());

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Category filter
      if (selectedCategoryId !== 'all' && task.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query) ?? false;
        const matchNotes = task.notes?.toLowerCase().includes(query) ?? false;
        if (!matchTitle && !matchDesc && !matchNotes) return false;
      }
      // Status filter
      if (activeFilter === 'today') {
        return task.dueDate === todayStr && !task.completed;
      }
      if (activeFilter === 'upcoming') {
        return task.dueDate > todayStr && !task.completed;
      }
      if (activeFilter === 'completed') {
        return task.completed;
      }
      if (activeFilter === 'overdue') {
        return task.dueDate < todayStr && !task.completed;
      }
      return true;
    });
  }, [tasks, selectedCategoryId, searchQuery, activeFilter, todayStr]);

  // Grouped tasks for categorized display (matching screenshot 8)
  const { todayList, upcomingList, overdueList, completedList } = useMemo(() => {
    const todayL: Task[] = [];
    const upcomingL: Task[] = [];
    const overdueL: Task[] = [];
    const completedL: Task[] = [];

    filteredTasks.forEach((t) => {
      if (t.completed) {
        completedL.push(t);
      } else if (t.dueDate === todayStr) {
        todayL.push(t);
      } else if (t.dueDate > todayStr) {
        upcomingL.push(t);
      } else {
        overdueL.push(t);
      }
    });

    return {
      todayList: todayL,
      upcomingList: upcomingL,
      overdueList: overdueL,
      completedList: completedL
    };
  }, [filteredTasks, todayStr]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      {/* Top Bar with Search & Filter */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Organize Your Day
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tasks.filter(t => !t.completed).length} tasks remaining today
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="toggle-search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Search tasks"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="relative mb-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              id="tasks-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, checklists..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-8 py-2 outline-hidden focus:border-blue-500 shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Category Filter Pills (matching screenshot 8: All, Work, Personal, Wishlist, Study, + Add) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          <button
            id="add-category-pill-btn"
            onClick={() => setIsAddingCategory(true)}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1 whitespace-nowrap border border-blue-200/50 dark:border-blue-800/50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Category</span>
          </button>
        </div>

        {/* Add Category Input */}
        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="flex items-center gap-2 mt-2 pt-1 animate-in fade-in">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-xs text-slate-400 px-1"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Status Filters Bar (All / Today / Upcoming / Completed / Overdue) */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {(['all', 'today', 'upcoming', 'completed', 'overdue'] as TaskFilter[]).map((f) => (
              <button
                key={f}
                id={`status-filter-${f}`}
                onClick={() => setActiveFilter(f)}
                className={`capitalize text-[11px] font-semibold transition-colors pb-0.5 ${
                  activeFilter === f
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {filteredTasks.length} items
          </span>
        </div>
      </div>

      {/* Main Task List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-1 pb-20 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 mb-3 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No tasks found
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Tap the floating "+" button below to quickly create your first task.
            </p>
          </div>
        ) : (
          <>
            {/* Overdue Section (if any) */}
            {overdueList.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('overdue')}
                  className="w-full flex items-center justify-between text-xs font-bold text-red-500 uppercase tracking-wider mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue ({overdueList.length})
                  </span>
                  {collapsedSections['overdue'] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                {!collapsedSections['overdue'] && (
                  <div className="space-y-2">
                    {overdueList.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Today Section (matching screenshot 8: "Today ▲") */}
            {todayList.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('today')}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    Today ({todayList.length})
                  </span>
                  {collapsedSections['today'] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                {!collapsedSections['today'] && (
                  <div className="space-y-2">
                    {todayList.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Future / Upcoming Section (matching screenshot 8: "Future ▲") */}
            {upcomingList.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('upcoming')}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    Future / Upcoming ({upcomingList.length})
                  </span>
                  {collapsedSections['upcoming'] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                {!collapsedSections['upcoming'] && (
                  <div className="space-y-2">
                    {upcomingList.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Section */}
            {completedList.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('completed')}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Completed ({completedList.length})
                  </span>
                  {collapsedSections['completed'] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                {!collapsedSections['completed'] && (
                  <div className="space-y-2">
                    {completedList.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating "+" Button matching screenshots */}
      <button
        id="floating-add-task-btn"
        onClick={onAddNewTask}
        className="absolute bottom-16 right-5 w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-all duration-150 z-20"
        title="Add new task"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
