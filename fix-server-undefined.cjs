const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Fix timetable POST
content = content.replace(
  /const data: any = \{([^}]+)\};\s+if \(grade !== undefined\) \{\s+data\.grade = grade;\s+\}\s+await setDoc\(doc\(db, "timetable", newId\), data\);/,
  `const data: any = {$1};
  if (grade !== undefined) {
    data.grade = grade;
  }
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });
  await setDoc(doc(db, "timetable", newId), data);`
);

// Fix exams POST
content = content.replace(
  /const data = \{\s*subject,\s*date,\s*time,\s*endTime,\s*classId,\s*invigilators: invigilators \|\| \[\]\s*\};\s+await setDoc\(doc\(db, "exams", newId\), data\);/,
  `const data: any = {
    subject,
    date,
    time,
    endTime,
    classId,
    invigilators: invigilators || []
  };
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });
  await setDoc(doc(db, "exams", newId), data);`
);

fs.writeFileSync('server.ts', content);
