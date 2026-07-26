const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "const [authForm, setAuthForm] = useState({ username: '', password: '', code: '', newPassword: '' });",
  "const [authForm, setAuthForm] = useState({ username: '', password: '', code: '', newPassword: '', confirmPassword: '' });"
);

content = content.replace(
  "setAuthForm({ username: '', password: '', code: '', newPassword: '' });",
  "setAuthForm({ username: '', password: '', code: '', newPassword: '', confirmPassword: '' });"
);

fs.writeFileSync('src/App.tsx', content);
