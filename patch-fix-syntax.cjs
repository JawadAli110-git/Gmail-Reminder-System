const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the class list
content = content.replace(
`                  </AnimatePresence>
                </div>}
                {classesList.length === 0 && (`,
`                  </AnimatePresence>
                </div>
                {classesList.length === 0 && (`
);

// Fix the "All Entries" grid
const allEntriesStart = `{isAdmin && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {entries.filter(e => e.classId === selectedClassId).map((entry, idx) => (`;

const allEntriesEndRegex = /<h3 className="text-xl font-bold mb-1 line-clamp-1">\{entry\.subject\}<\/h3>([\s\S]*?)<\/motion\.div>\n                    \)\)}\n                  <\/AnimatePresence>\n                <\/div>/;

const match = content.match(allEntriesEndRegex);
if (match) {
  content = content.replace(match[0], match[0] + "}");
}

fs.writeFileSync('src/App.tsx', content);
