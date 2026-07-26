import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'await fetchEntries();\\n      if (selectedClassId === id) setSelectedClassId(null);',
  'await fetchEntries();\\n      await fetchExams();\\n      if (selectedClassId === id) setSelectedClassId(null);'
);

fs.writeFileSync('src/App.tsx', content);
