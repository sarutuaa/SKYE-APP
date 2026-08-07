import React from 'react';
import { ViewMode } from '../types';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const tabs: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'list', label: 'รายการ', icon: 'view_list' },
    { key: 'week', label: 'สัปดาห์', icon: 'calendar_view_week' },
    { key: 'month', label: 'เดือน', icon: 'calendar_month' },
    { key: 'completed', label: 'เสร็จแล้ว', icon: 'task_alt' },
  ];

  return (
    <div className="bg-[#f0e7dc] p-1.5 rounded-full flex mx-auto shadow-inner w-max max-w-full">
      {tabs.map((tab) => {
        const active = currentView === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all duration-200 ${
              active
                ? 'bg-white shadow-sm text-[#296956] scale-100'
                : 'text-[#404945] hover:text-[#1f1b15] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
