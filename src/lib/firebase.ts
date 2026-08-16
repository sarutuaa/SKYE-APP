import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { Task } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);

export const INITIAL_CSV_TASKS: Task[] = [
  // --- น้องสกาย (sky) ---
  {
    id: '11fb40eb-7ae4-483d-8b87-d34fae7f575f',
    childId: 'sky',
    type: 'homework',
    title: 'ประวัติศาสตร์หน้า 22',
    subject: 'ประวัติศาสตร์',
    date: '2026-07-06',
    notes: 'ทำการบ้านหน้า 22',
    status: 'done',
    createdAt: '2026-07-06T13:43:37.588Z',
  },
  {
    id: '7bb5fc9d-61a8-4436-a4c3-5dad3fa5a2f8',
    childId: 'sky',
    type: 'exam',
    title: 'สอบศัพท์ภาษาอังกฤษ',
    subject: 'English',
    date: '2026-07-10',
    notes: 'ฝึกเขียน/สะกดค: cut, mud, sun, bug, hug, fun, run, bus, hut, bun',
    status: 'done',
    createdAt: '2026-07-10T09:46:06.325Z',
  },
  {
    id: 'f4881eb9-fdd4-4d42-a739-8ad813041b43',
    childId: 'sky',
    type: 'activity',
    title: 'กิจกรรมวันลูกเสือแห่งชาติ (กลางแจ้ง)',
    subject: 'ลูกเสือ',
    date: '2026-07-15',
    notes: 'กิจกรรมกลางแจ้งสำหรับ ป.1-3 เวลา 8:30-10:30 น. สิ่งที่ต้องเตรียม: ชุดพละ+รองเท้ากีฬา, เสื้อผ้าสำหรับเปลี่ยน (มีกิจกรรมเกี่ยวกับน้ำ), ขวดน้ำ, หมวก REPS',
    status: 'done',
    createdAt: '2026-08-04T14:12:51.404Z',
  },
  {
    id: '9f94ace1-35f8-4d6e-80f8-9268d265b45d',
    childId: 'sky',
    type: 'exam',
    title: 'ฝึกเขียนและสะกดคำศัพท์ภาษาอังกฤษ Q2 Set 1',
    subject: 'ภาษาอังกฤษ',
    date: '2026-08-14',
    notes: 'ฝึกเขียน/สะกดคำ: dad, man, bag, clap, can, rat, and, hand, stand, land',
    attachments: [
      {
        id: 'att-sample-1',
        name: 'เอกสารคำศัพท์ (Word Online)',
        url: 'https://onedrive.live.com/view.aspx?resid=sample-word-online',
        type: 'word',
        isLink: true,
      },
    ],
    status: 'not_started',
    createdAt: '2026-08-04T12:13:45.190Z',
  },
  {
    id: '3aa1adf6-665c-430e-8e40-005ce1788827',
    childId: 'sky',
    type: 'homework',
    title: 'ฝึกนับเลขถึง 40 (Home Practice)',
    subject: 'English Maths',
    date: '2026-08-10',
    notes: 'Home Practice - Counting up to 40 (มีวิดีโอลิงก์ประกอบใน portal: Video Link - Counting up to 40)',
    attachments: [
      {
        id: 'att-sample-2',
        name: 'โจทย์แบบฝึกหัด Math (PDF ใน Google Drive)',
        url: 'https://drive.google.com/file/d/sample-math-practice/view',
        type: 'pdf',
        isLink: true,
      },
    ],
    status: 'not_started',
    createdAt: '2026-08-07T08:00:28Z',
  },
  {
    id: '205f0826-bf4e-4d5a-a461-47b004ca0613',
    childId: 'sky',
    type: 'exam',
    title: 'การเขียนตัวเลขอารบิก-เลขไทย จำนวนนับไม่เกิน 40',
    subject: 'Thai Maths',
    date: '2026-08-17',
    notes: 'ทบทวนหนังสือหน้า 82-86, คะแนนเต็ม 20',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: 'c4d4d544-6e3f-4fdc-9446-0f9c0cf376db',
    childId: 'sky',
    type: 'exam',
    title: 'สระเอา สระเอีย สระเอือ สระอัว',
    subject: 'Thai Language',
    date: '2026-08-19',
    notes: 'ทบทวนหนังสือหน้า 86,87,88,91,92,96,97 (และหน้าต่อเนื่อง), คะแนนเต็ม 20',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: '8814fdec-ef47-4b68-897b-e744e364ecfc',
    childId: 'sky',
    type: 'homework',
    title: 'Thai spelling set 1',
    subject: 'ภาษาไทย',
    date: '2026-08-20',
    notes: 'เขียนตามคำบอก ชุดที่ ๑',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: '67f2a73a-a8f3-402f-be85-503c63dfd5ee',
    childId: 'sky',
    type: 'exam',
    title: 'ส่วนต่างๆ ของพืช (Project)',
    subject: 'Thai Science',
    date: '2026-08-24',
    notes: 'Project Information, คะแนนเต็ม 20',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: '499fe853-c099-4175-90a6-922c89af3088',
    childId: 'sky',
    type: 'exam',
    title: 'การใช้งานอุปกรณ์เทคโนโลยีเบื้องต้น',
    subject: 'ICT',
    date: '2026-08-24',
    notes: 'คะแนนเต็ม 20',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: '55986e69-5d59-4061-b927-141dd72bcdf9',
    childId: 'sky',
    type: 'exam',
    title: 'สอบปฏิบัติ Xylophone เพลง Can Can',
    subject: 'Music',
    date: '2026-08-27',
    notes: 'คะแนนเต็ม 30',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },
  {
    id: '4eceacb9-a6b3-4ef0-b3a5-0061c452cfc1',
    childId: 'sky',
    type: 'homework',
    title: 'Thai spelling set 2',
    subject: 'ภาษาไทย',
    date: '2026-08-27',
    notes: 'เขียนตามคำบอก ชุดที่ ๒',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
  },

  // --- น้องไออุ่น (aioun) ---
  {
    id: 'aioun-task-1',
    childId: 'aioun',
    type: 'homework',
    title: 'การบ้านคณิตศาสตร์ เรื่อง การบวก ลบ เศษส่วน',
    subject: 'คณิตศาสตร์',
    date: '2026-08-12',
    notes: 'ทำแบบฝึกหัดหน้า 45-48 ในหนังสือเล่มแบบฝึกหัด',
    status: 'not_started',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'aioun-task-2',
    childId: 'aioun',
    type: 'exam',
    title: 'สอบ Science Unit 2: Ecosystems & Food Chain',
    subject: 'Science',
    date: '2026-08-18',
    notes: 'ทบทวนคำศัพท์ Producer, Consumer, Decomposer และสายใยอาหาร',
    status: 'not_started',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'aioun-task-3',
    childId: 'aioun',
    type: 'activity',
    title: 'กิจกรรมประกวดคัดลายมือวันภาษาไทยแห่งชาติ',
    subject: 'ภาษาไทย',
    date: '2026-08-21',
    notes: 'จัดเตรียมปากกาคัดลายมือ และฝึกซ้อมเขียนบทกลอนระดมสมอง',
    status: 'not_started',
    createdAt: '2026-08-10T08:00:00Z',
  },

  // --- น้องลดา (lada) ---
  {
    id: 'lada-task-1',
    childId: 'lada',
    type: 'homework',
    title: 'แบบฝึกหัดฝึกลากเส้นตามรอยปรักและระบายสีรูปสัตว์',
    subject: 'เตรียมความพร้อม',
    date: '2026-08-11',
    notes: 'ฝึกลากเส้นลอนคลื่นและระบายสีภาพสัตว์เลี้ยงให้สวยงาม',
    status: 'not_started',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'lada-task-2',
    childId: 'lada',
    type: 'exam',
    title: 'สอบทบทวนการท่องพยัญชนะไทย ก-ฮ และนับเลข 1-10',
    subject: 'ภาษาไทย',
    date: '2026-08-15',
    notes: 'ฝึกท่อง ก-ฮ กับคุณแม่ตอนเย็นก่อนนอน',
    status: 'not_started',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'lada-task-3',
    childId: 'lada',
    type: 'activity',
    title: 'กิจกรรมเตรียมชุดไทยร่วมงานวันแม่แห่งชาติ',
    subject: 'กิจกรรมอนุบาล',
    date: '2026-08-12',
    notes: 'เตรียมชุดไทยเด็กอนุบาล และเข็มกลัดดอกมะลิ',
    status: 'done',
    createdAt: '2026-08-10T08:00:00Z',
  },
];

