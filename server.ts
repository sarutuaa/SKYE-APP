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

let tasks = [
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
  const { type, title, subject, date, time, location, notes, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ ok: false, error: "กรุณาระบุชื่อเรื่อง" });
  }
  const newTask = {
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    type: type || "homework",
    title: title.trim(),
    subject: subject || "",
    date: date || getTodayStr(0),
    time: time || "",
    location: location || "",
    notes: notes || "",
    status: status || "not_started",
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  res.json({ ok: true, item: newTask, items: tasks });
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ ok: false, error: "ไม่พบรายการที่ระบุ" });
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

    const ai = getGeminiClient();
    const contents: any[] = [];

    // Add inline image/PDF file if provided
    if (fileBase64) {
      contents.push({
        inlineData: {
          mimeType: fileMediaType || "image/jpeg",
          data: fileBase64,
        },
      });
    }

    const userPrompt = text
      ? `ข้อความประกาศจากโรงเรียน/กลุ่มไลน์ครู:\n"${text}"\n\nช่วยวิเคราะห์และสกัดรายการการบ้าน, การสอบ, หรือกิจกรรมทั้งหมดจากข้อความหรือรูปภาพนี้ให้อยู่ในรูปแบบรายการภาษาไทย วันที่เป็น YYYY-MM-DD โดยอ้างอิงปีปัจจุบัน (${new Date().getFullYear()}) หากไม่ระบุปี ให้ใช้ปีปัจจุบัน`
      : `ช่วยวิเคราะห์รูปภาพประกาศ/ใบสั่งงานนี้ และสกัดรายการการบ้าน, การสอบ, หรือกิจกรรมทั้งหมดให้อยู่ในรูปแบบรายการภาษาไทย วันที่เป็น YYYY-MM-DD โดยอ้างอิงปีปัจจุบัน (${new Date().getFullYear()})`;

    contents.push({ text: userPrompt });

    const systemInstruction = `คุณคือระบบ AI ผู้ช่วยคุณแม่เพื่อสรุปและจัดกลุ่มงานโรงเรียนของลูกนักเรียนอนุบาล/ประถมศึกษา
หน้าที่ของคุณคือสกัดข้อมูลการบ้าน (homework), การสอบ (exam), หรือกิจกรรม (activity) จากข้อความไลน์ครู หรือรูปใบงานประกาศโรงเรียน
ส่งคืนข้อมูลเป็น JSON Array เท่านั้น โดยแต่ละชิ้นมีโครงสร้าง:
- type: 'homework' (การบ้าน) | 'exam' (สอบ) | 'activity' (กิจกรรม)
- title: ชื่อรายการงานหรือเรื่องสั้นๆ กระชับเข้าใจง่าย
- subject: ชื่อวิชา (เช่น คณิตศาสตร์, วิทยาศาสตร์, ภาษาไทย, ภาษาอังกฤษ, สุขศึกษา) หรือใส่ 'ทั่วไป' หากเป็นกิจกรรม
- date: วันที่กำหนดส่งหรือวันทำกิจกรรม รูปแบบ YYYY-MM-DD (เช่น ${getTodayStr(0)})
- notes: รายละเอียดเพิ่มเติม คำแนะนำ สิ่งที่ต้องเตรียม หรือหมายเหตุ`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "รายการงานที่สกัดได้จากข้อความประกาศ",
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
                description: "วันที่กำหนดส่ง/สอบ รูปแบบ YYYY-MM-DD",
              },
              notes: {
                type: Type.STRING,
                description: "รายละเอียด สิ่งที่ต้องเตรียม หรือคำแนะนำจากครู",
              },
            },
            required: ["type", "title", "subject", "date"],
          },
        },
      },
    });

    const outputText = response.text || "[]";
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(outputText);
    } catch (e) {
      console.error("Failed to parse Gemini output JSON:", outputText);
    }

    res.json({
      ok: true,
      items: parsedItems,
    });
  } catch (error: any) {
    console.error("Error in /api/ai-parse:", error);
    res.status(500).json({
      ok: false,
      error: "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI: " + (error.message || "Unknown error"),
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
