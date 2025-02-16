import React, { useState, useEffect, useCallback } from 'react';
import { Chrome, Cylinder as Finder, Terminal, Settings, Music, Battery, Wifi, Search, X, BarChart3, Minimize2, Maximize2 } from 'lucide-react';
import LofiPlayer from './components/LofiPlayer';
import JupiterSwap from './components/JupiterSwap';
import FakeTerminal from './components/FakeTerminal';

interface AppWindow {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  content: React.ReactNode;
  isFullScreen: boolean;
}

interface DesktopIcon {
  icon: React.ElementType;
  name: string;
  url: string;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const apps = [
    { icon: Finder, name: 'Finder', content: 'File Explorer', width: 600, height: 400 },
    { icon: Chrome, name: 'Chrome', content: <iframe src="https://docs.babywen.io/" className="w-full h-full border-none" title="BabyWen Documentation" />, width: 800, height: 600 },
    { icon: Terminal, name: 'Terminal', content: <FakeTerminal />, width: 600, height: 400 },
    { icon: Settings, name: 'Settings', content: 'System Preferences', width: 600, height: 400 },
    { icon: Music, name: 'Music', content: <LofiPlayer />, width: 300, height: 145 },
    { icon: BarChart3, name: 'Jupiter', content: <JupiterSwap />, width: 800, height: 600 }
  ];

  const desktopIcons: DesktopIcon[] = [
    { 
      icon: () => <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X" width="40" height="40" style={{filter: 'brightness(0) invert(1)'}}/>,
      name: 'X',
      url: 'https://x.com/babywen_CTO'
    },
    { 
      icon: () => <img src="https://www.svgviewer.dev/static-svgs/406050/social-telegram.svg" alt="Telegram" width="48" height="48" style={{filter: 'brightness(0) invert(1)'}}/>,
      name: 'Telegram',
      url: 'https://t.me/babywenportal'
    },
    { icon: BarChart3, name: 'DexScreener', url: 'https://dexscreener.com' },
  ];

  const openWindow = useCallback((app: typeof apps[0]) => {
    const existingWindow = windows.find(w => w.id === app.name);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }

    const newWindow: AppWindow = {
      id: app.name,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      zIndex: highestZIndex + 1,
      position: {
        x: Math.random() * (window.innerWidth - 300),
        y: Math.random() * (window.innerHeight - 300),
      },
      content: app.content,
      isFullScreen: false,
    };

    setWindows(prev => [...prev, newWindow]);
    setHighestZIndex(prev => prev + 1);
  }, [windows, highestZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      zIndex: w.id === id ? highestZIndex + 1 : w.zIndex
    })));
    setHighestZIndex(prev => prev + 1);
  }, [highestZIndex]);

  const handleWindowMove = useCallback((id: string, deltaX: number, deltaY: number) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          position: {
            x: w.position.x + deltaX,
            y: w.position.y + deltaY
          }
        };
      }
      return w;
    }));
  }, []);

  const toggleFullScreen = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          isFullScreen: !w.isFullScreen,
          position: !w.isFullScreen ? { x: 0, y: 0 } : w.position,
        };
      }
      return w;
    }));
  }, []);

  const openUrl = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  return (
    <div className="h-screen w-screen bg-cover bg-center relative overflow-hidden bg-gray-900"
         style={{ backgroundImage: 'url(https://www.emana.io/wp-content/uploads/2021/02/Purple-and-Blue-Space-4k-Ultra-HD-Wallpaper-Background--scaled.jpg)' }}>
      {/* Menu Bar */}
      <div className="h-8 bg-black/40 backdrop-blur-2xl text-white px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-4">
        </div>
        <div className="flex items-center space-x-4">
          <Battery className="w-4 h-4 opacity-60" />
          <Wifi className="w-4 h-4 opacity-60" />
          <Search className="w-4 h-4 opacity-60" />
          <span className="opacity-80 font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Desktop Icons */}
      {!isMobile && (
        <div className="absolute top-12 left-4 space-y-4">
          {desktopIcons.map((icon, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => openUrl(icon.url)}
            >
              <div className="w-16 h-16 bg-black/20 rounded-xl backdrop-blur-xl flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
                <icon.icon className="w-10 h-10 text-white/90" />
              </div>
              <span className="mt-1 text-xs text-white/90 bg-black/40 px-2 py-1 rounded-md backdrop-blur-xl">
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Windows */}
      {windows.map((window) => (
        <WindowComponent
          key={window.id}
          window={window}
          isMobile={isMobile}
          onClose={closeWindow}
          onBringToFront={bringToFront}
          onMove={handleWindowMove}
          onToggleFullScreen={toggleFullScreen}
        />
      ))}

      {/* Dock */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${isMobile ? 'w-full px-4' : ''}`}>
        <div className={`flex items-end ${isMobile ? 'justify-between' : 'space-x-2'} bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl`}>
          {apps.map((app, index) => (
            <div key={index} className="group flex flex-col items-center relative">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                             text-white/90 text-xs absolute -top-8 backdrop-blur-2xl px-2 py-1 rounded-md bg-black/40
                             font-medium whitespace-nowrap">
                {app.name}
              </span>
              <div
                onClick={() => openWindow(app)}
                className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-2xl 
                          hover:bg-white/10 transition-all duration-200 transform hover:scale-110 hover:-translate-y-2 cursor-pointer
                          border border-white/5`}
              >
                <app.icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white/90`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface WindowComponentProps {
  window: AppWindow;
  isMobile: boolean;
  onClose: (id: string) => void;
  onBringToFront: (id: string) => void;
  onMove: (id: string, deltaX: number, deltaY: number) => void;
  onToggleFullScreen: (id: string) => void;
}

const WindowComponent: React.FC<WindowComponentProps> = React.memo(({ window, isMobile, onClose, onBringToFront, onMove, onToggleFullScreen }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isFullScreen) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - window.position.x, y: e.clientY - window.position.y });
    onBringToFront(window.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x - window.position.x;
    const deltaY = e.clientY - dragStart.y - window.position.y;
    onMove(window.id, deltaX, deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.isFullScreen) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - window.position.x, y: touch.clientY - window.position.y });
    onBringToFront(window.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x - window.position.x;
    const deltaY = touch.clientY - dragStart.y - window.position.y;
    onMove(window.id, deltaX, deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`absolute bg-black/40 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/5 overflow-hidden`}
      style={{
        left: window.isFullScreen ? 0 : window.position.x,
        top: window.isFullScreen ? 0 : window.position.y,
        zIndex: window.zIndex,
        width: window.isFullScreen ? '100%' : isMobile ? '90%' : '600px',
        height: window.isFullScreen ? '100%' : isMobile ? '70%' : '400px',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="h-8 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-3 cursor-move relative"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <button
            onClick={() => onToggleFullScreen(window.id)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group"
          >
            {window.isFullScreen ? <Minimize2 className="w-4 h-4 text-white/70 group-hover:text-white/90" /> : <Maximize2 className="w-4 h-4 text-white/70 group-hover:text-white/90" />}
          </button>
          <button
            onClick={() => onClose(window.id)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group"
          >
            <X className="w-4 h-4 text-white/70 group-hover:text-white/90" />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-white/80">
          <window.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{window.title}</span>
        </div>
      </div>
      <div className="h-[calc(100%-2rem)] overflow-auto">
        {window.content}
      </div>
    </div>
  );
});

export default App;
