const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            {!selectedClassId && (
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
            )}`;

const replaceStr = `            {!selectedClassId && isAdmin && (
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
            )}`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
