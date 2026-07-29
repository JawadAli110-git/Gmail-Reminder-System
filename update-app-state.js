import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  'const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);',
  'const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);\n  const [isComposingRequest, setIsComposingRequest] = useState(false);'
);
fs.writeFileSync('src/App.tsx', content);
