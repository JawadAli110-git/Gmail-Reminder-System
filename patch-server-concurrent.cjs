const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /async function checkConflict\(teacherName: string, time: string, endTime: string \| undefined, days: string\[\], classId: string, excludeId\?: string\) \{/,
  'async function checkConflict(teacherName: string, time: string, endTime: string | undefined, days: string[], classId: string, excludeId?: string, allowConcurrent?: boolean) {'
);

content = content.replace(
  /if \(entry.classId === classId\) \{\n\s*return \`Clash detected! This class already has \$\{entry.subject\} scheduled at this time.\`;\n\s*\}/,
  `if (!allowConcurrent && entry.classId === classId) {
        return \`Clash detected! This class already has \${entry.subject} scheduled at this time.\`;
      }`
);

content = content.replace(
  /const conflict = await checkConflict\(teacherName, time, req\.body\.endTime, days \|\| \["Daily"\], classId\);/,
  'const conflict = await checkConflict(teacherName, time, req.body.endTime, days || ["Daily"], classId, undefined, req.body.allowConcurrent);'
);

content = content.replace(
  /const conflict = await checkConflict\(updateData\.teacherName, updateData\.time, updateData\.endTime, updateData\.days \|\| \["Daily"\], updateData\.classId, id\);/,
  'const conflict = await checkConflict(updateData.teacherName, updateData.time, updateData.endTime, updateData.days || ["Daily"], updateData.classId, id, updateData.allowConcurrent);'
);

fs.writeFileSync('server.ts', content);
