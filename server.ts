import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

dotenv.config();

import fsSync from "fs";
const firebaseConfig = JSON.parse(fsSync.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);


const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

let emailLogs: { id: string, timestamp: string, teacherEmail: string, subject: string, status: 'success' | 'error', details?: string }[] = [];

async function getClasses() {
  const snap = await getDocs(collection(db, "classes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getTimetable() {
  const snap = await getDocs(collection(db, "timetable"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

async function getExams() {
  const snap = await getDocs(collection(db, "exams"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}




function formatTimeAmPm(time24) {
  if (!time24) return "";
  const match = time24.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
function checkTimeOverlap(start1, end1, start2, end2) {
  if (!start1 || !start2) return false;
  const s1 = parseTime(start1);
  const e1 = end1 ? parseTime(end1) : s1 + 60;
  const s2 = parseTime(start2);
  const e2 = end2 ? parseTime(end2) : s2 + 60;
  return s1 < e2 && s2 < e1;
}

// Mailer setup
// User must provide EMAIL_USER and EMAIL_APP_PASSWORD in .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Background cron job to check and send reminders
// Runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  
  // Create a formatter for Karachi time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  
  // We don't parse a string to a new Date object, we just calculate targets
  // in milliseconds and then format them to Karachi time.
  const getKarachiInfo = (dateObj: Date) => {
      const parts = formatter.formatToParts(dateObj);
      const get = (type: string) => parts.find(p => p.type === type)?.value;
      const y = get('year');
      const m = get('month');
      const d = get('day');
      const hr = parseInt(get('hour') || '0');
      const min = parseInt(get('minute') || '0');
      // Fix 24 to 0
      const hrAdjusted = hr === 24 ? 0 : hr;
      
      const dateISO = `${y}-${m}-${d}`;
      const timeMins = hrAdjusted * 60 + min;
      
      const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      // To get weekday in Karachi:
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'long' }).format(dateObj);
      
      return { dateISO, timeMins, weekdayStr };
  };

  const settings = await getSettings();
  const offset = settings.reminderOffset || 180; // default 3 hours
  const targets = Array.from(new Set([60, offset])); // 1 hour and user-defined offset

  const timetable = await getTimetable();
  const exams = await getExams();

  for (const t of targets) {
    const targetDate = new Date(now.getTime() + t * 60000);
    const targetInfo = getKarachiInfo(targetDate);
    
    // Check Timetable
    for (const entry of timetable) {
      const entryStart = parseTime(entry.time);
      if (entryStart === targetInfo.timeMins && (entry.days.includes(targetInfo.weekdayStr) || entry.days.includes("Daily"))) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) continue;
        
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: entry.teacherEmail,
            subject: `Reminder: Upcoming Class - ${entry.subject}`,
            text: `Dear ${entry.teacherName},\n\nThis is an automated reminder that your class for ${entry.subject} is starting at ${formatTimeAmPm(entry.time)}.\n\nBest regards,\nAdmin System`,
          };
          await transporter.sendMail(mailOptions);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: entry.teacherEmail,
            subject: entry.subject,
            status: 'success'
          });
          
          if (entry.taEmail && entry.taName) {
            try {
              const taMailOptions = {
                from: process.env.EMAIL_USER,
                to: entry.taEmail,
                subject: `Reminder: Upcoming TA Duty - ${entry.subject}`,
                text: `Dear ${entry.taName},\n\nThis is an automated reminder that your TA duty for ${entry.subject} with ${entry.teacherName} is starting at ${formatTimeAmPm(entry.time)}.\n\nBest regards,\nAdmin System`,
              };
              await transporter.sendMail(taMailOptions);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'success'
              });
            } catch (taError: any) {
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'error',
                details: taError.message
              });
            }
          }
        } catch (error: any) {
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: entry.teacherEmail,
            subject: entry.subject,
            status: 'error',
            details: error.message
          });
        }
      }
    }

    // Check Exams
    for (const exam of exams) {
      const examStart = parseTime(exam.time);
      if (exam.date === targetInfo.dateISO && examStart === targetInfo.timeMins) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) continue;
        
        for (const invigilator of exam.invigilators || []) {
          try {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: invigilator.email,
              subject: `Reminder: Invigilation Duty - ${exam.subject}`,
              text: `Dear ${invigilator.name},\n\nThis is an automated reminder that you have an invigilation duty for ${exam.subject} starting at ${formatTimeAmPm(exam.time)}.\n\nBest regards,\nAdmin System`,
            };
            await transporter.sendMail(mailOptions);
            emailLogs.unshift({
              id: Date.now().toString() + Math.random().toString(),
              timestamp: new Date().toISOString(),
              teacherEmail: invigilator.email,
              subject: exam.subject + " (Exam)",
              status: 'success'
            });
          } catch (error: any) {
            emailLogs.unshift({
              id: Date.now().toString() + Math.random().toString(),
              timestamp: new Date().toISOString(),
              teacherEmail: invigilator.email,
              subject: exam.subject + " (Exam)",
              status: 'error',
              details: error.message
            });
          }
        }
      }
    }
  }

  if (emailLogs.length > 50) emailLogs = emailLogs.slice(0, 50);
});


