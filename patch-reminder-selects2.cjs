const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            <div className="flex items-center gap-2 px-3 py-2.5 rounded-full liquid-glass shadow-sm shrink-0">
              <Clock size={16} className="text-slate-500" />
              <select
                value={reminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                title="2nd Reminder Time"
              >
                <option value={180}>3h before</option>
                <option value={240}>4h before</option>
                <option value={300}>5h before</option>
              </select>
            </div>`;

const replaceStr = `{isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-full liquid-glass shadow-sm shrink-0">
              <Clock size={16} className="text-slate-500" />
              <select
                value={reminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                title="2nd Reminder Time"
              >
                <option value={180}>3h before</option>
                <option value={240}>4h before</option>
                <option value={300}>5h before</option>
              </select>
            </div>
            )}`;
            
content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
