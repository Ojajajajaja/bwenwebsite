import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  icon: React.ElementType | (() => JSX.Element);
  name: string;
  url: string;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1);
  const [taskbarHeight, setTaskbarHeight] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Performance and mobile optimization hooks
  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    setWindowDimensions({ width: newWidth, height: newHeight });
    setIsMobile(newWidth <= 768);
    
    const taskbar = document.getElementById('taskbar');
    if (taskbar) {
      setTaskbarHeight(taskbar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const getResponsiveDimensions = useCallback((baseWidth: number, baseHeight: number) => {
    const aspectRatio = baseWidth / baseHeight;
    const maxWidth = windowDimensions.width * (isMobile ? 0.95 : 0.9);
    const maxHeight = windowDimensions.height * (isMobile ? 0.85 : 0.8);

    let width = Math.min(baseWidth, maxWidth);
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }, [windowDimensions, isMobile]);

  const apps = useMemo(() => [
    { icon: Finder, name: 'Finder', content: 'File Explorer', width: 600, height: 400 },
    { 
      icon: Chrome, 
      name: 'Chrome', 
      content: <iframe 
        src="https://docs.babywen.io/" 
        className="w-full h-full border-none" 
        title="BabyWen Documentation" 
        style={{ pointerEvents: 'auto' }} 
      />, 
      width: 800, 
      height: 600 
    },
    { icon: Terminal, name: 'Terminal', content: <FakeTerminal />, width: 600, height: 400 },
    { icon: Settings, name: 'Settings', content: 'System Preferences', width: 600, height: 400 },
    { icon: Music, name: 'Music', content: <LofiPlayer />, width: 300, height: 145 },
    { icon: BarChart3, name: 'Jupiter', content: <JupiterSwap />, width: 800, height: 600 }
  ], []);

  const desktopIcons: DesktopIcon[] = useMemo(() => [
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
  ], []);

  const openWindow = useCallback((app: typeof apps[0]) => {
    const existingWindow = windows.find(w => w.id === app.name);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }

    const { width, height } = getResponsiveDimensions(app.width, app.height);
    const isChrome = app.name === 'Chrome';
    
    // Center the window
    const newWindow: AppWindow = {
      id: app.name,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      zIndex: highestZIndex + 1,
      position: {
        x: (windowDimensions.width - width) / 2,
        y: Math.max(taskbarHeight, (windowDimensions.height - height) / 2),
      },
      content: app.content,
      isFullScreen: isChrome && isMobile,
    };

    setWindows(prev => [...prev, newWindow]);
    setHighestZIndex(prev => prev + 1);
  }, [windows, highestZIndex, windowDimensions, taskbarHeight, getResponsiveDimensions, isMobile]);

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

  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    if (isMobile) return; // Disable dragging on mobile

    const window = windows.find(w => w.id === windowId);
    if (!window || window.isFullScreen) return;

    bringToFront(windowId);
    setDraggedWindow(windowId);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
  }, [windows, bringToFront, isMobile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedWindow || isMobile) return;

    setWindows(prev => prev.map(w => {
      if (w.id === draggedWindow) {
        return {
          ...w,
          position: {
            x: Math.max(0, Math.min(e.clientX - dragOffset.x, windowDimensions.width - w.width)),
            y: Math.max(taskbarHeight, Math.min(e.clientY - dragOffset.y, windowDimensions.height - w.height))
          }
        };
      }
      return w;
    }));
  }, [draggedWindow, dragOffset, windowDimensions, taskbarHeight, isMobile]);

  const handleMouseUp = useCallback(() => {
    setDraggedWindow(null);
  }, []);

  const openUrl = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const toggleFullScreen = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const app = apps.find(a => a.name === id);
        const { width, height } = getResponsiveDimensions(app?.width || 800, app?.height || 600);
        return {
          ...w,
          isFullScreen: !w.isFullScreen,
          position: !w.isFullScreen 
            ? { x: 0, y: taskbarHeight }
            : { 
                x: (windowDimensions.width - width) / 2, 
                y: Math.max(taskbarHeight, (windowDimensions.height - height) / 2) 
              },
        };
      }
      return w;
    }));
  }, [apps, getResponsiveDimensions, windowDimensions, taskbarHeight]);

  return (
    <div 
      className={`h-screen w-screen bg-cover bg-center relative overflow-hidden bg-gray-900 ${isMobile ? 'touch-manipulation' : ''}`}
      style={{ backgroundImage: 'url(https://www.emana.io/wp-content/uploads/2021/02/Purple-and-Blue-Space-4k-Ultra-HD-Wallpaper-Background--scaled.jpg)' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Menu Bar */}
      <div 
        id="taskbar" 
        className="h-8 bg-black/40 backdrop-blur-2xl text-white px-4 flex items-center justify-between border-b border-white/5"
      >
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
      <div className={`absolute top-12 left-4 space-y-4 ${isMobile ? 'hidden' : 'block'}`}>
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

      {/* Windows */}
      {windows.map((window) => {
        const app = apps.find(a => a.name === window.id);
        const { width, height } = getResponsiveDimensions(app?.width || 800, app?.height || 600);
        
        return (
          <div
            key={window.id}
            className={`absolute bg-black/40 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/5 overflow-hidden`}
            style={{
              left: window.position.x,
              top: window.position.y,
              zIndex: window.zIndex,
              width: window.isFullScreen ? '100%' : width,
              height: window.isFullScreen ? '100%' : height,
            }}
          >
            <div
              className="h-8 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-3 cursor-move relative"
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {window.id === 'Chrome' && (
                  <button
                    onClick={() => toggleFullScreen(window.id)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group"
                  >
                    {window.isFullScreen ? <Minimize2 className="w-4 h-4 text-white/70 group-hover:text-white/90" /> : <Maximize2 className="w-4 h-4 text-white/70 group-hover:text-white/90" />}
                  </button>
                )}
                <button
                  onClick={() => closeWindow(window.id)}
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
            <div 
              className="h-[calc(100%-2rem)] overflow-auto touch-auto" 
              style={{ 
                pointerEvents: window.id === 'Chrome' ? 'auto' : 'none',
                WebkitOverflowScrolling: 'touch' 
              }}
            >
              {window.content}
            </div>
          </div>
        );
      })}

      {/* Mobile Dock */}
      <div 
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 
        ${isMobile ? 'w-[95%]' : 'w-auto'}`}
      >
        <div className={`
          flex items-center justify-center space-x-2 
          bg-black/40 backdrop-blur-2xl px-4 py-2 
          ${isMobile ? 'rounded-xl' : 'rounded-2xl'} 
          border border-white/5 shadow-2xl
          ${isMobile ? 'overflow-x-auto' : ''}`}
        >
          {apps.map((app, index) => (
            <div key={index} className="group flex flex-col items-center relative">
              <span className={`
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 
                text-white/90 text-xs absolute 
                backdrop-blur-2xl px-2 py-1 rounded-md bg-black/40
                font-medium whitespace-nowrap
                ${isMobile ? '-top-10' : '-top-8'}
              `}>
                {app.name}
              </span>
              <div
                onClick={() => openWindow(app)}
                className={`
                  flex items-center justify-center 
                  bg-black/20 rounded-xl backdrop-blur-2xl 
                  hover:bg-white/10 transition-all duration-200 
                  cursor-pointer border border-white/5
                  ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
                  hover:scale-110 hover:-translate-y-2
                `}
              >
                <app.icon className={`text-white/90 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
