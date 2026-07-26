import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'import { TimetableEntry, SchoolClass, EmailLog, ExamEntry } from "./types";',
  'import { TimetableEntry, SchoolClass, EmailLog, ExamEntry, PaperType } from "./types";'
);

fs.writeFileSync('src/App.tsx', content);
