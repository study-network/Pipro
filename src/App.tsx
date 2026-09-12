import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Send, Maximize2, RotateCcw } from 'lucide-react';

export default function App() {
  // Read initial path and query from browser location
  const getInitialPath = () => {
    const path = window.location.pathname || '/';
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return path + search + hash;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [iframeSrc, setIframeSrc] = useState<string>(() => {
    const initial = getInitialPath();
    const cleanPath = initial.startsWith('/') ? initial : '/' + initial;
    return `/frame${cleanPath}`;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHeaderHidden, setIsHeaderHidden] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Synchronize browser history and path changes from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'IFRAME_PATH_CHANGE') {
        const newPath = event.data.path;
        if (newPath && typeof newPath === 'string') {
          // Normalize path
          const cleanPath = newPath.startsWith('/') ? newPath : '/' + newPath;
          setCurrentPath(cleanPath);

          // Synchronize parent browser URL without full reload
          if (window.location.pathname + window.location.search + window.location.hash !== cleanPath) {
            window.history.replaceState(null, '', cleanPath);
          }

          // Update page title if provided
          if (event.data.title) {
            document.title = event.data.title;
          }
        }
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle native browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const popPath = window.location.pathname + window.location.search + window.location.hash;
      setCurrentPath(popPath);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'PARENT_NAVIGATE', path: popPath },
          '*'
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Actions from toolbar
  const handleNavigate = (path: string) => {
    let clean = path.trim();
    if (!clean) clean = '/';
    if (!clean.startsWith('/')) clean = '/' + clean;

    setCurrentPath(clean);
    setIsLoading(true);

    // Update parent URL
    window.history.pushState(null, '', clean);

    // Try posting message to iframe first for SPA smooth transition, or update src
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'PARENT_NAVIGATE', path: clean },
          '*'
        );
      } catch {
        setIframeSrc(`/frame${clean}`);
      }
    } else {
      setIframeSrc(`/frame${clean}`);
    }
  };

  const handleBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'PARENT_BACK' }, '*');
    }
  };

  const handleForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'PARENT_FORWARD' }, '*');
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // Force reload by refreshing src
      iframeRef.current.src = `/frame${currentPath}`;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div id="app-root-container" className="flex flex-col h-screen w-screen bg-[#09090b] overflow-hidden">
      {/* Top Navigation Control Bar */}
      {!isHeaderHidden && (
        <Toolbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          isFullscreen={isHeaderHidden}
          onToggleFullscreen={() => setIsHeaderHidden(true)}
          isLoading={isLoading}
        />
      )}

      {/* Floating Restore Button when header is minimized */}
      {isHeaderHidden && (
        <div
          id="floating-restore-panel"
          className="absolute top-3 right-3 z-50 flex items-center gap-2 bg-zinc-900/95 backdrop-blur border border-zinc-700/70 rounded-full px-3 py-1.5 shadow-xl text-xs text-zinc-300 transition-all hover:bg-zinc-800"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-[11px] max-w-[120px] truncate">{currentPath}</span>
          <button
            id="btn-restore-header"
            onClick={() => setIsHeaderHidden(false)}
            title="Show Control Bar"
            className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 ml-1"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Show Bar</span>
          </button>
          <a
            id="floating-telegram-btn"
            href="https://t.me/+lxSx0imjBEo2ZTll"
            target="_blank"
            rel="noopener noreferrer"
            title="PW Community Telegram"
            className="text-sky-400 hover:text-sky-300 p-1"
          >
            <Send className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Main Iframe Viewer */}
      <main id="iframe-viewport" className="relative flex-1 w-full h-full bg-[#09090b]">
        {/* Subtle Top Loading Progress Bar */}
        {isLoading && (
          <div
            id="iframe-loading-indicator"
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse z-20"
          />
        )}

        <iframe
          ref={iframeRef}
          id="pw-main-iframe"
          src={iframeSrc}
          title="PW Pi Pro Web Application"
          onLoad={handleIframeLoad}
          className="w-full h-full border-0 outline-none block bg-[#09090b]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </main>
    </div>
  );
}
