import { AttachmentType, TaskAttachment } from '../types';

export interface AttachmentMeta {
  type: AttachmentType;
  label: string;
  shortLabel: string;
  materialIcon: string;
  emoji: string;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
}

export const ATTACHMENT_META: Record<AttachmentType, AttachmentMeta> = {
  word: {
    type: 'word',
    label: 'Microsoft Word / Doc',
    shortLabel: 'Word Online',
    materialIcon: 'description',
    emoji: '📄',
    color: '#185abd',
    bg: '#e8f0fe',
    borderColor: '#b8d3fc',
    textColor: '#0f3c80',
  },
  pdf: {
    type: 'pdf',
    label: 'PDF Document',
    shortLabel: 'PDF',
    materialIcon: 'picture_as_pdf',
    emoji: '📕',
    color: '#d93025',
    bg: '#fce8e6',
    borderColor: '#f9ab9f',
    textColor: '#801811',
  },
  drive: {
    type: 'drive',
    label: 'Google Drive / Shared',
    shortLabel: 'Google Drive',
    materialIcon: 'folder_shared',
    emoji: '📁',
    color: '#137333',
    bg: '#e6f4ea',
    borderColor: '#a8dab5',
    textColor: '#0d4a22',
  },
  excel: {
    type: 'excel',
    label: 'Excel / Spreadsheet',
    shortLabel: 'Excel',
    materialIcon: 'table_chart',
    emoji: '📊',
    color: '#107c41',
    bg: '#e6f5eb',
    borderColor: '#a3dfb7',
    textColor: '#0a4b27',
  },
  powerpoint: {
    type: 'powerpoint',
    label: 'PowerPoint / Slides',
    shortLabel: 'PowerPoint',
    materialIcon: 'slideshow',
    emoji: '📽️',
    color: '#d24726',
    bg: '#fbece7',
    borderColor: '#f7b9a8',
    textColor: '#822812',
  },
  image: {
    type: 'image',
    label: 'รูปภาพประกอบ',
    shortLabel: 'รูปภาพ',
    materialIcon: 'image',
    emoji: '🖼️',
    color: '#006a4e',
    bg: '#e2f5ee',
    borderColor: '#a2e3cd',
    textColor: '#003828',
  },
  link: {
    type: 'link',
    label: 'เว็บลิงก์ / แหล่งข้อมูล',
    shortLabel: 'เว็บลิงก์',
    materialIcon: 'link',
    emoji: '🔗',
    color: '#005d76',
    bg: '#e0f2fe',
    borderColor: '#bae6fd',
    textColor: '#003644',
  },
  file: {
    type: 'file',
    label: 'ไฟล์เอกสารแนบ',
    shortLabel: 'ไฟล์แนบ',
    materialIcon: 'attach_file',
    emoji: '📎',
    color: '#555f5a',
    bg: '#f0e7dc',
    borderColor: '#ded1c1',
    textColor: '#292f2c',
  },
};

/**
 * Automatically inspects a URL or filename to detect if it's Word Online, Google Drive, PDF, etc.
 */
export function detectAttachmentType(url: string, fileName?: string, mimeType?: string): AttachmentType {
  const combined = `${url.toLowerCase()} ${(fileName || '').toLowerCase()} ${(mimeType || '').toLowerCase()}`;

  // Word Online / Word Docs
  if (
    combined.includes('sharepoint.com') ||
    combined.includes('onedrive.live.com') ||
    combined.includes('office.com') ||
    combined.includes('word') ||
    combined.includes('.docx') ||
    combined.includes('.doc') ||
    combined.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') ||
    combined.includes('application/msword')
  ) {
    // If it's explicitly excel or ppt on onedrive, handle separately
    if (combined.includes('excel') || combined.includes('.xlsx') || combined.includes('.xls')) {
      return 'excel';
    }
    if (combined.includes('powerpoint') || combined.includes('.pptx') || combined.includes('.ppt')) {
      return 'powerpoint';
    }
    return 'word';
  }

  // Google Drive / Google Docs / Sheets / Slides
  if (
    combined.includes('drive.google.com') ||
    combined.includes('docs.google.com')
  ) {
    if (combined.includes('spreadsheets') || combined.includes('sheets')) return 'excel';
    if (combined.includes('presentation') || combined.includes('slides')) return 'powerpoint';
    if (combined.includes('document')) return 'word';
    return 'drive';
  }

  // PDF
  if (
    combined.includes('.pdf') ||
    combined.includes('application/pdf') ||
    combined.includes('pdf')
  ) {
    return 'pdf';
  }

  // Excel
  if (
    combined.includes('.xlsx') ||
    combined.includes('.xls') ||
    combined.includes('.csv') ||
    combined.includes('spreadsheet')
  ) {
    return 'excel';
  }

  // PowerPoint
  if (
    combined.includes('.pptx') ||
    combined.includes('.ppt') ||
    combined.includes('presentation')
  ) {
    return 'powerpoint';
  }

  // Images
  if (
    combined.includes('.jpg') ||
    combined.includes('.jpeg') ||
    combined.includes('.png') ||
    combined.includes('.gif') ||
    combined.includes('.webp') ||
    combined.includes('image/')
  ) {
    return 'image';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'link';
  }

  return 'file';
}

/**
 * Normalizes an attachment URL to ensure it has https:// protocol if not data/blob URL
 */
export function normalizeAttachmentUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Format bytes to readable size like "1.2 MB"
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Safely open an attachment (URL or base64 Data URL)
 */
export function openAttachment(attachment: TaskAttachment) {
  if (!attachment.url) return;
  const targetUrl = normalizeAttachmentUrl(attachment.url);

  // If it's a web link
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    try {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  // If it's a data URL (image or document)
  if (targetUrl.startsWith('data:')) {
    try {
      const parts = targetUrl.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/octet-stream';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 5000);
      return;
    } catch (err) {
      console.error('Failed to open blob URL:', err);
    }
  }

  // Fallback direct open
  window.open(targetUrl, '_blank');
}
