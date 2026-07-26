const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                  <AnimatePresence>
                    {classesList.filter(cls => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      if (cls.name.toLowerCase().includes(q)) return true;
                      const classEntries = entries.filter(e => e.classId === cls.id);
                      return classEntries.some(e => 
                        e.subject.toLowerCase().includes(q) || 
                        e.teacherName.toLowerCase().includes(q) ||
                        (e.taName && e.taName.toLowerCase().includes(q))
                      );
                    }).map((c, idx) => (`;

const replaceStr = `                  <AnimatePresence>
                    {classesList.filter(cls => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      if (cls.name.toLowerCase().includes(q)) return true;
                      const classEntries = entries.filter(e => e.classId === cls.id);
                      return classEntries.some(e => 
                        e.subject.toLowerCase().includes(q) || 
                        e.teacherName.toLowerCase().includes(q) ||
                        (e.taName && e.taName.toLowerCase().includes(q))
                      );
                    }).length === 0 && searchQuery ? (
                      <div className="col-span-full text-center py-12 text-slate-500">
                        <Search className="mx-auto mb-3 opacity-50" size={32} />
                        <p className="text-lg">No classes found matching "{searchQuery}"</p>
                      </div>
                    ) : classesList.filter(cls => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      if (cls.name.toLowerCase().includes(q)) return true;
                      const classEntries = entries.filter(e => e.classId === cls.id);
                      return classEntries.some(e => 
                        e.subject.toLowerCase().includes(q) || 
                        e.teacherName.toLowerCase().includes(q) ||
                        (e.taName && e.taName.toLowerCase().includes(q))
                      );
                    }).map((c, idx) => (`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
