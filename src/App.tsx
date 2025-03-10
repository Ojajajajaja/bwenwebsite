import React, { useState, useEffect } from 'react';
import { Chrome, Terminal, Music, Battery, Wifi, Search, X, BarChart3, Minus, Book } from 'lucide-react';
import LofiPlayer from './components/LofiPlayer';
import FakeTerminal from './components/FakeTerminal';
import "@jup-ag/terminal/css";

interface AppWindow {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  content: React.ReactNode;
}

interface DesktopIcon {
  icon: React.ElementType | (() => JSX.Element);
  name: string;
  action: () => void;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1);
  const [taskbarHeight, setTaskbarHeight] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const taskbar = document.getElementById('taskbar');
    if (taskbar) {
      setTaskbarHeight(taskbar.offsetHeight);
    }
  }, []);

  const openWindow = (app: { name: string; icon: React.ElementType; content: React.ReactNode }) => {
    const existingWindow = windows.find(w => w.id === app.name);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows(windows.map(w => 
          w.id === app.name 
            ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 }
            : w
        ));
        setHighestZIndex(highestZIndex + 1);
      } else {
        bringToFront(existingWindow.id);
      }
      return;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const newWindow: AppWindow = {
      id: app.name,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      isMinimized: false,
      zIndex: highestZIndex + 1,
      position: {
        x: (screenWidth - 600) / 2,
        y: (screenHeight - 400) / 2 + taskbarHeight / 2,
      },
      content: app.content,
    };

    setWindows([...windows, newWindow]);
    setHighestZIndex(highestZIndex + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(windows.map(w => 
      w.id === id 
        ? { ...w, isMinimized: true }
        : w
    ));
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

  const desktopIcons: DesktopIcon[] = [
    { 
      icon: Terminal,
      name: 'Terminal',
      action: () => openWindow({ name: 'Terminal', icon: Terminal, content: <FakeTerminal /> })
    },
    { 
      icon: Music,
      name: 'Music',
      action: () => openWindow({ name: 'Music', icon: Music, content: <LofiPlayer /> })
    },
    { 
      icon: Book, 
      name: 'Docs', 
      action: () => openUrl('https://docs.babywen.io')
    }
  ];

  const dockIcons = [
    { 
      icon: () => <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" 
        alt="X" 
        width="36" 
        height="36" 
        style={{filter: 'brightness(0) invert(1)'}}
      />,
      name: 'X',
      action: () => openUrl('https://x.com/babywen_CTO')
    },
    { 
      icon: () => <img 
        src="https://www.svgviewer.dev/static-svgs/406050/social-telegram.svg" 
        alt="Telegram" 
        width="48" 
        height="48" 
        style={{filter: 'brightness(0) invert(1)'}}
      />,
      name: 'Telegram',
      action: () => openUrl('https://t.me/babywenportal')
    },
    { 
      icon: BarChart3, 
      name: 'DexScreener', 
      action: () => openUrl('https://dexscreener.com')
    }
  ];

  return (
    <div 
      className="h-screen w-screen bg-cover bg-center relative overflow-hidden bg-gray-900"
      style={{ backgroundImage: 'url(https://i.imgur.com/168l3G5.png)' }}
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
      <div className="absolute top-12 left-4 space-y-4">
        {desktopIcons.map((icon, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer group"
            onClick={icon.action}
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
      {windows.map((window) => (
        !window.isMinimized && (
          <div
            key={window.id}
            className="absolute bg-black/40 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/5 overflow-hidden"
            style={{
              left: window.position.x,
              top: window.position.y,
              zIndex: window.zIndex,
              width: '90vw',
              maxWidth: '600px',
              height: '80vh',
              maxHeight: '400px',
            }}
          >
            <div
              className="h-8 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-3 cursor-move relative"
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <div className="flex items-center space-x-2 text-white/80">
                <window.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{window.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => minimizeWindow(window.id, e)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group"
                >
                  <Minus className="w-4 h-4 text-white/70 group-hover:text-white/90" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group"
                >
                  <X className="w-4 h-4 text-white/70 group-hover:text-white/90" />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-auto">
              {window.content}
            </div>
          </div>
        )
      ))}

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex items-end space-x-2 bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
          {dockIcons.map((icon, index) => (
            <div key={index} className="group flex flex-col items-center relative">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                             text-white/90 text-xs absolute -top-8 backdrop-blur-2xl px-2 py-1 rounded-md bg-black/40
                             font-medium whitespace-nowrap">
                {icon.name}
              </span>
              <div
                onClick={icon.action}
                className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-2xl 
                          hover:bg-white/10 transition-all duration-200 transform hover:scale-110 hover:-translate-y-2 cursor-pointer
                          border border-white/5"
              >
                {typeof icon.icon === 'function' ? icon.icon() : <icon.icon className="w-8 h-8 text-white/90" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;