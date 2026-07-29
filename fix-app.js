import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update state type for userAuthMode
content = content.replace(
    /const \[userAuthMode, setUserAuthMode\] = useState\<'login' \| 'register' \| 'forgot' \| 'reset'\>\('login'\);/g,
    `const [userAuthMode, setUserAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify-signup'>('login');`
);

// Add code to userAuthForm
content = content.replace(
    /const \[userAuthForm, setUserAuthForm\] = useState\(\{ name: '', email: '', password: '', confirmPassword: '', code: '' \}\);/g,
    `const [userAuthForm, setUserAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '', code: '' });`
);
if (!content.includes(`const [userAuthForm, setUserAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '', code: '' });`)) {
    content = content.replace(
        /const \[userAuthForm, setUserAuthForm\] = useState\(\{ name: '', email: '', password: '', confirmPassword: '' \}\);/g,
        `const [userAuthForm, setUserAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '', code: '' });`
    );
}

// Update handleUserAuthSubmit
const authSubmitRegex = /const handleUserAuthSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?body: JSON\.stringify\(\{ email: userAuthForm\.email, password: userAuthForm\.password \}\)[\s\S]*?\}\s*\}\s*catch[^\}]+\}[\s\S]*?\};/;

const newAuthSubmit = `const handleUserAuthSubmit = async (e: React.FormEvent) => {
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
        
        // Send verification code
        const res = await window.fetch('/api/users/send-verification', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast("Success", "Verification code sent to your email", "success");
            setUserAuthMode('verify-signup');
        } else {
            showToast("Error", data.error || "Failed to send code", "error");
            triggerHapticError();
        }
        
      } else if (userAuthMode === 'verify-signup') {
        
        // Verify code and register
        const res = await window.fetch('/api/users/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userAuthForm.name, email: userAuthForm.email, password: userAuthForm.password, code: userAuthForm.code })
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
          showToast("Error", data.error || "Login failed", "error");
          triggerHapticError();
        }
      }
    } catch (error) {
        showToast("Error", "Authentication error", "error");
        triggerHapticError();
    } finally {
        setIsUserAuthenticating(false);
    }
  };`;

content = content.replace(authSubmitRegex, newAuthSubmit);

// Update Auth Form UI to include 'verify-signup' mode inputs
const uiResetRegex = /\{userAuthMode === 'reset' && \([\s\S]*?<\/div>\s*\)\}/;
const newUiReset = `{userAuthMode === 'reset' && (
              <div>
                <label className="block text-sm font-medium mb-1">Reset Code</label>
                <input type="text" required value={userAuthForm.code} onChange={e => setUserAuthForm({...userAuthForm, code: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="6-digit code" />
              </div>
            )}
            
            {userAuthMode === 'verify-signup' && (
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input type="text" required value={userAuthForm.code} onChange={e => setUserAuthForm({...userAuthForm, code: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="Enter code from email" />
              </div>
            )}`;

content = content.replace(uiResetRegex, newUiReset);

// Hide name, email, pass in verify mode
content = content.replace(
    /\{\(userAuthMode === 'login' \|\| userAuthMode === 'register' \|\| userAuthMode === 'forgot' \|\| userAuthMode === 'reset'\) && \(/g,
    `{(userAuthMode === 'login' || userAuthMode === 'register' || userAuthMode === 'forgot' || userAuthMode === 'reset' || userAuthMode === 'verify-signup') && (`
);

content = content.replace(
    /\{\(userAuthMode === 'login' \|\| userAuthMode === 'register'\) && \(/g,
    `{(userAuthMode === 'login' || userAuthMode === 'register' || userAuthMode === 'verify-signup') && (`
);

// Disable name, email, pass in verify mode if we want, but simpler to just show them as read-only or leave as is. Actually, it's better to just hide them.
// Let's modify the UI directly for verify-signup
const uiEmailRegex = /\{\(userAuthMode === 'login' \|\| userAuthMode === 'register' \|\| userAuthMode === 'forgot' \|\| userAuthMode === 'reset' \|\| userAuthMode === 'verify-signup'\) && \(/g;
content = content.replace(uiEmailRegex, `{(userAuthMode === 'login' || userAuthMode === 'register' || userAuthMode === 'forgot' || userAuthMode === 'reset') && (`);

const uiPassRegex = /\{\(userAuthMode === 'login' \|\| userAuthMode === 'register' \|\| userAuthMode === 'verify-signup'\) && \(/g;
content = content.replace(uiPassRegex, `{(userAuthMode === 'login' || userAuthMode === 'register') && (`);

// And update the button text
const btnTextRegex = /\{userAuthMode === 'login' \? 'Sign In' : userAuthMode === 'register' \? 'Create Account' : userAuthMode === 'forgot' \? 'Send Link' : 'Reset Password'\}/;
const newBtnText = `{userAuthMode === 'login' ? 'Sign In' : userAuthMode === 'register' ? 'Create Account' : userAuthMode === 'verify-signup' ? 'Verify & Register' : userAuthMode === 'forgot' ? 'Send Link' : 'Reset Password'}`;
content = content.replace(btnTextRegex, newBtnText);

// Fix dropdown overlay
content = content.replace(
    /\{isAccountMenuOpen && \(\s*<div className="absolute right-0/g,
    `{isAccountMenuOpen && (
                  <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
                  <div className="absolute right-0`
);
content = content.replace(
    /<LogOut size=\{16\} \/>\s*Log Out\s*<\/button>\s*<\/div>\s*\)\}/g,
    `<LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                  </>
                )}`
);


fs.writeFileSync('src/App.tsx', content);
