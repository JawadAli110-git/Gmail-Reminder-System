const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldModal = `                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
                    else confirmDeleteExam(deleteConfirm.id);
                  }} `;

const newModal = `                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allRecords') confirmDeleteAllRecords(deleteConfirm.id);
                    else confirmDeleteExam(deleteConfirm.id);
                  }} `;

content = content.replace(oldModal, newModal);
fs.writeFileSync('src/App.tsx', content);
