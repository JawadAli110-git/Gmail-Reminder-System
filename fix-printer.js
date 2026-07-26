import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldButton = `{selectedClassId && (
              <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export to PDF">
                <Printer size={20} />
              </button>
            )}`;

const newButtons = `{selectedClassId && (
              <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export Class Timetable to PDF">
                <Printer size={20} />
              </button>
            )}
            {!selectedClassId && activeTab === 'papers' && selectedPaperTypeId && (
              <button onClick={exportPaperScheduleToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export Paper Schedule to PDF">
                <Printer size={20} />
              </button>
            )}`;

content = content.replace(oldButton, newButtons);
fs.writeFileSync('src/App.tsx', content);
