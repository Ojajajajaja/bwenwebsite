import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const LofiPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initializeAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = 'https://live.hunter.fm/lofi_high';
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;

      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      analyserRef.current.fftSize = 256;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      initializeAudio().then(() => {
        if (audioContextRef.current && audioRef.current) {
          audioContextRef.current.resume().then(() => {
            audioRef.current?.play().catch(error => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
            });
          });
        }
      });

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        const draw = () => {
          // ... existing visualization code ...
        };

        draw();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="relative bg-black/60 backdrop-blur-lg p-4 rounded-b-lg w-full max-w-md overflow-hidden">
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'url(https://media1.giphy.com/media/26zzgaDnp9HgPX1uw/giphy.gif?cid=6c09b9521sm8b7ov8yl3wd6j9svpouy3caf33fbb201ylm41&ep=v1_gifs_search&rid=giphy.gif&ct=g)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
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
