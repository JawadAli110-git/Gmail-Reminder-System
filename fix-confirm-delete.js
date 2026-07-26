import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);',
  'if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);\n      await fetchExams();'
);

fs.writeFileSync('src/App.tsx', content);
