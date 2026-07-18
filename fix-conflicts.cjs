const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace checkConflict
content = content.replace(
  /async function checkConflict\([\s\S]*?return null;\n\}/m,
  `async function checkConflict(teacherName: string, time: string, endTime: string | undefined, days: string[], classId: string, excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  
  for (const entry of timetable) {
    if (excludeId && entry.id === excludeId) continue;
    
    const hasOverlap = entry.days.some((d: string) => days.includes(d) || d === "Daily" || days.includes("Daily"));
    if (hasOverlap && checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
      if (entry.classId === classId) {
        return \`Clash detected! This class already has \${entry.subject} scheduled at this time.\`;
      }
      if (entry.teacherName === teacherName) {
        return \`Clash detected! \${teacherName} is already teaching \${entry.subject} at \${entry.time}.\`;
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
           return \`Clash detected! This class already has an exam (\${exam.subject}) scheduled at this time.\`;
        }
        if (exam.invigilators?.some((i: any) => i.name === teacherName)) {
          return \`Clash detected! \${teacherName} is invigilating an exam (\${exam.subject}) on \${exam.date} at \${exam.time}.\`;
        }
      }
    }
  }
  return null;
}`
);

// Replace checkExamConflict
content = content.replace(
  /async function checkExamConflict\([\s\S]*?return null;\n\}/m,
  `async function checkExamConflict(invigilators: any[], date: string, time: string, endTime: string | undefined, classId: string, excludeId?: string) {
  const timetable = await getTimetable();
  const exams = await getExams();
  const examDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  for (const entry of timetable) {
    if (checkTimeOverlap(entry.time, entry.endTime, time, endTime)) {
      if (entry.days.includes(examDay) || entry.days.includes("Daily")) {
        if (entry.classId === classId) {
          return \`Clash detected! This class already has \${entry.subject} scheduled at this time.\`;
        }
        for (const inv of invigilators) {
          if (entry.teacherName === inv.name) {
            return \`Clash detected! \${inv.name} is already teaching \${entry.subject} at \${entry.time} on \${examDay}s.\`;
          }
        }
      }
    }
  }
  
  for (const exam of exams) {
    if (excludeId && exam.id === excludeId) continue;
    if (exam.date === date && checkTimeOverlap(exam.time, exam.endTime, time, endTime)) {
      if (exam.classId === classId) {
         return \`Clash detected! This class already has an exam (\${exam.subject}) scheduled at this time.\`;
      }
      for (const inv of invigilators) {
        if (exam.invigilators?.some((i: any) => i.name === inv.name)) {
          return \`Clash detected! \${inv.name} is already invigilating \${exam.subject} at this time.\`;
        }
      }
    }
  }
  return null;
}`
);

// Fix app.post("/api/timetable"
content = content.replace(
  /const conflict = await checkConflict\(teacherName, time, req\.body\.endTime, days \|\| \["Daily"\]\);/g,
  `const conflict = await checkConflict(teacherName, time, req.body.endTime, days || ["Daily"], classId);`
);

// Fix app.put("/api/timetable/:id"
content = content.replace(
  /const conflict = await checkConflict\(updateData\.teacherName, updateData\.time, updateData\.endTime, updateData\.days \|\| \["Daily"\], id\);/g,
  `const conflict = await checkConflict(updateData.teacherName, updateData.time, updateData.endTime, updateData.days || ["Daily"], updateData.classId, id);`
);

// Fix app.post("/api/exams"
content = content.replace(
  /const conflict = await checkExamConflict\(invigilators \|\| \[\], date, time, req\.body\.endTime\);/g,
  `const conflict = await checkExamConflict(invigilators || [], date, time, req.body.endTime, classId);`
);

// Fix app.put("/api/exams/:id"
content = content.replace(
  /const conflict = await checkExamConflict\(updateData\.invigilators \|\| \[\], updateData\.date, updateData\.time, updateData\.endTime, id\);/g,
  `const conflict = await checkExamConflict(updateData.invigilators || [], updateData.date, updateData.time, updateData.endTime, updateData.classId, id);`
);

fs.writeFileSync('server.ts', content);
