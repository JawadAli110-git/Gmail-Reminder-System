const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import React, \{ useState, useEffect \} from "react";/;
content = content.replace(importRegex, `import React, { useState, useEffect } from "react";\ninterface ConcurrentOption { day: string; time: string; endTime?: string; }`);

const stateInjection = `  const [exams, setExams] = useState<ExamEntry[]>([]);`;
const stateReplacement = `  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [concurrentOptions, setConcurrentOptions] = useState<ConcurrentOption[]>([]);
  const [showConcurrentPrompt, setShowConcurrentPrompt] = useState(false);
  const [showConcurrentForm, setShowConcurrentForm] = useState(false);
  const [concurrentFormData, setConcurrentFormData] = useState<Partial<TimetableEntry>>({});
  const [selectedConcurrentDay, setSelectedConcurrentDay] = useState<string>("");`;

content = content.replace(stateInjection, stateReplacement);

fs.writeFileSync('src/App.tsx', content);
