import fs from 'fs';
let content = fs.readFileSync('src/components/ExamForm.tsx', 'utf-8');

content = content.replace(
  'const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    onSubmit(formData);\n  };',
  `const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!formData.invigilators || formData.invigilators.length === 0) {\n      alert("Please add at least one invigilator.");\n      return;\n    }\n    onSubmit(formData);\n  };`
);

fs.writeFileSync('src/components/ExamForm.tsx', content);
