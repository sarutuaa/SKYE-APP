import React, { useState } from 'react';
import { AiParsedItem, TaskType, TYPE_META } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkSave: (items: AiParsedItem[]) => Promise<void>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onBulkSave,
}) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedResults, setParsedResults] = useState<AiParsedItem[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setFile({
        name: f.name,
        base64,
        type: f.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(f);
  };

  const handleParse = async () => {
    if (!text.trim() && !file) {
      setErrorMsg('กรุณาพิมพ์ข้อความ หรือแนบไฟล์รูปภาพ/ประกาศก่อนให้ AI อ่าน');
      return;
    }

    setIsParsing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          fileBase64: file?.base64 || null,
          fileMediaType: file?.type || null,
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || 'ไม่สามารถประมวลผลด้วย AI ได้');
      }

      if (!json.items || json.items.length === 0) {
        setErrorMsg('AI ไม่พบรายการการบ้านหรือกิจกรรมในข้อความนี้ ลองปรับข้อความแล้วลองอีกครั้ง');
      } else {
        setParsedResults(
          json.items.map((it: any) => ({
            included: true,
            type: (it.type as TaskType) || 'homework',
            title: it.title || 'การบ้านใหม่',
            subject: it.subject || 'ทั่วไป',
            date: it.date || new Date().toISOString().split('T')[0],
            notes: it.notes || '',
          }))
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleItemIncluded = (index: number) => {
    if (!parsedResults) return;
    const next = [...parsedResults];
    next[index].included = !next[index].included;
    setParsedResults(next);
  };

  const updateItemField = (index: number, field: keyof AiParsedItem, value: any) => {
    if (!parsedResults) return;
    const next = [...parsedResults];
    (next[index] as any)[field] = value;
    setParsedResults(next);
  };

  const handleSaveAll = async () => {
    if (!parsedResults) return;
    const selected = parsedResults.filter((it) => it.included && it.title.trim());
    if (selected.length === 0) {
      setErrorMsg('กรุณาเลือกรายการที่จะบันทึกอย่างน้อย 1 รายการ');
      return;
    }

    setIsSaving(true);
    try {
      await onBulkSave(selected);
      onClose();
      // reset modal state
      setParsedResults(null);
      setText('');
      setFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#1f1b15]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-2 border-[#eae1d6] animate-popIn flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl font-black text-[#002118] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0c6780]">auto_awesome</span>
            <span>ผู้ช่วย AI อ่านข้อความครู</span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] hover:bg-[#f6ece2] font-bold text-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {!parsedResults ? (
          <>
            {/* Input Form */}
            <p className="text-xs sm:text-sm text-[#404945]">
              คัดลอกข้อความจากไลน์กลุ่มห้องเรียน หรือถ่ายรูปใบประกาศ/การบ้านจากครู มาวางได้เลย
              AI จะช่วยสกัดและสร้างรายการให้อัตโนมัติ!
            </p>

            <textarea
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrorMsg('');
              }}
              placeholder="ตัวอย่าง: พรุ่งนี้มีสอบสะกดคำภาษาไทย อย่าลืมทบทวนคำศัพท์นะคะ และส่งการบ้านคณิตศาสตร์หน้า 45-46 ด้วยค่ะ..."
              className="w-full p-4 rounded-2xl border-2 border-[#eae1d6] focus:border-[#8ed5f2] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors resize-y min-h-[110px]"
            />

            {/* File Attachment Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {file ? (
                <div className="flex items-center gap-2 bg-[#f0f9ff] border-2 border-[#8ed5f2] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#005d76]">
                  <span>📎 {file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700 font-extrabold ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer px-4 py-2 rounded-full border-2 border-dashed border-[#8ed5f2] bg-[#f0f9ff] text-[#005d76] hover:bg-[#e0f2fe] font-bold text-xs flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                  <span>แนบรูปถ่าย / ใบงานประกาศ</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={isParsing}
              className="w-full py-4 rounded-full bg-[#8ed5f2] border-2 border-[#baeaff] text-[#004d62] font-black text-base shadow-md hover:bg-[#baeaff] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>{isParsing ? '🤖 AI กำลังอ่านและวิเคราะห์ข้อความ...' : 'ให้ AI ช่วยสกัดการบ้าน ✨'}</span>
            </button>
          </>
        ) : (
          <>
            {/* Parsed Output Review */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#296956]">
                พบ {parsedResults.length} รายการที่สกัดได้
              </span>
              <button
                onClick={() => setParsedResults(null)}
                className="text-xs font-bold text-[#0c6780] hover:underline"
              >
                ← แก้ไขข้อความป้อนเข้า
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {parsedResults.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                    item.included ? 'bg-white border-[#98d8c1]' : 'bg-[#f6ece2]/50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 font-bold text-sm text-[#1f1b15] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.included}
                        onChange={() => toggleItemIncluded(idx)}
                        className="w-5 h-5 accent-[#296956] rounded-md"
                      />
                      <span>เลือกรายการนี้</span>
                    </label>

                    {/* Type Selector for parsed item */}
                    <div className="flex gap-1">
                      {(['homework', 'exam', 'activity'] as TaskType[]).map((tKey) => {
                        const meta = TYPE_META[tKey];
                        const active = item.type === tKey;
                        return (
                          <button
                            key={tKey}
                            type="button"
                            onClick={() => updateItemField(idx, 'type', tKey)}
                            style={{
                              backgroundColor: active ? meta.bg : '#f6ece2',
                              color: active ? meta.textColor : '#707974',
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItemField(idx, 'title', e.target.value)}
                      placeholder="ชื่อเรื่อง"
                      className="p-2.5 rounded-xl border border-[#eae1d6] text-xs font-bold bg-[#fafafa]"
                    />
                    <input
                      type="text"
                      value={item.subject}
                      onChange={(e) => updateItemField(idx, 'subject', e.target.value)}
                      placeholder="วิชา"
                      className="p-2.5 rounded-xl border border-[#eae1d6] text-xs font-bold bg-[#fafafa]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateItemField(idx, 'date', e.target.value)}
                      className="p-2.5 rounded-xl border border-[#eae1d6] text-xs font-bold bg-[#fafafa]"
                    />
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItemField(idx, 'notes', e.target.value)}
                      placeholder="หมายเหตุเพิ่มเติม"
                      className="p-2.5 rounded-xl border border-[#eae1d6] text-xs font-bold bg-[#fafafa]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full py-4 rounded-full bg-[#98d8c1] border-2 border-[#aff0d8] text-[#1e604e] font-black text-base shadow-md hover:bg-[#aff0d8] active:scale-95 transition-all"
            >
              {isSaving ? 'กำลังเพิ่มรายการลงในตาราง...' : 'นำเข้าตารางงานเรียบร้อย ✨'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
