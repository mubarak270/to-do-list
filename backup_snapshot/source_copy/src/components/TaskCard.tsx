import React, { useState, useRef, useEffect } from 'react';
import { Bell, Paperclip, Repeat, Mic, Flag, Check, Trash2, Edit3, Calendar } from 'lucide-react';
import { Task, Category } from '../types';
import { getRelativeDateLabel } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const accentColor = task.colorLabel || category?.color || '#3b82f6';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasVoiceNotes = task.voiceNotes && task.voiceNotes.length > 0;
  const firstImage = task.attachments?.find(a => a.type === 'image');

  // Swipe-to-delete state
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasMovedSignificantRef = useRef(false);

  const SWIPE_THRESHOLD = 95; // pixels needed to trigger delete

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    isHorizontalSwipeRef.current = null;
    hasMovedSignificantRef.current = false;
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || isDeleting) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Check gesture direction if not locked yet
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaY) > 7 && Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical scrolling: do NOT hijack
        isHorizontalSwipeRef.current = false;
        return;
      }
      if (Math.abs(deltaX) > 7 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swiping: lock gesture
        isHorizontalSwipeRef.current = true;
        setIsDragging(true);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // Fallback if pointer capture not supported
        }
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      hasMovedSignificantRef.current = true;
      // Provide slight resistance past threshold
      const sign = Math.sign(deltaX);
      const absDelta = Math.abs(deltaX);
      const resistanceDelta = absDelta > 160 ? 160 + (absDelta - 160) * 0.35 : absDelta;
      setOffsetX(sign * resistanceDelta);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;

    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {
      // Fallback
    }

    const currentOffset = offsetX;
    const absOffset = Math.abs(currentOffset);

    setIsDragging(false);
    dragStartRef.current = null;
    isHorizontalSwipeRef.current = null;

    if (absOffset >= SWIPE_THRESHOLD && !isDeleting) {
      // Trigger full delete slide-out animation
      setIsDeleting(true);
      const direction = Math.sign(currentOffset);
      const finalX = direction * (window.innerWidth || 500);
      setOffsetX(finalX);

      // Perform actual deletion after animation completes
      setTimeout(() => {
        onDelete(task.id);
      }, 220);
    } else {
      // Snap back smoothly
      setOffsetX(0);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user was swiping, don't trigger edit
    if (hasMovedSignificantRef.current || Math.abs(offsetX) > 10) {
      e.stopPropagation();
      return;
    }
    onEdit(task);
  };

  const priorityColors = {
    urgent: 'text-red-600 dark:text-red-400 font-bold',
    high: 'text-amber-600 dark:text-amber-400 font-bold',
    medium: 'text-blue-600 dark:text-blue-400 font-semibold',
    low: 'text-slate-500 dark:text-slate-400'
  };

  const isSwipingLeft = offsetX < 0;
  const isSwipingRight = offsetX > 0;
  const isPastThreshold = Math.abs(offsetX) >= SWIPE_THRESHOLD;

  return (
    <div
      id={`task-card-wrapper-${task.id}`}
      className="relative w-full mb-2.5 select-none rounded-2xl overflow-hidden touch-pan-y"
    >
      {/* Background Red Delete Action Surface (revealed during swipe) */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center transition-colors ${
          isPastThreshold ? 'bg-red-600 dark:bg-red-600' : 'bg-red-500/90 dark:bg-red-500/90'
        } ${isSwipingLeft ? 'justify-end pr-5' : 'justify-start pl-5'}`}
      >
        <div
          className={`flex items-center gap-2 text-white transition-transform duration-150 ${
            isPastThreshold ? 'scale-110 font-extrabold' : 'scale-100 font-bold'
          }`}
        >
          <Trash2 className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs tracking-wider uppercase">
            {isPastThreshold ? 'Release to Delete' : 'Delete'}
          </span>
        </div>
      </div>

      {/* Foreground Swipeable Card Surface */}
      <div
        ref={cardRef}
        id={`task-card-${task.id}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onClick={handleCardClick}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging
            ? 'none'
            : isDeleting
            ? 'transform 0.22s cubic-bezier(0.2, 0, 0, 1), opacity 0.22s ease'
            : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isDeleting ? 0 : 1,
          willChange: 'transform, opacity'
        }}
        className={`group relative w-full bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-xs border border-slate-300 dark:border-slate-700/80 flex items-start gap-3 cursor-pointer ${
          task.completed ? 'bg-slate-100/90 dark:bg-slate-850/90' : 'hover:shadow-md'
        }`}
      >
        {/* Left Colored Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
          style={{ backgroundColor: accentColor }}
        />

        {/* Circular Checkbox */}
        <button
          id={`task-toggle-${task.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 ${
            task.completed
              ? 'bg-blue-600 text-white shadow-xs'
              : 'border-2 border-slate-500 dark:border-slate-400 hover:border-blue-600 bg-white dark:bg-slate-900'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content Body with High-Contrast Typography */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-[15px] font-extrabold tracking-tight truncate ${
                task.completed
                  ? 'line-through text-slate-500 dark:text-slate-400 font-semibold'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h4>

            {/* Priority Flag */}
            {task.priority !== 'low' && (
              <div className={`flex items-center gap-1 text-[11px] shrink-0 ${priorityColors[task.priority]}`}>
                <Flag className="w-3.5 h-3.5 fill-current" />
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}

          {/* Meta Info Row: Dates, Times, Badges */}
          <div className="flex items-center flex-wrap gap-2.5 mt-2 text-xs text-slate-700 dark:text-slate-200 font-semibold">
            {/* Due date / time */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="font-semibold">{getRelativeDateLabel(task.dueDate)}</span>
                {task.dueTime && (
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-200/90 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px] border border-slate-300 dark:border-slate-600">
                    {task.dueTime}
                  </span>
                )}
              </div>
            )}

            {/* Reminder Bell */}
            {task.reminderEnabled && (
              <div
                className="flex items-center gap-0.5 text-blue-700 dark:text-blue-300 font-bold"
                title={`Reminder set for ${task.reminderTime || 'on time'}`}
              >
                <Bell className="w-3.5 h-3.5" />
                {task.reminderTime && (
                  <span className="text-[10px] hidden sm:inline">{task.reminderTime}</span>
                )}
              </div>
            )}

            {/* Attachment Paperclip */}
            {hasAttachments && (
              <div className="flex items-center gap-0.5 text-slate-800 dark:text-slate-200" title={`${task.attachments.length} attachment(s)`}>
                <Paperclip className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">{task.attachments.length}</span>
              </div>
            )}

            {/* Voice Note Mic */}
            {hasVoiceNotes && (
              <div className="flex items-center gap-0.5 text-purple-700 dark:text-purple-300 font-bold" title="Voice note attached">
                <Mic className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Repeat loop icon */}
            {task.repeat !== 'none' && (
              <div className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300 font-bold" title={`Repeats ${task.repeat}`}>
                <Repeat className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Subtasks Count Badge */}
            {hasSubtasks && (
              <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                {completedSubtasks}/{task.subtasks.length} subtasks
              </span>
            )}

            {/* Category Chip (high-contrast, professional styling) */}
            {category && category.id !== 'all' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                {category.name}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail and Edit / Delete actions */}
        <div className="flex items-center gap-1.5 shrink-0 self-center">
          {firstImage && (
            <img
              src={firstImage.url}
              alt={task.title}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Quick buttons */}
          <div className="flex items-center">
            <button
              id={`task-edit-${task.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`task-delete-${task.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Delete task (or swipe left/right)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
