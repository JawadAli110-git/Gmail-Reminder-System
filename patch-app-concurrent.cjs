const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSubData = `    const submissionData = {
      ...concurrentFormData,
      classId: selectedClassId,
      days: [selectedOption.day],
      time: selectedOption.time,
      endTime: selectedOption.endTime,
      id: Date.now().toString()
    };`;

const newSubData = `    const submissionData = {
      ...concurrentFormData,
      classId: selectedClassId,
      days: [selectedOption.day],
      time: selectedOption.time,
      endTime: selectedOption.endTime,
      id: Date.now().toString(),
      allowConcurrent: true
    };`;

content = content.replace(oldSubData, newSubData);
fs.writeFileSync('src/App.tsx', content);
