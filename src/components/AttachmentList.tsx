import React, { useState } from 'react';
import { TaskAttachment } from '../types';
import { ATTACHMENT_META, openAttachment, normalizeAttachmentUrl } from '../utils/attachmentHelper';

interface AttachmentListProps {
  attachments?: TaskAttachment[];
  imageUrl?: string;
  mode?: 'compact' | 'full' | 'editable';
  onDelete?: (id: string) => void;
  onPreviewImage?: (url: string) => void;
  className?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments = [],
  imageUrl,
  mode = 'compact',
  onDelete,
  onPreviewImage,
  className = '',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasItems = attachments.length > 0 || !!imageUrl;
  if (!hasItems) return null;

  const handleCopy = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    e.preventDefault();
    const finalUrl = normalizeAttachmentUrl(url);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(finalUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // If in compact mode (for task cards in ListView / WeekView)
  if (mode === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 z-20 ${className}`} onClick={(e) => e.stopPropagation()}>
        {/* If legacy or direct imageUrl exists and not in attachments */}
        {imageUrl && !attachments.some((a) => a.url === imageUrl) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreviewImage) onPreviewImage(imageUrl);
              else window.open(imageUrl, '_blank');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#e2f5ee] hover:bg-[#c0eada] border border-[#a2e3cd] text-[#006a4e] text-xs font-bold transition-all shadow-2xs hover:scale-102 active:scale-95 cursor-pointer"
            title="ดูรูปภาพแนบ"
          >
            <span className="material-symbols-outlined text-[15px]">image</span>
            <span>รูปภาพ</span>
          </button>
        )}

        {/* List of attachments */}
        {attachments.map((att) => {
          const meta = ATTACHMENT_META[att.type] || ATTACHMENT_META.link;
          const isWebLink = att.url.startsWith('http://') || att.url.startsWith('https://') || att.isLink;
          const finalUrl = normalizeAttachmentUrl(att.url);

          if (isWebLink) {
            return (
              <a
                key={att.id}
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: meta.bg,
                  borderColor: meta.borderColor,
                  color: meta.textColor,
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-extrabold transition-all shadow-2xs hover:scale-102 active:scale-95 cursor-pointer max-w-[220px] truncate no-underline"
                title={`${meta.label}: ${att.name || 'เปิดลิงก์เอกสาร'}`}
              >
                <span className="material-symbols-outlined text-[15px] shrink-0" style={{ color: meta.color }}>
                  {meta.materialIcon}
                </span>
                <span className="truncate">{att.name || meta.shortLabel}</span>
                <span className="material-symbols-outlined text-[12px] opacity-70 shrink-0">open_in_new</span>
              </a>
            );
          }

          return (
            <button
              key={att.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (att.type === 'image' && onPreviewImage) {
                  onPreviewImage(att.url);
                } else {
                  openAttachment(att);
                }
              }}
              style={{
                backgroundColor: meta.bg,
                borderColor: meta.borderColor,
                color: meta.textColor,
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-extrabold transition-all shadow-2xs hover:scale-102 active:scale-95 cursor-pointer max-w-[220px] truncate"
              title={`${meta.label}: ${att.name || 'เปิดเอกสาร'}`}
            >
              <span className="material-symbols-outlined text-[15px] shrink-0" style={{ color: meta.color }}>
                {meta.materialIcon}
              </span>
              <span className="truncate">{att.name || meta.shortLabel}</span>
              <span className="material-symbols-outlined text-[12px] opacity-70 shrink-0">
                {att.type === 'image' ? 'zoom_in' : 'open_in_new'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Editable / Full mode (Inside TaskModal or Detail view)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Attachments List */}
      {attachments.map((att) => {
        const meta = ATTACHMENT_META[att.type] || ATTACHMENT_META.link;
        const isDataUrl = att.url.startsWith('data:');
        const isWebLink = att.url.startsWith('http://') || att.url.startsWith('https://') || att.isLink;
        const finalUrl = normalizeAttachmentUrl(att.url);

        return (
          <div
            key={att.id}
            style={{ backgroundColor: meta.bg, borderColor: meta.borderColor }}
            className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border-2 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: 'white', color: meta.color }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {meta.materialIcon}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-xs font-black px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: 'white', color: meta.color }}
                  >
                    {meta.shortLabel}
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1f1b15] truncate">
                    {att.name || meta.label}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#555f5a]">
                  {att.fileSize && <span>{att.fileSize}</span>}
                  {att.fileSize && !isDataUrl && <span>•</span>}
                  {!isDataUrl && (
                    <span className="truncate max-w-[220px] font-mono text-[10px] opacity-80" title={finalUrl}>
                      {finalUrl}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Copy link button if web link */}
              {isWebLink && (
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, att.id, att.url)}
                  className="px-2 py-1.5 rounded-xl bg-white hover:bg-white/80 font-bold text-xs text-[#555f5a] border border-[#eae1d6] shadow-2xs cursor-pointer transition-all flex items-center gap-1"
                  title="คัดลอกลิงก์"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedId === att.id ? 'check' : 'content_copy'}
                  </span>
                  <span className="hidden sm:inline">{copiedId === att.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              )}

              {/* Direct Open Link (<a> for maximum browser compatibility) */}
              {isWebLink ? (
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: meta.color }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-white/80 font-bold text-xs flex items-center gap-1 border border-current shadow-2xs cursor-pointer transition-all hover:scale-105 no-underline"
                  title="เปิดดูเอกสารในแท็บใหม่"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  <span>เปิดดู</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (att.type === 'image' && onPreviewImage) {
                      onPreviewImage(att.url);
                    } else {
                      openAttachment(att);
                    }
                  }}
                  style={{ color: meta.color }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-white/80 font-bold text-xs flex items-center gap-1 border border-current shadow-2xs cursor-pointer transition-all hover:scale-105"
                  title="เปิดดูเอกสาร"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {att.type === 'image' ? 'zoom_in' : 'open_in_new'}
                  </span>
                  <span>{att.type === 'image' ? 'ดูรูป' : 'เปิดดู'}</span>
                </button>
              )}

              {mode === 'editable' && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(att.id)}
                  className="w-8 h-8 rounded-xl bg-white text-[#944748] hover:bg-red-50 hover:text-red-700 border border-red-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="ลบเอกสารนี้"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
