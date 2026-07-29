import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add user auth state
content = content.replace(
  'const [isAdmin, setIsAdmin] = useState(false);',
  'const [isAdmin, setIsAdmin] = useState(false);\n  const [isUser, setIsUser] = useState(false);\n  const [userAuthMode, setUserAuthMode] = useState<"login" | "register" | "forgot" | "reset">("login");\n  const [userAuthForm, setUserAuthForm] = useState({ name: "", email: "", password: "", code: "", newPassword: "" });\n  const [isUserAuthenticating, setIsUserAuthenticating] = useState(false);'
);

// Add user check to useEffect
content = content.replace(
  'const token = localStorage.getItem("adminToken");\n    if (token) {\n      setIsAdmin(true);\n    } else {\n      setIsAdmin(false);\n    }',
  'const adminToken = localStorage.getItem("adminToken");\n    if (adminToken) setIsAdmin(true);\n    else setIsAdmin(false);\n    \n    const userToken = localStorage.getItem("userToken");\n    if (userToken) setIsUser(true);\n    else setIsUser(false);'
);

// Make customFetch use userToken if adminToken is not present
const customFetchOld = `const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }`;

const customFetchNew = `const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }`;

content = content.replace(customFetchOld, customFetchNew);

fs.writeFileSync('src/App.tsx', content);
