import React, { useState, useEffect, useRef } from 'react';

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

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div id="app-root-container" className="h-screen w-screen bg-[#09090b] overflow-hidden m-0 p-0">
      {/* Loading Progress Bar */}
      {isLoading && (
        <div
          id="iframe-loading-indicator"
          className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse z-50 pointer-events-none"
        />
      )}

      {/* Main Full-Screen Web Application Viewport */}
      <iframe
        ref={iframeRef}
        id="pw-main-iframe"
        src={iframeSrc}
        title="PW Pi Pro Web Application"
        onLoad={handleIframeLoad}
        className="w-full h-full border-0 outline-none block bg-[#09090b]"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
