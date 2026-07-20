const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import \{ ExamForm \} from "\.\/components\/ExamForm";/,
  `import { ExamForm } from "./components/ExamForm";\nimport { TimetablePreview } from "./components/TimetablePreview";`
);

fs.writeFileSync('src/App.tsx', content);
