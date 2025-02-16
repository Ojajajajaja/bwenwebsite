import React, { useState } from 'react';
import { Chrome, Cylinder as Finder, Terminal, Settings, Music, Battery, Wifi, Search, X, BarChart3 } from 'lucide-react';
import LofiPlayer from './components/LofiPlayer';

interface Window {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  content: React.ReactNode;
}

interface DesktopIcon {
  icon: React.ElementType;
  name: string;
  url: string;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [windows, setWindows] = useState<Window[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const apps = [
    { icon: Finder, name: 'Finder', content: 'File Explorer' },
    { icon: Chrome, name: 'Chrome', content: 'Web Browser' },
    { icon: Terminal, name: 'Terminal', content: 'Command Line Interface' },
    { icon: Settings, name: 'Settings', content: 'System Preferences' },
    { icon: Music, name: 'Music', content: <LofiPlayer /> }
  ];

  const desktopIcons: DesktopIcon[] = [
    { 
      icon: () => <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X" width="40" height="40" style={{filter: 'brightness(0) invert(1)'}}/>,
      name: 'X',
      url: 'https://x.com/babywen_CTO',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    { 
      icon: () => <img src="https://www.svgviewer.dev/static-svgs/406050/social-telegram.svg" alt="Telegram" width="48" height="48" style={{filter: 'brightness(0) invert(1)'}}/>,
      name: 'Telegram',
      url: 'https://t.me/babywenportal',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    { 
      icon: BarChart3, 
      name: 'DexScreener', 
      url: 'https://dexscreener.com',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
  ];

  const openWindow = (app: typeof apps[0]) => {
    const existingWindow = windows.find(w => w.id === app.name);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }

    const windowWidth = Math.min(window.innerWidth * 0.8, 800);
    const windowHeight = Math.min(window.innerHeight * 0.7, 600);
    const centerX = (window.innerWidth - windowWidth) / 2;
    const centerY = (window.innerHeight - windowHeight) / 2;

    const newWindow: Window = {
      id: app.name,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      zIndex: highestZIndex + 1,
      position: {
        x: centerX,
        y: centerY
      },
      content: app.content
    };

    setWindows([...windows, newWindow]);
    setHighestZIndex(highestZIndex + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const bringToFront = (id: string) => {
    setWindows(windows.map(w => ({
      ...w,
      zIndex: w.id === id ? highestZIndex + 1 : w.zIndex
    })));
    setHighestZIndex(highestZIndex + 1);
  };

  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    bringToFront(windowId);
    setDraggedWindow(windowId);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWindow) return;

    setWindows(windows.map(w => {
      if (w.id === draggedWindow) {
        return {
          ...w,
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          }
        };
      }
      return w;
    }));
  };

  const handleMouseUp = () => {
    setDraggedWindow(null);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="h-screen w-screen bg-cover bg-center relative overflow-hidden bg-gray-900"
         style={{ backgroundImage: 'url(./assets/background.png)' }}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}>
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

      {/* Windows */}
      {windows.map((window) => (
        <div
          key={window.id}
          className="absolute bg-black/40 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/5 overflow-hidden"
          style={{
            width: Math.min(window.innerWidth * 0.8, 800) + 'px',
            height: Math.min(window.innerHeight * 0.7, 600) + 'px',
            left: window.position.x,
            top: window.position.y,
            zIndex: window.zIndex,
          }}
        >
          <div
            className="h-8 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-3 cursor-move relative"
            onMouseDown={(e) => handleMouseDown(e, window.id)}
          >
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
          <div className="p-4 text-white/90 h-[calc(100%-2rem)]">
            {window.content}
          </div>
        </div>
      ))}

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex items-end space-x-2 bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
          {apps.map((app, index) => (
            <div key={index} className="group flex flex-col items-center relative">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                             text-white/90 text-xs absolute -top-8 backdrop-blur-2xl px-2 py-1 rounded-md bg-black/40
                             font-medium whitespace-nowrap">
                {app.name}
              </span>
              <div
                onClick={() => openWindow(app)}
                className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-2xl 
                          hover:bg-white/10 transition-all duration-200 transform hover:scale-110 hover:-translate-y-2 cursor-pointer
                          border border-white/5"
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
