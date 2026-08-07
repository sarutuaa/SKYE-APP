import React, { useState } from 'react';
import { Task, TYPE_META } from '../types';

interface MonthViewProps {
  tasks: Task[];
  onOpenEdit: (task: Task) => void;
  onOpenAddDate: (dateStr: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  tasks,
  onOpenEdit,
  onOpenAddDate,
}) => {
  const getTodayDate = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  const today = getTodayDate();
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const getMondayOf = (d: Date) => {
    const day = (d.getDay() + 6) % 7;
    const r = new Date(d);
    r.setDate(d.getDate() - day);
    return r;
  };

  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  const formatKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const weekdayShorts = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const gridStart = getMondayOf(firstOfMonth);
  const gridDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const todayKey = formatKey(today);
  const monthLabel = `${thaiMonthsFull[monthCursor.getMonth()]} ${monthCursor.getFullYear() + 543}`;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-2xl border-2 border-[#eae1d6] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
            }
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white font-extrabold hover:bg-[#f6ece2] flex items-center justify-center transition-all active:scale-95"
          >
            ‹
          </button>
          <span className="font-bold text-lg text-[#1f1b15] px-2">
            {monthLabel}
          </span>
          <button
            onClick={() =>
              setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
            }
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white font-extrabold hover:bg-[#f6ece2] flex items-center justify-center transition-all active:scale-95"
          >
            ›
          </button>
        </div>

        <button
          onClick={() => setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          className="px-4 py-2 rounded-full border-2 border-[#98d8c1] bg-[#aff0d8] text-[#002118] font-extrabold text-sm hover:bg-[#98d8c1] transition-all shadow-xs"
        >
          เดือนนี้ 🌟
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border-2 border-[#eae1d6] shadow-sm">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {weekdayShorts.map((wl) => (
            <div
              key={wl}
              className="text-center font-extrabold text-xs sm:text-sm text-[#707974] py-1"
            >
              {wl}
            </div>
          ))}
        </div>

        {/* 42 Calendar Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {gridDays.map((d) => {
            const dateKey = formatKey(d);
            const inMonth = d.getMonth() === monthCursor.getMonth();
            const isToday = dateKey === todayKey;
            const dayItems = tasks.filter((t) => t.date === dateKey);

            const shownItems = dayItems.slice(0, 3);
            const overflow = dayItems.length - shownItems.length;

            return (
              <div
                key={dateKey}
                onClick={() => onOpenAddDate(dateKey)}
                className={`rounded-2xl p-1.5 sm:p-2.5 min-h-[90px] sm:min-h-[110px] cursor-pointer border-2 transition-all flex flex-col justify-between ${
                  !inMonth ? 'opacity-35 bg-transparent border-transparent' : 'bg-white border-[#eae1d6] hover:border-[#98d8c1] hover:-translate-y-0.5 shadow-2xs'
                } ${isToday ? 'bg-[#fcf2e7] border-[#ff9e9e] ring-2 ring-[#ff9e9e]/30' : ''}`}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      isToday
                        ? 'bg-[#ff9e9e] text-[#3d050b] px-2 py-0.5 rounded-full font-black'
                        : 'text-[#404945]'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#296956]" />
                  )}
                </div>

                {/* Task Chips */}
                <div className="flex flex-col gap-1 mt-1">
                  {shownItems.map((item) => {
                    const typeMeta = TYPE_META[item.type] || TYPE_META.homework;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEdit(item);
                        }}
                        style={{
                          backgroundColor: typeMeta.bg,
                          color: typeMeta.textColor,
                        }}
                        className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold truncate flex items-center gap-1 shadow-2xs hover:scale-102 transition-transform"
                      >
                        <span className="text-[10px]">{typeMeta.icon}</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                    );
                  })}

                  {overflow > 0 && (
                    <div className="text-[10px] font-extrabold text-[#707974] px-1">
                      +{overflow} รายการ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
