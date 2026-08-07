import React from 'react';
import { TaskType, TYPE_META } from '../types';

interface FilterChipsProps {
  activeTypes: Record<TaskType, boolean>;
  onToggleType: (type: TaskType) => void;
  onOpenAddModal: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeTypes,
  onToggleType,
  onOpenAddModal,
}) => {
  const types: TaskType[] = ['homework', 'exam', 'activity'];

  return (
    <div className="flex flex-wrap gap-2.5 items-center w-full px-2 justify-center sm:justify-start">
      <span className="font-bold text-xs text-[#707974] uppercase tracking-wider mr-1">
        ตัวกรอง:
      </span>
      {types.map((type) => {
        const meta = TYPE_META[type];
        const isActive = activeTypes[type];

        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            style={{
              backgroundColor: isActive ? meta.bg : '#f6ece2',
              borderColor: isActive ? meta.borderColor : '#eae1d6',
              color: isActive ? meta.textColor : '#707974',
              opacity: isActive ? 1 : 0.65,
            }}
            className="px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border-2 transition-all duration-200 shadow-sm bouncy-active flex items-center gap-1.5 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[16px]">{meta.materialIcon}</span>
            <span>{meta.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenAddModal}
        className="w-8 h-8 rounded-full bg-[#eae1d6] hover:bg-[#e2d9ce] text-[#404945] flex items-center justify-center transition-colors shadow-sm"
        title="เพิ่มประเภทงานใหม่"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
    </div>
  );
};
