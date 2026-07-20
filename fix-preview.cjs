const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

const newStr = `            ) : (
              <>
                <div className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Timetable Preview</h3>
                  <TimetablePreview 
                    classEntries={entries.filter(e => e.classId === selectedClassId)}
                    classExams={exams.filter(e => !selectedClassId || e.classId === selectedClassId)}
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">All Entries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/App.tsx', content);
