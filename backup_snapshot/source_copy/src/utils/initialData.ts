import { Task, Category, Checklist, BirthdayCountdown, UserSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', icon: 'Layers', color: '#4A80F0', bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  { id: 'work', name: 'Work', icon: 'Briefcase', color: '#3B82F6', bgColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' },
  { id: 'personal', name: 'Personal', icon: 'User', color: '#4A80F0', bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingCart', color: '#10B981', bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { id: 'wishlist', name: 'Wishlist', icon: 'Heart', color: '#8B5CF6', bgColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
  { id: 'study', name: 'Study', icon: 'GraduationCap', color: '#F59E0B', bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'health', name: 'Health', icon: 'Activity', color: '#EC4899', bgColor: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400' }
];

// Helper to generate dates relative to current date
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getRelativeDateStr = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const getInitialTasks = (): Task[] => {
  const today = getTodayStr();
  const tomorrow = getRelativeDateStr(1);
  const in3Days = getRelativeDateStr(3);
  const in5Days = getRelativeDateStr(5);
  const yesterday = getRelativeDateStr(-1);

  return [
    {
      id: 'task-1',
      title: '🌿 Travel planning checklist',
      description: 'Prepare itinerary and bookings for the upcoming trip',
      categoryId: 'personal',
      priority: 'high',
      dueDate: in5Days,
      dueTime: '08:55',
      reminderEnabled: true,
      reminderTime: '08:50',
      repeat: 'monthly',
      completed: false,
      createdAt: new Date().toISOString(),
      notes: 'Remember to pack passports, power banks, sunscreen and comfortable walking shoes.',
      subtasks: [
        { id: 'sub-1', title: 'Go to beach', completed: true },
        { id: 'sub-2', title: 'Go to the mall', completed: false },
        { id: 'sub-3', title: 'Confirm flight boarding pass', completed: false },
        { id: 'sub-4', title: 'Book beachfront restaurant', completed: false }
      ],
      attachments: [
        {
          id: 'att-1',
          name: 'Sydney Opera House',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80',
          size: '2.4 MB'
        },
        {
          id: 'att-2',
          name: 'Scenic Sunset Beach',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
          size: '1.8 MB'
        }
      ],
      voiceNotes: [
        {
          id: 'vn-1',
          duration: 49,
          createdAt: new Date().toISOString(),
          title: 'Trip gear thoughts'
        }
      ],
      colorLabel: '#4A80F0'
    },
    {
      id: 'task-2',
      title: 'Have a date with Michael',
      description: 'Dinner at Harbor View restaurant',
      categoryId: 'personal',
      priority: 'urgent',
      dueDate: tomorrow,
      dueTime: '09:30',
      reminderEnabled: true,
      reminderTime: '09:00',
      repeat: 'none',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [
        {
          id: 'att-3',
          name: 'Restaurant reservation',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
          size: '1.2 MB'
        }
      ],
      voiceNotes: [],
      colorLabel: '#10B981'
    },
    {
      id: 'task-3',
      title: "Grandma's birthday 🎂",
      description: 'Call Grandma and deliver the flower bouquet',
      categoryId: 'personal',
      priority: 'high',
      dueDate: in3Days,
      dueTime: '17:30',
      reminderEnabled: true,
      reminderTime: '17:00',
      repeat: 'yearly',
      completed: false,
      createdAt: new Date().toISOString(),
      isImportantDate: true,
      importantDateType: 'birthday',
      subtasks: [
        { id: 'sub-5', title: 'Pick up strawberry shortcake', completed: false },
        { id: 'sub-6', title: 'Write birthday card with family signatures', completed: true }
      ],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#F27289'
    },
    {
      id: 'task-4',
      title: 'Supermarket shopping list',
      description: 'Weekly grocery restock',
      categoryId: 'shopping',
      priority: 'medium',
      dueDate: today,
      dueTime: '12:30',
      reminderEnabled: true,
      reminderTime: '12:15',
      repeat: 'weekly',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-7', title: 'Tomato 🍅', completed: true },
        { id: 'sub-8', title: 'Broccoli 🥦', completed: false },
        { id: 'sub-9', title: 'Chocolate 🍫', completed: false },
        { id: 'sub-10', title: 'Oat Milk 🥛', completed: false }
      ],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#8B72DE'
    },
    {
      id: 'task-5',
      title: 'Send Email to Tim',
      description: 'Send the updated Q4 design specs and sprint roadmap',
      categoryId: 'work',
      priority: 'high',
      dueDate: today,
      dueTime: '10:15',
      reminderEnabled: true,
      reminderTime: '10:00',
      repeat: 'none',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#F27289'
    },
    {
      id: 'task-6',
      title: 'Have a glass of water',
      description: 'Stay hydrated throughout the afternoon',
      categoryId: 'health',
      priority: 'low',
      dueDate: today,
      dueTime: '14:45',
      reminderEnabled: true,
      reminderTime: '14:45',
      repeat: 'daily',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#FF9F43'
    },
    {
      id: 'task-7',
      title: 'Doing housework',
      description: 'Afternoon cleaning routine',
      categoryId: 'personal',
      priority: 'medium',
      dueDate: today,
      dueTime: '11:30',
      reminderEnabled: false,
      repeat: 'none',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-11', title: 'Living room vacuum', completed: true },
        { id: 'sub-12', title: 'Clean coffee machine', completed: false }
      ],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#FF9F43'
    },
    {
      id: 'task-8',
      title: 'Make a studying plan',
      description: 'Outline weekly curriculum and study objectives',
      categoryId: 'study',
      priority: 'medium',
      dueDate: tomorrow,
      dueTime: '08:00',
      reminderEnabled: true,
      repeat: 'weekly',
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#F59E0B'
    },
    {
      id: 'task-9',
      title: 'Put a big, warm smile on your face',
      description: 'Morning positive affirmation',
      categoryId: 'personal',
      priority: 'low',
      dueDate: today,
      dueTime: '07:00',
      reminderEnabled: false,
      repeat: 'daily',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#4A80F0'
    },
    {
      id: 'task-10',
      title: "It's time for reading",
      description: 'Read 20 pages of clean code',
      categoryId: 'study',
      priority: 'medium',
      dueDate: yesterday,
      dueTime: '19:30',
      reminderEnabled: true,
      repeat: 'daily',
      completed: true,
      completedAt: yesterday,
      createdAt: new Date().toISOString(),
      subtasks: [],
      attachments: [],
      voiceNotes: [],
      colorLabel: '#8B5CF6'
    }
  ];
};

