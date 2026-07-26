import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const paperTypeString = `
  const handleAddPaperType = async (name: string) => {
    try {
      const res = await fetch("/api/paper-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchPaperTypes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePaperTypeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setDeleteConfirm({ type: 'paperType', id });
  };
`;

content = content.replace('const handleDeleteClassClick = (id: string, e: React.MouseEvent) => {', paperTypeString + '\n  const handleDeleteClassClick = (id: string, e: React.MouseEvent) => {');
fs.writeFileSync('src/App.tsx', content);
