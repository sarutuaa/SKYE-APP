export type TaskType = 'homework' | 'exam' | 'activity';
export type TaskStatus = 'not_started' | 'prepared' | 'done';
export type ViewMode = 'list' | 'week' | 'month' | 'completed' | 'settings';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "16:00 - 18:00" or "คาบ 3"
  location?: string; // e.g. "สนามกีฬา"
  notes?: string;
  status: TaskStatus;
  createdAt?: string;
}

export interface TypeMeta {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  icon: string;
  materialIcon: string;
}

export const TYPE_META: Record<TaskType, TypeMeta> = {
  homework: {
    label: 'การบ้าน',
    color: '#296956',
    bg: '#98d8c1',
    borderColor: '#aff0d8',
    textColor: '#002118',
    icon: '📝',
    materialIcon: 'menu_book',
  },
  exam: {
    label: 'สอบ',
    color: '#944748',
    bg: '#ff9e9e',
    borderColor: '#ffb3b2',
    textColor: '#3d050b',
    icon: '🎯',
    materialIcon: 'quiz',
  },
  activity: {
    label: 'กิจกรรม',
    color: '#0c6780',
    bg: '#8ed5f2',
    borderColor: '#baeaff',
    textColor: '#001f29',
    icon: '🎨',
    materialIcon: 'sports_baseball',
  },
};

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: string;
  materialIcon: string;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  not_started: {
    label: 'ยังไม่เริ่ม',
    color: '#404945',
    bg: '#fff8f3',
    borderColor: '#bfc9c3',
    icon: '⏳',
    materialIcon: 'schedule',
  },
  prepared: {
    label: 'เตรียมพร้อม',
    color: '#07513f',
    bg: '#98d8c1',
    borderColor: '#aff0d8',
    icon: '👍',
    materialIcon: 'check_circle',
  },
  done: {
    label: 'เสร็จแล้ว',
    color: '#1e604e',
    bg: '#aff0d8',
    borderColor: '#296956',
    icon: '✅',
    materialIcon: 'task_alt',
  },
};

export const STATUS_ORDER: TaskStatus[] = ['not_started', 'prepared', 'done'];

export interface AiParsedItem {
  included: boolean;
  type: TaskType;
  title: string;
  subject: string;
  date: string;
  notes: string;
}
