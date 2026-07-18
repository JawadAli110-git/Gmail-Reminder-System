const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const transformLogic = `
    const formattedTimetable = currentTimetable.map(item => ({
      ...item,
      time: formatTimeAmPm(item.time),
      endTime: item.endTime ? formatTimeAmPm(item.endTime) : undefined
    }));
    
    const formattedExams = currentExams.map(item => ({
      ...item,
      time: formatTimeAmPm(item.time),
      endTime: item.endTime ? formatTimeAmPm(item.endTime) : undefined
    }));

    const chat = ai.chats.create({
`;

content = content.replace('const chat = ai.chats.create({', transformLogic);
content = content.replace('Current Scheduled Classes Timetable:\\n${JSON.stringify(currentTimetable, null, 2)}', 'Current Scheduled Classes Timetable:\\n${JSON.stringify(formattedTimetable, null, 2)}');
content = content.replace('Current Scheduled Exams / Papers:\\n${JSON.stringify(currentExams, null, 2)}', 'Current Scheduled Exams / Papers:\\n${JSON.stringify(formattedExams, null, 2)}');
content = content.replace('You answer queries based on the scheduled classes and exams. Be concise and professional.', 'You answer queries based on the scheduled classes and exams. Always format times using AM/PM formatting. Be concise and professional.');

fs.writeFileSync('server.ts', content);
