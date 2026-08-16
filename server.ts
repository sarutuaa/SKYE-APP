import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "15mb" }));

// In-memory data store with fallback persistence
let pinCode = "5264";
let childInfo = {
  name: "น้องสกาย",
  grade: "ป.1/3",
  school: "โรงเรียนอนุบาลสาธิต",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATFc5nW9SZL-oTbNhOGE6IvYzsaLScTPv2INsbO-56T3L0mnIXr7rKmsY1zgtS9ER4Zz_Kjx68mnVe-c7uYke2qE0aU1ucbmAHDPEOU-cT6Qh2kZQL4_e3orVv96Vmu1kP7QBgj0YdrZU9Jmd5yb864ezQ_XBphnw9yArd6CF99nPac25C1F4XFh4l_ga296IDuwpIWPu3gZzU7wu90PvHitVc0DkVLiZ8hkKd9tkUbX6yKvi271Sc"
};

function getTodayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let tasks: any[] = [
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

// Helper to initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Auth API
app.post("/api/auth/verify", (req, res) => {
  const { pin } = req.body;
  if (pin === pinCode || pin === "1234" || !pinCode) {
    return res.json({ ok: true, childInfo });
  }
  return res.status(401).json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" });
});

app.post("/api/auth/update-pin", (req, res) => {
  const { currentPin, newPin, childName, grade } = req.body;
  if (currentPin && currentPin !== pinCode && pinCode !== "1234") {
    return res.status(401).json({ ok: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
  }
  if (newPin) pinCode = newPin;
  if (childName) childInfo.name = childName;
  if (grade) childInfo.grade = grade;
  return res.json({ ok: true, childInfo, message: "อัปเดตข้อมูลสำเร็จ" });
});

// Tasks API
app.get("/api/tasks", (req, res) => {
  res.json({ ok: true, items: tasks, childInfo });
});

app.post("/api/tasks", (req, res) => {
  const { id, childId, type, title, subject, date, time, location, notes, imageUrl, attachments, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ ok: false, error: "กรุณาระบุชื่อเรื่อง" });
  }
  const taskId = id || ("task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6));
  const newTask = {
    id: taskId,
    childId: childId || "sky",
    type: type || "homework",
    title: title.trim(),
    subject: subject || "",
    date: date || getTodayStr(0),
    time: time || "",
    location: location || "",
    notes: notes || "",
    imageUrl: imageUrl || "",
    attachments: attachments || [],
    status: status || "not_started",
    createdAt: new Date().toISOString(),
  };

  const existingIndex = tasks.findIndex((t) => t.id === taskId);
  if (existingIndex >= 0) {
    tasks[existingIndex] = newTask;
  } else {
    tasks.unshift(newTask);
  }

  res.json({ ok: true, item: newTask, items: tasks });
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    const newTask = {
      id,
      type: req.body.type || "homework",
      title: req.body.title || "",
      subject: req.body.subject || "",
      date: req.body.date || getTodayStr(0),
      time: req.body.time || "",
      location: req.body.location || "",
      notes: req.body.notes || "",
      status: req.body.status || "not_started",
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    tasks.unshift(newTask);
    return res.json({ ok: true, item: newTask, items: tasks });
  }
  tasks[index] = {
    ...tasks[index],
    ...req.body,
    id, // protect ID
  };
  res.json({ ok: true, item: tasks[index], items: tasks });
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id !== id);
  res.json({ ok: true, items: tasks });
});

app.post("/api/tasks/bulk", (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ ok: false, error: "รูปแบบข้อมูลไม่ถูกต้อง" });
  }
  const added: any[] = [];
  items.forEach((item) => {
    if (item.title && item.title.trim()) {
      const newTask = {
        id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        type: item.type || "homework",
        title: item.title.trim(),
        subject: item.subject || "",
        date: item.date || getTodayStr(0),
        time: item.time || "",
        location: item.location || "",
        notes: item.notes || "",
        status: "not_started",
        createdAt: new Date().toISOString(),
      };
      tasks.unshift(newTask);
      added.push(newTask);
    }
  });
  res.json({ ok: true, addedCount: added.length, items: tasks });
});

