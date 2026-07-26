import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'await deleteDoc(doc(db, "paperTypes", req.params.id));',
  'await deleteDoc(doc(db, "paperTypes", req.params.id));\n    const examsSnap = await getDocs(collection(db, "exams"));\n    for (const d of examsSnap.docs) {\n      if (d.data().paperTypeId === req.params.id) {\n        await deleteDoc(d.ref);\n      }\n    }'
);

fs.writeFileSync('server.ts', content);
