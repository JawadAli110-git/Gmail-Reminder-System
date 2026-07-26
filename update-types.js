import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace('export interface ExamEntry {', 'export interface PaperType { id: string; name: string; }\n\nexport interface ExamEntry {');
content = content.replace('classId?: string;', 'classId?: string;\n  paperTypeId?: string;');
fs.writeFileSync('src/types.ts', content);
