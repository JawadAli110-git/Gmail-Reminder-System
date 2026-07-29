import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = "{/* Auth Modal */}";
const lastIndex = content.lastIndexOf(target);

if (lastIndex !== -1) {
    const endTag = "</AnimatePresence>";
    const endIndex = content.indexOf(endTag, lastIndex);
    if (endIndex !== -1) {
        const fullEndIndex = endIndex + endTag.length;
        content = content.substring(0, lastIndex).trimEnd() + content.substring(fullEndIndex);
        fs.writeFileSync('src/App.tsx', content);
        console.log("Successfully removed the second Auth Modal.");
    }
}
