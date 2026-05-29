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
  sequential: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>,
  shuffle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>,
  loop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  single: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /><text x="12" y="14" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1</text></svg>,
};

export default function PlayerPage({ song, isPlaying, currentTime, duration, playMode, onTogglePlay, onPrev, onNext, onCycleMode, onSeek, onClose }: PlayerPageProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyric, setLoadingLyric] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(Date.now());

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

  // Cover rotation — direct DOM manipulation, no setState
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (isPlaying) {
        rotationRef.current = (rotationRef.current + delta * 30) % 360;
        if (coverRef.current) {
          coverRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    lastTimeRef.current = Date.now();
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  const currentLyricIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, lyrics]);

  // Get 3 visible lyric lines: previous, current, next
  const visibleLyrics = useMemo(() => {
    if (currentLyricIndex < 0 || lyrics.length === 0) return [];
    const prev = currentLyricIndex > 0 ? lyrics[currentLyricIndex - 1] : null;
    const curr = lyrics[currentLyricIndex];
    const next = currentLyricIndex < lyrics.length - 1 ? lyrics[currentLyricIndex + 1] : null;
    return [prev, curr, next];
  }, [currentLyricIndex, lyrics]);

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
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})`, filter: 'blur(30px) brightness(0.45) saturate(1.2)', transform: 'scale(1.15)' }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-obsidian-400 to-obsidian-700" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5">
        <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className="text-center flex-1 min-w-0 px-4">
          <p className="font-lyric font-bold text-2xl truncate">{song.name}</p>
          <p className="font-lyric text-base text-white/50 truncate mt-1">{song.artist}</p>
        </div>
        <div className="w-11" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left: Cover */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-obsidian-600 to-obsidian-400 shadow-2xl" />
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-5 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-8 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-11 rounded-full border border-white/[0.04]" />
            {/* Cover */}
            <div
              ref={coverRef}
              className="absolute inset-14 rounded-full overflow-hidden shadow-xl ring-1 ring-white/[0.08]"
            >
              {cover ? (
                <img src={cover} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full bg-obsidian-400 flex items-center justify-center">
                  <span className="text-4xl opacity-30">♪</span>
                </div>
              )}
            </div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-obsidian-600 border-2 border-white/10 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Right: Lyrics — single line with slow fade */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {loadingLyric ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white/60"></div>
            </div>
          ) : lyrics.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-white/30 font-lyric text-sm">暂无歌词</div>
          ) : (
            <div className="w-full max-w-2xl h-48 flex items-center justify-center overflow-hidden">
              {currentLyricIndex >= 0 && lyrics[currentLyricIndex] ? (
                <p
                  key={currentLyricIndex}
                  className="text-4xl md:text-5xl font-lyric font-bold text-white cursor-pointer text-center leading-relaxed px-6 lyric-fade-in"
                  onClick={() => onSeek(lyrics[currentLyricIndex].time)}
                >
                  {lyrics[currentLyricIndex].text}
                </p>
              ) : (
                <p className="text-4xl md:text-5xl font-lyric font-bold text-white/10 text-center">
                  轻触播放，聆听旋律
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-8 pb-10 pt-4">
        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-white/40 w-11 text-right font-mono">{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max={duration || 0} value={currentTime}
            onChange={e => onSeek(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
          />
          <span className="text-xs text-white/40 w-11 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-8">
          <button onClick={onCycleMode} title={MODE_LABELS[playMode]} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white/50 hover:text-white">
            {MODE_ICONS[playMode]}
          </button>
          <button onClick={onPrev} className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
          </button>
          <button onClick={onTogglePlay} className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 backdrop-blur transition-all hover:shadow-glow active:scale-95">
            {isPlaying ? (
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-9 h-9 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            )}
          </button>
          <button onClick={onNext} className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
          </button>
          <div className="w-11" />
        </div>
      </div>
    </div>
  );
}
