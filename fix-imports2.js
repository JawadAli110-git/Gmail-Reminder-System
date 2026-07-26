import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'import type { TimetableEntry, EmailLog, SchoolClass, ExamEntry } from "./types";',
  'import type { TimetableEntry, EmailLog, SchoolClass, ExamEntry, PaperType } from "./types";'
);

fs.writeFileSync('src/App.tsx', content);
