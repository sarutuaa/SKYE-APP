import React, { useState } from 'react';
import { Task, TYPE_META, STATUS_META } from '../types';
import { normalizeAttachmentUrl } from '../utils/attachmentHelper';

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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="w-9 h-9 rounded-xl border border-[#eae1d6] bg-[#faf6f0] hover:bg-[#f6ece2] flex items-center justify-center font-bold text-[#1f1b15] transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
              weekOffset === 0
                ? 'bg-[#98d8c1] border-[#98d8c1] text-[#002118]'
                : 'border-[#eae1d6] bg-[#faf6f0] hover:bg-[#f6ece2] text-[#707974]'
            }`}
          >
            สัปดาห์นี้
          </button>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="w-9 h-9 rounded-xl border border-[#eae1d6] bg-[#faf6f0] hover:bg-[#f6ece2] flex items-center justify-center font-bold text-[#1f1b15] transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>

        <div className="font-extrabold text-sm sm:text-base text-[#1f1b15]">
          📅 {rangeLabel}
        </div>
      </div>

      {/* 7 Days Columns */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((dayObj, index) => {
          const dateKey = formatKey(dayObj);
          const isToday = dateKey === todayKey;
          const dayTasks = tasks.filter((t) => t.date === dateKey);

          return (
            <div
              key={dateKey}
              className={`flex flex-col rounded-2xl border-2 transition-all min-h-[300px] ${
                isToday
                  ? 'bg-[#f0f9f5] border-[#98d8c1] shadow-md'
                  : 'bg-white border-[#eae1d6] shadow-xs'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b-2 flex flex-col items-center justify-center ${
                  isToday
                    ? 'bg-[#98d8c1]/30 border-[#98d8c1]'
                    : 'bg-[#faf6f0] border-[#eae1d6]'
                }`}
              >
                <span className="text-[11px] font-extrabold text-[#707974]">
                  {weekdayLabels[index]}
                </span>
                <span
                  className={`text-lg font-black mt-0.5 ${
                    isToday ? 'text-[#006a4e]' : 'text-[#1f1b15]'
                  }`}
                >
                  {dayObj.getDate()}
                </span>
                {isToday && (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-[#006a4e] text-white text-[9px] font-black tracking-wider">
                    วันนี้
                  </span>
                )}
              </div>

              {/* Tasks List for this day */}
              <div className="p-2 flex flex-col gap-2 flex-1">
                {dayTasks.map((task) => {
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

                      {/* Attachment / Image badges with direct open */}
                      {((task.attachments && task.attachments.length > 0) || task.imageUrl) && (
                        <div className="flex flex-wrap items-center gap-1 mt-0.5 z-20" onClick={(e) => e.stopPropagation()}>
                          {task.attachments?.map((att) => {
                            const isWebLink = att.url.startsWith('http://') || att.url.startsWith('https://') || att.isLink;
                            const finalUrl = normalizeAttachmentUrl(att.url);
                            
                            if (isWebLink) {
                              return (
                                <a
                                  key={att.id}
                                  href={finalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white border border-black/15 text-[#002118] hover:bg-[#e8f0fe] transition-colors no-underline shadow-2xs"
                                  title={`เปิดดู: ${att.name || 'เอกสาร'}`}
                                >
                                  <span>
                                    {att.type === 'word' ? '📄' : att.type === 'pdf' ? '📕' : att.type === 'drive' ? '📁' : '🔗'}
                                  </span>
                                  <span className="truncate max-w-[65px]">{att.name || 'เอกสาร'}</span>
                                  <span className="material-symbols-outlined text-[10px] opacity-70">open_in_new</span>
                                </a>
                              );
                            }

                            return (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => {
                                  if (att.type === 'image') setPreviewImageUrl(att.url);
                                  else window.open(att.url, '_blank');
                                }}
                                className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white border border-black/15 text-[#002118] hover:bg-[#faf6f0] transition-colors shadow-2xs"
                                title={att.name}
                              >
                                <span>
                                  {att.type === 'image' ? '🖼️' : '📎'}
                                </span>
                                <span className="truncate max-w-[65px]">{att.name || 'ไฟล์'}</span>
                              </button>
                            );
                          })}

                          {task.imageUrl && !task.attachments?.some((a) => a.url === task.imageUrl) && (
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(task.imageUrl!)}
                              className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#e2f5ee] border border-[#a2e3cd] text-[#006a4e] hover:bg-[#c0eada] transition-colors shadow-2xs cursor-pointer"
                              title="ดูรูปภาพแนบ"
                            >
                              <span className="material-symbols-outlined text-[12px]">image</span>
                              <span>รูป</span>
                            </button>
                          )}
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
                  className="mt-auto py-1.5 px-2 rounded-xl border border-dashed border-[#bfc9c3] text-[#707974] hover:bg-[#f6ece2] text-xs font-bold flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>เพิ่มงาน</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] flex flex-col items-center bg-white/10 p-3 sm:p-5 rounded-3xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImageUrl}
              alt="รูปภาพขยาย"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-6 py-2.5 rounded-full bg-white text-[#1f1b15] font-black text-sm shadow-xl hover:bg-[#e2f5ee] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>ปิดหน้าต่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
