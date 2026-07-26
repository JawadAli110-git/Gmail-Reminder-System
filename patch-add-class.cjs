const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const addClassStart = `            ) : (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsClassFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-blue-600/20 shrink-0 ml-auto md:ml-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Class</span>
              </button>
            )}`;

const newAddClassStart = `            ) : !selectedClassId && isAdmin ? (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsClassFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-blue-600/20 shrink-0 ml-auto md:ml-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Class</span>
              </button>
            ) : null}`;

content = content.replace(addClassStart, newAddClassStart);

fs.writeFileSync('src/App.tsx', content);
