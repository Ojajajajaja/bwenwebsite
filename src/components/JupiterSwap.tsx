import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Jupiter: any;
  }
}

const JupiterSwap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadJupiterTerminal = async () => {
      if (typeof window.Jupiter !== 'undefined') {
        new window.Jupiter.Terminal({
          containerElement: containerRef.current,
          integratorId: 'BabyWen-Desktop',
          displayMode: 'integrated',
          defaultExplorer: 'Solana Explorer',
          defaultRoute: 'swap',
          strictTokenList: false,
          widgetStyle: {
            position: 'relative',
            width: '100%',
            height: '100%',
          },
        });
      } else {
        console.error('Jupiter Terminal not loaded');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v2.js';
    script.async = true;
    script.onload = loadJupiterTerminal;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default JupiterSwap;
