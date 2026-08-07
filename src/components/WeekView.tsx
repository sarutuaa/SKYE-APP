import React, { useState } from 'react';
import { Task, TYPE_META, STATUS_META } from '../types';

interface WeekViewProps {
  tasks: Task[];
  onOpenEdit: (task: Task) => void;
  onOpenAddDate: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  tasks,
  onOpenEdit,
  onOpenAddDate,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const getTodayDate = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  const today = getTodayDate();

  const getMondayOf = (d: Date) => {
    const day = (d.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
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

  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const weekdayLabels = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  const weekMonday = addDays(getMondayOf(today), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i));

  const startDay = weekDays[0];
  const endDay = weekDays[6];
  const rangeLabel = `${startDay.getDate()} ${thaiMonthsShort[startDay.getMonth()]} – ${endDay.getDate()} ${thaiMonthsShort[endDay.getMonth()]} ${startDay.getFullYear() + 543}`;

  const todayKey = formatKey(today);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-2xl border-2 border-[#eae1d6] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white font-extrabold hover:bg-[#f6ece2] flex items-center justify-center transition-all active:scale-95"
          >
            ‹
          </button>
          <span className="font-bold text-base sm:text-lg text-[#1f1b15] px-2">
            {rangeLabel}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white font-extrabold hover:bg-[#f6ece2] flex items-center justify-center transition-all active:scale-95"
          >
            ›
          </button>
        </div>

        <button
          onClick={() => setWeekOffset(0)}
          className="px-4 py-2 rounded-full border-2 border-[#98d8c1] bg-[#aff0d8] text-[#002118] font-extrabold text-sm hover:bg-[#98d8c1] transition-all shadow-xs"
        >
          สัปดาห์นี้ 🌟
        </button>
      </div>

      {/* 7-Day Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {weekDays.map((d, idx) => {
          const dateKey = formatKey(d);
          const isToday = dateKey === todayKey;
          const dayItems = tasks.filter((t) => t.date === dateKey);

          return (
            <div
              key={dateKey}
              className={`rounded-2xl border-2 min-h-[220px] flex flex-col transition-all ${
                isToday
                  ? 'bg-[#fcf2e7] border-[#ff9e9e] shadow-md'
                  : 'bg-white border-[#eae1d6]'
              }`}
            >
              {/* Day Header */}
              <div
                onClick={() => onOpenAddDate(dateKey)}
                className={`p-3 text-center border-b-2 border-dashed border-[#eae1d6] cursor-pointer hover:bg-[#f6ece2]/50 transition-colors ${
                  isToday ? 'bg-[#ffdad9]/30 text-[#763032]' : 'text-[#707974]'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">
                  {weekdayLabels[idx]}
                </div>
                <div className="text-xl font-extrabold mt-0.5">
                  {d.getDate()}
                </div>
              </div>

              {/* Day Tasks */}
              <div className="flex flex-col gap-2 p-2.5 flex-1">
                {dayItems.map((task) => {
                  const typeMeta = TYPE_META[task.type] || TYPE_META.homework;
                  const statusMeta = STATUS_META[task.status] || STATUS_META.not_started;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenEdit(task)}
                      style={{
                        backgroundColor: typeMeta.bg,
                        borderColor: typeMeta.borderColor,
                      }}
                      className="p-2.5 rounded-xl border-2 cursor-pointer shadow-2xs hover:-translate-y-0.5 transition-transform flex flex-col gap-1"
                    >
                      <div className="text-xs font-bold text-[#1f1b15] leading-snug line-clamp-2">
                        {typeMeta.icon} {task.title}
                      </div>
                      {task.subject && (
                        <div className="text-[11px] text-[#404945] font-semibold">
                          {task.subject}
                        </div>
                      )}
                      <div className="text-[10px] font-bold text-[#07513f] mt-1 pt-1 border-t border-black/5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          {statusMeta.materialIcon}
                        </span>
                        <span>{statusMeta.label}</span>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => onOpenAddDate(dateKey)}
                  className="mt-auto py-1.5 px-2 rounded-xl border border-dashed border-[#bfc9c3] text-[#707974] hover:bg-[#f6ece2] text-xs font-bold flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>เพิ่มงาน</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
