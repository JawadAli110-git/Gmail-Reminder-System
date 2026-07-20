const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `<div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="email"
                      value={formData.teacherEmail || ""} onChange={e => setFormData({...formData, teacherEmail: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="teacher@school.edu"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Name (Optional)</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text"
                          value={formData.taName || ""} onChange={e => setFormData({...formData, taName: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Email (Optional)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email"
                          value={formData.taEmail || ""} onChange={e => setFormData({...formData, taEmail: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="ta@school.edu"
                        />
                      </div>
                    </div>
                </div>`;

content = content.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Email<\/label>\s*<div className="relative">\s*<Mail size=\{16\} className="absolute left-4 top-1\/2 -translate-y-1\/2 text-slate-500" \/>\s*<input \s*required type="email"\s*value=\{formData\.teacherEmail \|\| ""\} onChange=\{e => setFormData\(\{\.\.\.formData, teacherEmail: e\.target\.value\}\)\}\s*className="w-full pl-11 pr-4 py-2\.5 md:py-3 rounded-2xl bg-white\/90 dark:bg-black\/50 border border-black\/10 dark:border-white\/10 focus:outline-none focus:ring-2 focus:ring-blue-500\/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"\s*placeholder="teacher@school\.edu"\s*\/>\s*<\/div>\s*<\/div>/g,
  replacement
);

fs.writeFileSync('src/App.tsx', content);
