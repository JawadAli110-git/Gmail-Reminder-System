import fs from 'fs';
let content = fs.readFileSync('src/components/TimetablePreview.tsx', 'utf-8');

// Remove classExams from props
content = content.replace(/,\s*classExams\s*:\s*ExamEntry\[\]/g, '');
content = content.replace(/,\s*classExams/g, '');
content = content.replace(/import type \{ TimetableEntry, ExamEntry \} from '\.\.\/types';/, "import type { TimetableEntry } from '../types';");

// Remove exam logic
content = content.replace(/const hasExams = classExams\.some\([\s\S]*?\}\);/g, '');
content = content.replace(/&& !hasExams/g, '');
content = content.replace(/classExams\.forEach\(e => allTimes\.add\(e\.time\)\);/g, '');

const examLogicRegex = /const dayExams = classExams\.filter\([\s\S]*?if \(!cellText\) \{/;
content = content.replace(examLogicRegex, 'if (!cellText) {');

fs.writeFileSync('src/components/TimetablePreview.tsx', content);
