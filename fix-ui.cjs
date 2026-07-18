const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const formatTimeAmPmGlobal = `
export const formatTimeAmPm = (time24?: string) => {
  if (!time24) return "";
  const match = time24.match(/^(\\d{1,2}):(\\d{2})/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return \`\${h}:\${m} \${ampm}\`;
};
`;

content = content.replace('import { ExamForm } from "./components/ExamForm";', 'import { ExamForm } from "./components/ExamForm";\n' + formatTimeAmPmGlobal);

// Remove the local formatTimeAmPm from exportToPDF
content = content.replace(/const formatTimeAmPm = \(time24: string\) => \{[\s\S]*?return `\$\{hours\}:\$\{m\} \$\{ampm\}`;[\s\S]*?\};\n/, '');

// Apply to Timetable entry UI
content = content.replace(/\{entry\.time\}\{entry\.endTime \? \` - \$\{entry\.endTime\}\` : ''\}/g, '{formatTimeAmPm(entry.time)}{entry.endTime ? ` - ${formatTimeAmPm(entry.endTime)}` : \'\'}');

// Apply to Exam UI
content = content.replace(/\{exam\.time\}\{exam\.endTime \? \` - \$\{exam\.endTime\}\` : ''\}/g, '{formatTimeAmPm(exam.time)}{exam.endTime ? ` - ${formatTimeAmPm(exam.endTime)}` : \'\'}');
// There are some hardcoded {exam.time} that aren't handling endTime
content = content.replace(/>\{exam\.time\}</g, '>{formatTimeAmPm(exam.time)}{exam.endTime ? ` - ${formatTimeAmPm(exam.endTime)}` : \'\'}<');

// Wait, the exam time inside PDF is already using formatTimeAmPm(time) for the whole row.
// Let's write the updated App.tsx
fs.writeFileSync('src/App.tsx', content);
