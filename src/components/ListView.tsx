import React, { useState } from 'react';
import { Task, TaskStatus, TYPE_META, STATUS_META, STATUS_ORDER } from '../types';
import { AttachmentList } from './AttachmentList';

interface ListViewProps {
  tasks: Task[];
  onOpenEdit: (task: Task) => void;
  onCycleStatus: (taskId: string, e: React.MouseEvent) => void;
  isCompletedView?: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onOpenEdit,
  onCycleStatus,
  isCompletedView = false,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const getTodayStr = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr(0);
  const tomorrowStr = getTodayStr(1);

  // Group tasks by date
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const key = task.date || todayStr;
    if (!groupedTasks[key]) groupedTasks[key] = [];
    groupedTasks[key].push(task);
  });

  const sortedDates = Object.keys(groupedTasks).sort();

  const formatGroupHeader = (dateStr: string) => {
    if (dateStr === todayStr) return isCompletedView ? 'วันนี้ (ทำเสร็จแล้ว)' : 'วันนี้ (งานที่ต้องทำ)';
    if (dateStr === tomorrowStr) return 'พรุ่งนี้';

    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    return `${thaiDays[dateObj.getDay()]}ที่ ${d} ${thaiMonths[m - 1]} ${y + 543}`;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-[#eae1d6] text-center my-6">
        <div className="text-5xl mb-3">{isCompletedView ? '✨' : '🎉'}</div>
        <h3 className="font-bold text-lg text-[#1f1b15]">
          {isCompletedView ? 'ยังไม่มีงานที่ทำเสร็จแล้ว' : 'ไม่มีงานค้างอยู่ในขณะนี้!'}
        </h3>
        <p className="text-sm text-[#707974] mt-1">
          {isCompletedView
            ? 'เมื่อทำการบ้านหรือกิจกรรมเสร็จแล้ว สามารถกดเปลี่ยนสถานะเป็น "เสร็จแล้ว" เพื่อย้ายมาที่นี่ได้เลย'
            : 'คุณสามารถกดปุ่ม "+ เพิ่มงาน" เพื่อสร้างรายการใหม่ได้เลย'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="px-2 -mb-2">
        <h2 className="font-['Plus_Jakarta_Sans','Noto_Sans_Thai'] font-extrabold text-[#296956] flex items-center gap-2">
          <span style={{ fontSize: '15px' }}>{isCompletedView ? 'งานที่ทำเสร็จแล้ว ✅' : 'งานที่ต้องทำ'}</span>
          <span className="text-[#707974] bg-[#f0e7dc] px-2 py-0.5 rounded-full font-bold inline-flex items-center justify-center" style={{ fontSize: '9px' }}>
            {tasks.length}
          </span>
        </h2>
        <p className="text-[#404945] text-sm mt-0.5">
          {isCompletedView
            ? 'รายการงานและกิจกรรมที่สะสางเรียบร้อยแล้ว'
            : 'รายการงานที่ยังไม่เสร็จสิ้นสำหรับการจัดการรายวัน'}
        </p>
      </div>

      {sortedDates.map((dateStr) => {
        const groupItems = groupedTasks[dateStr];
        const isToday = dateStr === todayStr;
        const isTomorrow = dateStr === tomorrowStr;

        return (
          <section key={dateStr} className={`flex flex-col gap-4 ${isTomorrow ? 'opacity-90' : ''}`}>
            {/* Group Header */}
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#1f1b15] flex items-center gap-2">
                <span
                  className={`w-2.5 h-6 rounded-full inline-block ${
                    isToday ? 'bg-[#296956]' : 'bg-[#eae1d6]'
                  }`}
                />
                <span>{formatGroupHeader(dateStr)}</span>
              </h3>
              <span className="font-bold text-xs text-[#707974] bg-[#f0e7dc] px-3 py-1 rounded-full">
                {groupItems.length} งาน
              </span>
            </div>

            {/* Grid of Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {groupItems.map((task) => {
                const typeMeta = TYPE_META[task.type] || TYPE_META.homework;
                const statusMeta = STATUS_META[task.status] || STATUS_META.not_started;
                const isUrgent =
                  task.time?.includes('ส่งพรุ่งนี้') ||
                  (task.date < todayStr && task.status !== 'done');

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenEdit(task)}
                    className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(41,105,86,0.05)] border-2 border-[#98d8c1] hover:border-[#296956] transition-all duration-300 bouncy-hover bouncy-active flex flex-col justify-between gap-4 relative overflow-hidden group cursor-pointer min-h-[170px]"
                  >
                    {/* Corner Deco */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#98d8c1]/40 rounded-bl-[40px] -mr-4 -mt-4 group-hover:scale-110 transition-transform pointer-events-none" />

                    {/* Top Tag & Options */}
                    <div className="flex justify-between items-start z-10">
                      <span
                        style={{
                          backgroundColor: typeMeta.bg,
                          color: typeMeta.textColor,
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {typeMeta.materialIcon}
                        </span>
                        <span>{typeMeta.label}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEdit(task);
                        }}
                        className="text-[#bfc9c3] hover:text-[#296956] p-1 transition-colors rounded-full"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>

                    {/* Title & Subject */}
                    <div className="flex flex-col gap-1 z-10">
                      <h4 className="text-base sm:text-lg font-bold text-[#1f1b15] leading-snug line-clamp-2">
                        {task.title}
                      </h4>
                      {task.subject && (
                        <p className="text-xs sm:text-sm text-[#404945]">
                          วิชา: {task.subject}
                        </p>
                      )}
                      {task.location && (
                        <p className="text-xs sm:text-sm text-[#404945]">
                          สถานที่: {task.location}
                        </p>
                      )}
                      {/* Attachments (Word Online, PDF, Drive, Files) & Image */}
                      {(task.attachments?.length || task.imageUrl) && (
                        <div className="mt-2 z-20">
                          <AttachmentList
                            attachments={task.attachments}
                            imageUrl={task.imageUrl}
                            mode="compact"
                            onPreviewImage={(url) => setPreviewImageUrl(url)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Time/Deadline & Status Cycle Button */}
                    <div className="mt-1 flex items-center justify-between z-10 pt-2 border-t border-[#f6ece2]">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold ${
                          isUrgent ? 'text-[#ba1a1a]' : 'text-[#404945]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{task.time || 'ในกำหนด'}</span>
                      </div>

                      {/* Status Button */}
                      <button
                        onClick={(e) => onCycleStatus(task.id, e)}
                        style={{
                          backgroundColor: statusMeta.bg,
                          color: statusMeta.color,
                          borderColor: statusMeta.borderColor,
                        }}
                        className="px-3 py-1 rounded-full border-2 text-xs font-extrabold flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all"
                        title="แตะเพื่อเปลี่ยนสถานะ"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {statusMeta.materialIcon}
                        </span>
                        <span>{statusMeta.label}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Full Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewImageUrl}
              alt="รูปภาพขยาย"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="mt-3 px-5 py-2 rounded-full bg-white text-[#1f1b15] font-extrabold text-sm shadow-lg hover:bg-[#e2f5ee] transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
