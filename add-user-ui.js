import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const userAuthFunctions = `
  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserAuthenticating(true);
    triggerHaptic();

    try {
      if (userAuthMode === 'register') {
        if (userAuthForm.password !== (userAuthForm as any).confirmPassword) {
            showToast("Error", "Passwords do not match", "error");
            triggerHapticError();
            setIsUserAuthenticating(false);
            return;
        }
        const res = await window.fetch('/api/users/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userAuthForm.name, email: userAuthForm.email, password: userAuthForm.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('userToken', data.token);
          setIsUser(true);
          showToast("Success", "Account created successfully", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "Registration failed", "error");
          triggerHapticError();
        }
      } else if (userAuthMode === 'login') {
        const res = await window.fetch('/api/users/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email, password: userAuthForm.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('userToken', data.token);
          setIsUser(true);
          showToast("Success", "Logged in successfully", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "Invalid credentials", "error");
          triggerHapticError();
        }
      } else if (userAuthMode === 'forgot') {
        const res = await window.fetch('/api/users/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email })
        });
        const data = await res.json();
        if (data.success) {
          setUserAuthMode('reset');
          showToast("Success", "Reset code sent to your email", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "User not found", "error");
          triggerHapticError();
        }
      } else if (userAuthMode === 'reset') {
        if (userAuthForm.newPassword !== (userAuthForm as any).confirmPassword) {
            showToast("Error", "Passwords do not match", "error");
            triggerHapticError();
            setIsUserAuthenticating(false);
            return;
        }
        const res = await window.fetch('/api/users/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email, code: userAuthForm.code.trim(), newPassword: userAuthForm.newPassword })
        });
        const data = await res.json();
        if (data.success) {
          setUserAuthMode('login');
          setUserAuthForm({ ...userAuthForm, password: '', code: '', newPassword: '' });
          showToast("Success", "Password reset successfully. You can now log in.", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "Invalid or expired code", "error");
          triggerHapticError();
        }
      }
    } catch (err) {
      showToast("Error", "Connection error", "error");
      triggerHapticError();
    } finally {
      setIsUserAuthenticating(false);
    }
  };
`;

content = content.replace(
  '  const toggleTheme = () => {',
  userAuthFunctions + '\n  const toggleTheme = () => {'
);


const returnStatementOld = `  return (
    <div className="min-h-screen relative pb-32`;

const fullScreenAuthUI = `
  if (!isAdmin && !isUser) {
    return (
      <div className={\`min-h-screen relative flex items-center justify-center p-6 transition-colors duration-500 \${isDark ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}\`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px]" />
        </div>
        
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              className={\`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border \${toastMessage.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-green-500/90 text-white border-green-400'}\`}
            >
              <span className="font-semibold">{toastMessage.title}:</span> {toastMessage.message}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={toggleTheme} className="absolute top-6 right-6 p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm z-50">
           {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md liquid-glass-heavy rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg text-white">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to Timetable</h1>
            <p className="text-slate-500 mt-2">
               {userAuthMode === 'login' ? 'Sign in to your account' : 
                userAuthMode === 'register' ? 'Create a new account' :
                userAuthMode === 'forgot' ? 'Reset your password' : 'Enter new password'}
            </p>
          </div>

          <form onSubmit={handleUserAuthSubmit} className="space-y-4">
            {userAuthMode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" required value={userAuthForm.name} onChange={e => setUserAuthForm({...userAuthForm, name: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="John Doe" />
              </div>
            )}
            
            {(userAuthMode === 'login' || userAuthMode === 'register' || userAuthMode === 'forgot' || userAuthMode === 'reset') && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required value={userAuthForm.email} onChange={e => setUserAuthForm({...userAuthForm, email: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="you@example.com" />
              </div>
            )}

            {userAuthMode === 'reset' && (
              <div>
                <label className="block text-sm font-medium mb-1">Reset Code</label>
                <input type="text" required value={userAuthForm.code} onChange={e => setUserAuthForm({...userAuthForm, code: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="6-digit code" />
              </div>
            )}

            {(userAuthMode === 'login' || userAuthMode === 'register') && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium">Password</label>
                  {userAuthMode === 'login' && (
                    <button type="button" onClick={() => setUserAuthMode('forgot')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={userAuthForm.password} onChange={e => setUserAuthForm({...userAuthForm, password: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            )}

            {(userAuthMode === 'register' || userAuthMode === 'reset') && (
               <>
                 {userAuthMode === 'reset' && (
                   <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} required value={userAuthForm.newPassword} onChange={e => setUserAuthForm({...userAuthForm, newPassword: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showNewPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                   </div>
                 )}
                 <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} required value={(userAuthForm as any).confirmPassword || ''} onChange={e => setUserAuthForm({...userAuthForm, confirmPassword: e.target.value} as any)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                 </div>
               </>
            )}

            <button type="submit" disabled={isUserAuthenticating} className="w-full py-3 mt-4 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isUserAuthenticating ? 'Please wait...' : 
               userAuthMode === 'login' ? 'Sign In' : 
               userAuthMode === 'register' ? 'Create Account' :
               userAuthMode === 'forgot' ? 'Send Reset Code' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {userAuthMode === 'login' ? (
              <p>Don't have an account? <button onClick={() => setUserAuthMode('register')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setUserAuthMode('login')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign in</button></p>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 text-center">
             <button onClick={() => setIsLoginOpen(true)} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-2 mx-auto">
                <Lock size={14}/> Admin Login
             </button>
          </div>
        </motion.div>

        {/* Existing Admin Login Modal */}
        <AnimatePresence>
          {isLoginOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoginOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl">
                 <h2 className="text-xl font-bold mb-4">Admin Access</h2>
                 <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Admin login inputs */}
                    {authMode === 'login' && (
                      <>
                        <input type="text" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="Username" />
                        <input type="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="Password" />
                      </>
                    )}
                    {authMode === 'forgot' && (
                        <input type="email" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="Admin Email" />
                    )}
                    {authMode === 'reset' && (
                       <>
                         <input type="text" required value={authForm.code} onChange={e => setAuthForm({...authForm, code: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="Reset Code" />
                         <input type="password" required value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="New Password" />
                       </>
                    )}
                    <button type="submit" disabled={isAuthenticating} className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium">
                       {isAuthenticating ? 'Wait...' : (authMode === 'login' ? 'Login' : authMode === 'forgot' ? 'Send Code' : 'Reset')}
                    </button>
                    {authMode === 'login' ? (
                       <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-blue-600 block text-center w-full mt-2">Forgot Password?</button>
                    ) : (
                       <button type="button" onClick={() => setAuthMode('login')} className="text-sm text-blue-600 block text-center w-full mt-2">Back to Login</button>
                    )}
                 </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-32`;

content = content.replace(returnStatementOld, fullScreenAuthUI);

fs.writeFileSync('src/App.tsx', content);
