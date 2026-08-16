import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  childGrade: string;
  onUpdateInfo: (name: string, grade: string, newPin?: string) => Promise<void>;
  onResetData: () => Promise<void>;
  onOpenInstallPwa?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  childName,
  childGrade,
  onUpdateInfo,
  onResetData,
  onOpenInstallPwa,
}) => {
  const [name, setName] = useState(childName);
  const [grade, setGrade] = useState(childGrade);
  const [newPin, setNewPin] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsBusy(true);
    setMsg('');
    try {
      await onUpdateInfo(name.trim() || 'น้องสกาย', grade.trim(), newPin.trim() || undefined);
      setMsg('อัปเดตข้อมูลเรียบร้อยแล้ว ✨');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setMsg(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsBusy(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('คุณต้องการรีเซ็ตกลับเป็นข้อมูลตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setIsBusy(true);
      try {
        await onResetData();
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsBusy(false);
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#1f1b15]/60 backdrop-blur-xs flex items-center justify-center max-sm:items-end z-50 p-3 sm:p-4 max-sm:p-0 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-sm:rounded-b-none max-sm:rounded-t-3xl w-full max-w-md max-h-[90vh] max-sm:max-h-[92vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border-2 border-[#eae1d6] max-sm:border-x-0 max-sm:border-b-0 animate-popIn flex flex-col gap-5"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#eae1d6] rounded-full mx-auto sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl font-black text-[#002118] flex items-center gap-2">
            <span>⚙️ ตั้งค่าแอปผู้ช่วยคุณแม่</span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] hover:bg-[#f6ece2] font-bold text-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Student Name */}
        <div>
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
            ชื่อลูกน้อย
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น น้องสกาย"
            className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-bold text-sm text-[#1f1b15] focus:outline-none transition-colors"
          />
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
            ชั้นเรียน / ห้อง
          </label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="เช่น ป.1/3"
            className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-bold text-sm text-[#1f1b15] focus:outline-none transition-colors"
          />
        </div>

        {/* Change PIN */}
        <div>
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
            เปลี่ยนรหัสผ่านปลดล็อก (PIN)
          </label>
          <input
            type="password"
            maxLength={12}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน (เริ่มต้น 5264)"
            className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-bold text-sm text-[#1f1b15] focus:outline-none transition-colors"
          />
        </div>

        {msg && (
          <div className="p-3 bg-[#aff0d8] border border-[#98d8c1] rounded-xl text-xs font-bold text-[#002118]">
            {msg}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {onOpenInstallPwa && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInstallPwa();
              }}
              className="w-full py-3 rounded-2xl bg-[#e2f5ee] border-2 border-[#a2e3cd] text-[#296956] font-extrabold text-xs shadow-xs hover:bg-[#d0ece1] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
              <span>📲 เพิ่มแอปไปยังหน้าจอมือถือ (Install PWA)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isBusy}
            className="w-full py-3.5 rounded-full bg-[#98d8c1] border-2 border-[#aff0d8] text-[#1e604e] font-black text-sm shadow-md hover:bg-[#aff0d8] active:scale-95 transition-all"
          >
            {isBusy ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง ✨'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isBusy}
            className="w-full py-3 rounded-full border-2 border-red-100 bg-red-50/50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors mt-2"
          >
            ล้างข้อมูลและคืนค่าตัวอย่างเริ่มต้น 🔄
          </button>
        </div>
      </div>
    </div>
  );
};
