import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add Download icon to imports if it's not there, but it is.
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

  content = content.replace(
    /<button\s+onClick=\{printGlobalTimetable\}\s+className="p-2 sm:p-2.5 rounded-xl bg-white\/50 dark:bg-black\/30/,
    `{showInstallBtn && (
                <button
                  onClick={handleInstallClick}
                  className="p-2 sm:p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all group relative"
                  title="Install App"
                >
                  <Download size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Install App
                  </span>
                </button>
              )}
              <button
                onClick={printGlobalTimetable}
                className="p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-black/30`
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
