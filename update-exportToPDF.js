import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Inside exportToPDF:
// We want to remove classExams logic.
// Find: const classExams = exams.filter(e => !selectedClassId || e.classId === selectedClassId);
// And replace all the dayExams logic in tableData generation.

content = content.replace(/const classExams = exams\.filter\(e => !selectedClassId \|\| e\.classId === selectedClassId\);\s*/, '');

content = content.replace(/const hasExams = classExams\.some[\s\S]*?\}\);/, 'const hasExams = false;');

content = content.replace(/classExams\.forEach\(e => allTimes\.add\(e\.time\)\);/, '');

// Inside the row data map:
content = content.replace(/const dayExams = classExams\.filter[\s\S]*?if \(!cellText\) \{/m, 'if (!cellText) {');

fs.writeFileSync('src/App.tsx', content);
