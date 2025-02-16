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

  // Time update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive and taskbar setup
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setIsMobile(newWidth <= 768);
      setWindowDimensions({ width: newWidth, height: newHeight });

      const taskbar = document.getElementById('taskbar');
      if (taskbar) {
        setTaskbarHeight(taskbar.offsetHeight);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive dimension calculation
  const getResponsiveDimensions = useCallback((baseWidth: number, baseHeight: number) => {
    const aspectRatio = baseWidth / baseHeight;
    let width, height;

    if (isMobile) {
      width = windowDimensions.width * 0.95;
      height = width / aspectRatio;
    } else {
      width = Math.min(baseWidth, windowDimensions.width * 0.9);
      height = width / aspectRatio;

      if (height > windowDimensions.height * 0.8) {
        height = windowDimensions.height * 0.8;
        width = height * aspectRatio;
      }
    }

    return { width, height };
  }, [windowDimensions, isMobile]);

  // Apps configuration
  const apps = [
    { icon: Finder, name: 'Finder', content: 'File Explorer', width: 600, height: 400 },
    { 
      icon: Chrome, 
      name: 'Chrome', 
      content: <iframe 
        src="https://docs.babywen.io/" 
        className="w-full h-full border-none" 
        title="BabyWen Documentation" 
      />, 
      width: 800, 
      height: 600 
    },
    { icon: Terminal, name: 'Terminal', content: <FakeTerminal />, width: 600, height: 400 },
    { icon: Settings, name: 'Settings', content: 'System Preferences', width: 600, height: 400 },
    { icon: Music, name: 'Music', content: <LofiPlayer />, width: 300, height: 145 },
    { icon: BarChart3, name: 'Jupiter', content: <JupiterSwap />, width: 800, height: 600 }
  ];

  // Desktop icons with improved mobile support
  const desktopIcons: DesktopIcon[] = [
    { 
      icon: () => <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" 
        alt="X" 
        className="w-10 h-10" 
        style={{filter: 'brightness(0) invert(1)'}}
      />,
      name: 'X',
      url: 'https://x.com/babywen_CTO'
    },
    { 
      icon: () => <img 
        src="https://www.svgviewer.dev/static-svgs/406050/social-telegram.svg" 
        alt="Telegram" 
        className="w-12 h-12" 
        style={{filter: 'brightness(0) invert(1)'}}
      />,
      name: 'Telegram',
      url: 'https://t.me/babywenportal'
    },
    { 
      icon: BarChart3, 
      name: 'DexScreener', 
      url: 'https://dexscreener.com' 
    },
  ];

  // Open window with centered positioning
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
      isFullScreen: isChrome && !isMobile,
    };

    setWindows(prevWindows => [...prevWindows, newWindow]);
    setHighestZIndex(prev => prev + 1);
  }, [windows, highestZIndex, windowDimensions, taskbarHeight, getResponsiveDimensions, isMobile]);

  // Close window
  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  // Bring window to front
  const bringToFront = (id: string) => {
    setWindows(windows.map(w => ({
      ...w,
      zIndex: w.id === id ? highestZIndex + 1 : w.zIndex
    })));
    setHighestZIndex(prev => prev + 1);
  };

  // Drag and move window with constraints
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    if (isMobile) return; // Disable dragging on mobile

    const window = windows.find(w => w.id === windowId);
    if (!window || window.isFullScreen) return;

    bringToFront(windowId);
    setDraggedWindow(windowId);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWindow || isMobile) return;

    setWindows(windows.map(w => {
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
  };

  const handleMouseUp = () => {
    setDraggedWindow(null);
  };

  // Open external URL
  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // Toggle fullscreen for Chrome window
  const toggleFullScreen = (id: string) => {
    setWindows(windows.map(w => {
      if (w.id === id && w.id === 'Chrome') {
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
  };

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
          {/* Optional left side menu items */}
        </div>
        <div className="flex items-center space-x-4">
          <Battery className="w-4 h-4 opacity-60" />
          <Wifi className="w-4 h-4 opacity-60" />
          <Search className="w-4 h-4 opacity-60" />
          <span className="opacity-80 font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className={`absolute top-12 left-4 space-y-4 ${isMobile ? 'grid grid-cols-3 gap-4 w-full px-4' : ''}`}>
        {desktopIcons.map((icon, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => openUrl(icon.url)}
          >
            <div className="w-16 h-16 bg-black/20 rounded-xl backdrop-blur-xl flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
              {typeof icon.icon === 'function' ? icon.icon() : <icon.icon className="w-10 h-10 text-white/90" />}
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
            <div className={`h-[calc(100%-2rem)] overflow-auto ${isMobile ? 'touch-pan-y' : ''}`}>
              {window.content}
            </div>
          </div>
        );
      })}

      {/* Dock */}
      <div 
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 ${
          isMobile ? 'w-full px-4' : ''
        }`}
      >
        <div 
          className={`
            flex items-end space-x-2 bg-black/40 backdrop-blur-2xl px-4 py-2 
            rounded-2xl border border-white/5 shadow-2xl
            ${isMobile ? 'justify-between w-full' : ''}
          `}
        >
          {apps.map((app, index) => (
            <div 
              key={index} 
              className={`
                group flex flex-col items-center relative 
                ${isMobile ? 'w-1/6 flex-grow' : ''}
              `}
            >
              <span 
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                  text-white/90 text-xs absolute -top-8 backdrop-blur-2xl px-2 py-1 
                  rounded-md bg-black/40 font-medium whitespace-nowrap
                  ${isMobile ? 'hidden' : ''}
                `}
              >
                {app.name}
              </span>
              <div
                onClick={() => openWindow(app)}
                className={`
                  flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-2xl 
                  hover:bg-white/10 transition-all duration-200 transform hover:scale-110 
                  hover:-translate-y-2 cursor-pointer border border-white/5
                  ${isMobile ? 'w-full aspect-square' : 'w-12 h-12'}
                `}
              >
                <app.icon className="w-8 h-8 text-white/90" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
