const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const formFieldStr = `                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Username / Email</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="admin"
                    />
                  </div>
                </div>`;

const newFormFieldStr = `                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">{authMode === 'login' ? 'Username / Email' : 'Email'}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder={authMode === 'login' ? 'admin' : 'admin@example.com'}
                    />
                  </div>
                </div>`;

content = content.replace(formFieldStr, newFormFieldStr);
fs.writeFileSync('src/App.tsx', content);
