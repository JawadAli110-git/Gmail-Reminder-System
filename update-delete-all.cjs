const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[deleteConfirm, setDeleteConfirm\] = useState<\{type: 'class' \| 'entry' \| 'exam', id: string\} \| null>\(null\);/,
  `const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords', id: string} | null>(null);`
);

const oldDeleteConfirm = `  const confirmDeleteClass = async (id: string) => {
    try {
      await fetch(\`/api/classes/\${id}\`, { method: "DELETE" });
      await fetchClasses();
      await fetchEntries();
      if (selectedClassId === id) setSelectedClassId(null);
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };`;

const newDeleteConfirm = `  const confirmDeleteClass = async (id: string) => {
    try {
      await fetch(\`/api/classes/\${id}\`, { method: "DELETE" });
      await fetchClasses();
      await fetchEntries();
      if (selectedClassId === id) setSelectedClassId(null);
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };
  
  const confirmDeleteAllRecords = async (classId: string) => {
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

content = content.replace(oldDeleteConfirm, newDeleteConfirm);

const deleteConfirmModal = `                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'exam') confirmDeleteExam(deleteConfirm.id);
                    else confirmDelete(deleteConfirm.id);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Delete
                </button>`;

const newDeleteConfirmModal = `                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'exam') confirmDeleteExam(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allRecords') confirmDeleteAllRecords(deleteConfirm.id);
                    else confirmDelete(deleteConfirm.id);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Delete
                </button>`;

content = content.replace(deleteConfirmModal, newDeleteConfirmModal);

const deleteModalText = `                <h3 className="text-xl font-bold mb-2">Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : 'Entry'}</h3>
                <p className="text-slate-500 mb-6">Are you sure you want to delete this {deleteConfirm.type === 'class' ? 'class' : deleteConfirm.type === 'exam' ? 'exam' : 'entry'}? This action cannot be undone.</p>`;

const newDeleteModalText = `                <h3 className="text-xl font-bold mb-2">Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : deleteConfirm.type === 'allRecords' ? 'All Records' : 'Entry'}</h3>
                <p className="text-slate-500 mb-6">Are you sure you want to delete {deleteConfirm.type === 'allRecords' ? 'all records for this class' : \`this \${deleteConfirm.type === 'class' ? 'class' : deleteConfirm.type === 'exam' ? 'exam' : 'entry'}\`}? This action cannot be undone.</p>`;

content = content.replace(deleteModalText, newDeleteModalText);


const oldAddEntryBtn = `            {selectedClassId ? (
              <button
                onClick={() => {
                  triggerHaptic();
                  setEditingId(null);
                  setFormData({});
                  setAdditionalSessions([]);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0 ml-auto md:ml-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Entry</span>
              </button>
            ) : (`;

const newAddEntryBtn = `            {selectedClassId ? (
              <div className="flex gap-2 ml-auto md:ml-0">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setDeleteConfirm({ type: 'allRecords', id: selectedClassId });
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0"
                  title="Delete All Records"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic();
                    setEditingId(null);
                    setFormData({});
                    setAdditionalSessions([]);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Entry</span>
                </button>
              </div>
            ) : (`;

content = content.replace(oldAddEntryBtn, newAddEntryBtn);

fs.writeFileSync('src/App.tsx', content);
