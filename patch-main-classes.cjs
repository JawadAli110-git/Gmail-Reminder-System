const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            {!selectedClassId ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {classesList.map((c, idx) => (`;

const replaceStr = `            {!selectedClassId ? (
              <>
                <div className="mb-8">
                  <div className="relative max-w-2xl mx-auto">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search for a class, subject, or teacher to view its schedule..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-500 shadow-sm text-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
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

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
