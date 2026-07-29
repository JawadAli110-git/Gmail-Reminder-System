import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace states
content = content.replace(
    /const \[isComposingRequest, setIsComposingRequest\] = useState\(false\);\n  const \[requestFormData, setRequestFormData\] = useState\(\{ type: 'Exchange Class', message: '', email: '', name: '' \}\);\n  const \[requestReplyData, setRequestReplyData\] = useState<Record<string, string>>\(\{\}\);\n  const \[isSubmittingRequest, setIsSubmittingRequest\] = useState\(false\);/,
    `const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);`
);

// Replace types and names
content = content.replaceAll('TeacherRequest[]', 'ChatMessage[]');
content = content.replaceAll('setTeacherRequests', 'setMessages');
content = content.replaceAll('teacherRequests', 'messages');

// Replace fetchTeacherRequests with fetchMessages
content = content.replaceAll('fetchTeacherRequests', 'fetchMessages');
content = content.replace('const fetchMessages = async () => {', 'const fetchMessages = async () => {');
content = content.replaceAll('customFetch("/api/requests");', 'customFetch("/api/messages");');
content = content.replaceAll('setMessages(data);', 'setMessages(data);');

// Replace request handlers
content = content.replace(
    /const handleRequestSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?const handleDeleteRequest = async \(id: string\) => \{[\s\S]*?  \};/,
    `const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) {
      showToast("Error", "Message cannot be empty", "error");
      return;
    }
    
    setIsSendingMessage(true);
    triggerHaptic();

    try {
      const res = await customFetch('/api/messages', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: newMessageText, 
          receiverEmail: isAdmin ? selectedChatUser : 'admin' 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewMessageText("");
        fetchMessages();
      } else {
        showToast("Error", data.error || "Failed to send message.", "error");
      }
    } catch (err) {
      showToast("Error", "Failed to send message.", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };`
);

// Replace Chat Modal UI
const chatModalRegex = /\{isRequestsModalOpen && \([\s\S]*?\{isLogsOpen && \(/;

const newChatModal = `{isRequestsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsRequestsModalOpen(false); setSelectedChatUser(null); }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl h-[85vh] flex flex-col liquid-glass-heavy rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 shrink-0 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  {(isAdmin && selectedChatUser) ? (
                    <button onClick={() => setSelectedChatUser(null)} className="mr-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <span className="text-lg font-black">&larr;</span>
                    </button>
                  ) : (
                    <MessageSquare size={20} className="text-purple-500" />
                  )}
                  {isAdmin ? (selectedChatUser ? \`Chat with \${messages.find((m: any) => m.senderEmail === selectedChatUser)?.senderName || selectedChatUser}\` : "User Chats") : "Chat with Admin"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsRequestsModalOpen(false); setSelectedChatUser(null); }}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col bg-white/30 dark:bg-black/30">
                {isAdmin && !selectedChatUser ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {(() => {
                      const userEmails = Array.from(new Set(messages.map((m: any) => m.senderRole === 'user' ? m.senderEmail : m.receiverEmail).filter((e: any) => e !== 'admin')));
                      if (userEmails.length === 0) {
                        return (
                          <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                            <MessageSquare className="mb-3 opacity-50" size={32} />
                            <p>No chats found.</p>
                          </div>
                        );
                      }
                      return userEmails.map(email => {
                        const userMsgs = messages.filter((m: any) => m.senderEmail === email || m.receiverEmail === email);
                        const latestMsg = userMsgs[userMsgs.length - 1];
                        const unreadCount = userMsgs.filter((m: any) => m.senderEmail === email && !m.readByAdmin).length;
                        return (
                          <div 
                            key={email as string} 
                            onClick={() => {
                              setSelectedChatUser(email as string);
                              if (unreadCount > 0) {
                                customFetch('/api/messages/read', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otherUserEmail: email }) })
                                  .then(() => fetchMessages())
                                  .catch(console.error);
                              }
                            }}
                            className="p-4 rounded-2xl bg-white/50 dark:bg-black/50 hover:bg-white/80 dark:hover:bg-black/70 border border-black/5 dark:border-white/5 cursor-pointer transition-colors flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-lg">{latestMsg.senderRole === 'user' ? latestMsg.senderName : (messages.find((m: any) => m.senderEmail === email)?.senderName || email)}</div>
                              <div className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-md">{latestMsg.text}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-slate-400">{formatTimeAmPm(new Date(latestMsg.timestamp).toLocaleTimeString("en-US", {hour12: false}))}</span>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col">
                      {messages.filter((m: any) => isAdmin ? (m.senderEmail === selectedChatUser || m.receiverEmail === selectedChatUser) : true).length === 0 ? (
                         <div className="text-center py-10 text-slate-500 m-auto flex flex-col items-center">
                            <MessageSquare className="mb-3 opacity-50" size={32} />
                            <p>Send a message to start chatting.</p>
                            {!isAdmin && <p className="text-xs mt-2 opacity-70">Daily limit: 15 messages.</p>}
                          </div>
                      ) : (
                        messages.filter((m: any) => isAdmin ? (m.senderEmail === selectedChatUser || m.receiverEmail === selectedChatUser) : true).map((msg: any) => {
                          const isMine = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'user';
                          return (
                            <div key={msg.id} className={\`flex \${isMine ? 'justify-end' : 'justify-start'}\`}>
                              <div className={\`max-w-[80%] rounded-2xl p-3 sm:p-4 \${isMine ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm border border-black/5 dark:border-white/5'}\`}>
                                <div className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                <div className={\`text-[10px] mt-1.5 flex items-center justify-end gap-1 \${isMine ? 'text-purple-200' : 'text-slate-400'}\`}>
                                  {formatTimeAmPm(new Date(msg.timestamp).toLocaleTimeString("en-US", {hour12: false}))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-black/50 border-t border-black/5 dark:border-white/5 shrink-0">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full px-5 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                          disabled={isSendingMessage}
                        />
                        <button
                          type="submit"
                          disabled={!newMessageText.trim() || isSendingMessage}
                          className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Send size={20} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isLogsOpen && (`

content = content.replace(chatModalRegex, newChatModal);

fs.writeFileSync('src/App.tsx', content);
