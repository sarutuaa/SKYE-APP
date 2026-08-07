import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskStatus, TYPE_META, STATUS_META, STATUS_ORDER } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  isEditing: boolean;
  taskDraft: Task | null;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  isEditing,
  taskDraft,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TaskType>('homework');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');

  const [titleError, setTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskDraft) {
      setType(taskDraft.type || 'homework');
      setTitle(taskDraft.title || '');
      setSubject(taskDraft.subject || '');
      setDate(taskDraft.date || new Date().toISOString().split('T')[0]);
      setTime(taskDraft.time || '');
      setLocation(taskDraft.location || '');
      setNotes(taskDraft.notes || '');
      setStatus(taskDraft.status || 'not_started');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setType('homework');
      setTitle('');
      setSubject('');
      setDate(today);
      setTime('');
      setLocation('');
      setNotes('');
      setStatus('not_started');
    }
    setTitleError(false);
  }, [taskDraft, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        id: taskDraft?.id || '',
        type,
        title: title.trim(),
        subject: subject.trim(),
        date: date || new Date().toISOString().split('T')[0],
        time: time.trim(),
        location: location.trim(),
        notes: notes.trim(),
        status,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskDraft?.id) return;
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      setIsSubmitting(true);
      try {
        await onDelete(taskDraft.id);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const types: TaskType[] = ['homework', 'exam', 'activity'];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#1f1b15]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-2 border-[#eae1d6] animate-popIn"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#002118] flex items-center gap-2">
            <span>{isEditing ? '✏️ แก้ไขรายการ' : '✨ เพิ่มรายการใหม่'}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] hover:bg-[#f6ece2] font-bold text-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Type Selector */}
        <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-2">
          ประเภทรายการ
        </label>
        <div className="grid grid-cols-3 gap-2 bg-[#f6ece2] p-1.5 rounded-2xl mb-5">
          {types.map((tKey) => {
            const meta = TYPE_META[tKey];
            const active = type === tKey;
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => setType(tKey)}
                style={{
                  backgroundColor: active ? meta.bg : 'transparent',
                  color: active ? meta.textColor : '#707974',
                  borderColor: active ? meta.borderColor : 'transparent',
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border-2 transition-all ${
                  active ? 'shadow-sm font-extrabold' : 'hover:bg-white/50'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
            ชื่อเรื่อง / งาน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError(false);
            }}
            placeholder="เช่น แบบฝึกหัดคณิตศาสตร์ หน้า 45-46"
            className={`w-full p-3.5 rounded-2xl border-2 bg-[#fafafa] font-semibold text-base text-[#1f1b15] focus:outline-none focus:bg-white transition-colors ${
              titleError ? 'border-red-400 bg-red-50' : 'border-[#eae1d6] focus:border-[#98d8c1]'
            }`}
          />
          {titleError && (
            <p className="text-xs font-bold text-red-500 mt-1">
              กรุณาระบุชื่อเรื่องสำหรับรายการนี้
            </p>
          )}
        </div>

        {/* Subject & Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
              วิชา / หมวดหมู่
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="เช่น คณิตศาสตร์, วิทยาศาสตร์"
              className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
              วันที่กำหนด
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Time / Location Optional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
              เวลา / กำหนดส่ง (ระบุข้อความได้)
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="เช่น ส่งพรุ่งนี้, 16:00 - 18:00, คาบ 3"
              className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
              สถานที่ (ถ้ามี)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น สนามกีฬา, ห้องเรียนวิทย์"
              className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-1.5">
            รายละเอียดเพิ่มเติม / สิ่งที่ต้องเตรียม
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น สวมชุดพละ ทบทวนบทที่ 4 ก่อนเข้าห้องสอบ..."
            className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors resize-y min-h-[90px]"
          />
        </div>

        {/* Status Selector */}
        <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-2">
          สถานะงาน
        </label>
        <div className="grid grid-cols-3 gap-2 bg-[#f6ece2] p-1.5 rounded-2xl mb-6">
          {STATUS_ORDER.map((stKey) => {
            const meta = STATUS_META[stKey];
            const active = status === stKey;
            return (
              <button
                key={stKey}
                type="button"
                onClick={() => setStatus(stKey)}
                style={{
                  backgroundColor: active ? meta.bg : 'transparent',
                  color: active ? meta.color : '#707974',
                  borderColor: active ? meta.borderColor : 'transparent',
                }}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border-2 transition-all ${
                  active ? 'shadow-sm font-extrabold' : 'hover:bg-white/50'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-full border-2 border-red-200 bg-red-50 text-red-600 font-extrabold text-sm hover:bg-red-100 transition-colors"
            >
              ลบ 🗑
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] font-bold text-sm hover:bg-[#f6ece2] transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full bg-[#98d8c1] border-2 border-[#aff0d8] text-[#1e604e] font-extrabold text-sm shadow-md hover:bg-[#aff0d8] active:scale-95 transition-all"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก ✨'}
          </button>
        </div>
      </div>
    </div>
  );
};
