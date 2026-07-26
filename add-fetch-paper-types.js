import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const fetchString = `
  const fetchPaperTypes = async () => {
    try {
      const res = await fetch("/api/paper-types");
      const data = await res.json();
      setPaperTypes(data);
    } catch (e) {
      console.error(e);
    }
  };
`;

content = content.replace('const fetchExams = async () => {', fetchString + '\n  const fetchExams = async () => {');
content = content.replace('fetchExams();', 'fetchExams();\n    fetchPaperTypes();');
fs.writeFileSync('src/App.tsx', content);
