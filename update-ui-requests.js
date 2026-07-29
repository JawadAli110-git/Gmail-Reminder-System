import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update fetch requests useEffect
const useEffectOld = `  useEffect(() => {
    if (isRequestsModalOpen && isAdmin) {
      fetchTeacherRequests();
    }
  }, [isRequestsModalOpen, isAdmin]);`;

const useEffectNew = `  useEffect(() => {
    if (isAdmin || isUser) {
      fetchTeacherRequests();
      // Poll every 30 seconds
      const interval = setInterval(fetchTeacherRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, isUser]);`;

content = content.replace(useEffectOld, useEffectNew);

// Update Request State
content = content.replace(
  "const [requestFormData, setRequestFormData] = useState({ name: '', email: '', type: 'Exchange Class', message: '' });",
  "const [requestFormData, setRequestFormData] = useState({ type: 'Exchange Class', message: '' });"
);

// Update handleRequestSubmit
const handleSubmitOld = `    if (!requestFormData.name || !requestFormData.email || !requestFormData.message) {
      showToast("Error", "Please fill all required fields.", "error");
      return;
    }`;
const handleSubmitNew = `    if (!requestFormData.message) {
      showToast("Error", "Message is required.", "error");
      return;
    }`;
content = content.replace(handleSubmitOld, handleSubmitNew);

const resetFormOld = `setRequestFormData({ name: '', email: '', type: 'Exchange Class', message: '' });`;
const resetFormNew = `setRequestFormData({ type: 'Exchange Class', message: '' });\n        fetchTeacherRequests();`;
content = content.replace(resetFormOld, resetFormNew);


// Update buttons in Header
const headerButtonsOldRegex = /\{!isAdmin && \(\s*<button\s*onClick=\{\(\) => setIsRequestsModalOpen\(true\)\}\s*className="flex items-center gap-2 px-4 py-2\.5 rounded-full font-medium bg-purple-100 dark:bg-purple-900\/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900\/50 transition-colors shadow-sm shrink-0"\s*title="Submit Request"\s*>\s*<Send size=\{18\} \/>\s*<span className="hidden sm:inline">Submit Request<\/span>\s*<\/button>\s*\)\}\s*\{isAdmin && <button\s*onClick=\{\(\) => \{\s*triggerHaptic\(\);\s*setIsRequestsModalOpen\(true\);\s*\}\}\s*className="p-3 rounded-full liquid-glass hover:bg-white\/80 dark:hover:bg-black\/60 transition-colors shadow-sm relative shrink-0"\s*title="Requests Inbox"\s*>\s*<MessageSquare size=\{20\} \/>\s*\{teacherRequests\.filter\(r => r\.status === 'pending'\)\.length > 0 && \(\s*<span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"><\/span>\s*\)\}\s*<\/button>\}/;

const headerButtonsNew = `
            {isUser && !isAdmin && (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsRequestsModalOpen(true);
                  teacherRequests.filter(r => r.readByUser === false).forEach(r => {
                     customFetch(\`/api/requests/\${r.id}/read\`, { method: "PUT" }).then(() => fetchTeacherRequests());
                  });
                }}
                className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
                title="My Requests"
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
                teacherRequests.filter(r => r.readByAdmin === false).forEach(r => {
                   customFetch(\`/api/requests/\${r.id}/read\`, { method: "PUT" }).then(() => fetchTeacherRequests());
                });
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
              title="Requests Inbox"
            >
              <MessageSquare size={20} />
              {teacherRequests.filter(r => r.status === 'pending' || r.readByAdmin === false).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white">
                  {teacherRequests.filter(r => r.status === 'pending' || r.readByAdmin === false).length}
                </span>
              )}
            </button>}`;

content = content.replace(headerButtonsOldRegex, headerButtonsNew);

fs.writeFileSync('src/App.tsx', content);
