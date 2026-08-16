import React from 'react';

interface HeaderProps {
  childName: string;
  childGrade: string;
  avatarUrl: string;
  syncStatus: 'syncing' | 'ok' | 'error';
  lastSynced: Date | null;
  onRefresh: () => void;
  onOpenAi: () => void;
  onOpenAdd: () => void;
  onOpenSettings: () => void;
  onGoHome?: () => void;
  onOpenInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  childName,
  childGrade,
  avatarUrl,
  syncStatus,
  lastSynced,
  onRefresh,
  onOpenAi,
  onOpenAdd,
  onOpenSettings,
  onGoHome,
  onOpenInstallPwa,
}) => {
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return '—';
    const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
    if (diffSec < 10) return 'เมื่อสักครู่';
    if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`;
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    const diffHr = Math.round(diffMin / 60);
    return `${diffHr} ชั่วโมงที่แล้ว`;
  };

  const getSyncText = () => {
    if (syncStatus === 'syncing') return 'กำลังซิงค์...';
    if (syncStatus === 'error') return 'ซิงค์ไม่สำเร็จ (แตะเพื่อลองใหม่)';
    return `ซิงค์แล้ว • ${formatTimeAgo(lastSynced)}`;
  };

  return (
    <header className="w-full sticky top-0 bg-[#fff8f3]/90 dark:bg-[#e2d9ce]/90 z-40 rounded-b-2xl px-4 md:px-0 py-3 shadow-sm backdrop-blur-md transition-all">
      <div className="flex items-center justify-between h-16 w-full max-w-7xl mx-auto">
        {/* Leading Avatar & Kid Name + Back to Landing Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#eae1d6] text-[#296956] font-bold text-xs sm:text-sm hover:bg-[#f0f9f5] active:scale-95 transition-all shadow-xs cursor-pointer"
              title="สลับเลือกลูกเรียนคนอื่น"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span className="hidden sm:inline">สลับคน</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onOpenSettings}>
            <div className="relative">
              <img
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#98d8c1] shadow-xs group-hover:scale-105 transition-transform"
                src={avatarUrl}
                alt="Avatar"
              />
              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                  syncStatus === 'syncing'
                    ? 'bg-[#8ed5f2] animate-ping'
                    : syncStatus === 'error'
                    ? 'bg-[#ff9e9e]'
                    : 'bg-[#98d8c1]'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-['Plus_Jakarta_Sans','Noto_Sans_Thai'] text-[#296956] font-extrabold tracking-tight flex items-center gap-1.5" style={{ fontSize: '18px' }}>
                <span>{childName}</span>
                {childGrade && (
                  <span className="text-[11px] sm:text-xs bg-[#aff0d8] text-[#002118] px-2 py-0.5 rounded-full font-bold">
                    {childGrade}
                  </span>
                )}
              </h1>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                className="text-[11px] sm:text-xs text-[#707974] font-semibold flex items-center gap-1 hover:text-[#296956] transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[13px] text-[#296956]">
                  {syncStatus === 'syncing' ? 'sync' : syncStatus === 'error' ? 'sync_problem' : 'cloud_done'}
                </span>
                <span style={{ fontSize: '7px' }}>{getSyncText()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Install PWA Button */}
          {onOpenInstallPwa && (
            <button
              onClick={onOpenInstallPwa}
              className="p-2 rounded-full bg-[#e2f5ee] hover:bg-[#d0ece1] text-[#296956] active:scale-90 transition-transform"
              title="วิธีติดตั้งลงมือถือ"
            >
              <span className="material-symbols-outlined text-[20px]">add_to_home_screen</span>
            </button>
          )}

          {/* AI Helper Button */}
          <button
            onClick={onOpenAi}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#8ed5f2] bg-white text-[#005d76] font-bold text-sm shadow-sm hover:bg-[#f0f9ff] active:scale-95 transition-all"
            title="ให้ AI ช่วยถอดข้อความครู/ไลน์กลุ่ม"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0c6780]">
              auto_awesome
            </span>
            <span>AI ช่วยจด</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={onOpenAdd}
            className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-full bg-[#ff9e9e] border-2 border-[#ffb3b2] text-[#3d050b] font-extrabold text-sm shadow-sm hover:bg-[#ffb3b2] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>เพิ่มงาน</span>
          </button>

          {/* Refresh Icon Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-full hover:bg-[#f0e7dc] text-[#404945] active:scale-90 transition-transform"
            title="ซิงค์ข้อมูลชั่วคราว"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                syncStatus === 'syncing' ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-[#f0e7dc] text-[#404945] active:scale-90 transition-transform"
            title="ตั้งค่า"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
