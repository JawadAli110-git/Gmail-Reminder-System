const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                          <button 
                            onClick={(e) => handleDeleteClassClick(c.id, e)} 
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>`;

const replaceStr = `                          {isAdmin && <button 
                            onClick={(e) => handleDeleteClassClick(c.id, e)} 
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>}`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
