import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const requestBtns = `
            {!isAdmin && (
              <button
                onClick={() => setIsRequestsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors shadow-sm shrink-0"
                title="Submit Request"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Submit Request</span>
              </button>
            )}
            {isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsRequestsModalOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
              title="Requests Inbox"
            >
              <MessageSquare size={20} />
              {teacherRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
              )}
            </button>}
`;

content = content.replace(
  '{isAdmin && <button\n              onClick={() => {\n                triggerHaptic();\n                setIsLogsOpen(true);\n              }}',
  requestBtns + '{isAdmin && <button\n              onClick={() => {\n                triggerHaptic();\n                setIsLogsOpen(true);\n              }}'
);

fs.writeFileSync('src/App.tsx', content);
