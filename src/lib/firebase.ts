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
  {
    id: '11fb40eb-7ae4-483d-8b87-d34fae7f575f',
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
    type: 'exam',
    title: 'ฝึกเขียนและสะกดคำศัพท์ภาษาอังกฤษ Q2 Set 1',
    subject: 'ภาษาอังกฤษ',
    date: '2026-08-14',
    notes: 'ฝึกเขียน/สะกดคำ: dad, man, bag, clap, can, rat, and, hand, stand, land',
    status: 'not_started',
    createdAt: '2026-08-04T12:13:45.190Z',
  },
  {
    id: '3aa1adf6-665c-430e-8e40-005ce1788827',
    type: 'homework',
    title: 'ฝึกนับเลขถึง 40 (Home Practice)',
    subject: 'English Maths',
    date: '2026-08-10',
    notes: 'Home Practice - Counting up to 40 (มีวิดีโอลิงก์ประกอบใน portal: Video Link - Counting up to 40)',
    status: 'not_started',
    createdAt: '2026-08-07T08:00:28Z',
  },
  {
    id: '205f0826-bf4e-4d5a-a461-47b004ca0613',
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
    type: 'homework',
    title: 'Thai spelling set 2',
    subject: 'ภาษาไทย',
    date: '2026-08-27',
    notes: 'เขียนตามคำบอก ชุดที่ ๒',
    status: 'not_started',
    createdAt: '2026-08-07T08:05:55Z',
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
            created_by: '',
            updated_at: new Date().toISOString(),
            child_id: 'default',
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
        type: data.type || 'homework',
        title: data.title || '',
        subject: data.subject || '',
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        notes: data.notes || '',
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
    type: task.type,
    title: task.title,
    subject: task.subject || '',
    date: task.date,
    time: task.time || '',
    location: task.location || '',
    notes: task.notes || '',
    status: task.status || 'not_started',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, TASKS_COLLECTION, taskId), {
      ...newTask,
      updated_at: new Date().toISOString(),
      child_id: 'default',
    });
  } catch (err) {
    console.warn('Firestore add failed (Quota or network), using API fallback:', err);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
  }

  return newTask;
}

export async function updateFirestoreTask(id: string, updates: Partial<Task>): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await updateDoc(taskRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore update failed, using API fallback:', err);
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }
}

export async function deleteFirestoreTask(id: string): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('Firestore delete failed, using API fallback:', err);
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
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
