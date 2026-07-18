const fs = require('fs');

// Fix ExamForm
let examFormContent = fs.readFileSync('src/components/ExamForm.tsx', 'utf8');
examFormContent = examFormContent.replace(/<input\s*\n\s*required type="time"\s*\n\s*value=\{formData.endTime/g, '<input type="time"\n                      value={formData.endTime');
fs.writeFileSync('src/components/ExamForm.tsx', examFormContent);

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/<input\s*\n\s*required type="time"\s*\n\s*value=\{formData.endTime/g, '<input type="time"\n                          value={formData.endTime');
fs.writeFileSync('src/App.tsx', appContent);
