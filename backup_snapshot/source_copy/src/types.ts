export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size?: string;
}

export interface VoiceNote {
  id: string;
  duration: number; // in seconds
  audioUrl?: string;
  createdAt: string;
  title?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  reminderEnabled: boolean;
  reminderTime?: string; // e.g. "8:50" or "10m before"
  repeat: RepeatOption;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  subtasks: Subtask[];
  notes?: string;
  attachments: Attachment[];
  voiceNotes: VoiceNote[];
  colorLabel?: string; // hex or color identifier
  isImportantDate?: boolean;
  importantDateType?: 'birthday' | 'anniversary' | 'event';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
  createdAt: string;
}

export interface BirthdayCountdown {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'birthday' | 'event' | 'holiday';
  icon: string;
  color: string;
}

export interface GoogleDriveSyncState {
  connected: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  lastSyncTime?: string;
  autoSync: boolean;
  status: 'idle' | 'syncing' | 'synced' | 'error';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  firstDayOfWeek: 'sunday' | 'monday';
  pinLockEnabled: boolean;
  pinCode: string;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  reminderSound: string;
  vibrationEnabled: boolean;
  ringtoneVolume: number;
  googleDrive: GoogleDriveSyncState;
}

export type TabType = 'tasks' | 'calendar' | 'statistics' | 'mine' | 'settings' | 'checklists' | 'widgets';

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
export type TaskSort = 'dueDate' | 'priority' | 'title' | 'created';
