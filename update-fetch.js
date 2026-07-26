import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace fetch( with customFetch(
content = content.replace(/fetch\(/g, 'customFetch(');

// define customFetch near the top
const fetchDef = `
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  const response = await window.fetch(input, { ...init, headers });
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.reload();
  }
  return response;
};
`;

content = content.replace('export default function App() {', fetchDef + '\nexport default function App() {');

fs.writeFileSync('src/App.tsx', content);
