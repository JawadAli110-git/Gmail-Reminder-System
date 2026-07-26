import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. confirmDeletePaperType
content = content.replace(
  'if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);\\n    } catch (e)',
  'if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);\\n      await fetchExams();\\n    } catch (e)'
);

// 2. confirmDeleteClass
content = content.replace(
  'await fetchEntries();\\n      if (selectedClassId === id) setSelectedClassId(null);',
  'await fetchEntries();\\n      await fetchExams();\\n      if (selectedClassId === id) setSelectedClassId(null);'
);

// 3. confirmDeleteAllRecords
content = content.replace(
  'await fetchEntries();\\n      setDeleteConfirm(null);',
  'await fetchEntries();\\n      await fetchExams();\\n      setDeleteConfirm(null);'
);

// 4. confirmDeleteAllGlobalExams
content = content.replace(
  'await fetch(`/api/exams/all`, { method: "DELETE" });\\n      setDeleteConfirm(null);',
  'await fetch(`/api/exams/all`, { method: "DELETE" });\\n      await fetchExams();\\n      setDeleteConfirm(null);'
);

// 5. handleExamSubmit
content = content.replace(
  'showToast("Success", editingExamId ? "Paper updated successfully." : "Paper scheduled successfully.", "success");\\n      }',
  'showToast("Success", editingExamId ? "Paper updated successfully." : "Paper scheduled successfully.", "success");\\n        await fetchExams();\\n      }'
);

// 6. confirmDeleteExam
content = content.replace(
  'await fetch(`/api/exams/${id}`, { method: "DELETE" });\\n      setDeleteConfirm(null);',
  'await fetch(`/api/exams/${id}`, { method: "DELETE" });\\n      await fetchExams();\\n      setDeleteConfirm(null);'
);

fs.writeFileSync('src/App.tsx', content);
