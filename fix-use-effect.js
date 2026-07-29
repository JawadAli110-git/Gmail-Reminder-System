import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /if \(userToken\) setIsUser\(true\);\n    else \n    fetchEntries\(\);\n    fetchClasses\(\);\n    fetchExams\(\);\n    fetchPaperTypes\(\);\n    fetchSettings\(\);/,
    `if (userToken) setIsUser(true);
    else setIsUser(false);
    
    fetchEntries();
    fetchClasses();
    fetchExams();
    fetchPaperTypes();
    fetchSettings();`
);

fs.writeFileSync('src/App.tsx', content);
