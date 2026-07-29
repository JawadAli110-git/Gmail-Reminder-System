import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const requestFunctions = `
  const fetchTeacherRequests = async () => {
    try {
      const res = await customFetch("/api/requests");
      const data = await res.json();
      setTeacherRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isRequestsModalOpen && isAdmin) {
      fetchTeacherRequests();
    }
  }, [isRequestsModalOpen, isAdmin]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.name || !requestFormData.email || !requestFormData.message) {
      showToast("Error", "Please fill all required fields.", "error");
      return;
    }
    setIsSubmittingRequest(true);
    triggerHaptic();
    try {
      const res = await customFetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestFormData)
      });
      if (res.ok) {
        showToast("Success", "Request submitted successfully. Admin will be notified.", "success");
        setIsRequestsModalOpen(false);
        setRequestFormData({ name: '', email: '', type: 'Exchange Class', message: '' });
      }
    } catch (err) {
      showToast("Error", "Failed to submit request.", "error");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: 'approved' | 'disapproved', reply: string, reqObj: any) => {
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
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const res = await customFetch(\`/api/requests/\${id}\`, { method: "DELETE" });
      if (res.ok) fetchTeacherRequests();
    } catch (err) {
      console.error(err);
    }
  };
`;

content = content.replace(
  '  const handleAddClass = async (e: React.FormEvent) => {',
  requestFunctions + '\n  const handleAddClass = async (e: React.FormEvent) => {'
);

fs.writeFileSync('src/App.tsx', content);
