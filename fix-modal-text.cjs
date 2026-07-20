const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldModalText = `<h2 className="text-xl font-bold tracking-tight mb-2">
                Delete {deleteConfirm.type === 'class' ? 'Class' : 'Entry'}?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {deleteConfirm.type === 'class' 
                  ? "Are you sure you want to delete this class? All of its schedule entries will also be permanently deleted."
                  : "Are you sure you want to delete this scheduled class entry?"}
              </p>`;

const newModalText = `<h2 className="text-xl font-bold tracking-tight mb-2">
                Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : deleteConfirm.type === 'allRecords' ? 'All Records' : 'Entry'}?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {deleteConfirm.type === 'class' 
                  ? "Are you sure you want to delete this class? All of its schedule entries will also be permanently deleted."
                  : deleteConfirm.type === 'exam' ? "Are you sure you want to delete this exam?" 
                  : deleteConfirm.type === 'allRecords' ? "Are you sure you want to delete all scheduled entries and exams for this class? This action cannot be undone."
                  : "Are you sure you want to delete this scheduled class entry?"}
              </p>`;

content = content.replace(oldModalText, newModalText);
fs.writeFileSync('src/App.tsx', content);
