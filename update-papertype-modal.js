import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const modalStr = `
      {/* Paper Type Form Modal */}
      <AnimatePresence>
        {isPaperTypeFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPaperTypeFormOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  New Paper Type
                </h2>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (paperTypeFormData.name.trim()) {
                  await handleAddPaperType(paperTypeFormData.name.trim());
                  setIsPaperTypeFormOpen(false);
                  setPaperTypeFormData({ name: "" });
                }
              }} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Type Name</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={paperTypeFormData.name} onChange={e => setPaperTypeFormData({ name: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mids, Finals"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsPaperTypeFormOpen(false)} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-red-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

content = content.replace('</AnimatePresence>\n\n      {/* Delete Confirmation Modal', '</AnimatePresence>\n' + modalStr + '\n      {/* Delete Confirmation Modal');
fs.writeFileSync('src/App.tsx', content);
