const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="password"
                          value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>`;

const replaceStr = `                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="password"
                          value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="password"
                          value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>`;

content = content.replace(targetStr, replaceStr);

// Add validation to handleAuth
const handleAuthStart = `      } else if (authMode === 'reset') {`;
const handleAuthReplace = `      } else if (authMode === 'reset') {
        if (authForm.newPassword !== authForm.confirmPassword) {
          showToast("Error", "Passwords do not match.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }`;
content = content.replace(handleAuthStart, handleAuthReplace);

fs.writeFileSync('src/App.tsx', content);
