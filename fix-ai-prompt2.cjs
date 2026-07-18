const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('Current Scheduled Classes Timetable:\\n${JSON.stringify(currentTimetable, null, 2)}', 'Current Scheduled Classes Timetable:\\n${JSON.stringify(formattedTimetable, null, 2)}');
content = content.replace('Current Scheduled Exams / Papers:\\n${JSON.stringify(currentExams, null, 2)}', 'Current Scheduled Exams / Papers:\\n${JSON.stringify(formattedExams, null, 2)}');

fs.writeFileSync('server.ts', content);
