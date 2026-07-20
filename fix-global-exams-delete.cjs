const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldType = `const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords', id: string} | null>(null);`;
const newType = `const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords' | 'allGlobalExams', id: string} | null>(null);`;
content = content.replace(oldType, newType);

const oldFunc = `  const confirmDeleteAllRecords = async (classId: string) => {
    try {
      await fetch(\`/api/classes/\${classId}/records\`, { method: "DELETE" });
      await fetchEntries();
      await fetchExams();
      setDeleteConfirm(null);
      showToast("Success", "All records deleted for this class.", "success");
    } catch (err) {
      triggerHapticError();
    }
  };`;

const newFunc = `  const confirmDeleteAllRecords = async (classId: string) => {
    try {
      await fetch(\`/api/classes/\${classId}/records\`, { method: "DELETE" });
      await fetchEntries();
      await fetchExams();
      setDeleteConfirm(null);
      showToast("Success", "All records deleted for this class.", "success");
    } catch (err) {
      triggerHapticError();
    }
  };
  
  const confirmDeleteAllGlobalExams = async () => {
    try {
      await fetch(\`/api/exams/all\`, { method: "DELETE" });
      await fetchExams();
      setDeleteConfirm(null);
      showToast("Success", "All scheduled papers deleted.", "success");
    } catch (err) {
      triggerHapticError();
    }
  };`;
content = content.replace(oldFunc, newFunc);

const oldModalCond = `                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allRecords') confirmDeleteAllRecords(deleteConfirm.id);
                    else confirmDeleteExam(deleteConfirm.id);`;

const newModalCond = `                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allRecords') confirmDeleteAllRecords(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allGlobalExams') confirmDeleteAllGlobalExams();
                    else confirmDeleteExam(deleteConfirm.id);`;

content = content.replace(oldModalCond, newModalCond);

const oldModalText = `Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : deleteConfirm.type === 'allRecords' ? 'All Records' : 'Entry'}?`;
const newModalText = `Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : deleteConfirm.type === 'allRecords' ? 'All Records' : deleteConfirm.type === 'allGlobalExams' ? 'All Papers' : 'Entry'}?`;

content = content.replace(oldModalText, newModalText);

const oldModalText2 = `? "Are you sure you want to delete all scheduled entries and exams for this class? This action cannot be undone."
                  : "Are you sure you want to delete this scheduled class entry?"}`;

const newModalText2 = `? "Are you sure you want to delete all scheduled entries and exams for this class? This action cannot be undone."
                  : deleteConfirm.type === 'allGlobalExams' ? "Are you sure you want to delete all scheduled papers? This action cannot be undone."
                  : "Are you sure you want to delete this scheduled class entry?"}`;

content = content.replace(oldModalText2, newModalText2);

fs.writeFileSync('src/App.tsx', content);
