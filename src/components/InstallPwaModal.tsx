import React, { useState, useEffect } from 'react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for install prompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center max-sm:items-end p-3 sm:p-4 max-sm:p-0 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl max-sm:rounded-b-none max-sm:rounded-t-3xl p-5 sm:p-6 shadow-2xl border-2 border-[#eae1d6] max-sm:border-x-0 max-sm:border-b-0 flex flex-col gap-5 overflow-hidden animate-popIn"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#eae1d6] rounded-full mx-auto sm:hidden" />

        {/* Header Icon & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Skye Homework Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-[#296956]"
            />
            <div>
              <div className="inline-block text-[11px] font-bold text-[#296956] bg-[#e2f5ee] px-2.5 py-0.5 rounded-full mb-1">
                📱 Progressive Web App
              </div>
              <h2 className="text-xl font-black text-[#1f1b15] tracking-tight">
                ติดตั้งแอปบนมือถือ
              </h2>
              <p className="text-xs text-[#707974] font-medium">
                Skye Homework • บันทึกการบ้าน REPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f0e7dc] text-[#707974] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Section */}
        {isInstalled ? (
          <div className="bg-[#f0f9f5] border border-[#d0ece1] rounded-2xl p-4 text-center space-y-2">
            <span className="text-3xl">🎉</span>
            <h3 className="text-base font-extrabold text-[#296956]">ติดตั้งแอปเรียบร้อยแล้ว!</h3>
            <p className="text-xs text-[#555f5a]">
              คุณสามารถใช้งาน Skye Homework ได้จากหน้าจอหลักบนมือถือได้ทันที
            </p>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <p className="text-sm text-[#555f5a] font-medium">
              คลิกปุ่มด้านล่างเพื่อเพิ่มไอคอนแอปไปยังหน้าจอหลักมือถือ ใช้งานได้สะดวกรวดเร็วเสมือนแอปจริง
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-[#296956] hover:bg-[#1e5243] text-white font-extrabold text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_to_home_screen</span>
              <span>กดเพื่อติดตั้งลงหน้าจอมือถือ</span>
            </button>
          </div>
        ) : isIos ? (
          <div className="space-y-3 bg-[#faf6f0] border border-[#eae1d6] p-4 rounded-2xl text-xs text-[#1f1b15]">
            <h3 className="font-extrabold text-sm text-[#296956] flex items-center gap-1.5">
              <span>🍎 วิธีติดตั้งสำหรับ iPhone / iPad (Safari):</span>
            </h3>
            <ol className="space-y-2 pl-4 list-decimal text-[#555f5a] font-medium leading-relaxed">
              <li>
                แตะปุ่ม <span className="font-bold text-[#1f1b15]">แชร์ (Share)</span>{' '}
                <span className="material-symbols-outlined text-[16px] inline-block align-middle text-[#0c6780]">
                  ios_share
                </span>{' '}
                ที่แถบล่างสุดของเบราว์เซอร์ Safari
              </li>
              <li>
                เลื่อนเมนูลงมาแล้วเลือก{' '}
                <span className="font-bold text-[#1f1b15]">"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</span> ➕
              </li>
              <li>
                แตะปุ่ม <span className="font-bold text-[#296956]">"เพิ่ม" (Add)</span> มุมขวาบน เพื่อเสร็จสิ้น
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 bg-[#faf6f0] border border-[#eae1d6] p-4 rounded-2xl text-xs text-[#1f1b15]">
            <h3 className="font-extrabold text-sm text-[#296956] flex items-center gap-1.5">
              <span>🤖 วิธีติดตั้งสำหรับ Android / Chrome:</span>
            </h3>
            <ol className="space-y-2 pl-4 list-decimal text-[#555f5a] font-medium leading-relaxed">
              <li>
                แตะจุด 3 จุด <span className="font-bold text-[#1f1b15]">(⋮)</span> มุมบนขวาของ Chrome
              </li>
              <li>
                เลือกเมนู <span className="font-bold text-[#1f1b15]">"ติดตั้งแอป" (Install app)</span> หรือ{' '}
                <span className="font-bold text-[#1f1b15]">"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</span>
              </li>
              <li>ยืนยันการติดตั้งเพื่อเข้าใช้อย่างรวดเร็ว</li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#f0e7dc] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#f0e7dc] hover:bg-[#e4d8c8] text-[#1f1b15] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
