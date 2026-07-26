import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords' | 'allGlobalExams', id: string} | null>(null);",
  "const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords' | 'allGlobalExams' | 'paperType', id: string} | null>(null);"
);

fs.writeFileSync('src/App.tsx', content);
