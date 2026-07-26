const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const modals = `
      {/* Concurrent Prompt Modal */}
      <AnimatePresence>
        {showConcurrentPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                 setShowConcurrentPrompt(false);
                 showToast("Success", "Schedule entry saved.", "success");
              }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Add another subject?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Do you want to add another subject class at the same time?
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowConcurrentPrompt(false);
                    showToast("Success", "Schedule entry saved.", "success");
                  }} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    setShowConcurrentPrompt(false);
                    setShowConcurrentForm(true);
                    setSelectedConcurrentDay(concurrentOptions[0].day);
                    setConcurrentFormData({});
                  }} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-blue-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform hover:bg-blue-700"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Concurrent Form Modal */}
      <AnimatePresence>
        {showConcurrentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                 setShowConcurrentForm(false);
                 showToast("Success", "Schedule entry saved.", "success");
              }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  Concurrent Class
                </h2>
              </div>

              <form onSubmit={handleConcurrentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Subject / Course</label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={concurrentFormData.subject || ""} onChange={e => setConcurrentFormData({...concurrentFormData, subject: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Day</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select 
                        required
                        value={selectedConcurrentDay} 
                        onChange={e => setSelectedConcurrentDay(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all appearance-none"
                      >
                        {concurrentOptions.map((opt, idx) => (
                           <option key={idx} value={opt.day}>{opt.day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        disabled
                        value={concurrentOptions.find(o => o.day === selectedConcurrentDay)?.time || ""}
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={concurrentFormData.teacherName || ""} onChange={e => setConcurrentFormData({...concurrentFormData, teacherName: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mr. Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="email"
                      value={concurrentFormData.teacherEmail || ""} onChange={e => setConcurrentFormData({...concurrentFormData, teacherEmail: e.target.value})}
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
                          value={concurrentFormData.taName || ""} onChange={e => setConcurrentFormData({...concurrentFormData, taName: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="e.g. Alex"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Email (Optional)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email"
                          value={concurrentFormData.taEmail || ""} onChange={e => setConcurrentFormData({...concurrentFormData, taEmail: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="ta@school.edu"
                        />
                      </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" disabled={isSubmittingEntry} onClick={() => {
                      setShowConcurrentForm(false);
                      showToast("Success", "Schedule entry saved.", "success");
                    }} 
                    className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingEntry} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingEntry && <Sparkles size={16} className="animate-pulse" />}
                    Add Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

content = content.replace("{/* Form Modal */}", modals + "\n      {/* Form Modal */}");
fs.writeFileSync('src/App.tsx', content);
