const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Hide All Entries
const allEntriesStart = `<h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">All Entries</h3>`;
const newAllEntriesStart = `{isAdmin && <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">All Entries</h3>}`;
content = content.replace(allEntriesStart, newAllEntriesStart);

const allEntriesGridStart = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {entries.filter(e => e.classId === selectedClassId).map((entry, idx) => (`;
const newAllEntriesGridStart = `{isAdmin && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {entries.filter(e => e.classId === selectedClassId).map((entry, idx) => (`;
content = content.replace(allEntriesGridStart, newAllEntriesGridStart);

const allEntriesGridEnd = `                    ))}
                  </AnimatePresence>
                </div>`;
const newAllEntriesGridEnd = `                    ))}
                  </AnimatePresence>
                </div>}`;
content = content.replace(allEntriesGridEnd, newAllEntriesGridEnd);

const emptyEntriesStart = `{entries.filter(e => e.classId === selectedClassId).length === 0 && (`;
const newEmptyEntriesStart = `{isAdmin && entries.filter(e => e.classId === selectedClassId).length === 0 && (`;
content = content.replace(emptyEntriesStart, newEmptyEntriesStart);

// Hide Global Exams
const globalExamsStart = `{/* Global Exams Section */}
                {exams.length > 0 && (`;
const newGlobalExamsStart = `{/* Global Exams Section */}
                {isAdmin && exams.length > 0 && (`;
content = content.replace(globalExamsStart, newGlobalExamsStart);

fs.writeFileSync('src/App.tsx', content);
