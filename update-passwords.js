import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /required type="password"\s*value=\{authForm\.password\}/g,
  'required type={showPassword ? "text" : "password"}\n                        value={authForm.password}'
);

content = content.replace(
  'onChange={e => setAuthForm({...authForm, password: e.target.value})}\n                        className="w-full pl-11 pr-4 py-3',
  'onChange={e => setAuthForm({...authForm, password: e.target.value})}\n                        className="w-full pl-11 pr-11 py-3'
);

content = content.replace(
  /placeholder="••••••••"\n\s*\/>\n\s*<\/div>/,
  'placeholder="••••••••"\n                      />\n                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">\n                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}\n                      </button>\n                    </div>'
);

fs.writeFileSync('src/App.tsx', content);
