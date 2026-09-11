import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AppHeader } from './components/AppHeader';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallModal } from './components/PWAInstallModal';
import { BottomNavBar } from './components/BottomNavBar';
import { TasksMainView } from './components/TasksMainView';
import { CalendarView } from './components/CalendarView';
import { StatisticsView } from './components/StatisticsView';
import { MineProfileView } from './components/MineProfileView';
import { SettingsView } from './components/SettingsView';
import { ChecklistsView } from './components/ChecklistsView';
import { WidgetsView } from './components/WidgetsView';
import { TaskModal } from './components/TaskModal';
import { DriveSyncModal } from './components/DriveSyncModal';
import { AppLockModal } from './components/AppLockModal';
import { ReminderPopup } from './components/ReminderPopup';
import { AddCountdownModal } from './components/AddCountdownModal';
import { Task, Category, Checklist, BirthdayCountdown, UserSettings, TabType } from './types';
import { storage } from './utils/storage';
import { soundManager } from './utils/audio';
import { notificationService } from './utils/notificationService';

export default function App() {
  // State from storage
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [checklists, setChecklists] = useState<Checklist[]>(() => storage.getChecklists());
  const [countdowns, setCountdowns] = useState<BirthdayCountdown[]>(() => storage.getCountdowns());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [navigationHistory, setNavigationHistory] = useState<TabType[]>(['tasks']);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDriveSyncModalOpen, setIsDriveSyncModalOpen] = useState(false);
  const [isAppLockSetupOpen, setIsAppLockSetupOpen] = useState(false);
  const [isAddCountdownOpen, setIsAddCountdownOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(() => settings.pinLockEnabled);
  const [activeReminder, setActiveReminder] = useState<Task | null>(null);

  // Connectivity & Sync state
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state to local storage whenever changed
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    storage.saveChecklists(checklists);
  }, [checklists]);

  useEffect(() => {
    storage.saveCountdowns(countdowns);
  }, [countdowns]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // Handle Theme (apply .dark to document if dark or system matches)
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Initialize Capacitor Local Notifications, channel, tap listener, and foreground listener
  useEffect(() => {
    notificationService.init();

    // 1. Notification Tap handler (when user clicks notification in Android notification shade)
    const unsubscribeTap = notificationService.onNotificationTap((taskId) => {
      console.log('Notification tapped for taskId:', taskId);
      const target = tasks.find((t) => t.id === taskId);
      if (target) {
        setActiveReminder(target);
        setActiveTab('tasks');
      }
    });

    // 2. Foreground notification handler (when notification arrives while app is open)
    const unsubscribeReceived = notificationService.onNotificationReceived((notif) => {
      const taskId = notif.extra?.taskId as string;
      const target = tasks.find((t) => t.id === taskId);
      if (target) {
        setActiveReminder(target);
        soundManager.playReminderSound();
      }
    });

    return () => {
      unsubscribeTap();
      unsubscribeReceived();
    };
  }, [tasks]);

  // Reschedule all active task reminders after app restart / when tasks or notification settings change
  useEffect(() => {
    notificationService.rescheduleAll(tasks, settings.notificationsEnabled);
  }, [tasks, settings.notificationsEnabled]);

  // Handle Tab changes with history
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setNavigationHistory((prev) => [...prev, tab]);
  };

  // Android Back button handler
  const handleAndroidBack = useCallback(() => {
    if (isTaskModalOpen) {
      setIsTaskModalOpen(false);
      return;
    }
    if (isDriveSyncModalOpen) {
      setIsDriveSyncModalOpen(false);
      return;
    }
    if (isAppLockSetupOpen) {
      setIsAppLockSetupOpen(false);
      return;
    }
    if (isAddCountdownOpen) {
      setIsAddCountdownOpen(false);
      return;
    }
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // current
      const prevTab = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveTab(prevTab);
    }
  }, [
    isTaskModalOpen,
    isDriveSyncModalOpen,
    isAppLockSetupOpen,
    isAddCountdownOpen,
    navigationHistory
  ]);

  // Android Home button handler
  const handleAndroidHome = useCallback(() => {
    setIsTaskModalOpen(false);
    setIsDriveSyncModalOpen(false);
    setIsAppLockSetupOpen(false);
    setIsAddCountdownOpen(false);
    setActiveTab('tasks');
    setNavigationHistory(['tasks']);
  }, []);

  // Toggle complete task with celebration sound & confetti
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const willComplete = !t.completed;
        if (willComplete) {
          soundManager.playCompleteSound();
          notificationService.cancelTask(taskId);
          try {
            confetti({
              particleCount: 35,
              spread: 55,
              origin: { y: 0.8 },
              colors: ['#4A80F0', '#F27289', '#FF9F43', '#10B981']
            });
          } catch {
            // Safe fallback
          }
        } else {
          // Re-schedule reminder if enabled
          const reopenedTask = { ...t, completed: false };
          if (settings.notificationsEnabled && reopenedTask.reminderEnabled) {
            notificationService.scheduleTask(reopenedTask);
          }
        }
        return {
          ...t,
          completed: willComplete,
          completedAt: willComplete ? new Date().toISOString() : undefined
        };
      })
    );
  };

  // Task creation/update
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Update existing
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t));
        const updatedTask = updated.find((t) => t.id === taskData.id);
        if (updatedTask && settings.notificationsEnabled) {
          notificationService.scheduleTask(updatedTask);
        }
        return updated;
      });
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        categoryId: taskData.categoryId || 'personal',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: taskData.dueTime || '09:00',
        reminderEnabled: taskData.reminderEnabled ?? true,
        reminderTime: taskData.reminderTime || '08:50',
        repeat: taskData.repeat || 'none',
        completed: false,
        createdAt: new Date().toISOString(),
        notes: taskData.notes || '',
        colorLabel: taskData.colorLabel || '#4A80F0',
        subtasks: taskData.subtasks || [],
        attachments: taskData.attachments || [],
        voiceNotes: taskData.voiceNotes || []
      };
      setTasks((prev) => [newTask, ...prev]);
      if (settings.notificationsEnabled && newTask.reminderEnabled) {
        notificationService.scheduleTask(newTask);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    notificationService.cancelTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Helper to add test reminder task directly into task list for testing
  const handleAddTestReminderTask = (title: string, minutesFromNow: number) => {
    const fireTimeDate = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const ymd = fireTimeDate.toISOString().split('T')[0];
    const timeStr = `${String(fireTimeDate.getHours()).padStart(2, '0')}:${String(fireTimeDate.getMinutes()).padStart(2, '0')}`;
    const testTask: Task = {
      id: `task-test-${Date.now()}`,
      title,
      description: 'Scheduled test reminder for Android notification engine',
      categoryId: 'personal',
      priority: 'high',
      dueDate: ymd,
      dueTime: timeStr,
      reminderEnabled: true,
      reminderTime: timeStr,
      repeat: 'none',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: []
    };
    setTasks((prev) => [testTask, ...prev]);
    notificationService.scheduleTask(testTask);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleAddTaskForDate = (dateYmd: string) => {
    setEditingTask({
      id: '',
      title: '',
      categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : 'personal',
      priority: 'medium',
      dueDate: dateYmd,
      dueTime: '10:00',
      reminderEnabled: true,
      repeat: 'none',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: []
    });
    setIsTaskModalOpen(true);
  };

  const handleAddCategory = (name: string) => {
    const newCat: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon: 'Tag',
      color: '#4A80F0',
      bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
    };
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
  };

  // Google Drive Cloud Sync Trigger
  const handleTriggerSync = () => {
    if (!isOnline) return;
    setIsSyncing(true);
    setSettings((prev) => ({
      ...prev,
      googleDrive: { ...prev.googleDrive, status: 'syncing' }
    }));

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setIsSyncing(false);
      setSettings((prev) => ({
        ...prev,
        googleDrive: {
          ...prev.googleDrive,
          connected: true,
          status: 'synced',
          lastSyncTime: `Today at ${timeStr}`
        }
      }));
      soundManager.playCompleteSound();
    }, 1200);
  };

  // Toggle online / offline status (testing offline capability)
  const handleToggleOnline = () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    if (nextOnline) {
      // Reconnected! Auto sync queued items
      handleTriggerSync();
    }
  };

  const handleDataReloaded = () => {
    setTasks(storage.getTasks());
    setCategories(storage.getCategories());
    setChecklists(storage.getChecklists());
    setCountdowns(storage.getCountdowns());
    setSettings(storage.getSettings());
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const isDarkTheme =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start transition-colors duration-200 ${
        isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-800'
      }`}
    >
      <div className="w-full max-w-2xl lg:max-w-4xl min-h-screen flex flex-col bg-white dark:bg-slate-900 border-x border-slate-200/80 dark:border-slate-800/80 shadow-xs relative">
        {/* App Header (No fake status bar or fake time) */}
        <AppHeader
          settings={settings}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onToggleOnline={handleToggleOnline}
          onManualSync={handleTriggerSync}
          onToggleTheme={() => {
            const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
            setSettings({ ...settings, theme: nextTheme });
          }}
          onOpenInstallModal={() => setIsPWAInstallOpen(true)}
        />

        {/* Offline notification banner */}
        <OfflineIndicator />
      {/* App Lock PIN Screen if locked */}
      <AppLockModal
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
        correctPin={settings.pinCode || '1234'}
      />

      {/* Setup App Lock Modal */}
      {isAppLockSetupOpen && (
        <AppLockModal
          isLocked={false}
          onUnlock={() => {}}
          correctPin={settings.pinCode}
          isSetupMode={true}
          onSaveNewPin={(newPin, bio) => {
            setSettings({
              ...settings,
              pinLockEnabled: true,
              pinCode: newPin,
              biometricEnabled: bio
            });
            setIsAppLockSetupOpen(false);
          }}
          onCloseSetup={() => setIsAppLockSetupOpen(false)}
        />
      )}

      {/* Timely Reminder Popup (matching screenshot 7) */}
      <ReminderPopup
        task={activeReminder}
        onDismiss={() => setActiveReminder(null)}
        onCheckTask={(t) => {
          setActiveReminder(null);
          handleEditTask(t);
        }}
      />

      {/* Main View based on activeTab */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'tasks' && (
          <TasksMainView
            tasks={tasks}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddNewTask={handleAddNewTask}
            onAddCategory={handleAddCategory}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            categories={categories}
            firstDayOfWeek={settings.firstDayOfWeek}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskForDate={handleAddTaskForDate}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            tasks={tasks}
            categories={categories}
            onSelectTask={handleEditTask}
          />
        )}

        {activeTab === 'checklists' && (
          <ChecklistsView
            checklists={checklists}
            onUpdateChecklists={setChecklists}
          />
        )}

        {activeTab === 'widgets' && (
          <WidgetsView
            tasks={tasks}
            countdowns={countdowns}
            onToggleTask={handleToggleComplete}
          />
        )}

        {activeTab === 'mine' && (
          <MineProfileView
            settings={settings}
            tasks={tasks}
            countdowns={countdowns}
            onOpenSyncModal={() => setIsDriveSyncModalOpen(true)}
            onNavigateToSettings={() => handleTabChange('settings')}
            onOpenAddCountdown={() => setIsAddCountdownOpen(true)}
            onDataImported={handleDataReloaded}
            onOpenInstallModal={() => setIsPWAInstallOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenSyncModal={() => setIsDriveSyncModalOpen(true)}
            onOpenAppLockSetup={() => setIsAppLockSetupOpen(true)}
            onOpenInstallModal={() => setIsPWAInstallOpen(true)}
            onAddTestTask={handleAddTestReminderTask}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingCount}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
      />

      {/* Google Drive Cloud Sync Modal */}
      <DriveSyncModal
        isOpen={isDriveSyncModalOpen}
        onClose={() => setIsDriveSyncModalOpen(false)}
        syncState={settings.googleDrive}
        onTriggerSync={handleTriggerSync}
        onToggleAutoSync={() =>
          setSettings((prev) => ({
            ...prev,
            googleDrive: {
              ...prev.googleDrive,
              autoSync: !prev.googleDrive.autoSync
            }
          }))
        }
        isOnline={isOnline}
      />

      {/* Add Countdown Modal */}
      <AddCountdownModal
        isOpen={isAddCountdownOpen}
        onClose={() => setIsAddCountdownOpen(false)}
        onAddCountdown={(newCd) => setCountdowns((prev) => [...prev, newCd])}
      />

      {/* PWA / APK Installation Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />
      </div>
    </div>
  );
}
