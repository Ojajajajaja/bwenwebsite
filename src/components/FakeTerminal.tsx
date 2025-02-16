import React, { useState, useEffect, useRef } from 'react';

const FakeTerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>(['Welcome to BabyWen Terminal.']);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput('');
  };

  const processCommand = (command: string) => {
    setOutput([...output, `$ ${command}`]);
    
    // Easter egg commands
    const easterEggs = {
      'test': 'test',
      'hello': 'Hello, BabyWen enthusiast!',
      'babywen': 'BabyWen is the future of decentralized finance!',
      'moon': 'To the moon and beyond! 🚀🌕',
      'clear': () => setOutput([]),
    };

    // Obfuscated easter egg processing
    const processEasterEgg = (cmd: string) => {
      const result = (easterEggs as any)[cmd];
      return typeof result === 'function' ? result() : result;
    };

    const response = processEasterEgg(command.toLowerCase()) || `Command not found: ${command}`;
    
    if (response !== undefined) {
      setOutput(prev => [...prev, response]);
    }
  };

  return (
    <div className="bg-transparent text-green-400 p-4 font-mono h-full flex flex-col">
      <div 
        ref={terminalRef} 
        className="flex-grow overflow-y-auto mb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`
            #terminal-output::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div id="terminal-output">
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <span className="mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow bg-transparent outline-none"
          autoFocus
        />
      </form>
    </div>
  );
};

export default FakeTerminal;
