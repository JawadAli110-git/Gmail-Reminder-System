import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const aboutModal = `
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAboutModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Info size={20} className="text-purple-500" />
                  About the App
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {appInfo ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-2xl">
                        A
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Acadamus</h3>
                        <p className="text-slate-500 dark:text-slate-400">Version {appInfo.version}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2">What's New</h4>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {appInfo.changelog}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2">App Purpose</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {appInfo.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
  /\{isRequestsModalOpen && \(/,
  aboutModal + '\n        {isRequestsModalOpen && ('
);

fs.writeFileSync('src/App.tsx', content);
