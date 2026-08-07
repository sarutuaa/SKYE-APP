import React from 'react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAiModal: () => void;
  onOpenSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenAiModal,
  onOpenSettings,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg.white/95 dark:bg-[#1f1b15]/95 border-t-2 border-[#98d8c1] shadow-lg rounded-t-3xl z-40 md:hidden backdrop-blur-md">
      {/* Tasks List */}
      <button
        onClick={() => onViewChange('list')}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition-all min-w-[68px] ${
          currentView === 'list'
            ? 'bg-[#98d8c1] text-[#1e604e] font-black shadow-xs'
            : 'text-[#707974] hover:bg-[#f6ece2]'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">assignment</span>
        <span className="font-bold text-[11px] mt-0.5">รายการ</span>
      </button>

      {/* Calendar View */}
      <button
        onClick={() => onViewChange('month')}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition-all min-w-[68px] ${
          currentView === 'month' || currentView === 'week'
            ? 'bg-[#98d8c1] text-[#1e604e] font-black shadow-xs'
            : 'text-[#707974] hover:bg-[#f6ece2]'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">calendar_month</span>
        <span className="font-bold text-[11px] mt-0.5">ปฏิทิน</span>
      </button>

      {/* AI Assistant */}
      <button
        onClick={onOpenAiModal}
        className="flex flex-col items-center justify-center text-[#005d76] px-4 py-1.5 hover:bg-[#f0f9ff] rounded-2xl active:scale-95 transition-all min-w-[68px]"
      >
        <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
        <span className="font-bold text-[11px] mt-0.5">AI ช่วยจด</span>
      </button>

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center text-[#707974] px-4 py-1.5 hover:bg-[#f6ece2] rounded-2xl active:scale-95 transition-all min-w-[68px]"
      >
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="font-bold text-[11px] mt-0.5">ตั้งค่า</span>
      </button>
    </nav>
  );
};
