import React from 'react';
import { Bell, Paperclip, Repeat, Mic, Flag, Check, Trash2, Edit3, Calendar } from 'lucide-react';
import { Task, Category } from '../types';
import { formatTime12h, getRelativeDateLabel } from '../utils/dateUtils';

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
  const accentColor = task.colorLabel || category?.color || '#4A80F0';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasVoiceNotes = task.voiceNotes && task.voiceNotes.length > 0;
  const firstImage = task.attachments?.find(a => a.type === 'image');

  const priorityColors = {
    urgent: 'text-red-500 fill-red-500/20',
    high: 'text-amber-500 fill-amber-500/20',
    medium: 'text-blue-500 fill-blue-500/20',
    low: 'text-slate-400'
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative w-full bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 mb-2.5 shadow-xs border border-slate-200/70 dark:border-slate-700/60 transition-all duration-200 hover:shadow-md flex items-start gap-3 overflow-hidden ${
        task.completed ? 'opacity-70 bg-slate-50/70 dark:bg-slate-850/60' : ''
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
        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
          task.completed
            ? 'bg-blue-600 text-white shadow-xs'
            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-900'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Task Content Body */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(task)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-[15px] font-semibold tracking-tight text-slate-800 dark:text-slate-100 truncate ${
              task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Priority Flag */}
          {task.priority !== 'low' && (
            <Flag className={`w-3.5 h-3.5 shrink-0 ${priorityColors[task.priority]}`} />
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {task.description}
          </p>
        )}

        {/* Meta Info Row */}
        <div className="flex items-center flex-wrap gap-2.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {/* Due date / time */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{getRelativeDateLabel(task.dueDate)}</span>
              {task.dueTime && (
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {task.dueTime}
                </span>
              )}
            </div>
          )}

          {/* Reminder Bell */}
          {task.reminderEnabled && (
            <div className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400" title={`Reminder set for ${task.reminderTime || 'on time'}`}>
              <Bell className="w-3 h-3" />
            </div>
          )}

          {/* Attachment Paperclip */}
          {hasAttachments && (
            <div className="flex items-center gap-0.5 text-slate-500" title={`${task.attachments.length} attachment(s)`}>
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}

          {/* Voice Note Mic */}
          {hasVoiceNotes && (
            <div className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400" title="Voice note attached">
              <Mic className="w-3 h-3" />
            </div>
          )}

          {/* Repeat loop icon */}
          {task.repeat !== 'none' && (
            <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title={`Repeats ${task.repeat}`}>
              <Repeat className="w-3 h-3" />
            </div>
          )}

          {/* Subtasks Count Badge */}
          {hasSubtasks && (
            <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          )}

          {/* Category Chip */}
          {category && category.id !== 'all' && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor
              }}
            >
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail or Action Menu */}
      <div className="flex items-center gap-1.5 shrink-0 self-center">
        {firstImage && (
          <img
            src={firstImage.url}
            alt={task.title}
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            referrerPolicy="no-referrer"
          />
        )}

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <button
            id={`task-edit-${task.id}`}
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`task-delete-${task.id}`}
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
