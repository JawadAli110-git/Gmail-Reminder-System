const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[reminderOffset, setReminderOffset\] = useState<number>\(15\);/,
  `const [reminderOffset, setReminderOffset] = useState<number>(180);`
);

fs.writeFileSync('src/App.tsx', content);
