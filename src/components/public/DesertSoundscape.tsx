'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Wind, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoundTrack {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  volume: number;
}

export default function DesertSoundscape() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.3);
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { name: 'Wind', icon: Wind, color: 'text-blue-400', volume: 0.6 },
    { name: 'Fire', icon: Flame, color: 'text-orange-400', volume: 0.4 },
    { name: 'Drums', icon: () => <span className="text-lg">🥁</span>, color: 'text-yellow-400', volume: 0.3 },
  ]);

  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Web Audio API for procedural sounds
    if (isEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        startAmbientSounds();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    } else if (!isEnabled && audioContextRef.current) {
      stopAmbientSounds();
    }

    return () => {
      stopAmbientSounds();
    };
  }, [isEnabled]);

  const createDesertWind = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(60 + Math.random() * 40, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(tracks[0].volume * masterVolume * 0.08, ctx.currentTime + 1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 6);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 6);
  };

  const createFireCrackle = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05 * tracks[1].volume * masterVolume;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  };

  const createDrumBeat = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(tracks[2].volume * masterVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const startAmbientSounds = () => {
    if (soundIntervalRef.current) return;
    
    // Wind every 8-15 seconds
    const windInterval = setInterval(() => {
      if (Math.random() > 0.3) createDesertWind();
    }, 8000 + Math.random() * 7000);
    
    // Fire crackles every 2-5 seconds
    const fireInterval = setInterval(() => {
      if (Math.random() > 0.4) createFireCrackle();
    }, 2000 + Math.random() * 3000);
    
    // Distant drums every 20-40 seconds
    const drumInterval = setInterval(() => {
      if (Math.random() > 0.7) createDrumBeat();
    }, 20000 + Math.random() * 20000);
    
    soundIntervalRef.current = setInterval(() => {
      // Keep intervals alive
    }, 1000);
    
    // Store intervals for cleanup
    (soundIntervalRef.current as any).intervals = [windInterval, fireInterval, drumInterval];
  };

  const stopAmbientSounds = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      if ((soundIntervalRef.current as any).intervals) {
        (soundIntervalRef.current as any).intervals.forEach(clearInterval);
      }
      soundIntervalRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const toggleSound = () => {
    setIsEnabled(!isEnabled);
  };

  const updateTrackVolume = (trackIndex: number, volume: number) => {
    setTracks(prev => prev.map((track, index) => 
      index === trackIndex ? { ...track, volume } : track
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-40"
    >
      {/* Sound Control Panel */}
      <motion.div
        className="relative"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Main Sound Toggle */}
        <motion.div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
            backdrop-blur-sm border-2 shadow-lg transition-all duration-300
            ${isEnabled 
              ? 'bg-gradient-to-br from-orange-500 to-red-500 border-yellow-300/50' 
              : 'bg-gray-600/80 border-gray-400/50'
            }
          `}
          onClick={toggleSound}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isEnabled 
              ? ['0 0 15px rgba(249, 115, 22, 0.5)', '0 0 25px rgba(249, 115, 22, 0.8)', '0 0 15px rgba(249, 115, 22, 0.5)']
              : '0 4px 15px rgba(0, 0, 0, 0.3)',
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {isEnabled ? (
            <Volume2 className="h-5 w-5 text-white drop-shadow-lg" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-300" />
          )}
        </motion.div>

        {/* Sound Status Indicator */}
        {isEnabled && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && isEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-sm rounded-xl p-3 border border-orange-300/30 shadow-2xl min-w-[180px]"
            >
              <div className="text-center mb-3">
                <h3 className="text-white font-semibold text-sm mb-1">Desert Sounds</h3>
                <p className="text-orange-300 text-xs">Ambient soundscape</p>
              </div>

              {/* Master Volume */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs">Volume</span>
                  <span className="text-orange-300 text-xs">{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Individual Track Controls */}
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div key={track.name} className="flex items-center space-x-2">
                    <track.icon className={`h-3 w-3 ${track.color}`} />
                    <span className="text-white text-xs flex-1">{track.name}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={track.volume}
                      onChange={(e) => updateTrackVolume(index, parseFloat(e.target.value))}
                      className="w-12 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Sound Visualization */}
              <div className="mt-3 flex justify-center space-x-1">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full"
                    animate={{
                      height: [2, 8 + Math.random() * 6, 2],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Instruction */}
        {!isExpanded && isEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute -top-6 right-0 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded-full shadow-sm whitespace-nowrap"
          >
            Hover for controls 🎵
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
