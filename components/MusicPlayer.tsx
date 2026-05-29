'use client';

import { useState, useRef, useEffect } from 'react';
import { Song, PlayUrl } from '@/types/music';

type PlayMode = 'sequential' | 'shuffle' | 'loop' | 'single';

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  seek: (time: number) => void;
}

interface MusicPlayerProps {
  song: Song | null;
  playUrl: PlayUrl | null;
  loading: boolean;
  playlist: Song[];
  currentIndex: number;
  onPlayIndex: (index: number) => void;
  playMode: PlayMode;
  onPlayModeChange: (mode: PlayMode) => void;
  onOpenPlayerPage?: () => void;
  onStateChange?: (state: MusicPlayerState) => void;
}

const MODE_LIST: PlayMode[] = ['sequential', 'shuffle', 'loop', 'single'];

const MODE_INFO: Record<PlayMode, { label: string; icon: JSX.Element }> = {
  sequential: {
    label: '顺序播放',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
  },
  shuffle: {
    label: '随机播放',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    ),
  },
  loop: {
    label: '列表循环',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  single: {
    label: '单曲循环',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        <text x="12" y="14" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">1</text>
      </svg>
    ),
  },
};

export default function MusicPlayer({ song, playUrl, loading, playlist, currentIndex, onPlayIndex, playMode, onPlayModeChange, onOpenPlayerPage, onStateChange }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    if (playUrl?.url && audioRef.current) {
      audioRef.current.src = playUrl.url;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [playUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Report state to parent
  useEffect(() => {
    onStateChange?.({ isPlaying, currentTime, duration, togglePlay, seek: seekTo });
  }, [isPlaying, currentTime, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const getNextIndex = (): number => {
    if (playlist.length === 0) return -1;
    switch (playMode) {
      case 'single':
        return currentIndex;
      case 'shuffle':
        if (playlist.length <= 1) return 0;
        let r;
        do { r = Math.floor(Math.random() * playlist.length); } while (r === currentIndex);
        return r;
      case 'loop':
        return (currentIndex + 1) % playlist.length;
      case 'sequential':
      default:
        return currentIndex < playlist.length - 1 ? currentIndex + 1 : -1;
    }
  };

  const getPrevIndex = (): number => {
    if (playlist.length === 0) return -1;
    switch (playMode) {
      case 'shuffle':
        if (playlist.length <= 1) return 0;
        let r;
        do { r = Math.floor(Math.random() * playlist.length); } while (r === currentIndex);
        return r;
      default:
        return currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    }
  };

  const handlePrev = () => {
    const idx = getPrevIndex();
    if (idx >= 0) onPlayIndex(idx);
  };

  const handleNext = () => {
    const idx = getNextIndex();
    if (idx >= 0) onPlayIndex(idx);
  };

  const handleEnded = () => {
    const idx = getNextIndex();
    if (idx >= 0) {
      onPlayIndex(idx);
    } else {
      setIsPlaying(false);
    }
  };

  const cyclePlayMode = () => {
    const i = MODE_LIST.indexOf(playMode);
    onPlayModeChange(MODE_LIST[(i + 1) % MODE_LIST.length]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) return null;

  return (
    <>
      {/* Playlist Panel */}
      {showPlaylist && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPlaylist(false)}>
          <div className="absolute bottom-20 right-4 w-80 max-h-96 bg-white rounded-lg shadow-2xl border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">播放列表 ({playlist.length})</h3>
              <button onClick={() => setShowPlaylist(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {playlist.length === 0 ? (
                <div className="p-4 text-center text-gray-400">暂无歌曲</div>
              ) : playlist.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${currentIndex === index ? 'bg-blue-50 text-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                  onClick={() => { onPlayIndex(index); setShowPlaylist(false); }}
                >
                  <span className="w-6 text-center text-sm text-gray-400">
                    {currentIndex === index ? (
                      <svg className="w-4 h-4 text-primary mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    ) : index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} />
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Song Info */}
            <div
              className={`flex items-center gap-3 flex-1 min-w-0 ${onOpenPlayerPage ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors' : ''}`}
              onClick={onOpenPlayerPage}
            >
              {song.cover && (
                <img src={song.cover} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{song.name}</p>
                <p className="text-sm text-gray-500 truncate">{song.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Play Mode */}
              <button
                onClick={cyclePlayMode}
                title={MODE_INFO[playMode].label}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${playMode === 'loop' ? 'text-primary' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                {MODE_INFO[playMode].icon}
              </button>

              {/* Prev */}
              <button onClick={handlePrev} className="w-9 h-9 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
              </button>

              {/* Play/Pause */}
              <button onClick={togglePlay} disabled={loading} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                )}
              </button>

              {/* Next */}
              <button onClick={handleNext} className="w-9 h-9 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
              </button>
            </div>

            {/* Progress */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-gray-500 w-12">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <span className="text-sm text-gray-500 w-12">{formatTime(duration)}</span>
            </div>

            {/* Volume & Playlist */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <button onClick={() => setShowPlaylist(!showPlaylist)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showPlaylist ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
