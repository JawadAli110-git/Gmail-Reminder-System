import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /<\/div>\n\s*return userEmails\.map/g,
    `return userEmails.map`
);

content = content.replace(
    /\{\(\(\) => \{\n\s*const userEmails =/g,
    `{(() => {
                      const userEmails =`
);

content = content.replace(
    /return userEmails\.map\(email => \{/g,
    `return userEmails.map(email => {`
);

// I need to find the end of the IIFE `})()}` and add a `</div>` after it, to close `<div className="flex-1 flex flex-col">`.
content = content.replace(
    /\{\(\(\) => \{[\s\S]*?\}\)\(\)\}\n\s*<\/div>/g,
    (match) => match + '\n                  </div>'
);

fs.writeFileSync('src/App.tsx', content);
