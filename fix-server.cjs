const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const formatHelper = `
function formatTimeAmPm(time24) {
  if (!time24) return "";
  const match = time24.match(/^(\\d{1,2}):(\\d{2})/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return \`\${h}:\${m} \${ampm}\`;
}
`;

content = content.replace('function parseTime(timeStr) {', formatHelper + '\nfunction parseTime(timeStr) {');

content = content.replace(
  'text: \`Dear ${entry.teacherName},\\n\\nThis is an automated reminder that your class for ${entry.subject} is starting now (${entry.time}).\\n\\nBest regards,\\nAdmin System\`,',
  'text: \`Dear ${entry.teacherName},\\n\\nThis is an automated reminder that your class for ${entry.subject} is starting at ${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,'
);

content = content.replace(
  'text: \`Dear ${invigilator.name},\\n\\nThis is an automated reminder that you have an invigilation duty for ${exam.subject} starting now (${exam.time}).\\n\\nBest regards,\\nAdmin System\`,',
  'text: \`Dear ${invigilator.name},\\n\\nThis is an automated reminder that you have an invigilation duty for ${exam.subject} starting at ${formatTimeAmPm(exam.time)}.\\n\\nBest regards,\\nAdmin System\`,'
);

fs.writeFileSync('server.ts', content);
