import React from 'react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAiModal?: () => void;
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenSettings,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-3 pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] bg-white/95 border-t-2 border-[#98d8c1] shadow-lg rounded-t-3xl z-40 md:hidden backdrop-blur-md">
      {/* Tasks List */}
      <button
        onClick={() => onViewChange('list')}
        className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all min-w-[64px] min-h-[48px] cursor-pointer ${
          currentView === 'list'
            ? 'bg-[#98d8c1] text-[#1e604e] font-black shadow-xs'
            : 'text-[#707974] hover:bg-[#f6ece2] active:bg-[#f0e7dc]'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">assignment</span>
        <span className="font-bold text-[11px] mt-0.5">รายการ</span>
      </button>

      {/* Week View */}
      <button
        onClick={() => onViewChange('week')}
        className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all min-w-[64px] min-h-[48px] cursor-pointer ${
          currentView === 'week'
            ? 'bg-[#98d8c1] text-[#1e604e] font-black shadow-xs'
            : 'text-[#707974] hover:bg-[#f6ece2] active:bg-[#f0e7dc]'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">calendar_view_week</span>
        <span className="font-bold text-[11px] mt-0.5">สัปดาห์</span>
      </button>

      {/* Calendar View */}
      <button
        onClick={() => onViewChange('month')}
        className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all min-w-[64px] min-h-[48px] cursor-pointer ${
          currentView === 'month'
            ? 'bg-[#98d8c1] text-[#1e604e] font-black shadow-xs'
            : 'text-[#707974] hover:bg-[#f6ece2] active:bg-[#f0e7dc]'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">calendar_month</span>
        <span className="font-bold text-[11px] mt-0.5">เดือน</span>
      </button>

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center text-[#707974] px-3 py-2 hover:bg-[#f6ece2] active:bg-[#f0e7dc] rounded-2xl transition-all min-w-[64px] min-h-[48px] cursor-pointer"
      >
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="font-bold text-[11px] mt-0.5">ตั้งค่า</span>
      </button>
    </nav>
  );
};
