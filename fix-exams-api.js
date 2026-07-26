import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'const { id, subject, date, time, classId, invigilators } = req.body;',
  'const { id, subject, date, time, classId, invigilators, paperTypeId } = req.body;'
);

content = content.replace(
  'await setDoc(doc(db, "exams", newId), { subject, date, time, endTime: req.body.endTime, classId, invigilators: invigilators || [] });',
  'await setDoc(doc(db, "exams", newId), { subject, date, time, endTime: req.body.endTime, classId, paperTypeId: paperTypeId || null, invigilators: invigilators || [] });'
);

fs.writeFileSync('server.ts', content);
