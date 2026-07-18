const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newHeaderRight = `
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 no-print w-full md:w-auto mt-4 md:mt-0">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {selectedClassId && (
                <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export to PDF">
                  <Printer size={20} />
                </button>
              )}
              
              {!selectedClassId && (
                <button 
                  onClick={() => {
                    triggerHaptic();
                    setIsExamFormOpen(true);
                  }} 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">Add Paper</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-2.5 rounded-full liquid-glass shadow-sm">
                <Clock size={16} className="text-slate-500" />
                <select
                  value={reminderOffset}
                  onChange={(e) => updateSettings(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                  title="Reminder Time"
                >
                  <option value={5}>5m before</option>
                  <option value={10}>10m before</option>
                  <option value={15}>15m before</option>
                  <option value={30}>30m before</option>
                  <option value={60}>1h before</option>
                </select>
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsLogsOpen(true);
                }}
                className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm"
                title="Email Logs"
              >
                <Activity size={20} />
              </button>
            </div>

            {selectedClassId ? (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0"
              >
                <Plus size={18} />
                <span>Add Timetable Entry</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsClassFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-blue-600/20 shrink-0"
              >
                <Plus size={18} />
                <span>Add Class</span>
              </button>
            )}
          </div>
`;

const regex = /<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">[\s\S]*?<\/button>\s*?\)\}\s*?<\/div>/;
content = content.replace(regex, newHeaderRight.trim());

fs.writeFileSync('src/App.tsx', content);