export const INITIAL_CHECKLISTS: Checklist[] = [
  {
    id: 'cl-1',
    title: 'Study List',
    category: 'Study',
    icon: 'GraduationCap',
    color: '#FFF7ED',
    items: [
      { id: 'cli-1', text: '🌍 French lesson', done: false },
      { id: 'cli-2', text: '📒 Math class', done: false },
      { id: 'cli-3', text: '🍃 Biology homework', done: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cl-2',
    title: 'Shopping list, supermarket',
    category: 'Shopping',
    icon: 'ShoppingCart',
    color: '#F0FDF4',
    items: [
      { id: 'cli-4', text: '🍅 Tomato', done: true },
      { id: 'cli-5', text: '🥦 Broccoli', done: false },
      { id: 'cli-6', text: '🍫 Chocolate', done: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'cl-3',
    title: 'Movie list',
    category: 'Wishlist',
    icon: 'Film',
    color: '#FFF1F2',
    items: [
      { id: 'cli-7', text: '🎬 Big Fish', done: false },
      { id: 'cli-8', text: '🎬 Nomadland', done: false },
      { id: 'cli-9', text: '🎬 Raya and The Last Dragon', done: false }
    ],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_COUNTDOWNS: BirthdayCountdown[] = [
  {
    id: 'cd-1',
    title: 'My birthday',
    date: '2026-09-21',
    type: 'birthday',
    icon: 'Cake',
    color: '#EC4899'
  },
  {
    id: 'cd-2',
    title: "Grandma's birthday",
    date: '2026-09-12',
    type: 'birthday',
    icon: 'Gift',
    color: '#F27289'
  },
  {
    id: 'cd-3',
    title: 'Product Launch Day',
    date: '2026-10-01',
    type: 'event',
    icon: 'Rocket',
    color: '#3B82F6'
  }
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'light',
  firstDayOfWeek: 'sunday',
  pinLockEnabled: false,
  pinCode: '1234',
  biometricEnabled: false,
  notificationsEnabled: true,
  reminderSound: 'Gentle Chime',
  vibrationEnabled: true,
  ringtoneVolume: 80,
  googleDrive: {
    connected: false,
    email: 'mhshow79@gmail.com',
    name: 'Android User',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    lastSyncTime: undefined,
    autoSync: true,
    status: 'idle'
  }
};
