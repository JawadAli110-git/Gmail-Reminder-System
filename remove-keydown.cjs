const fs = require('fs');

function removeKeydown(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Regex to remove the onKeyDown block
  // It looks like:
  // onKeyDown={e => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     handleSubmit(e as any);
  //   }
  // }}
  const regex = /\s*onKeyDown=\{e => \{\s*if \(e\.key === 'Enter'\) \{\s*e\.preventDefault\(\);\s*handle[a-zA-Z]+\(e as any\);\s*\}\s*\}\}/g;
  content = content.replace(regex, '');
  fs.writeFileSync(filePath, content);
}

removeKeydown('src/App.tsx');
removeKeydown('src/components/ExamForm.tsx');
