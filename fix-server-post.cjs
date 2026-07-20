const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const data: any = \{ \n    teacherName, \n    subject, \n    time,\n    endTime: req\.body\.endTime,\n    teacherEmail, \n    days: days \|\| \["Daily"\], \n    classId \n  \};/,
  `const data: any = { 
    teacherName, 
    subject, 
    time,
    endTime: req.body.endTime,
    teacherEmail, 
    days: days || ["Daily"], 
    classId,
    taName: req.body.taName,
    taEmail: req.body.taEmail
  };`
);

fs.writeFileSync('server.ts', content);
