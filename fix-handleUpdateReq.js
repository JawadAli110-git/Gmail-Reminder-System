import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldFunc = `  const handleUpdateRequestStatus = async (id: string, status: 'approved' | 'disapproved', reply: string, reqObj: any) => {
    triggerHaptic();
    try {
      const res = await customFetch(\`/api/requests/\${id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reply, email: reqObj.email, name: reqObj.name, subject: reqObj.type })
      });
      if (res.ok) {
        showToast("Success", \`Request \${status} successfully.\`, "success");
        fetchTeacherRequests();
      }
    } catch (err) {
      showToast("Error", "Failed to update request.", "error");
    }
  };`;

const newFunc = `  const handleUpdateRequestStatus = async (id: string, status: string, reply: string, reqObj: any, actionName: string) => {
    triggerHaptic();
    try {
      const res = await customFetch(\`/api/requests/\${id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reply, email: reqObj.email, name: reqObj.name, subject: reqObj.type })
      });
      if (res.ok) {
        showToast("Success", \`Request \${actionName} successfully.\`, "success");
        fetchTeacherRequests();
      }
    } catch (err) {
      showToast("Error", "Failed to update request.", "error");
    }
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/App.tsx', content);
