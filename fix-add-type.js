import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'triggerHaptic();\n                  const typeName = prompt("Enter new Paper Type (e.g. Mids, Finals):");\n                  if (typeName && typeName.trim()) {\n                    handleAddPaperType(typeName.trim());\n                  }',
  'triggerHaptic();\n                  setIsPaperTypeFormOpen(true);'
);

fs.writeFileSync('src/App.tsx', content);
