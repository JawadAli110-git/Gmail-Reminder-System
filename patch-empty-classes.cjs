const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const emptyClassesStart = `                {classesList.length === 0 && (
                  <div className="py-20 text-center text-slate-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="text-slate-400" size={24} />
                    </div>
                    <p>No classes available. Create your first class.</p>
                  </div>
                )}`;

const newEmptyClassesStart = `                {classesList.length === 0 && (
                  <div className="py-20 text-center text-slate-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="text-slate-400" size={24} />
                    </div>
                    <p>{isAdmin ? "No classes available. Create your first class." : "No classes have been published yet."}</p>
                  </div>
                )}`;

content = content.replace(emptyClassesStart, newEmptyClassesStart);

fs.writeFileSync('src/App.tsx', content);