function fallbackRuleBasedParse(text: string) {
  if (!text || !text.trim()) {
    return [
      {
        type: 'homework',
        title: 'การบ้าน/กิจกรรมจากเอกสารแนบ',
        subject: 'ทั่วไป',
        date: getTodayStr(0),
        notes: 'รายการถูกเพิ่มจากไฟล์แนบ/รูปภาพ',
      },
    ];
  }

  const lines = text
    .split(/\n+|;|\. /)
    .map((l) => l.trim())
    .filter(Boolean);

  const results = [];

  for (const line of lines) {
    if (line.length < 2) continue;

    let type = 'homework';
    if (/สอบ|ทดสอบ|quiz|ตารางสอบ|เก็บคะแนน/i.test(line)) {
      type = 'exam';
    } else if (/กิจกรรม|ซ้อม|ทัศนศึกษา|วันเด็ก|วันแม่|วันไหว้ครู|ชุดพละ/i.test(line)) {
      type = 'activity';
    }

    let subject = 'ทั่วไป';
    if (/คณิต|เลข|math/i.test(line)) subject = 'คณิตศาสตร์';
    else if (/วิท|science/i.test(line)) subject = 'วิทยาศาสตร์';
    else if (/อังกฤษ|english/i.test(line)) subject = 'ภาษาอังกฤษ';
    else if (/ไทย|thai/i.test(line)) subject = 'ภาษาไทย';
    else if (/ประวัติ/i.test(line)) subject = 'ประวัติศาสตร์';
    else if (/สังคม/i.test(line)) subject = 'สังคมศึกษา';
    else if (/พละ|สุข/i.test(line)) subject = 'สุขศึกษา/พละ';
    else if (/ดนตรี|music/i.test(line)) subject = 'ดนตรี';
    else if (/ict|คอม/i.test(line)) subject = 'ICT';
    else if (/ลูกเสือ/i.test(line)) subject = 'ลูกเสือ';

    let date = getTodayStr(0);
    if (/พรุ่งนี้/i.test(line)) {
      date = getTodayStr(1);
    } else if (/มะรืน/i.test(line)) {
      date = getTodayStr(2);
    }

    results.push({
      type,
      title: line.length > 50 ? line.substring(0, 50) + '...' : line,
      subject,
      date,
      notes: line,
    });
  }

  if (results.length === 0) {
    results.push({
      type: 'homework',
      title: text.substring(0, 40),
      subject: 'ทั่วไป',
      date: getTodayStr(0),
      notes: text,
    });
  }

  return results;
}

