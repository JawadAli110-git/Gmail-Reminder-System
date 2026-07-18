const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix "Add Entry" button
content = content.replace(
  /onClick=\{\(\) => \{\n\s*triggerHaptic\(\);\n\s*setIsFormOpen\(true\);\n\s*\}\}/,
  `onClick={() => {
                  triggerHaptic();
                  setEditingId(null);
                  setFormData({});
                  setIsFormOpen(true);
                }}`
);

// Fix "Add Paper" button
content = content.replace(
  /onClick=\{\(\) => \{\n\s*triggerHaptic\(\);\n\s*setIsExamFormOpen\(true\);\n\s*\}\}/,
  `onClick={() => {
                  triggerHaptic();
                  setEditingExamId(null);
                  setIsExamFormOpen(true);
                }}`
);

// Fix Exam Form missing setEditingExamId(null) inside onSubmit success
content = content.replace(
  /setIsExamFormOpen\(false\);\n\s*setEditingExamId\(null\);/,
  `setIsExamFormOpen(false);
        setEditingExamId(null);` // It already has it but let's make sure
);

// We need to check if there are multiple occurrences.
fs.writeFileSync('src/App.tsx', content);