async function getSettings() {
  const snap = await getDocs(collection(db, "settings"));
  if (snap.empty) return { reminderOffset: 15 };
  return snap.docs[0].data();
}
app.get("/api/settings", async (req, res) => {
  res.json(await getSettings());
});
app.post("/api/settings", async (req, res) => {
  const { reminderOffset } = req.body;
  await setDoc(doc(db, "settings", "global"), { reminderOffset });
  res.json({ success: true });
});

// Classes API
app.get("/api/classes", async (req, res) => {
  res.json(await getClasses());
});

app.post("/api/classes", async (req, res) => {
  const { id, name } = req.body;
  const newId = id || Date.now().toString();
  await setDoc(doc(db, "classes", newId), { name });
  res.json({ success: true });
});


app.delete("/api/classes/:id/records", async (req, res) => {
  const { id } = req.params;
  try {
    // Delete all timetable entries for this class
    const timetableSnap = await getDocs(collection(db, "timetable"));
    const timetableDocs = timetableSnap.docs.filter(d => d.data().classId === id);
    for (const doc of timetableDocs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete all exams for this class
    const examsSnap = await getDocs(collection(db, "exams"));
    const examsDocs = examsSnap.docs.filter(d => d.data().classId === id);
    for (const doc of examsDocs) {
      await deleteDoc(doc.ref);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/classes/:id", async (req, res) => {
  const { id } = req.params;
  await deleteDoc(doc(db, "classes", id));
  // Delete associated timetable entries
  const t = await getTimetable();
  for (const entry of t) {
    if (entry.classId === id) {
      await deleteDoc(doc(db, "timetable", entry.id));
    }
  }
  res.json({ success: true });
});

// Timetable API
app.get("/api/timetable", async (req, res) => {
  res.json(await getTimetable());
});

async function checkConflict(teacherName: string, time: string, endTime: string | undefined, days: string[], classId: string, excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  
  for (const entry of timetable) {
    if (excludeId && entry.id === excludeId) continue;
    
    const hasOverlap = entry.days.some((d: string) => days.includes(d) || d === "Daily" || days.includes("Daily"));
    if (hasOverlap && checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
      if (entry.classId === classId) {
        return `Clash detected! This class already has ${entry.subject} scheduled at this time.`;
      }
      if (entry.teacherName === teacherName) {
        return `Clash detected! ${teacherName} is already teaching ${entry.subject} at ${entry.time}.`;
      }
    }
  }

  for (const exam of exams) {
    if (excludeId && exam.id === excludeId) continue;
    if (checkTimeOverlap(exam.time, exam.endTime, time, endTime)) {
      const examDay = new Date(exam.date).toLocaleDateString("en-US", { weekday: "long" });
      const hasOverlap = days.includes(examDay) || days.includes("Daily");
      if (hasOverlap) {
        if (exam.classId === classId) {
           return `Clash detected! This class already has an exam (${exam.subject}) scheduled at this time.`;
        }
        if (exam.invigilators?.some((i: any) => i.name === teacherName)) {
          return `Clash detected! ${teacherName} is invigilating an exam (${exam.subject}) on ${exam.date} at ${exam.time}.`;
        }
      }
    }
  }
  return null;
}

async function checkExamConflict(invigilators: any[], date: string, time: string, endTime: string | undefined, classId: string, excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  const examDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  for (const entry of timetable) {
    if (checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
      if (entry.days.includes(examDay) || entry.days.includes("Daily")) {
        if (entry.classId === classId) {
          return `Clash detected! This class already has ${entry.subject} scheduled at this time.`;
        }
        for (const inv of invigilators) {
          if (entry.teacherName === inv.name) {
            return `Clash detected! ${inv.name} is already teaching ${entry.subject} at ${entry.time} on ${examDay}s.`;
          }
        }
      }
    }
  }
  
  for (const exam of exams) {
    if (excludeId && exam.id === excludeId) continue;
    if (exam.date === date && checkTimeOverlap(exam.time, exam.endTime, time, endTime)) {
      if (exam.classId === classId) {
         return `Clash detected! This class already has an exam (${exam.subject}) scheduled at this time.`;
      }
      for (const inv of invigilators) {
        if (exam.invigilators?.some((i: any) => i.name === inv.name)) {
          return `Clash detected! ${inv.name} is already invigilating ${exam.subject} at this time.`;
        }
      }
    }
  }
  return null;
}

app.post("/api/timetable", async (req, res) => {
  const { id, teacherName, subject, time, teacherEmail, days, classId, grade } = req.body;
  const newId = id || Date.now().toString();
  
  const conflict = await checkConflict(teacherName, time, req.body.endTime, days || ["Daily"], classId);
  if (conflict) return res.status(400).json({ error: conflict });

  const data: any = { 
    teacherName, 
    subject, 
    time,
    endTime: req.body.endTime,
    teacherEmail, 
    days: days || ["Daily"], 
    classId,
    taName: req.body.taName,
    taEmail: req.body.taEmail
  };
  if (grade !== undefined) {
    data.grade = grade;
  }
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });
  await setDoc(doc(db, "timetable", newId), data);
  res.json({ success: true });
});

app.put("/api/timetable/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  
  const conflict = await checkConflict(updateData.teacherName, updateData.time, updateData.endTime, updateData.days || ["Daily"], updateData.classId, id);
  if (conflict) return res.status(400).json({ error: conflict });

  // Remove undefined fields to prevent Firestore errors
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  await updateDoc(doc(db, "timetable", id), updateData);
  res.json({ success: true });
});

