const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const rowData: any\[\] = \[\{ content: formatTimeAmPm\(time\), styles: \{ cellWidth: 28 \} \}\];/;
const replacement = `
        let endTimeStr = "";
        const entryWithTime = classEntries.find(e => e.time === time && e.endTime);
        const examWithTime = classExams.find(e => e.time === time && e.endTime);
        if (entryWithTime?.endTime) endTimeStr = entryWithTime.endTime;
        else if (examWithTime?.endTime) endTimeStr = examWithTime.endTime;
        
        let timeText = formatTimeAmPm(time);
        if (endTimeStr) {
           timeText += \` - \\n\${formatTimeAmPm(endTimeStr)}\`;
        }
        const rowData: any[] = [{ content: timeText, styles: { cellWidth: 28 } }];
`;

content = content.replace(regex, replacement.trim());
fs.writeFileSync('src/App.tsx', content);
