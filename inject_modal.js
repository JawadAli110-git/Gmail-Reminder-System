import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `
        {/* Auth Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white flex flex-col"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                {authMode === 'login' ? <Lock size={32} /> : <KeyRound size={32} />}
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
                {authMode === 'login' ? 'Admin Login' : authMode === 'forgot' ? 'Reset Password' : 'New Password'}
              </h2>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">{authMode === 'login' ? 'Username / Email' : 'Email'}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      disabled={authMode === 'reset'}
                      value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={authMode === 'login' ? 'admin' : 'admin@example.com'}
                    />
                  </div>
                </div>

                {authMode === 'login' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        required type={showPassword ? "text" : "password"}
                        value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="text-right mt-2">
                      <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</button>
                    </div>
                  </div>
                )}

                {authMode === 'reset' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">6-Digit Code</label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="text"
                          value={authForm.code} onChange={e => setAuthForm({...authForm, code: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type={showNewPassword ? "text" : "password"}
                          value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type={showConfirmPassword ? "text" : "password"}
                          value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" disabled={isAuthenticating} onClick={() => {
                      if (authMode !== 'login') setAuthMode('login');
                      else setIsLoginOpen(false);
                    }} 
                    className="flex-1 py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-900 dark:text-slate-200 transition-colors"
                  >
                    {authMode !== 'login' ? 'Back' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={isAuthenticating} className="flex-1 py-3 rounded-2xl font-medium bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                    {isAuthenticating && <Sparkles size={16} className="animate-pulse" />}
                    {authMode === 'login' ? 'Login' : authMode === 'forgot' ? 'Send Code' : 'Reset'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

// Insert it right after:
//           </div>
//        </motion.div>
//      </div>
//    );
// }
// wait, the easiest is to find `</div>\n    );\n  }\n  return (`

content = content.replace(
    /(\s*<\/div>\s*<\/motion\.div>\s*)(<\/div>\s*\);\s*}\s*return \()/,
    `$1${replacement}$2`
);

fs.writeFileSync('src/App.tsx', content);
