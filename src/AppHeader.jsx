import { useEffect, useState } from 'react';
import './AppHeader.css';

const AppHeader = () => {
  const [debug, setDebug] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize from URL hash params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
    const debugParam = params.get('debug') === 'true';
    const darkParam = params.get('dark') === 'true';
    
    setDebug(debugParam);
    setDarkMode(darkParam);
    
    // Apply dark mode class to document if enabled
    if (darkParam) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  // Update URL hash params when state changes
  const updateHashParams = (newDebug, newDark) => {
    const params = new URLSearchParams();
    if (newDebug) params.set('debug', 'true');
    if (newDark) params.set('dark', 'true');
    
    const newHash = params.toString() ? `#${params.toString()}` : '#';
    window.location.hash = newHash;
  };

  const handleDebugToggle = () => {
    const newDebug = !debug;
    setDebug(newDebug);
    updateHashParams(newDebug, darkMode);
  };

  const handleDarkModeToggle = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    updateHashParams(debug, newDark);
    
    // Apply/remove dark mode class
    if (newDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  return (
    <header className="app-header">
      <h1>Screenplay Generator</h1>
      <div className="header-controls">
        <button
          className={`control-btn debug-btn ${debug ? 'active' : ''}`}
          onClick={handleDebugToggle}
          title={debug ? 'Disable Debug Mode' : 'Enable Debug Mode'}
        >
          🐛 Debug {debug ? 'ON' : 'OFF'}
        </button>
        <button
          className={`control-btn dark-mode-btn ${darkMode ? 'active' : ''}`}
          onClick={handleDarkModeToggle}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
