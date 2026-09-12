import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Fullscreen toggle logic
  const toggleFullscreen = async () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const isCurrentlyFull = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isCurrentlyFull) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle error:', err);
    }
  };

  // Synchronize fullscreen state with browser events
  useEffect(() => {
    const onFullscreenChange = () => {
      const doc = document as any;
      const isFull = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    // Keyboard shortcut: 'F' toggles fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Synchronize browser history and path changes from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'TOGGLE_FULLSCREEN') {
        toggleFullscreen();
      } else if (event.data.type === 'REQUEST_FULLSCREEN') {
        if (!isFullscreen) toggleFullscreen();
      } else if (event.data.type === 'EXIT_FULLSCREEN') {
        if (isFullscreen) toggleFullscreen();
      } else if (event.data.type === 'IFRAME_PATH_CHANGE') {
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
  }, [isFullscreen]);

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
    <div id="app-root-container" className="h-screen w-screen bg-[#09090b] overflow-hidden m-0 p-0 relative">
      {/* Loading Progress Bar */}
      {isLoading && (
        <div
          id="iframe-loading-indicator"
          className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse z-50 pointer-events-none"
        />
      )}

      {/* Top Full-Screen Toggle Button */}
      <button
        id="fullscreen-toggle-btn"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
        aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/70 shadow-2xl backdrop-blur-md px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer select-none group ring-1 ring-white/10 hover:ring-amber-400/30"
      >
        {isFullscreen ? (
          <>
            <Minimize className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Exit Full Screen</span>
          </>
        ) : (
          <>
            <Maximize className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Full Screen</span>
          </>
        )}
      </button>

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
