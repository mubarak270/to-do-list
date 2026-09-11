import React from 'react';
import { CheckSquare, Calendar as CalendarIcon, BarChart3, User, Settings, LayoutGrid } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <div className="relative flex items-center justify-center">
          <CalendarIcon className="w-5 h-5" />
          <span className="absolute text-[9px] font-bold top-[6px] text-current">7</span>
        </div>
      )
    },
    {
      id: 'statistics',
      label: 'Stats',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'widgets',
      label: 'Widgets',
      icon: <LayoutGrid className="w-5 h-5" />
    },
    {
      id: 'mine',
      label: 'Mine',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <nav aria-label="Bottom Navigation" className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-300 dark:border-slate-800 py-1 px-2 flex items-center justify-around z-20 shadow-xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-bold'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'scale-105' : ''}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
