import React from 'react';

interface FloatingActionsProps {
  onOpenAi: () => void;
  onOpenAdd: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ onOpenAi, onOpenAdd }) => {
  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 flex flex-col gap-3 z-40 items-end">
      {/* AI Sparkle FAB */}
      <button
        onClick={onOpenAi}
        className="btn-pressable w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#baeaff] shadow-[0_4px_0_0_#89d0ed] flex items-center justify-center text-[#0c6780] hover:bg-[#baeaff]/40 transition-colors group"
        title="✨ ให้ AI ช่วยอ่านข้อความครู"
      >
        <span className="material-symbols-outlined text-[26px] sm:text-[28px] group-hover:rotate-12 transition-transform duration-300">
          auto_awesome
        </span>
      </button>

      {/* Primary Add FAB */}
      <button
        onClick={onOpenAdd}
        className="btn-pressable px-5 py-3.5 sm:px-6 sm:py-4 rounded-full bg-[#296956] text-white border-2 border-[#1e604e] shadow-[0_5px_0_0_#1e604e] flex items-center justify-center gap-2 hover:bg-[#1e604e] transition-colors font-extrabold text-xs sm:text-sm uppercase tracking-wider group"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
          add
        </span>
        <span>เพิ่มงาน</span>
      </button>
    </div>
  );
};
