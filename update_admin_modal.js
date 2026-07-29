import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex1 = /\{\/\* Existing Admin Login Modal \*\/\}\s*<AnimatePresence>[\s\S]*?<\/AnimatePresence>/;
const regex2 = /\{\/\* Auth Modal \*\/\}\s*<AnimatePresence>[\s\S]*?<\/AnimatePresence>\s*/;

const match2 = content.match(regex2);
if (match2) {
    const authModalContent = match2[0];
    
    // Replace the old admin modal with the beautiful one
    content = content.replace(regex1, authModalContent);
    
    // Remove the beautiful one from its original place
    content = content.replace(regex2, '');
    
    fs.writeFileSync('src/App.tsx', content);
    console.log('Successfully updated the admin modal!');
} else {
    console.log('Could not find Auth Modal (regex2)');
}
