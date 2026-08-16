import React from 'react';
import { Child, STUDENTS, Task } from '../types';

interface StudentLandingPageProps {
  onSelectChild: (childId: string) => void;
  tasks: Task[];
  onOpenAi: () => void;
  onOpenAdd: () => void;
  onOpenSettings: () => void;
  onOpenInstallPwa?: () => void;
}

export const StudentLandingPage: React.FC<StudentLandingPageProps> = ({
  onSelectChild,
  tasks,
  onOpenAi,
  onOpenAdd,
  onOpenSettings,
  onOpenInstallPwa,
}) => {
  const getChildStats = (childId: string) => {
    const childTasks = tasks.filter((t) => (t.childId || 'sky') === childId);
    const pending = childTasks.filter((t) => t.status !== 'done');
    const exams = childTasks.filter((t) => t.type === 'exam' && t.status !== 'done');
    const done = childTasks.filter((t) => t.status === 'done');
    return {
      total: childTasks.length,
      pendingCount: pending.length,
      examCount: exams.length,
      doneCount: done.length,
    };
  };

  const totalPendingAll = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#f0f9f5] via-[#fffbf7] to-[#f0f8fc] rounded-3xl p-6 md:p-8 border-2 border-[#d0ece1] shadow-sm">
        <div className="absolute -right-6 -bottom-6 text-[#296956]/5 text-9xl font-black pointer-events-none select-none">
          🎒
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#e2f5ee] border border-[#a2e3cd] px-3.5 py-1 rounded-full text-xs font-bold text-[#296956] tracking-wide">
              <span>🏡 หน้าหลักบันทึกการบ้านคุณแม่</span>
              <span className="w-2 h-2 rounded-full bg-[#296956] animate-pulse" />
            </div>
            <h1 className="font-black text-[#1f1b15] tracking-tight leading-tight" style={{ fontSize: '22px' }}>
              เลือกสมุดการบ้านของลูกเรียน
            </h1>
            <p className="text-sm md:text-base text-[#555f5a] max-w-xl font-medium">
              มีงานค้างรวมทั้งหมด{' '}
              <span className="font-extrabold text-[#944748] bg-[#fff2f2] border border-[#ffb3b2] px-2.5 py-0.5 rounded-md">
                {totalPendingAll} รายการ
              </span>{' '}
              คลิกเลือกชื่อนักเรียนเพื่อดูและจัดการงานรายบุคคล
            </p>
          </div>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onOpenAi}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#296956] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:bg-[#1e5243] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
              <span>AI ช่วยจด</span>
            </button>
            <button
              onClick={onOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#fff2f2] border border-[#ffb3b2] text-[#944748] font-extrabold text-xs sm:text-sm shadow-xs hover:bg-[#ffe5e5] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>เพิ่มงาน</span>
            </button>
            {onOpenInstallPwa && (
              <button
                onClick={onOpenInstallPwa}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#a2e3cd] text-[#296956] font-extrabold text-xs sm:text-sm shadow-xs hover:bg-[#e2f5ee] active:scale-95 transition-all cursor-pointer"
                title="ติดตั้งแอปไอคอนลงหน้าจอมือถือ"
              >
                <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
                <span>ติดตั้งแอปมือถือ</span>
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-[#eae1d6] hover:bg-[#faf6f0] text-[#555f5a] font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer shadow-xs ${
                !onOpenInstallPwa ? 'col-span-2 sm:col-span-1' : ''
              }`}
              title="ตั้งค่า"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>ตั้งค่า</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-[#1f1b15] flex items-center gap-2">
            <span style={{ fontSize: '15px' }}>🐾 รายชื่อนักเรียน (3 คน)</span>
          </h2>
          <span className="font-bold text-[#707974] bg-[#f0e7dc] px-3 py-1 rounded-full" style={{ fontSize: '10px' }}>
            แตะที่การ์ดเพื่อเปิดดูสมุดการบ้าน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STUDENTS.map((child: Child) => {
            const stats = getChildStats(child.id);

            return (
              <div
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className="group relative bg-white rounded-3xl p-5 border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                style={{ borderColor: child.badgeBg }}
              >
                {/* Background decorative accent tint */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 pointer-events-none transition-transform group-hover:scale-110"
                  style={{ backgroundColor: child.themeColor }}
                />

                {/* Card Header: Cute Avatar + Student Info */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-20 h-20 rounded-2xl object-cover border-4 shadow-md group-hover:scale-105 transition-transform"
                        style={{ borderColor: child.themeColor }}
                      />
                      <span
                        className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs border border-white"
                        style={{
                          backgroundColor: child.badgeBg,
                          color: child.badgeTextColor,
                        }}
                      >
                        {child.grade}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="inline-block text-xs font-black text-[#1f1b15] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#eae1d6]">
                        🏫 {child.school || 'REPS'}
                      </span>
                      {child.animalName && (
                        <span className="text-[11px] font-extrabold text-[#707974] bg-white px-2 py-0.5 rounded-full border border-[#f0e7dc]">
                          {child.animalName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className="text-2xl font-black tracking-tight flex items-center gap-2"
                      style={{ color: child.themeColor }}
                    >
                      <span>{child.name}</span>
                    </h3>
                    <p className="text-xs text-[#707974] font-semibold mt-0.5">
                      โรงเรียน REPS • ชั้นเรียน {child.grade}
                    </p>
                  </div>

                  {/* Task Quick Stats Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-[#faf6f0] p-2.5 rounded-xl border border-[#eae1d6] flex flex-col">
                      <span className="text-[11px] font-bold text-[#707974]">งานค้างทั้งหมด</span>
                      <span
                        className={`text-base font-extrabold ${
                          stats.pendingCount > 0 ? 'text-[#944748]' : 'text-[#296956]'
                        }`}
                      >
                        {stats.pendingCount > 0 ? `⏳ ${stats.pendingCount} งาน` : '🎉 ครบแล้ว'}
                      </span>
                    </div>

                    <div className="bg-[#faf6f0] p-2.5 rounded-xl border border-[#eae1d6] flex flex-col">
                      <span className="text-[11px] font-bold text-[#707974]">มีสอบเร็วๆ นี้</span>
                      <span className="text-base font-extrabold text-[#0c6780]">
                        {stats.examCount > 0 ? `🎯 ${stats.examCount} วิชา` : 'ไม่มีสอบ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button Footer */}
                <div className="relative z-10 mt-6 pt-3 border-t border-[#f0e7dc]">
                  <button
                    className="w-full py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 text-white shadow-md group-hover:shadow-lg transition-all"
                    style={{ backgroundColor: child.themeColor }}
                  >
                    <span>เปิดสมุดการบ้าน{child.name}</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
