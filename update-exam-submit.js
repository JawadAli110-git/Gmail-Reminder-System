import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'const handleExamSubmit = async (data: Partial<ExamEntry>) => {',
  'const handleExamSubmit = async (data: Partial<ExamEntry>) => {\n    if (selectedPaperTypeId && !data.classId) data.paperTypeId = selectedPaperTypeId;'
);

fs.writeFileSync('src/App.tsx', content);
