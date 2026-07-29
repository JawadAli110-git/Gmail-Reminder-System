import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const modalStr = `
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBroadcastModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Send size={20} className="text-purple-500" />
                  Broadcast Update
                </h2>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Message content</label>
                    <textarea
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      placeholder="Type the update message to send to all users..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      disabled={isBroadcasting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!broadcastText.trim() || isBroadcasting}
                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isBroadcasting ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                       <>
                         <Send size={18} />
                         Send Broadcast
                       </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
    /\{isRequestsModalOpen && \(/,
    modalStr + '\n        {isRequestsModalOpen && ('
);

fs.writeFileSync('src/App.tsx', content);
