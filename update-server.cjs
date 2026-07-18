const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Add parseTime and checkTimeOverlap helpers
const helpers = `
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
`;

content = content.replace('// Mailer setup', helpers + '\n// Mailer setup');

// Settings API
const settingsApi = `
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
`;
content = content.replace('// Classes API', settingsApi + '\n// Classes API');

// Replace checkConflict
content = content.replace(
/async function checkConflict[\s\S]*?return null;\n}/m,
`async function checkConflict(teacherName: string, time: string, endTime: string | undefined, days: string[], excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  
  // Check timetable clashes
  for (const entry of timetable) {
    if (excludeId && entry.id === excludeId) continue;
    if (entry.teacherName === teacherName && checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
      const hasOverlap = entry.days.some((d: string) => days.includes(d) || d === "Daily" || days.includes("Daily"));
      if (hasOverlap) return \`Clash detected! \${teacherName} is already teaching \${entry.subject} at \${entry.time}.\`;
    }
  }

  // Check exam clashes
  for (const exam of exams) {
    if (excludeId && exam.id === excludeId) continue;
    if (checkTimeOverlap(exam.time, exam.endTime, time, endTime)) {
      const examDay = new Date(exam.date).toLocaleDateString("en-US", { weekday: "long" });
      const hasOverlap = days.includes(examDay) || days.includes("Daily");
      if (hasOverlap && exam.invigilators?.some((i: any) => i.name === teacherName)) {
        return \`Clash detected! \${teacherName} is invigilating an exam (\${exam.subject}) on \${exam.date} at \${exam.time}.\`;
      }
    }
  }
  return null;
}`
);

// Replace checkExamConflict
content = content.replace(
/async function checkExamConflict[\s\S]*?return null;\n}/m,
`async function checkExamConflict(invigilators: any[], date: string, time: string, endTime: string | undefined, excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  const examDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  for (const inv of invigilators) {
    for (const entry of timetable) {
      if (entry.teacherName === inv.name && checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
        if (entry.days.includes(examDay) || entry.days.includes("Daily")) {
          return \`Clash detected! \${inv.name} is already teaching \${entry.subject} at \${entry.time} on \${examDay}s.\`;
        }
      }
    }
    for (const exam of exams) {
      if (excludeId && exam.id === excludeId) continue;
      if (exam.date === date && checkTimeOverlap(exam.time, exam.endTime, time, endTime) && exam.invigilators?.some((i: any) => i.name === inv.name)) {
        return \`Clash detected! \${inv.name} is already invigilating \${exam.subject} at this time.\`;
      }
    }
  }
  return null;
}`
);

// Update Timetable endpoints
content = content.replace(
  'const conflict = await checkConflict(teacherName, time, days || ["Daily"]);',
  'const conflict = await checkConflict(teacherName, time, req.body.endTime, days || ["Daily"]);'
);
content = content.replace(
  'const conflict = await checkConflict(updateData.teacherName, updateData.time, updateData.days || ["Daily"], id);',
  'const conflict = await checkConflict(updateData.teacherName, updateData.time, updateData.endTime, updateData.days || ["Daily"], id);'
);
content = content.replace(
  '     teacherEmail,\n     days: days || ["Daily"],\n     classId',
  '     teacherEmail,\n     days: days || ["Daily"],\n     classId,\n     endTime: req.body.endTime'
);

// Update Exams endpoints
content = content.replace(
  'const conflict = await checkExamConflict(invigilators || [], date, time);',
  'const conflict = await checkExamConflict(invigilators || [], date, time, req.body.endTime);'
);
content = content.replace(
  '{ subject, date, time, invigilators: invigilators || [] }',
  '{ subject, date, time, endTime: req.body.endTime, invigilators: invigilators || [] }'
);
content = content.replace(
  'const conflict = await checkExamConflict(updateData.invigilators || [], updateData.date, updateData.time, id);',
  'const conflict = await checkExamConflict(updateData.invigilators || [], updateData.date, updateData.time, updateData.endTime, id);'
);

// Cron job offset
content = content.replace(
  'const timetable = await getTimetable();',
  `const settings = await getSettings();
  const offset = settings.reminderOffset || 15;
  const timetable = await getTimetable();`
);

content = content.replace(
  /if \(entry\.time === currentTime/g,
  `const entryStart = parseTime(entry.time);
    const currentMins = parseTime(currentTime);
    if (entryStart - currentMins === offset`
);
content = content.replace(
  /if \(exam\.time === currentTime/g,
  `const examStart = parseTime(exam.time);
    const currentMins = parseTime(currentTime);
    if (examStart - currentMins === offset`
);

fs.writeFileSync('server.ts', content);
