import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const LofiPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio('https://live.hunter.fm/lofi_high');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#8A2387');
    gradient.addColorStop(0.5, '#E94057');
    gradient.addColorStop(1, '#F27121');

    const drawWave = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      for (let i = 0; i <= canvas.width; i++) {
        const y = Math.sin((i + time) * 0.05) * 20 + canvas.height / 2;
        ctx.lineTo(i, y);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      animationRef.current = requestAnimationFrame((t) => drawWave(t * 0.05));
    };

    drawWave(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative bg-black/60 backdrop-blur-lg p-4 rounded-lg w-full max-w-md overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-semibold">Lofi Radio</h2>
          <button
            onClick={togglePlay}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
        <div className="flex items-center">
          <Volume2 size={20} className="text-white mr-2" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-white bg-transparent"
            style={{
              WebkitAppearance: 'none',
              appearance: 'none',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LofiPlayer;
