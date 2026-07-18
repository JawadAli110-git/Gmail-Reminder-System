const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// PDF table cell time logic
content = content.replace(
  /let timeText = formatTimeAmPm\(time\);\n\s+if \(endTimeStr\) \{\n\s+timeText \+= \` - \\n\$\{formatTimeAmPm\(endTimeStr\)\}\`;\n\s+\}/,
  `let timeText = formatTimeAmPm(time);`
);

// UI Exams block time logic
content = content.replace(
  /\{formatTimeAmPm\(exam\.time\)\}\{exam\.endTime \? \` - \$\{formatTimeAmPm\(exam\.endTime\)\}\` : ''\}/g,
  `{formatTimeAmPm(exam.time)}`
);

// UI Entries block time logic
content = content.replace(
  /\{formatTimeAmPm\(entry\.time\)\}\{entry\.endTime \? \` - \$\{formatTimeAmPm\(entry\.endTime\)\}\` : ''\}/g,
  `{formatTimeAmPm(entry.time)}`
);

fs.writeFileSync('src/App.tsx', content);
