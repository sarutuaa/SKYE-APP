import React from 'react';
import { Child, STUDENTS, Task } from '../types';

interface ChildSelectorProps {
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  tasks: Task[];
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  selectedChildId,
  onSelectChild,
  tasks,
}) => {
  // Calculate remaining pending tasks per child
  const getPendingTaskCount = (childId: string) => {
    return tasks.filter((t) => (t.childId || 'sky') === childId && t.status !== 'done').length;
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-3xl border-2 border-[#eae1d6] shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1 gap-2 flex-wrap sm:flex-nowrap">
        <h2 className="text-base sm:text-lg font-black text-[#1f1b15] flex items-center gap-2">
          <span>🐾 เลือกลูกเรียน (3 คน)</span>
        </h2>
        <span className="text-xs font-semibold text-[#707974] bg-[#f0e7dc] px-2.5 py-1 rounded-full whitespace-nowrap">
          แยกบันทึกข้อมูลงานรายบุคคล
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STUDENTS.map((child: Child) => {
          const isSelected = selectedChildId === child.id;
          const pendingCount = getPendingTaskCount(child.id);

          return (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`relative flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-white shadow-md scale-[1.01] z-10'
                  : 'bg-[#faf6f0] hover:bg-white border-[#eae1d6] opacity-85 hover:opacity-100'
              }`}
              style={{
                borderColor: isSelected ? child.themeColor : '#eae1d6',
              }}
            >
              {/* Left Side: Avatar + Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Avatar with Status Ring */}
                <div className="relative shrink-0">
                  <img
                    src={child.avatarUrl}
                    alt={child.name}
                    className="w-12 h-12 rounded-full object-cover border-2 shadow-xs"
                    style={{ borderColor: child.themeColor }}
                  />
                  {isSelected && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-xs"
                      style={{ backgroundColor: child.themeColor }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-extrabold text-base truncate"
                      style={{ color: isSelected ? child.themeColor : '#1f1b15' }}
                    >
                      {child.name}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: child.badgeBg,
                        color: child.badgeTextColor,
                      }}
                    >
                      {child.grade}
                    </span>
                  </div>

                  <span className="text-[#707974] text-xs font-bold truncate mt-0.5">
                    {child.animalName || child.school || 'REPS'}
                  </span>
                </div>
              </div>

              {/* Right Side: Task Count Badge */}
              <div className="shrink-0 flex items-center">
                <span
                  className={`font-extrabold px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    pendingCount > 0
                      ? 'bg-[#ff9e9e]/25 text-[#944748] border border-[#ffb3b2]/50'
                      : 'bg-[#98d8c1]/25 text-[#296956] border border-[#98d8c1]/50'
                  }`}
                >
                  {pendingCount > 0 ? `${pendingCount} งานค้าง` : 'ครบแล้ว 🎉'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
