import React, { useState, useRef } from 'react';
import {
  X, Calendar, Clock, Bell, Repeat, FileText, Paperclip, Mic,
  Plus, Check, Trash2, Play, Pause, Image as ImageIcon,
  Tag, Flag, Sparkles, AlertCircle
} from 'lucide-react';
import { Task, Category, Priority, RepeatOption, Subtask, Attachment, VoiceNote } from '../types';
import { soundManager } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initialTask?: Task | null;
  categories: Category[];
}

const PASTEL_COLORS = [
  { name: 'Sky Blue', hex: '#4A80F0' },
  { name: 'Soft Rose', hex: '#F27289' },
  { name: 'Warm Amber', hex: '#FF9F43' },
  { name: 'Gentle Purple', hex: '#8B72DE' },
  { name: 'Mint Green', hex: '#10B981' },
  { name: 'Golden Yellow', hex: '#F59E0B' }
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [categoryId, setCategoryId] = useState(initialTask?.categoryId || 'personal');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState(initialTask?.dueTime || '09:00');
  const [reminderEnabled, setReminderEnabled] = useState(initialTask?.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(initialTask?.reminderTime || '08:50');
  const [repeat, setRepeat] = useState<RepeatOption>(initialTask?.repeat || 'none');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [colorLabel, setColorLabel] = useState(initialTask?.colorLabel || '#4A80F0');

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(initialTask?.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice notes
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(initialTask?.voiceNotes || []);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const recordTimerRef = useRef<number | null>(null);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
    soundManager.playCompleteSound();
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Image Upload Simulator / Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : 'file',
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };
      setAttachments([...attachments, newAtt]);
    };
    reader.readAsDataURL(file);
  };

  // Voice Note Recording
  const startRecording = () => {
    soundManager.playTone(880, 0.1);
    setIsRecording(true);
    setRecordingSeconds(0);
    recordTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    soundManager.playTone(440, 0.15);
    setIsRecording(false);
    const duration = Math.max(recordingSeconds, 3);
    const newVoiceNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      duration: duration,
      createdAt: new Date().toISOString(),
      title: `Voice Memo (${duration}s)`
    };
    setVoiceNotes([...voiceNotes, newVoiceNote]);
  };

  const playVoiceNote = () => {
    setIsPlayingAudio(true);
    soundManager.playTone(587.33, 0.2);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      dueDate,
      dueTime,
      reminderEnabled,
      reminderTime,
      repeat,
      notes,
      colorLabel,
      subtasks,
      attachments,
      voiceNotes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        {/* Header matching screenshot 3 ("Rich Features") */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: colorLabel }}
            />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {initialTask ? 'Edit Task' : 'New Task'}
            </h3>
          </div>
          <button
            id="close-task-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
          {/* Title input */}
          <div>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do? (e.g. 🌿 Travel checklist)"
              className="w-full text-lg font-bold text-slate-900 dark:text-slate-50 placeholder-slate-400 bg-transparent border-none outline-hidden focus:ring-0 px-0"
              autoFocus
              required
            />
            <input
              id="task-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add brief description or context..."
              className="w-full text-xs text-slate-600 dark:text-slate-400 placeholder-slate-400 bg-transparent border-none outline-hidden focus:ring-0 px-0 mt-1"
            />
          </div>

          {/* Quick Category & Priority Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.filter(c => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                type="button"
                id={`cat-select-${cat.id}`}
                onClick={() => setCategoryId(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  categoryId === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Priority flags */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" /> Priority:
            </span>
            {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                id={`priority-select-${p}`}
                onClick={() => setPriority(p)}
                className={`capitalize px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  priority === p
                    ? p === 'urgent'
                      ? 'bg-red-500 text-white font-bold'
                      : p === 'high'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-blue-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Sub-tasks / Checklist section (matching screenshot 3) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sub-tasks Checklist ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </span>
              <button
                id="toggle-add-subtask-btn"
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sub-task
              </button>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-2 group py-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                      st.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}>
                      {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {st.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="opacity-60 hover:opacity-100 text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Input field to add subtask */}
            {(isAddingSubtask || subtasks.length === 0) && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <input
                  id="new-subtask-title-input"
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="e.g. Confirm flight boarding pass..."
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  id="confirm-add-subtask-btn"
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Date, Time & Reminder Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60">
              <label htmlFor="task-due-date-picker" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Due Date
              </label>
              <input
                id="task-due-date-picker"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden"
              />
            </div>

            {/* Time & Reminder */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="task-due-time-picker" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Time & Reminder
                </label>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    reminderEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {reminderEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="task-due-time-picker"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden"
                />
                {reminderEnabled && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    (Remind: {reminderTime || 'at time'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Repeat Task Row */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-blue-500" /> Repeat Task
            </span>
            <select
              id="task-repeat-select"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatOption)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="none">No Repeat</option>
              <option value="daily">Daily Repeat</option>
              <option value="weekly">Weekly Repeat</option>
              <option value="monthly">Monthly Repeat</option>
              <option value="yearly">Yearly Repeat</option>
            </select>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> Notes
            </span>
            <textarea
              id="task-notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add additional details, links, or instructions..."
              rows={2}
              className="w-full text-xs bg-transparent border-none outline-hidden focus:ring-0 text-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>

          {/* Attachments & Voice Notes (matching screenshot 3) */}
          <div className="space-y-3">
            {/* Attachment image preview */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-500" /> Attachments ({attachments.length})
                </span>
                <button
                  type="button"
                  id="trigger-file-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Attachments list */}
              {attachments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {attachments.map((att) => (
                    <div key={att.id} className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      {att.type === 'image' ? (
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 dark:bg-slate-800 flex flex-col items-center justify-center p-1 text-center">
                          <Paperclip className="w-5 h-5 text-blue-500" />
                          <span className="text-[9px] truncate w-full text-slate-600 dark:text-slate-300">{att.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Note Section (matching screenshot 3 audio bar!) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-500" /> Voice Notes ({voiceNotes.length})
                </span>

                {isRecording ? (
                  <button
                    id="stop-recording-btn"
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse"
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>Stop ({recordingSeconds}s)</span>
                  </button>
                ) : (
                  <button
                    id="start-recording-btn"
                    type="button"
                    onClick={startRecording}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Record
                  </button>
                )}
              </div>

              {/* Render voice notes player bars */}
              {voiceNotes.map((vn) => (
                <div
                  key={vn.id}
                  className="w-full bg-blue-50/90 dark:bg-blue-950/40 rounded-xl p-2.5 flex items-center gap-3 border border-blue-200/60 dark:border-blue-800/40 mb-2"
                >
                  <button
                    type="button"
                    onClick={playVoiceNote}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    {/* Simulated Waveform Bar */}
                    <div className="flex items-center gap-[2px] h-4 mb-1">
                      {[12, 24, 18, 28, 14, 22, 30, 16, 26, 18, 24, 14, 20, 28, 12, 18].map((h, idx) => (
                        <span
                          key={idx}
                          className={`w-1 rounded-full transition-all ${
                            isPlayingAudio ? 'bg-blue-600 animate-pulse' : 'bg-blue-300 dark:bg-blue-700'
                          }`}
                          style={{ height: `${(h / 30) * 16}px` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>00:00</span>
                      <span>00:{String(vn.duration).padStart(2, '0')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVoiceNotes(voiceNotes.filter(v => v.id !== vn.id))}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Color Label Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Color Label:</span>
              <div className="flex items-center gap-2">
                {PASTEL_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    id={`color-label-${c.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setColorLabel(c.hex)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      colorLabel === c.hex ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
