import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskType,
  TaskStatus,
  TaskAttachment,
  TYPE_META,
  STATUS_META,
  STATUS_ORDER,
  STUDENTS,
} from '../types';
import { AttachmentList } from './AttachmentList';
import {
  detectAttachmentType,
  formatFileSize,
  ATTACHMENT_META,
  normalizeAttachmentUrl,
} from '../utils/attachmentHelper';

interface TaskModalProps {
  isOpen: boolean;
  isEditing: boolean;
  taskDraft: Task | null;
  activeChildId?: string;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  isEditing,
  taskDraft,
  activeChildId = 'sky',
  onClose,
  onSave,
  onDelete,
}) => {
  const [childId, setChildId] = useState<string>('sky');
  const [type, setType] = useState<TaskType>('homework');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [status, setStatus] = useState<TaskStatus>('not_started');

  // Attachment input sub-state
  const [attachmentMode, setAttachmentMode] = useState<'link' | 'upload'>('link');
  const [linkInputUrl, setLinkInputUrl] = useState('');
  const [linkInputName, setLinkInputName] = useState('');
  const [linkInputError, setLinkInputError] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [titleError, setTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (taskDraft) {
      setChildId(taskDraft.childId || activeChildId || 'sky');
      setType(taskDraft.type || 'homework');
      setTitle(taskDraft.title || '');
      setSubject(taskDraft.subject || '');
      setDate(taskDraft.date || new Date().toISOString().split('T')[0]);
      setTime(taskDraft.time || '');
      setLocation(taskDraft.location || '');
      setNotes(taskDraft.notes || '');
      setImageUrl(taskDraft.imageUrl || '');
      setAttachments(taskDraft.attachments || []);
      setStatus(taskDraft.status || 'not_started');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setChildId(activeChildId || 'sky');
      setType('homework');
      setTitle('');
      setSubject('');
      setDate(today);
      setTime('');
      setLocation('');
      setNotes('');
      setImageUrl('');
      setAttachments([]);
      setStatus('not_started');
    }
    setTitleError(false);
    setPreviewModalUrl(null);
    setLinkInputUrl('');
    setLinkInputName('');
    setLinkInputError('');
  }, [taskDraft, isOpen, activeChildId]);

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
        childId,
        type,
        title: title.trim(),
        subject: subject.trim(),
        date: date || new Date().toISOString().split('T')[0],
        time: time.trim(),
        location: location.trim(),
        notes: notes.trim(),
        imageUrl: imageUrl.trim(),
        attachments,
        status,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Link Attachment
  const handleAddLink = () => {
    const trimmedUrl = linkInputUrl.trim();
    if (!trimmedUrl) {
      setLinkInputError('กรุณากรอก URL ลิงก์ (เช่น https://...)');
      return;
    }

    const finalUrl = normalizeAttachmentUrl(trimmedUrl);
    const detectedType = detectAttachmentType(finalUrl, linkInputName);
    const meta = ATTACHMENT_META[detectedType];
    
    let fallbackDomain = '';
    try {
      fallbackDomain = new URL(finalUrl).hostname.replace('www.', '');
    } catch {
      fallbackDomain = 'ลิงก์';
    }

    const finalName = linkInputName.trim() || `${meta.shortLabel} (${fallbackDomain})`;

    const newAttachment: TaskAttachment = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: finalName,
      url: finalUrl,
      type: detectedType,
      isLink: true,
      createdAt: new Date().toISOString(),
    };

    setAttachments((prev) => [...prev, newAttachment]);
    setLinkInputUrl('');
    setLinkInputName('');
    setLinkInputError('');
  };

  // Handle Local File Upload (PDF, Word, Excel, PowerPoint, Image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB limit for local base64 storage
    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์มีขนาดใหญ่เกิน 10MB แนะนำให้อัปโหลดขึ้น Google Drive หรือ OneDrive แล้วนำลิงก์มาวางในช่อง "แนบลิงก์" แทนครับ');
      e.target.value = '';
      return;
    }

    setIsUploadingFile(true);
    const detectedType = detectAttachmentType(file.name, file.name, file.type);
    const readableSize = formatFileSize(file.size);

    if (file.type.startsWith('image/')) {
      // Compress image for lightweight fast storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setImageUrl(compressedDataUrl);

            const newAtt: TaskAttachment = {
              id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              name: file.name,
              url: compressedDataUrl,
              type: 'image',
              fileSize: readableSize,
              isLink: false,
              createdAt: new Date().toISOString(),
            };
            setAttachments((prev) => [...prev, newAtt]);
          }
          setIsUploadingFile(false);
        };
        if (typeof event.target?.result === 'string') {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Document / PDF / Word upload as Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const newAtt: TaskAttachment = {
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: file.name,
            url: event.target.result,
            type: detectedType,
            fileSize: readableSize,
            isLink: false,
            createdAt: new Date().toISOString(),
          };
          setAttachments((prev) => [...prev, newAtt]);
        }
        setIsUploadingFile(false);
      };
      reader.onerror = () => {
        setIsUploadingFile(false);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && target.url === imageUrl) {
        setImageUrl('');
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleRemoveImage = () => {
    const currentImg = imageUrl;
    setImageUrl('');
    if (currentImg) {
      setAttachments((prev) => prev.filter((a) => a.url !== currentImg));
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
  const previewDetectedType = linkInputUrl.trim()
    ? detectAttachmentType(normalizeAttachmentUrl(linkInputUrl), linkInputName)
    : null;
  const previewDetectedMeta = previewDetectedType ? ATTACHMENT_META[previewDetectedType] : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#1f1b15]/60 backdrop-blur-xs flex items-center justify-center max-sm:items-end z-50 p-3 sm:p-4 max-sm:p-0 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-sm:rounded-b-none max-sm:rounded-t-3xl w-full max-w-xl max-h-[90vh] max-sm:max-h-[92vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border-2 border-[#eae1d6] max-sm:border-x-0 max-sm:border-b-0 animate-popIn"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#eae1d6] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#002118] flex items-center gap-2">
            <span>{isEditing ? '✏️ แก้ไขรายการ' : '✨ เพิ่มรายการใหม่'}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] hover:bg-[#f6ece2] font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Student Selector */}
        <div className="mb-5">
          <label className="block text-xs font-extrabold text-[#707974] uppercase tracking-wider mb-2">
            สำหรับนักเรียน
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STUDENTS.map((st) => {
              const active = childId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setChildId(st.id)}
                  className={`py-2 px-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    active
                      ? 'shadow-xs border-current'
                      : 'bg-[#faf6f0] border-[#eae1d6] text-[#707974] hover:bg-[#f6ece2]'
                  }`}
                  style={{
                    backgroundColor: active ? st.bgColor : undefined,
                    borderColor: active ? st.themeColor : '#eae1d6',
                    color: active ? st.themeColor : '#707974',
                  }}
                >
                  <img src={st.avatarUrl} alt={st.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="truncate">{st.name}</span>
                </button>
              );
            })}
          </div>
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
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
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
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น สวมชุดพละ ทบทวนบทที่ 4 หรือคำสั่งพิเศษจากครู..."
            className="w-full p-3.5 rounded-2xl border-2 border-[#eae1d6] focus:border-[#98d8c1] bg-[#fafafa] focus:bg-white font-semibold text-sm text-[#1f1b15] focus:outline-none transition-colors resize-y min-h-[75px]"
          />
        </div>

        {/* 🖼️ DIRECT PHOTO / IMAGE PREVIEW SECTION (Restored & Enhanced) */}
        {imageUrl && (
          <div className="mb-5 bg-[#e2f5ee] p-4 rounded-3xl border-2 border-[#a2e3cd]">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-black text-[#006a4e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">image</span>
                <span>รูปภาพที่แนบไว้</span>
              </label>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs font-bold text-[#944748] hover:text-red-700 flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-white/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                <span>ลบรูปภาพ</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-[#a2e3cd]/60">
              <div
                onClick={() => setPreviewModalUrl(imageUrl)}
                className="relative group cursor-pointer overflow-hidden rounded-xl w-full sm:w-36 h-32 bg-[#faf6f0] shrink-0 border border-[#eae1d6]"
              >
                <img
                  src={imageUrl}
                  alt="รูปแนบ"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[24px]">zoom_in</span>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#006a4e]">รูปภาพการบ้าน / ใบงาน</p>
                  <p className="text-[11px] text-[#555f5a] mt-0.5">
                    แตะที่รูปหรือกดปุ่มด้านล่างเพื่อเปิดดูภาพขนาดใหญ่แบบเต็มจอ
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(imageUrl)}
                    className="px-3 py-1.5 rounded-xl bg-[#006a4e] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs hover:bg-[#00523c] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                    <span>ดูรูปภาพขนาดเต็ม</span>
                  </button>

                  <label
                    htmlFor="task-doc-replace-img"
                    className="px-3 py-1.5 rounded-xl bg-white text-[#006a4e] border border-[#a2e3cd] font-bold text-xs flex items-center gap-1 hover:bg-[#e2f5ee] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    <span>เปลี่ยนรูป</span>
                  </label>
                  <input
                    id="task-doc-replace-img"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📎 ATTACHMENTS & DOCUMENT LINKS SECTION */}
        <div className="mb-6 bg-[#fcf8f2] p-4 sm:p-5 rounded-3xl border-2 border-[#eae1d6]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <label className="text-xs font-black text-[#1f1b15] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006a4e]">attach_file</span>
              <span>เอกสารแนบ / ลิงก์จากคุณครู</span>
            </label>
            {attachments.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#aff0d8] text-[#002118] text-[11px] font-black">
                {attachments.length} รายการ
              </span>
            )}
          </div>

          {/* Sub-Tabs: 🔗 แนบลิงก์ (Word Online / Drive) vs 📎 อัปโหลดไฟล์ (PDF / รูปภาพ / เอกสาร) */}
          <div className="flex gap-2 p-1 bg-white rounded-2xl border border-[#eae1d6] mb-3">
            <button
              type="button"
              onClick={() => setAttachmentMode('link')}
              className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                attachmentMode === 'link'
                  ? 'bg-[#e8f0fe] text-[#185abd] shadow-xs border border-[#b8d3fc]'
                  : 'text-[#707974] hover:bg-[#faf6f0]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              <span>แนบลิงก์ (Word Online / Drive / PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setAttachmentMode('upload')}
              className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                attachmentMode === 'upload'
                  ? 'bg-[#e2f5ee] text-[#006a4e] shadow-xs border border-[#a2e3cd]'
                  : 'text-[#707974] hover:bg-[#faf6f0]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>อัปโหลดไฟล์ / รูปภาพ</span>
            </button>
          </div>

          {/* Mode 1: Link Input (MS Word Online, Google Drive, OneDrive, Share Drive, PDF Link) */}
          {attachmentMode === 'link' && (
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#eae1d6] flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#707974] mb-1">
                  วาง URL ลิงก์เอกสารที่ครูส่งมา (OneDrive / Word Online / Google Drive / PDF)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={linkInputUrl}
                      onChange={(e) => {
                        setLinkInputUrl(e.target.value);
                        if (e.target.value.trim()) setLinkInputError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      placeholder="https://... (วางลิงก์ที่นี่ เช่น onedrive, google drive, word)"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#eae1d6] focus:border-[#185abd] text-xs sm:text-sm font-semibold text-[#1f1b15] focus:outline-none"
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-[#707974]">
                      link
                    </span>
                  </div>
                </div>
                {linkInputError && (
                  <p className="text-[11px] font-bold text-red-500 mt-1">{linkInputError}</p>
                )}
              </div>

              {/* Detected Type Banner */}
              {previewDetectedMeta && (
                <div
                  style={{ backgroundColor: previewDetectedMeta.bg, borderColor: previewDetectedMeta.borderColor }}
                  className="px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs"
                >
                  <span className="font-extrabold flex items-center gap-1.5" style={{ color: previewDetectedMeta.textColor }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: previewDetectedMeta.color }}>
                      {previewDetectedMeta.materialIcon}
                    </span>
                    <span>ตรวจพบรูปแบบ: {previewDetectedMeta.label}</span>
                  </span>
                  <span className="text-[10px] font-bold opacity-75">{previewDetectedMeta.emoji}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#707974] mb-1">
                  ชื่อเอกสาร / รายละเอียด (ระบุหรือไม่ระบุก็ได้)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkInputName}
                    onChange={(e) => setLinkInputName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    placeholder="เช่น ใบงานคำศัพท์ Word Online, สไลด์การสอน Drive"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[#eae1d6] focus:border-[#185abd] text-xs sm:text-sm font-semibold text-[#1f1b15] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2.5 rounded-xl bg-[#185abd] text-white font-extrabold text-xs sm:text-sm hover:bg-[#0f3c80] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_link</span>
                    <span>แนบลิงก์</span>
                  </button>
                </div>
              </div>

              {/* Preset Help Chips */}
              <div className="pt-1 border-t border-dashed border-[#eae1d6]">
                <span className="text-[10px] font-bold text-[#707974] mr-2">ตัวอย่างบริการที่รองรับ:</span>
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e8f0fe] text-[#185abd] text-[10px] font-bold">
                    📄 MS Word Online
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e6f4ea] text-[#137333] text-[10px] font-bold">
                    📁 Google Drive / Shared
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fce8e6] text-[#d93025] text-[10px] font-bold">
                    📕 PDF Link
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#005d76] text-[10px] font-bold">
                    ☁️ OneDrive
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload (PDF, Word, Excel, PowerPoint, Image) */}
          {attachmentMode === 'upload' && (
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#eae1d6] flex flex-col gap-3">
              <label
                htmlFor="task-doc-upload"
                className={`w-full p-5 rounded-2xl border-2 border-dashed border-[#a2e3cd] bg-[#f0f9f5] hover:bg-[#e2f5ee] flex flex-col items-center justify-center gap-2 text-[#006a4e] font-extrabold text-xs sm:text-sm cursor-pointer transition-all hover:scale-[1.005] active:scale-[0.99] ${
                  isUploadingFile ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-[#006a4e] shadow-2xs flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">
                    {isUploadingFile ? 'sync' : 'upload_file'}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-black text-sm">
                    {isUploadingFile ? 'กำลังประมวลผลไฟล์...' : 'แตะเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง'}
                  </p>
                  <p className="text-[11px] text-[#555f5a] font-normal mt-0.5">
                    รองรับไฟล์ PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), รูปภาพ
                  </p>
                </div>
              </label>
              <input
                id="task-doc-upload"
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.webp,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Render Active Attachments List */}
          {attachments.length > 0 && (
            <div className="mt-3">
              <span className="block text-[11px] font-black text-[#555f5a] mb-2 uppercase tracking-wider">
                รายการเอกสารที่แนบไว้ ({attachments.length}):
              </span>
              <AttachmentList
                attachments={attachments}
                mode="editable"
                onDelete={handleDeleteAttachment}
                onPreviewImage={(url) => setPreviewModalUrl(url)}
              />
            </div>
          )}
        </div>

        {/* Full Image Preview Modal */}
        {previewModalUrl && (
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div
              className="relative max-w-3xl max-h-[90vh] flex flex-col items-center bg-white/10 p-3 sm:p-5 rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewModalUrl}
                alt="รูปภาพขยาย"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="px-6 py-2.5 rounded-full bg-white text-[#1f1b15] font-black text-sm shadow-xl hover:bg-[#e2f5ee] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span>ปิดหน้าต่าง</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
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
              className="px-4 py-3 rounded-full border-2 border-red-200 bg-red-50 text-red-600 font-extrabold text-sm hover:bg-red-100 transition-colors cursor-pointer"
            >
              ลบ 🗑
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-full border-2 border-[#eae1d6] bg-white text-[#707974] font-bold text-sm hover:bg-[#f6ece2] transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full bg-[#98d8c1] border-2 border-[#aff0d8] text-[#1e604e] font-extrabold text-sm shadow-md hover:bg-[#aff0d8] active:scale-95 transition-all cursor-pointer"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก ✨'}
          </button>
        </div>
      </div>
    </div>
  );
};