app.delete("/api/timetable/:id", async (req, res) => {
  const { id } = req.params;
  await deleteDoc(doc(db, "timetable", id));
  res.json({ success: true });
});

// Exams API
app.get("/api/exams", async (req, res) => {
  res.json(await getExams());
});

app.post("/api/exams", async (req, res) => {
  const { id, subject, date, time, classId, invigilators } = req.body;
  const newId = id || Date.now().toString();

  const conflict = await checkExamConflict(invigilators || [], date, time, req.body.endTime, classId);
  if (conflict) return res.status(400).json({ error: conflict });

  await setDoc(doc(db, "exams", newId), { subject, date, time, endTime: req.body.endTime, classId, invigilators: invigilators || [] });
  res.json({ success: true });
});

app.put("/api/exams/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  
  const conflict = await checkExamConflict(updateData.invigilators || [], updateData.date, updateData.time, updateData.endTime, updateData.classId, id);
  if (conflict) return res.status(400).json({ error: conflict });

  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  await updateDoc(doc(db, "exams", id), updateData);
  res.json({ success: true });
});


app.delete("/api/exams/all", async (req, res) => {
  try {
    const examsSnap = await getDocs(collection(db, "exams"));
    for (const doc of examsSnap.docs) {
      await deleteDoc(doc.ref);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/exams/:id", async (req, res) => {
  const { id } = req.params;
  await deleteDoc(doc(db, "exams", id));
  res.json({ success: true });
});

app.get("/api/logs", (req, res) => {
  res.json(emailLogs);
});

// Chatbot API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Convert history for SDK
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'model' || msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.parts ? msg.parts[0].text : msg.text }]
    }));
    
    const currentClasses = await getClasses();
    const currentTimetable = await getTimetable();
    const currentExams = await getExams();
    
    const now = new Date();
    const currentDateString = now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeString = now.toLocaleTimeString("en-US");
    
    
    const formattedTimetable = currentTimetable.map(item => ({
      ...item,
      time: formatTimeAmPm(item.time),
      endTime: item.endTime ? formatTimeAmPm(item.endTime) : undefined
    }));
    
    const formattedExams = currentExams.map(item => ({
      ...item,
      time: formatTimeAmPm(item.time),
      endTime: item.endTime ? formatTimeAmPm(item.endTime) : undefined
    }));

    const chat = ai.chats.create({

      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: `You are a helpful admin assistant for a school timetable system. You answer queries based on the scheduled classes and exams. Always format times using AM/PM formatting. Be concise and professional.
Whenever the user asks for a schedule or timetable, present it clearly as a Markdown table.
The current date is ${currentDateString} and the time is ${currentTimeString}.

Current Classes:
${JSON.stringify(currentClasses, null, 2)}

Current Scheduled Classes Timetable:
${JSON.stringify(formattedTimetable, null, 2)}

Current Scheduled Exams / Papers:
${JSON.stringify(formattedExams, null, 2)}`,
      },
      history: formattedHistory,
    });
    
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/intelligence", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
