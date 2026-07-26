const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            <div className="flex gap-2">
              <select
                value={firstReminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value), secondReminderOffset)}
                className="bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-full px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="1st Reminder Time"
              >
                <option value={60}>1h before</option>
                <option value={120}>2h before</option>
              </select>
              <select
                value={secondReminderOffset}
                onChange={(e) => updateSettings(firstReminderOffset, Number(e.target.value))}
                className="bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-full px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="2nd Reminder Time"
              >
                <option value={180}>3h before</option>
                <option value={240}>4h before</option>
                <option value={300}>5h before</option>
              </select>
            </div>`;

const replaceStr = `{isAdmin && (
            <div className="flex gap-2">
              <select
                value={firstReminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value), secondReminderOffset)}
                className="bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-full px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="1st Reminder Time"
              >
                <option value={60}>1h before</option>
                <option value={120}>2h before</option>
              </select>
              <select
                value={secondReminderOffset}
                onChange={(e) => updateSettings(firstReminderOffset, Number(e.target.value))}
                className="bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-full px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="2nd Reminder Time"
              >
                <option value={180}>3h before</option>
                <option value={240}>4h before</option>
                <option value={300}>5h before</option>
              </select>
            </div>
            )}`;
            
content = content.replace(targetStr, replaceStr);

// I noticed the first updateSettings parameter might have been broken in my earlier regex. 
// Let's make sure it handles both.
// Wait, the earlier sed showed: `onChange={(e) => updateSettings(Number(e.target.value))}`
// Let me verify the exact string.
