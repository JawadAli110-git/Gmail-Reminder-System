import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'if (exam.classId === classId) {\n         return `Clash detected! This class already has an exam (${exam.subject}) scheduled at this time.`;\n      }',
  'if (classId && exam.classId === classId) {\n         return `Clash detected! This class already has an exam (${exam.subject}) scheduled at this time.`;\n      }'
);

content = content.replace(
  'if (entry.classId === classId) {\n          return `Clash detected! This class already has ${entry.subject} scheduled at this time.`;\n        }',
  'if (classId && entry.classId === classId) {\n          return `Clash detected! This class already has ${entry.subject} scheduled at this time.`;\n        }'
);

fs.writeFileSync('server.ts', content);
