import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Jupiter: any;
  }
}

const JupiterSwap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://terminal.jup.ag/main-v2.js';
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
      };

      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded && containerRef.current && window.Jupiter) {
      const initJupiter = () => {
        try {
          window.Jupiter.init({
            displayMode: 'integrated',
            integratorId: 'BabyWen-Desktop',
            elementId: containerRef.current?.id,
            defaultExplorer: 'Solana Explorer',
            defaultRoute: 'swap',
            strictTokenList: false,
            widgetStyle: {
              position: 'relative',
              width: '100%',
              height: '100%',
            },
          });
        } catch (error) {
          console.error('Error initializing Jupiter Terminal:', error);
        }
      };

      // Delay initialization to ensure the element is in the DOM
      setTimeout(initJupiter, 100);
    }
  }, [scriptLoaded]);

  return <div id="jupiter-terminal" ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default JupiterSwap;
