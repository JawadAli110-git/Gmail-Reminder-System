import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const stateRegex = /const \[isRequestsModalOpen, setIsRequestsModalOpen\] = useState\(false\);/;
content = content.replace(stateRegex, "const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);\n  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);");

const regex = /<div className="flex flex-wrap items-center gap-3 no-print w-full md:w-auto mt-4 md:mt-0">[\s\S]*?<\/button>\}/m;

const newHeader = `<div className="flex flex-wrap items-center gap-3 no-print w-full md:w-auto mt-4 md:mt-0">
            {selectedClassId && (
              <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export Class Timetable to PDF">
                <Printer size={20} />
              </button>
            )}
            {!selectedClassId && activeTab === 'papers' && selectedPaperTypeId && (
              <div className="flex gap-2">
                <button onClick={() => exportPaperScheduleToPDF(false)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Students (No Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Students</span>
                </button>
                <button onClick={() => exportPaperScheduleToPDF(true)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Teachers (With Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Teachers</span>
                </button>
              </div>
            )}
            
            {!selectedClassId && isAdmin && activeTab === 'papers' && selectedPaperTypeId && (
              <button 
                onClick={() => {
                  triggerHaptic();
                  setEditingExamId(null);
                  setIsExamFormOpen(true);
                }} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Add Paper</span>
              </button>
            )}
            
            {!selectedClassId && isAdmin && activeTab === 'papers' && !selectedPaperTypeId && (
              <button 
                onClick={() => {
                  triggerHaptic();
                  setIsPaperTypeFormOpen(true);
                }} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Add Type</span>
              </button>
            )}

            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="p-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors shadow-sm shrink-0"
                title="Install App"
              >
                <Download size={20} />
              </button>
            )}

            {isUser && !isAdmin && (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsRequestsModalOpen(true);
                }}
                className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
                title="Chat with Admin"
              >
                <MessageSquare size={20} />
                {teacherRequests.filter(r => r.readByUser === false).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white">
                    {teacherRequests.filter(r => r.readByUser === false).length}
                  </span>
                )}
              </button>
            )}
            {isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsRequestsModalOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
              title="User Chats"
            >
              <MessageSquare size={20} />
              {(() => {
                const unreadUsers = new Set(teacherRequests.filter(r => !r.readByAdmin).map(r => r.senderEmail));
                return unreadUsers.size > 0 ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadUsers.size}
                  </span>
                ) : null;
              })()}
            </button>}

            {(isAdmin || isUser) && (
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center"
                >
                  <User size={20} className="text-slate-700 dark:text-slate-300" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden z-50">
                    
                    <button
                      onClick={() => { toggleTheme(); setIsAccountMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {isAdmin && (
                      <div className="border-b border-t border-black/5 dark:border-white/10">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Admin Settings
                        </div>
                        <div className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-300">
                          <Clock size={16} />
                          <select
                            value={reminderOffset}
                            onChange={(e) => updateSettings(Number(e.target.value))}
                            className="bg-transparent font-medium focus:outline-none appearance-none cursor-pointer flex-1"
                          >
                            <option value={180}>3h before</option>
                            <option value={240}>4h before</option>
                            <option value={300}>5h before</option>
                          </select>
                        </div>
                        <button
                          onClick={() => { setIsLogsOpen(true); setIsAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Activity size={16} />
                          Email Logs
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsAdmin(false);
                        setIsUser(false);
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('userToken');
                        setIsAccountMenuOpen(false);
                        showToast("Success", "Logged out successfully", "success");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}`;
content = content.replace(regex, newHeader);
fs.writeFileSync('src/App.tsx', content);
