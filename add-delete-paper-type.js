import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const deleteStr = `
  const confirmDeletePaperType = async (id: string) => {
    try {
      await fetch(\`/api/paper-types/\${id}\`, { method: "DELETE" });
      setPaperTypes(prev => prev.filter(t => t.id !== id));
      if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);
    } catch (e) {
      console.error(e);
    }
    setDeleteConfirm(null);
  };
`;

content = content.replace('const confirmDeleteClass = async (id: string) => {', deleteStr + '\n  const confirmDeleteClass = async (id: string) => {');

content = content.replace('if (deleteConfirm.type === \'class\') confirmDeleteClass(deleteConfirm.id);', 
  "if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);\n                    else if (deleteConfirm.type === 'paperType') confirmDeletePaperType(deleteConfirm.id);");

fs.writeFileSync('src/App.tsx', content);