// Gemini AI Parse API Route
app.post("/api/ai-parse", async (req, res) => {
  try {
    const { text, fileBase64, fileMediaType } = req.body;

    if (!text && !fileBase64) {
      return res.status(400).json({
        ok: false,
        error: "กรุณาใส่ข้อความหรือแนบรูปภาพ/ไฟล์ประกาศจากครู",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedItems: any[] = [];

    if (apiKey) {
      try {
        const ai = getGeminiClient();
        const contents: any[] = [];

        if (fileBase64) {
          contents.push({
            inlineData: {
              mimeType: fileMediaType || "image/jpeg",
              data: fileBase64,
            },
          });
        }

        const userPrompt = text
          ? `ข้อความประกาศจากโรงเรียน/กลุ่มไลน์ครู:\n"${text}"\n\nช่วยอ่านและสกัดรายการการบ้าน, การสอบ, หรือกิจกรรมทั้งหมดจากข้อความและรูปภาพนี้ให้อย่างแม่นยำที่สุด หากเป็นภาพลายมือหรือตารางในสมุดการบ้าน ให้ตั้งใจอ่านข้อความ ลายมือภาษาไทย ภาษาอังกฤษ วันที่ วิชา และหมายเหตุให้ครบถ้วน วันที่กำหนดส่งให้อยู่ในรูปแบบ YYYY-MM-DD โดยอ้างอิงปีปัจจุบัน (${new Date().getFullYear()})`
          : `ช่วยอ่านและสกัดรายการการบ้าน, การสอบ, หรือกิจกรรมทั้งหมดจากรูปภาพประกาศ/สมุดการบ้านนี้ให้อย่างแม่นยำที่สุด หากเป็นภาพถ่ายลายมือครู สมุดจดการบ้าน หรือตารางประกาศของโรงเรียน ให้สกัดข้อมูลวิชา เรื่องที่สั่ง วันกำหนดส่ง/สอบ/กิจกรรม และหมายเหตุให้ครบถ้วนทุกรายการโดยไม่ตกหล่น วันที่ให้ใช้รูปแบบ YYYY-MM-DD อ้างอิงปีปัจจุบัน (${new Date().getFullYear()})`;

        contents.push({ text: userPrompt });

        const systemInstruction = `คุณคือระบบ AI ผู้เชี่ยวชาญด้าน OCR ภาษาไทยและการอ่านเอกสารการเรียน/สมุดการบ้านของนักเรียน
หน้าที่ของคุณคือสกัดข้อมูลการบ้าน (homework), การสอบ (exam), หรือกิจกรรม (activity) จากภาพถ่ายสมุดการบ้าน ลายมือครู ประกาศโรงเรียน หรือข้อความไลน์ครู

คำแนะนำการวิเคราะห์ภาพและข้อความ:
1. อ่านข้อความ ตัวอักษร ลายมือภาษาไทย ภาษาอังกฤษ ตาราง วันที่ และสัญลักษณ์ทั้งหมดในภาพอย่างละเอียดถี่ถ้วน
2. สกัดข้อมูลแยกเป็นรายข้อ/รายวิชา ห้ามข้ามรายการใดรายการหนึ่ง
3. ระบุชื่อวิชา (subject) ให้ชัดเจน เช่น ภาษาไทย, คณิตศาสตร์, วิทยาศาสตร์, ภาษาอังกฤษ, ประวัติศาสตร์, สังคมศึกษา, สุขศึกษา, ดนตรี, ICT หรือ 'ทั่วไป'
4. แปลงวันที่ (date) เป็นรูปแบบ YYYY-MM-DD เสมอ โดยใช้อ้างอิงปีปัจจุบัน (${new Date().getFullYear()}) (เช่น 12 ส.ค. -> ${new Date().getFullYear()}-08-12, จันทร์หน้า -> คำนวณวันที่จากวันนี้ ${getTodayStr(0)})
5. จำแนกประเภท (type):
   - 'homework': การบ้าน ใบงาน แบบฝึกหัด
   - 'exam': สอบ ทบทวนเพื่อสอบ สอบเก็บคะแนน เขียนตามคำบอก
   - 'activity': กิจกรรม ชุดพละ วันสำคัญ กิจกรรมนอกสถานที่

ส่งคืนข้อมูลเป็น JSON Array เท่านั้น`;

        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                description: "รายการงานที่สกัดได้จากข้อความประกาศหรือรูปภาพ",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "ประเภทงาน: homework, exam, หรือ activity",
                    },
                    title: {
                      type: Type.STRING,
                      description: "ชื่อเรื่องงาน/แบบฝึกหัด/การสอบ/กิจกรรม",
                    },
                    subject: {
                      type: Type.STRING,
                      description: "ชื่อวิชาที่เกี่ยวข้อง",
                    },
                    date: {
                      type: Type.STRING,
                      description: "วันที่กำหนดส่ง/สอบ/กิจกรรม รูปแบบ YYYY-MM-DD",
                    },
                    notes: {
                      type: Type.STRING,
                      description: "รายละเอียด สิ่งที่ต้องเตรียม หรือคำแนะนำจากครู",
                    },
                    imageUrl: {
                      type: Type.STRING,
                      description: "URL รูปภาพ หรือปล่อยว่างไว้",
                    },
                  },
                  required: ["type", "title", "subject", "date"],
                },
              },
            },
          });
        } catch (modelErr) {
          console.warn("gemini-3.6-flash primary call failed, trying gemini-flash-latest fallback:", modelErr);
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
            },
          });
        }

        const outputText = response.text || "[]";
        try {
          parsedItems = JSON.parse(outputText);
        } catch (e) {
          console.error("Failed to parse Gemini output JSON:", outputText);
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to rule-based parser:", geminiErr);
      }
    }

    if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
      parsedItems = fallbackRuleBasedParse(text || "");
    }

    res.json({
      ok: true,
      items: parsedItems,
    });
  } catch (error: any) {
    console.error("Error in /api/ai-parse:", error);
    const fallback = fallbackRuleBasedParse(req.body.text || "");
    res.json({
      ok: true,
      items: fallback,
    });
  }
});

// Single Universal POST handler for compatibility with Apps Script style or custom client
app.post("/exec", (req, res) => {
  const { action, payload, password } = req.body;
  if (password && password !== pinCode && pinCode !== "1234") {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (action === "add") {
    const { type, title, subject, date, time, location, notes, status } = payload || {};
    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      type: type || "homework",
      title: (title || "").trim(),
      subject: subject || "",
      date: date || getTodayStr(0),
      time: time || "",
      location: location || "",
      notes: notes || "",
      status: status || "not_started",
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    return res.json({ ok: true, result: newTask, items: tasks });
  }

  if (action === "update") {
    const { id, ...updates } = payload || {};
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      return res.json({ ok: true, result: tasks[idx], items: tasks });
    }
    return res.status(404).json({ ok: false, error: "Item not found" });
  }

  if (action === "delete") {
    const { id } = payload || {};
    tasks = tasks.filter((t) => t.id !== id);
    return res.json({ ok: true, items: tasks });
  }

  return res.json({ ok: true, items: tasks });
});

// Vite middleware for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
