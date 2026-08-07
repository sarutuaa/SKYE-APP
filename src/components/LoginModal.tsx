import React, { useState } from 'react';

interface LoginModalProps {
  onVerifyPin: (pin: string) => Promise<boolean>;
  loginError: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onVerifyPin, loginError }) => {
  const [pin, setPin] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setLocalError('กรุณาใส่รหัสผ่าน');
      return;
    }
    setIsBusy(true);
    setLocalError('');
    try {
      const ok = await onVerifyPin(pin.trim());
      if (!ok) {
        setLocalError('รหัสผ่านไม่ถูกต้อง (ลอง 5264)');
      }
    } catch (err: any) {
      setLocalError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-radial from-[#fcf2e7] to-[#fff8f3]">
      <div className="bg-white rounded-3xl p-8 sm:p-12 w-full max-w-sm shadow-2xl border-2 border-[#eae1d6] text-center animate-popIn">
        {/* Teddy Bear Emoji */}
        <div className="text-6xl mb-4 animate-bounce inline-block">🧸</div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#002118] mb-2 font-['Plus_Jakarta_Sans','Noto_Sans_Thai']">
          แอปผู้ช่วยคุณแม่
        </h2>
        <p className="text-sm font-semibold text-[#707974] mb-8">
          ใส่รหัสผ่านเพื่อเข้าใช้งาน
        </p>

        {/* PIN Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setLocalError('');
            }}
            placeholder="••••"
            disabled={isBusy}
            autoFocus
            className="w-full p-4 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] font-black text-3xl tracking-widest text-center text-[#1f1b15] focus:outline-none focus:bg-white transition-all"
          />

          {(localError || loginError) && (
            <div className="text-xs font-bold text-red-500 min-h-[18px]">
              {localError || loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-4 mt-2 rounded-full bg-[#98d8c1] border-2 border-[#aff0d8] text-[#1e604e] font-black text-lg shadow-md hover:bg-[#aff0d8] active:scale-95 transition-all login-pulse"
          >
            {isBusy ? 'กำลังตรวจสอบ...' : 'เข้าใช้งาน ✨'}
          </button>
        </form>
      </div>
    </div>
  );
};
