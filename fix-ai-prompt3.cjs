const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/\$\{JSON\.stringify\(currentTimetable, null, 2\)\}/g, '${JSON.stringify(formattedTimetable, null, 2)}');
content = content.replace(/\$\{JSON\.stringify\(currentExams, null, 2\)\}/g, '${JSON.stringify(formattedExams, null, 2)}');

fs.writeFileSync('server.ts', content);
