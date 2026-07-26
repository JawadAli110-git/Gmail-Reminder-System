const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<aside className={\`fixed inset-y-0 left-0 z-40 w-72 lg:w-80 liquid-glass-heavy border-r border-slate-200/50 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0\`}>`;
const endTarget = `          </div>
        </div>
      </aside>`;

// We will find the whole aside block
const startIndex = content.indexOf('<aside className={`fixed inset-y-0 left-0 z-40 w-72 lg:w-80');
const endIndex = content.indexOf('</aside>', startIndex) + 8;
const asideBlock = content.substring(startIndex, endIndex);

let newAsideBlock = asideBlock;

// Hide the "Add Class" button in User mode
newAsideBlock = newAsideBlock.replace(
  '<button onClick={() => setIsClassFormOpen(true)} className="p-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-transform shadow-md">',
  '{isAdmin && <button onClick={() => setIsClassFormOpen(true)} className="p-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-transform shadow-md">'
);
newAsideBlock = newAsideBlock.replace(
  '<Plus size={20} />\n            </button>',
  '<Plus size={20} />\n            </button>}'
);

// Add search bar
const searchBarHtml = `
          <div className="px-4 pb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search classes, subjects, teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-black/30 border-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
          </div>
`;

newAsideBlock = newAsideBlock.replace(
  '<div className="flex items-center justify-between p-6">',
  searchBarHtml + '\n          <div className="flex items-center justify-between p-6 pt-2">'
);

// Filtering logic for the list of classes
// Instead of {classes.map((cls) => (
// We need to filter it. We can do it inline or create a variable. Inline is easier.
const mapTarget = '{classes.map((cls) => (';
const newMapTarget = `{classes.filter(cls => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            if (cls.name.toLowerCase().includes(q)) return true;
            // Check timetable entries for this class
            const classEntries = entries.filter(e => e.classId === cls.id);
            return classEntries.some(e => 
              e.subject.toLowerCase().includes(q) || 
              e.teacherName.toLowerCase().includes(q) ||
              (e.taName && e.taName.toLowerCase().includes(q))
            );
          }).map((cls) => (`;

newAsideBlock = newAsideBlock.replace(mapTarget, newMapTarget);

// Hide delete class button in User mode
newAsideBlock = newAsideBlock.replace(
  '<button onClick={(e) => handleDeleteClassClick(cls.id, e)}',
  '{isAdmin && <button onClick={(e) => handleDeleteClassClick(cls.id, e)}'
);
newAsideBlock = newAsideBlock.replace(
  'title="Delete Class"\n                    >\n                      <Trash2 size={16} />\n                    </button>',
  'title="Delete Class"\n                    >\n                      <Trash2 size={16} />\n                    </button>}'
);

// Add Admin Login button at the bottom of the sidebar if !isAdmin
const bottomNavTarget = `        <div className="p-4 border-t border-slate-200/50 dark:border-white/10">`;
const newBottomNavTarget = `        <div className="p-4 border-t border-slate-200/50 dark:border-white/10 space-y-2">
          {!isAdmin ? (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <LogIn size={18} />
              <span>Admin Login</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsAdmin(false);
                showToast("Success", "Logged out successfully", "success");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <LogIn size={18} />
              <span>Logout</span>
            </button>
          )}
          {isAdmin && (
`;

newAsideBlock = newAsideBlock.replace(bottomNavTarget, newBottomNavTarget);

// Close the conditional rendering for isAdmin
const endOfBottomNavTarget = `            </button>
          </div>
        </div>
      </aside>`;
const newEndOfBottomNavTarget = `            </button>
          </div>
          )}
        </div>
      </aside>`;

newAsideBlock = newAsideBlock.replace(endOfBottomNavTarget, newEndOfBottomNavTarget);

content = content.replace(asideBlock, newAsideBlock);

fs.writeFileSync('src/App.tsx', content);
