import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add state
content = content.replace(
    /const \[isRequestsModalOpen, setIsRequestsModalOpen\] = useState\(false\);/,
    `const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);`
);

// Add handler
const handler = `
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    triggerHaptic();
    try {
        const res = await customFetch('/api/messages/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: broadcastText })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Success", \`Broadcast sent to \${data.count} users\`, "success");
            setBroadcastText("");
            setIsBroadcastModalOpen(false);
            fetchMessages();
        } else {
            showToast("Error", data.error || "Broadcast failed", "error");
        }
    } catch (err) {
        showToast("Error", "Broadcast failed", "error");
    } finally {
        setIsBroadcasting(false);
    }
  };
`;

content = content.replace(
    /const handleSendMessage = async \(e: React\.FormEvent\) => \{/,
    handler + '\n  const handleSendMessage = async (e: React.FormEvent) => {'
);

fs.writeFileSync('src/App.tsx', content);
