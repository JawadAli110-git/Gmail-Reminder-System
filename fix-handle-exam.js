import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'const res = await fetch("/api/exams", {\n        method: "POST",',
  'const res = await fetch(editingExamId ? `/api/exams/${editingExamId}` : "/api/exams", {\n        method: editingExamId ? "PUT" : "POST",'
);

fs.writeFileSync('src/App.tsx', content);
