const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const handleConcurrentSubmit = async`;
const insertion = `  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    triggerHaptic();
    
    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, password: authForm.password })
        });
        const data = await res.json();
        if (data.success) {
          setIsAdmin(true);
          setIsLoginOpen(false);
          setAuthForm({ username: '', password: '', code: '', newPassword: '' });
          showToast("Success", "Logged in successfully.", "success");
        } else {
          showToast("Error", data.error || "Invalid credentials", "error");
          triggerHapticError();
        }
      } else if (authMode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username })
        });
        const data = await res.json();
        if (data.success) {
          setAuthMode('reset');
          showToast("Success", "Reset code sent to email.", "success");
        } else {
          showToast("Error", data.error || "User not found", "error");
          triggerHapticError();
        }
      } else if (authMode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, code: authForm.code, newPassword: authForm.newPassword })
        });
        const data = await res.json();
        if (data.success) {
          setAuthMode('login');
          showToast("Success", "Password reset successfully. Please login.", "success");
        } else {
          showToast("Error", data.error || "Invalid code", "error");
          triggerHapticError();
        }
      }
    } catch (err) {
      triggerHapticError();
      showToast("Error", "Network error occurred.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConcurrentSubmit = async`;

content = content.replace(targetStr, insertion);

fs.writeFileSync('src/App.tsx', content);
