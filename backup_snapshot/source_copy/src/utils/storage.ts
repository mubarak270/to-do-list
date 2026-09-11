import { Task, Category, Checklist, BirthdayCountdown, UserSettings } from '../types';
import { INITIAL_CATEGORIES, getInitialTasks, INITIAL_CHECKLISTS, INITIAL_COUNTDOWNS, DEFAULT_USER_SETTINGS } from './initialData';

const TASKS_KEY = 'android_todo_tasks_v2';
const CATEGORIES_KEY = 'android_todo_categories_v2';
const CHECKLISTS_KEY = 'android_todo_checklists_v2';
const COUNTDOWNS_KEY = 'android_todo_countdowns_v2';
const SETTINGS_KEY = 'android_todo_settings_v2';

export const storage = {
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (!data) {
        const initial = getInitialTasks();
        this.saveTasks(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialTasks();
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        this.saveCategories(INITIAL_CATEGORIES);
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  getChecklists(): Checklist[] {
    try {
      const data = localStorage.getItem(CHECKLISTS_KEY);
      if (!data) {
        this.saveChecklists(INITIAL_CHECKLISTS);
        return INITIAL_CHECKLISTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHECKLISTS;
    }
  },

  saveChecklists(checklists: Checklist[]): void {
    try {
      localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(checklists));
    } catch (e) {
      console.error('Failed to save checklists', e);
    }
  },

  getCountdowns(): BirthdayCountdown[] {
    try {
      const data = localStorage.getItem(COUNTDOWNS_KEY);
      if (!data) {
        this.saveCountdowns(INITIAL_COUNTDOWNS);
        return INITIAL_COUNTDOWNS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COUNTDOWNS;
    }
  },

  saveCountdowns(countdowns: BirthdayCountdown[]): void {
    try {
      localStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(countdowns));
    } catch (e) {
      console.error('Failed to save countdowns', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        this.saveSettings(DEFAULT_USER_SETTINGS);
        return DEFAULT_USER_SETTINGS;
      }
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportBackupJson(): string {
    const payload = {
      version: '1.03.15',
      exportDate: new Date().toISOString(),
      tasks: this.getTasks(),
      categories: this.getCategories(),
      checklists: this.getChecklists(),
      countdowns: this.getCountdowns(),
      settings: this.getSettings()
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const payload = JSON.parse(jsonString);
      if (payload.tasks) this.saveTasks(payload.tasks);
      if (payload.categories) this.saveCategories(payload.categories);
      if (payload.checklists) this.saveChecklists(payload.checklists);
      if (payload.countdowns) this.saveCountdowns(payload.countdowns);
      if (payload.settings) this.saveSettings(payload.settings);
      return true;
    } catch (err) {
      console.error('Import backup failed', err);
      return false;
    }
  },

  resetToDefault(): void {
    this.saveTasks(getInitialTasks());
    this.saveCategories(INITIAL_CATEGORIES);
    this.saveChecklists(INITIAL_CHECKLISTS);
    this.saveCountdowns(INITIAL_COUNTDOWNS);
    this.saveSettings(DEFAULT_USER_SETTINGS);
  }
};
