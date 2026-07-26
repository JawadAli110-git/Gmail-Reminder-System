const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { Plus, Trash2, Edit2, Download, Calendar, Clock, User, Mail, Sparkles, Shield, X, RefreshCw, Layers, CheckCircle2, AlertCircle, Eye, Settings, Terminal, FileText, Check } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Download, Calendar, Clock, User, Mail, Sparkles, Shield, X, RefreshCw, Layers, CheckCircle2, AlertCircle, Eye, Settings, Terminal, FileText, Check, Search, Lock, LogIn, KeyRound } from "lucide-react";'
);

fs.writeFileSync('src/App.tsx', content);
