import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove state
content = content.replace(
    /const \[isBroadcastModalOpen, setIsBroadcastModalOpen\] = useState\(false\);\n\s*const \[broadcastText, setBroadcastText\] = useState\(""\);\n\s*const \[isBroadcasting, setIsBroadcasting\] = useState\(false\);/,
    ''
);

// Remove handler
content = content.replace(
    /const handleBroadcast = async \(e: React\.FormEvent\) => \{[\s\S]*?\} finally \{[\s\S]*?\}\n\s*\};/g,
    ''
);

// Remove button
content = content.replace(
    /<div className="flex-1 flex flex-col">\n\s*<div className="p-4 border-b border-black\/5 dark:border-white\/5">\n\s*<button onClick=\{\(\) => setIsBroadcastModalOpen\(true\)\} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900\/30 dark:text-purple-300 font-medium hover:bg-purple-200 dark:hover:bg-purple-900\/50 transition-colors">\n\s*<Send size=\{18\} \/>\n\s*Broadcast Update to All Users\n\s*<\/button>\n\s*<\/div>/g,
    '<div className="flex-1 flex flex-col">'
);

// Remove modal
content = content.replace(
    /\{isBroadcastModalOpen && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)\}/g,
    ''
);

fs.writeFileSync('src/App.tsx', content);
