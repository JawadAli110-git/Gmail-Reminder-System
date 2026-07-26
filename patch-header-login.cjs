const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            <button
              onClick={toggleTheme}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>`;

const replaceStr = `            <button
              onClick={toggleTheme}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {!isAdmin && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors shadow-sm shrink-0"
                title="Admin Login"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
