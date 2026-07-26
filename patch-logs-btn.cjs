const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            <button
              onClick={() => {
                triggerHaptic();
                setIsLogsOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Email Logs"
            >
              <Activity size={20} />
            </button>`;

const replacementStr = `{isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsLogsOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Email Logs"
            >
              <Activity size={20} />
            </button>}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', content);
