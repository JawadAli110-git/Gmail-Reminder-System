import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. confirmDeletePaperType
content = content.replace(
  /if \(selectedPaperTypeId === id\) setSelectedPaperTypeId\(null\);\s*\} catch \(e\)/g,
  'if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);\n      await fetchExams();\n    } catch (e)'
);

// 2. confirmDeleteClass
content = content.replace(
  /await fetchEntries\(\);\s*if \(selectedClassId === id\) setSelectedClassId\(null\);/g,
  'await fetchEntries();\n      await fetchExams();\n      if (selectedClassId === id) setSelectedClassId(null);'
);

// 3. confirmDeleteAllRecords
content = content.replace(
  /await fetchEntries\(\);\s*setDeleteConfirm\(null\);\s*showToast\("Success", "All records deleted for this class.", "success"\);/g,
  'await fetchEntries();\n      await fetchExams();\n      setDeleteConfirm(null);\n      showToast("Success", "All records deleted for this class.", "success");'
);

// 4. confirmDeleteAllGlobalExams
content = content.replace(
  /await fetch\(`\/api\/exams\/all`, \{ method: "DELETE" \}\);\s*setDeleteConfirm\(null\);/g,
  'await fetch(`/api/exams/all`, { method: "DELETE" });\n      await fetchExams();\n      setDeleteConfirm(null);'
);

// 5. handleExamSubmit
content = content.replace(
  /showToast\("Success", editingExamId \? "Paper updated successfully\." : "Paper scheduled successfully\.", "success"\);\s*\}/g,
  'showToast("Success", editingExamId ? "Paper updated successfully." : "Paper scheduled successfully.", "success");\n        await fetchExams();\n      }'
);

// 6. confirmDeleteExam
content = content.replace(
  /await fetch\(`\/api\/exams\/\$\{id\}`\, \{ method: "DELETE" \}\);\s*setDeleteConfirm\(null\);/g,
  'await fetch(`/api/exams/${id}`, { method: "DELETE" });\n      await fetchExams();\n      setDeleteConfirm(null);'
);

fs.writeFileSync('src/App.tsx', content);
