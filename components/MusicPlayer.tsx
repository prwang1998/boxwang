'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Song, PlayUrl, QualityLevel, QUALITY_OPTIONS } from '@/types/music';
import { useTheme } from '@/app/theme-context';

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
  currentQuality?: QualityLevel;
  onQualityChange?: (quality: QualityLevel) => void;
}

const MODE_LIST: PlayMode[] = ['sequential', 'shuffle', 'loop', 'single'];

const MODE_INFO: Record<PlayMode, { label: string; icon: JSX.Element }> = {
  sequential: {
    label: '顺序播放',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    ),
  },
  shuffle: {
    label: '随机播放',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    ),
  },
  loop: {
    label: '列表循环',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  single: {
    label: '单曲循环',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        <text x="12" y="14" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1</text>
      </svg>
    ),
  },
};

export default function MusicPlayer({ song, playUrl, loading, playlist, currentIndex, onPlayIndex, playMode, onPlayModeChange, onOpenPlayerPage, onStateChange, currentQuality = 'exhigh', onQualityChange }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (playUrl?.url && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = playUrl.url;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [playUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    onStateChange?.({ isPlaying, currentTime, duration, togglePlay, seek: seekTo });
  }, [isPlaying, currentTime, duration, togglePlay, seekTo, onStateChange]);

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
          <div
            className="absolute bottom-20 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-80 max-h-96 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            style={{
              background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(26,26,26,0.95)',
              border: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(255,255,255,0.06)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: isLight ? '1px solid rgba(180,150,100,0.12)' : '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="font-semibold text-obsidian-50 text-sm">播放列表 ({playlist.length})</h3>
              <button onClick={() => setShowPlaylist(false)} className="text-obsidian-100 hover:text-obsidian-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {playlist.length === 0 ? (
                <div className="p-6 text-center text-obsidian-100 text-sm">暂无歌曲</div>
              ) : playlist.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 ${
                    currentIndex === index
                      ? 'bg-primary/10 text-primary'
                      : 'text-obsidian-50'
                  }`}
                  style={currentIndex !== index ? {
                    ['--hover-bg' as string]: isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)',
                  } : {}}
                  onMouseEnter={e => { if (currentIndex !== index) (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (currentIndex !== index) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  onClick={() => { onPlayIndex(index); setShowPlaylist(false); }}
                >
                  <span className="w-6 text-center text-xs text-obsidian-100">
                    {currentIndex === index ? (
                      <div className="w-3.5 h-3.5 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                      </div>
                    ) : index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-xs text-obsidian-100 truncate">{item.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Bar — Floating Island */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-6 pb-4"
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        {/* 封面色彩环境光晕 */}
        <div id="player-ambient-glow" className="player-ambient-glow" />
        <div
          className="backdrop-blur-3xl rounded-2xl md:rounded-3xl"
          style={{
            pointerEvents: 'auto',
            background: isLight
              ? 'rgba(255,255,255,0.92)'
              : 'rgba(14,10,7,0.88)',
            border: isLight
              ? '1px solid rgba(180,150,100,0.18)'
              : '1px solid rgba(232,168,73,0.1)',
            boxShadow: isLight
              ? '0 -2px 0 rgba(255,255,255,0.8) inset, 0 8px 40px rgba(100,80,50,0.1), 0 2px 8px rgba(100,80,50,0.06)'
              : '0 1px 0 rgba(232,168,73,0.08) inset, 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} />
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-3">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-5">
            {/* Top row on mobile: song info + controls */}
            <div className="flex items-center gap-2 md:gap-5 w-full md:w-auto">
              {/* Song Info */}
              <div
                className={`flex items-center gap-2.5 min-w-0 flex-1 md:flex-none md:w-56 ${onOpenPlayerPage ? 'cursor-pointer hover:bg-white/[0.04] -mx-1 px-1.5 py-1 rounded-xl transition-all' : ''}`}
                onClick={onOpenPlayerPage}
              >
                {song.cover ? (
                  <img src={song.cover} alt="" className="w-10 h-10 md:w-11 md:h-11 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/[0.06]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-obsidian-100" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-obsidian-50 text-sm truncate">{song.name}</p>
                  <p className="text-xs text-obsidian-100 truncate">{song.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5 md:gap-1.5">
                <button
                  onClick={cyclePlayMode}
                  title={MODE_INFO[playMode].label}
                  className={`hidden md:flex w-9 h-9 rounded-lg items-center justify-center transition-all duration-200 ${
                    playMode === 'loop' || playMode === 'single'
                      ? 'text-primary bg-primary/10'
                      : 'text-obsidian-100 hover:text-obsidian-50 hover:bg-white/[0.04]'
                  }`}
                >
                  {MODE_INFO[playMode].icon}
                </button>

                <button onClick={handlePrev} className="w-8 h-8 md:w-9 md:h-9 rounded-lg text-obsidian-100 hover:text-obsidian-50 hover:bg-white/[0.04] flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                </button>

                <button onClick={togglePlay} disabled={loading} className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary text-obsidian-700 flex items-center justify-center hover:bg-primary-hover transition-all duration-200 disabled:opacity-40 shadow-lg shadow-primary/25 hover:shadow-glow active:scale-95">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-obsidian-700/30 border-t-obsidian-700"></div>
                  ) : isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  )}
                </button>

                <button onClick={handleNext} className="w-8 h-8 md:w-9 md:h-9 rounded-lg text-obsidian-100 hover:text-obsidian-50 hover:bg-white/[0.04] flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
                </button>

                {/* Quality button — desktop only */}
                {onQualityChange && (
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      title={playUrl?.level ? `当前播放: ${QUALITY_OPTIONS.find(q => q.value === playUrl.level)?.label || playUrl.level}` : '音质选择'}
                      className="h-7 px-2 rounded-md flex items-center justify-center transition-all duration-200 text-[11px] font-medium border"
                      style={{
                        background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(232,168,73,0.1)',
                        color: isLight ? '#8b6914' : '#e8a849',
                        borderColor: isLight ? 'rgba(139,105,20,0.2)' : 'rgba(232,168,73,0.2)',
                      }}
                    >
                      {playUrl?.level
                        ? (QUALITY_OPTIONS.find(q => q.value === playUrl.level)?.label || playUrl.level)
                        : (QUALITY_OPTIONS.find(q => q.value === currentQuality)?.label || 'HQ')
                      }
                    </button>

                    {/* Quality menu */}
                    {showQualityMenu && (
                      <div
                        className="absolute bottom-full right-0 mb-2 w-44 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-scale-in"
                        style={{
                          background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(26,26,26,0.95)',
                          border: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div className="p-1.5">
                          {QUALITY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                onQualityChange(option.value);
                                setShowQualityMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150"
                              style={{
                                background: currentQuality === option.value
                                  ? (isLight ? 'rgba(139,105,20,0.1)' : 'rgba(232,168,73,0.15)')
                                  : 'transparent',
                                color: currentQuality === option.value
                                  ? (isLight ? '#8b6914' : '#e8a849')
                                  : (isLight ? '#6b5e4f' : 'rgba(255,255,255,0.7)'),
                              }}
                              onMouseEnter={e => {
                                if (currentQuality !== option.value) {
                                  e.currentTarget.style.background = isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (currentQuality !== option.value) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div>
                                <span className="text-sm font-medium">{option.label}</span>
                                <span className="text-[10px] ml-1.5 opacity-60">{option.description}</span>
                              </div>
                              {currentQuality === option.value && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Playlist button — always visible */}
                <button onClick={() => setShowPlaylist(!showPlaylist)} className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${showPlaylist ? 'bg-primary/15 text-primary' : 'text-obsidian-100 hover:text-obsidian-50 hover:bg-white/[0.04]'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
              </div>
            </div>

            {/* Bottom row on mobile: progress bar + volume */}
            <div className="flex items-center gap-2 md:gap-3 md:flex-1 mt-1 md:mt-0">
              <span className="text-[10px] md:text-xs text-obsidian-100 w-9 md:w-10 text-right font-mono">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-1" />
              <span className="text-[10px] md:text-xs text-obsidian-100 w-9 md:w-10 font-mono">{formatTime(duration)}</span>

              {/* Volume — desktop only */}
              <div className="hidden md:flex items-center gap-2 ml-2">
                <svg className="w-4 h-4 text-obsidian-100" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-20" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
