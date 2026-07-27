import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('deferredPrompt')) {
  content = content.replace(
    "const [darkMode, setDarkMode] = useState(() => {",
    `const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      }
    }
  };

  const [darkMode, setDarkMode] = useState(() => {`
  );
}

content = content.replace(
  '<button\n              onClick={toggleTheme}',
  `{showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="p-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors shadow-sm shrink-0"
                title="Install App"
              >
                <Download size={20} />
              </button>
            )}
            <button
              onClick={toggleTheme}`
);

fs.writeFileSync('src/App.tsx', content);
