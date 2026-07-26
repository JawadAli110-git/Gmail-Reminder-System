const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add isAdmin, searchQuery, isLoginOpen states
const stateInjection = `  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'error' | 'success'} | null>(null);`;
const newStateInjection = `  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'error' | 'success'} | null>(null);
  
  // Auth & User View States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '', code: '', newPassword: '' });
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);`;

content = content.replace(stateInjection, newStateInjection);

fs.writeFileSync('src/App.tsx', content);
