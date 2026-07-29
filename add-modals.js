import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const requestModals = `
        {isRequestsModalOpen && !isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRequestsModalOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg flex flex-col liquid-glass-heavy rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Send size={20} className="text-purple-500" />
                  Submit Request
                </h2>
                <button
                  type="button"
                  onClick={() => setIsRequestsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input type="text" required value={requestFormData.name} onChange={e => setRequestFormData({...requestFormData, name: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Email</label>
                  <input type="email" required value={requestFormData.email} onChange={e => setRequestFormData({...requestFormData, email: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="e.g. john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Request Type</label>
                  <select value={requestFormData.type} onChange={e => setRequestFormData({...requestFormData, type: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white">
                    <option value="Exchange Class">Exchange Class</option>
                    <option value="Cancel Class">Cancel Class</option>
                    <option value="Change Invigilation">Change Invigilation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea required rows={4} value={requestFormData.message} onChange={e => setRequestFormData({...requestFormData, message: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 resize-none" placeholder="Explain your request..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsRequestsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmittingRequest} className="px-6 py-2.5 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isRequestsModalOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRequestsModalOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col liquid-glass-heavy rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <MessageSquare size={20} className="text-purple-500" />
                  Requests Inbox
                </h2>
                <button
                  type="button"
                  onClick={() => setIsRequestsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-white/30 dark:bg-black/30">
                {teacherRequests.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <MessageSquare className="mx-auto mb-3 opacity-50" size={32} />
                    <p>No requests found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teacherRequests.map((req) => (
                      <div key={req.id} className="p-5 rounded-2xl bg-white/70 dark:bg-black/50 border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{req.type}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{req.name} &lt;{req.email}&gt;</p>
                          </div>
                          <span className={\`text-xs px-2.5 py-1 rounded-full font-medium \${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}\`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm bg-black/5 dark:bg-white/5 p-3 rounded-xl mb-4 text-slate-800 dark:text-slate-200">
                          {req.message}
                        </div>
                        
                        {req.status === 'pending' ? (
                          <div className="space-y-3">
                            <textarea 
                              placeholder="Type a custom reply (optional)..."
                              value={requestReplyData[req.id] || ''}
                              onChange={e => setRequestReplyData({...requestReplyData, [req.id]: e.target.value})}
                              className="w-full bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateRequestStatus(req.id, 'approved', requestReplyData[req.id] || '', req)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors flex-1 justify-center"><Check size={16}/> Approve</button>
                              <button onClick={() => handleUpdateRequestStatus(req.id, 'disapproved', requestReplyData[req.id] || '', req)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex-1 justify-center"><X size={16}/> Disapprove</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                            <div className="text-sm text-slate-500 italic flex-1">
                              {req.reply ? \`Admin Reply: \${req.reply}\` : 'No custom reply added.'}
                            </div>
                            <button onClick={() => handleDeleteRequest(req.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors ml-2" title="Delete Request"><Trash2 size={16} /></button>
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-3">{new Date(req.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
`;

content = content.replace(
  '{isLogsOpen && (',
  requestModals + '\n        {isLogsOpen && ('
);

fs.writeFileSync('src/App.tsx', content);
