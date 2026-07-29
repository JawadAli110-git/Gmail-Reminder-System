import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  /MessageSquare, Send, Check, X \} from "lucide-react";/,
  'MessageSquare, Send, Check, X, Info } from "lucide-react";'
);
fs.writeFileSync('src/App.tsx', content);
