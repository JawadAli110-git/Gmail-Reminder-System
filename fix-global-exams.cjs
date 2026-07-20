const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldGlobalExams = `<div className="flex items-center gap-3 mb-8">
                      <FileText className="text-red-500" size={24} />
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Scheduled Papers</h2>
                    </div>`;

const newGlobalExams = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-3">
                        <FileText className="text-red-500" size={24} />
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Scheduled Papers</h2>
                      </div>
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setDeleteConfirm({ type: 'allGlobalExams', id: 'global' });
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg w-fit"
                        title="Delete All Scheduled Papers"
                      >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    </div>`;

content = content.replace(oldGlobalExams, newGlobalExams);
fs.writeFileSync('src/App.tsx', content);
