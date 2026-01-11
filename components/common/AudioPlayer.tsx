
import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  file: File;
  seekToTime?: number | null;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ file, seekToTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !file || !(file instanceof File) || !file.size) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#DCD3C9', // beige-300
      progressColor: '#BC8A5F', // khaki-700
      cursorColor: '#4A403A', // brown-800
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      height: 60,
      normalize: true,
      url: URL.createObjectURL(file),
    });

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [file]);

  // Handle external seek requests
  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && waveSurferRef.current) {
      waveSurferRef.current.setTime(seekToTime);
      waveSurferRef.current.play();
    }
  }, [seekToTime]);

  const togglePlay = useCallback(() => {
    waveSurferRef.current?.playPause();
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!waveSurferRef.current) return;
    const newTime = waveSurferRef.current.getCurrentTime() + seconds;
    waveSurferRef.current.setTime(Math.max(0, Math.min(duration, newTime)));
  }, [duration]);

  const toggleMute = useCallback(() => {
    if (!waveSurferRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    waveSurferRef.current.setVolume(nextMuted ? 0 : volume);
  }, [isMuted, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    waveSurferRef.current?.setVolume(val);
  };

  if (!(file instanceof File) || !file.size) {
      return (
          <div className="p-4 bg-beige-100 rounded-xl border border-beige-200 text-center text-brown-500 text-sm italic">
            Audio playback is not available for historical items.
          </div>
      );
  }

  return (
    <div className="bg-white/40 border border-beige-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div ref={containerRef} className="w-full" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button onClick={() => skip(-5)} className="p-2 text-brown-500 hover:bg-beige-200 rounded-lg transition-colors" title="Back 5s">
            <RotateCcw size={18} />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 flex items-center justify-center bg-khaki-600 text-white rounded-full hover:bg-khaki-700 transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
          </button>

          <button onClick={() => skip(5)} className="p-2 text-brown-500 hover:bg-beige-200 rounded-lg transition-colors" title="Forward 5s">
            <RotateCw size={18} />
          </button>

          <div className="ml-2 font-mono text-xs text-brown-500 min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto px-4">
          <button onClick={toggleMute} className="text-brown-500 hover:text-khaki-700 transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolumeChange}
            className="w-24 h-1.5 bg-beige-300 rounded-lg appearance-none cursor-pointer accent-khaki-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