const TASKS_COLLECTION = 'tasks';

// Fallback helper to fetch from Express backend API
async function fetchFromApiServer(): Promise<Task[]> {
  try {
    const res = await fetch('/api/tasks');
    if (res.ok) {
      const json = await res.json();
      if (json.items && Array.isArray(json.items)) {
        return json.items;
      }
    }
  } catch (e) {
    console.warn('API fallback fetch failed, returning initial CSV tasks:', e);
  }
  return INITIAL_CSV_TASKS;
}

// Get tasks from Firestore with automatic API fallback on Quota / Network error
export async function getFirestoreTasks(): Promise<Task[]> {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const snapshot = await getDocs(query(tasksRef, orderBy('date', 'asc')));

    if (snapshot.empty) {
      console.log('Firestore empty, attempting to seed initial CSV tasks...');
      try {
        for (const t of INITIAL_CSV_TASKS) {
          await setDoc(doc(db, TASKS_COLLECTION, t.id), {
            ...t,
            childId: t.childId || 'sky',
            created_by: '',
            updated_at: new Date().toISOString(),
            child_id: t.childId || 'sky',
          });
        }
      } catch (seedErr) {
        console.warn('Firestore seeding skipped due to quota or error:', seedErr);
      }
      return INITIAL_CSV_TASKS;
    }

    const fetchedTasks: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        childId: data.childId || data.child_id || 'sky',
        type: data.type || 'homework',
        title: data.title || '',
        subject: data.subject || '',
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        notes: data.notes || '',
        imageUrl: data.imageUrl || '',
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        status: data.status || 'not_started',
        createdAt: data.createdAt || data.updated_at || new Date().toISOString(),
      };
    });

    return fetchedTasks;
  } catch (err) {
    console.warn('Firestore fetch failed (e.g. Quota exceeded), using API backend fallback:', err);
    return await fetchFromApiServer();
  }
}

