import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /required type="password"\n\s*value=\{authForm\.newPassword\}/g,
  'required type={showNewPassword ? "text" : "password"}\n                          value={authForm.newPassword}'
);

content = content.replace(
  'onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}\n                          className="w-full pl-11 pr-4 py-3',
  'onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}\n                          className="w-full pl-11 pr-11 py-3'
);

content = content.replace(
  /value=\{authForm\.newPassword\}[\s\S]*?placeholder="••••••••"\n\s*\/>\n\s*<\/div>/,
  `value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>`
);

content = content.replace(
  /required type="password"\n\s*value=\{authForm\.confirmPassword\}/g,
  'required type={showConfirmPassword ? "text" : "password"}\n                          value={authForm.confirmPassword}'
);

content = content.replace(
  'onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}\n                          className="w-full pl-11 pr-4 py-3',
  'onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}\n                          className="w-full pl-11 pr-11 py-3'
);

content = content.replace(
  /value=\{authForm\.confirmPassword\}[\s\S]*?placeholder="••••••••"\n\s*\/>\n\s*<\/div>/,
  `value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>`
);

fs.writeFileSync('src/App.tsx', content);
