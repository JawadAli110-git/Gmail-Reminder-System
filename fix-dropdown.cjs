const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldDropdown = `<select
                value={reminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                title="Reminder Time"
              >
                <option value={5}>5m before</option>
                <option value={10}>10m before</option>
                <option value={15}>15m before</option>
                <option value={30}>30m before</option>
                <option value={60}>1h before</option>
              </select>`;

const newDropdown = `<select
                value={reminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                title="2nd Reminder Time"
              >
                <option value={180}>3h before</option>
                <option value={240}>4h before</option>
                <option value={300}>5h before</option>
              </select>`;

content = content.replace(oldDropdown, newDropdown);
fs.writeFileSync('src/App.tsx', content);