export async function addFirestoreTask(task: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
  const taskId = task.id || 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newTask: Task = {
    id: taskId,
    childId: task.childId || 'sky',
    type: task.type,
    title: task.title,
    subject: task.subject || '',
    date: task.date,
    time: task.time || '',
    location: task.location || '',
    notes: task.notes || '',
    imageUrl: task.imageUrl || '',
    attachments: task.attachments || [],
    status: task.status || 'not_started',
    createdAt: new Date().toISOString(),
  };

  // Sync to Express backend API first to guarantee persistence even if Firestore quota is exceeded
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
  } catch (apiErr) {
    console.warn('API sync failed:', apiErr);
  }

  try {
    await setDoc(doc(db, TASKS_COLLECTION, taskId), {
      ...newTask,
      updated_at: new Date().toISOString(),
      child_id: newTask.childId,
    });
  } catch (err) {
    console.warn('Firestore add skipped/failed (e.g. Quota exceeded):', err);
  }

  return newTask;
}

export async function updateFirestoreTask(id: string, updates: Partial<Task>): Promise<void> {
  // Sync to Express backend API first
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch (apiErr) {
    console.warn('API update failed:', apiErr);
  }

  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await setDoc(
      taskRef,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore update skipped/failed (e.g. Quota exceeded):', err);
  }
}

export async function deleteFirestoreTask(id: string): Promise<void> {
  // Sync to Express backend API first
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  } catch (apiErr) {
    console.warn('API delete failed:', apiErr);
  }

  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('Firestore delete skipped/failed (e.g. Quota exceeded):', err);
  }
}

export async function seedFirestoreWithCsvData(): Promise<Task[]> {
  try {
    for (const t of INITIAL_CSV_TASKS) {
      await setDoc(doc(db, TASKS_COLLECTION, t.id), {
        ...t,
        created_by: '',
        updated_at: new Date().toISOString(),
        child_id: 'default',
      });
    }
  } catch (err) {
    console.warn('Firestore seed failed, using local/API fallback:', err);
  }
  return INITIAL_CSV_TASKS;
}
