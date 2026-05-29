'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from '@/types/music';

type PlayMode = 'sequential' | 'shuffle' | 'loop' | 'single';

interface PlayerPageProps {
  song: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playMode: PlayMode;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onCycleMode: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
}

interface LyricLine {
  time: number;
  text: string;
}

function parseLyric(lrc: string): LyricLine[] {
  if (!lrc) return [];
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/g;
  let match;
  while ((match = regex.exec(lrc)) !== null) {
    const min = parseInt(match[1]);
    const sec = parseInt(match[2]);
    const ms = parseInt(match[3].padEnd(3, '0'));
    const time = min * 60 + sec + ms / 1000;
    const text = match[4].trim();
    if (text) lines.push({ time, text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

const MODE_LABELS: Record<PlayMode, string> = {
  sequential: '顺序',
  shuffle: '随机',
  loop: '循环',
  single: '单曲',
};

const MODE_ICONS: Record<PlayMode, JSX.Element> = {
  sequential: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  shuffle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>,
  loop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  single: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /><text x="12" y="14" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">1</text></svg>,
};

export default function PlayerPage({ song, isPlaying, currentTime, duration, playMode, onTogglePlay, onPrev, onNext, onCycleMode, onSeek, onClose }: PlayerPageProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyric, setLoadingLyric] = useState(false);
  const lyricListRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const [coverRotation, setCoverRotation] = useState(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(Date.now());

  // Fetch lyrics
  useEffect(() => {
    let cancelled = false;
    const fetchLyric = async () => {
      setLoadingLyric(true);
      try {
        const res = await fetch(`/api/music/lyric?id=${song.id}&source=${song.source}`);
        const data = await res.json();
        if (!cancelled) {
          setLyrics(parseLyric(data.lyric || ''));
        }
      } catch {
        if (!cancelled) setLyrics([]);
      } finally {
        if (!cancelled) setLoadingLyric(false);
      }
    };
    fetchLyric();
    return () => { cancelled = true; };
  }, [song.id, song.source]);

  // Cover rotation animation
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (isPlaying) {
        setCoverRotation(prev => (prev + delta * 30) % 360);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    lastTimeRef.current = Date.now();
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  // Find current lyric index
  const currentLyricIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, lyrics]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (currentLyricIndex < 0 || !lyricListRef.current) return;
    const container = lyricListRef.current;
    const activeEl = container.children[currentLyricIndex] as HTMLElement;
    if (activeEl) {
      const containerHeight = container.clientHeight;
      const offset = activeEl.offsetTop - containerHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    }
  }, [currentLyricIndex]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const cover = song.cover || '';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col text-white overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 z-0">
        {cover ? (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})`, filter: 'blur(60px) brightness(0.3)', transform: 'scale(1.3)' }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="font-semibold truncate">{song.name}</p>
          <p className="text-sm text-white/60 truncate">{song.artist}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left: Cover */}
        <div className="flex-1 flex items-center justify-center">
          {/* Vinyl disc */}
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-900 to-gray-700 shadow-2xl" />
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-white/5" />
            <div className="absolute inset-6 rounded-full border border-white/5" />
            <div className="absolute inset-10 rounded-full border border-white/5" />
            {/* Cover */}
            <div
              ref={coverRef}
              className="absolute inset-12 rounded-full overflow-hidden shadow-xl"
              style={{ transform: `rotate(${coverRotation}deg)` }}
            >
              {cover ? (
                <img src={cover} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-4xl">♪</span>
                </div>
              )}
            </div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-600 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div
            ref={lyricListRef}
            className="w-full max-w-md h-[60vh] overflow-y-auto scrollbar-hide"
            style={{ maskImage: 'linear-gradient(transparent, black 15%, black 85%, transparent)' }}
          >
            {loadingLyric ? (
              <div className="flex items-center justify-center h-full text-white/40">加载歌词中...</div>
            ) : lyrics.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/40">暂无歌词</div>
            ) : (
              <div className="py-[30vh] space-y-4">
                {lyrics.map((line, i) => (
                  <p
                    key={i}
                    className={`text-center transition-all duration-500 cursor-pointer ${
                      i === currentLyricIndex
                        ? 'text-white text-lg font-semibold scale-105'
                        : 'text-white/30 text-base hover:text-white/50'
                    }`}
                    onClick={() => onSeek(line.time)}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-8 pt-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-white/50 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max={duration || 0} value={currentTime}
            onChange={e => onSeek(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-xs text-white/50 w-10">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={onCycleMode} title={MODE_LABELS[playMode]} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
            {MODE_ICONS[playMode]}
          </button>
          <button onClick={onPrev} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
          </button>
          <button onClick={onTogglePlay} className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition-colors">
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            )}
          </button>
          <button onClick={onNext} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
          </button>
          <div className="w-10" />
        </div>
      </div>

      {/* Hide scrollbar style */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
