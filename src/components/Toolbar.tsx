import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Home,
  BookOpen,
  Search,
  Send,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ToolbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLoading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  onNavigate,
  onBack,
  onForward,
  onReload,
  isFullscreen,
  onToggleFullscreen,
  isLoading
}) => {
  const [inputVal, setInputVal] = useState(currentPath);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Keep inputVal in sync with currentPath when not actively editing
  React.useEffect(() => {
    if (!isEditing) {
      setInputVal(currentPath);
    }
  }, [currentPath, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    let target = inputVal.trim();
    if (!target) target = '/';
    if (!target.startsWith('/')) target = '/' + target;
    onNavigate(target);
  };

  const handleCopy = () => {
    const fullUrl = window.location.origin + currentPath;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Library', path: '/library', icon: BookOpen },
    { label: 'Search', path: '/search', icon: Search }
  ];

  return (
    <header
      id="pw-app-toolbar"
      className="bg-[#0e0e11] border-b border-zinc-800/80 px-3 py-2 text-zinc-200 select-none shadow-md z-30 transition-all"
    >
      <div className="mx-auto flex flex-wrap items-center justify-between gap-2 max-w-7xl">
        {/* Left Section: Brand & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Logo & Brand */}
          <div
            id="brand-badge"
            className="flex items-center gap-2 mr-1 sm:mr-2 cursor-pointer"
            onClick={() => onNavigate('/')}
            title="PW Pi Pro - Home"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-bold text-amber-400 text-xs shadow-inner">
              PW
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-black tracking-wide text-zinc-100 flex items-center gap-1">
                PW-PIPRO
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5">Live Synced</span>
            </div>
          </div>

          {/* History Navigation Buttons */}
          <div className="flex items-center gap-0.5 bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-800">
            <button
              id="btn-nav-back"
              type="button"
              onClick={onBack}
              title="Go Back"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-nav-forward"
              type="button"
              onClick={onForward}
              title="Go Forward"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-nav-reload"
              type="button"
              onClick={onReload}
              title="Reload Page"
              className={`p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition ${
                isLoading ? 'animate-spin text-amber-400' : ''
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="hidden lg:flex items-center gap-1 ml-1">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`btn-quick-${item.label.toLowerCase()}`}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition font-medium ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      : 'hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive URL / Path Input Form */}
        <form
          id="url-path-form"
          onSubmit={handleSubmit}
          className="flex-1 max-w-md min-w-[200px] flex items-center bg-zinc-900/90 border border-zinc-700/60 rounded-lg px-2.5 py-1 focus-within:border-amber-400/60 focus-within:ring-1 focus-within:ring-amber-400/20 transition"
        >
          <span className="text-[11px] font-mono text-zinc-500 mr-1 select-none">path:</span>
          <input
            id="url-path-input"
            type="text"
            value={inputVal}
            onChange={(e) => {
              setIsEditing(true);
              setInputVal(e.target.value);
            }}
            onBlur={() => setIsEditing(false)}
            placeholder="/"
            className="flex-1 bg-transparent text-xs font-mono text-zinc-200 focus:outline-none placeholder-zinc-600"
          />
          {inputVal !== currentPath && (
            <button
              id="btn-path-go"
              type="submit"
              className="text-[10px] bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded hover:bg-amber-300 ml-1 transition"
            >
              Go
            </button>
          )}
          <button
            id="btn-copy-url"
            type="button"
            onClick={handleCopy}
            title={copied ? 'URL Copied!' : 'Copy full URL path'}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 ml-1 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </form>

        {/* Right Section: Telegram Link & View Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Telegram Channel Button (Updated link requested by user) */}
          <a
            id="btn-telegram-community"
            href="https://t.me/+lxSx0imjBEo2ZTll"
            target="_blank"
            rel="noopener noreferrer"
            title="Join PW Community on Telegram"
            className="flex items-center gap-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-lg font-medium transition"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Telegram</span>
          </a>

          {/* Open Direct Frame Tab */}
          <a
            id="btn-open-new-tab"
            href={`/frame${currentPath}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in standalone tab"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Fullscreen / Immersion Toggle */}
          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Immersion Mode' : 'Enter Immersion Mode'}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
