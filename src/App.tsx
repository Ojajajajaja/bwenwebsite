import React, { useState, useEffect } from 'react';
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
  const [taskbarHeight, setTaskbarHeight] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

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

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... (rest of the component code remains unchanged)

  return (
    <div className="h-screen w-screen bg-cover bg-center relative overflow-hidden bg-gray-900"
         style={{ 
           backgroundImage: 'url(https://www.emana.io/wp-content/uploads/2021/02/Purple-and-Blue-Space-4k-Ultra-HD-Wallpaper-Background--scaled.jpg)',
           height: '100vh',
           width: '100vw',
         }}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}>
      {/* Menu Bar */}
      <div id="taskbar" className="h-8 bg-black/40 backdrop-blur-2xl text-white px-4 flex items-center justify-between border-b border-white/5">
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
            <div className="h-[calc(100%-2rem)] overflow-auto">
              {window.content}
            </div>
          </div>
        );
      })}

      {/* Dock */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
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
