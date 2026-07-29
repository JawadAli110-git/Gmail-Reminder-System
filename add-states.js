import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const newStates = `
  const [teacherRequests, setTeacherRequests] = useState<TeacherRequest[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({ name: '', email: '', type: 'Exchange Class', message: '' });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestReplyData, setRequestReplyData] = useState<{ [key: string]: string }>({});
`;

content = content.replace(
  '  const [isLogsOpen, setIsLogsOpen] = useState(false);',
  '  const [isLogsOpen, setIsLogsOpen] = useState(false);\n' + newStates
);

fs.writeFileSync('src/App.tsx', content);
