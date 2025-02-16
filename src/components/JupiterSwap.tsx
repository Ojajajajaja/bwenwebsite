import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Jupiter: any;
  }
}

const JupiterSwap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v2.js';
    script.async = true;
    
    script.onload = () => {
      if (containerRef.current && window.Jupiter) {
        window.Jupiter.init({
          displayMode: 'integrated',
          integratorId: 'BabyWen-Desktop',
          elementId: 'jupiter-terminal',
          defaultExplorer: 'Solana Explorer',
          defaultRoute: 'swap',
          strictTokenList: false,
          widgetStyle: {
            position: 'relative',
            width: '100%',
            height: '100%',
          },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="jupiter-terminal" ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default JupiterSwap;
