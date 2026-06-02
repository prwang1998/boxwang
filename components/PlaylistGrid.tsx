'use client';

import { useState, useEffect, useRef } from 'react';
import { Playlist } from '@/types/music';
import { useTheme } from '@/app/theme-context';
import CountUp from './CountUp';

type LayoutMode = '3' | '5';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
}

const LAYOUT_OPTIONS: { key: LayoutMode; label: string }[] = [
  { key: '3', label: '三列' },
  { key: '5', label: '五列' },
];

export default function PlaylistGrid({ playlists, onPlaylistClick }: PlaylistGridProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('3');
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.playlist-card-reveal');
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [playlists]);

  const formatPlayCount = (count: number): string => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`;
    if (count >= 10000) return `${Math.floor(count / 10000)}万`;
    return count.toString();
  };

  if (playlists.length === 0) return null;

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {playlists.map((playlist, index) => (
        <div
          key={playlist.id}
          className="cursor-pointer group playlist-card-reveal"
          style={{ '--reveal-delay': `${index * 40}ms` } as React.CSSProperties}
          onClick={() => onPlaylistClick(playlist)}
        >
          {/* Double-Bezel outer shell — Spotlight Border */}
          <div
            className="spotlight-border relative aspect-square rounded-2xl p-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
            style={{
              background: isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)',
              border: '1px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: isLight
                ? 'var(--card-shadow-light, 0 2px 20px rgba(100,80,50,0.06))'
                : 'var(--card-shadow-dark, 0 2px 20px rgba(0,0,0,0.3))',
              transition: 'all 0.5s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
              const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
              e.currentTarget.style.setProperty('--spotlight-x', `${x}%`);
              e.currentTarget.style.setProperty('--spotlight-y', `${y}%`);
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = isLight
                ? '0 20px 60px rgba(180,120,50,0.18), 0 4px 20px rgba(180,120,50,0.1)'
                : '0 20px 60px rgba(232,168,73,0.18), 0 4px 20px rgba(232,168,73,0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = isLight
                ? 'rgba(139,105,20,0.3)'
                : 'rgba(232,168,73,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = isLight
                ? '0 2px 20px rgba(100,80,50,0.06)'
                : '0 2px 20px rgba(0,0,0,0.3)';
              (e.currentTarget as HTMLElement).style.borderColor = isLight
                ? 'rgba(180,150,100,0.12)'
                : 'rgba(255,255,255,0.06)';
            }}
          >
            {/* Double-Bezel inner core */}
            <div
              className="relative w-full h-full rounded-[calc(1rem-0.25rem)] overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
              }}
            >
              {playlist.cover ? (
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PS4zZW0iPvCfkpE8L3RleHQ+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                  <span className="text-obsidian-100 text-4xl opacity-30">♪</span>
                </div>
              )}
              {/* Play count */}
              {playlist.playCount > 0 && (
                <div
                  className="absolute top-2 right-2 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                  style={{
                    background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.65)',
                    color: isLight ? '#6b5e4f' : 'rgba(255,255,255,0.9)',
                  }}
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <CountUp
                    value={playlist.playCount}
                    format={formatPlayCount}
                    duration={800}
                  />
                </div>
              )}
              {/* Hover overlay + play button */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.25)' }}
              >
                <div
                  className="w-1 h-1 p-0 rounded-full bg-primary/90 flex items-center justify-center scale-50 group-hover:scale-100 group-hover:w-11 group-hover:h-11 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-glow"
                >
                  <svg className="w-4 h-4 text-obsidian-700 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-sm font-medium text-obsidian-50 line-clamp-2 group-hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] leading-snug tracking-[-0.01em]">
            {playlist.name}
          </p>
          <p className="text-[11px] text-obsidian-100 mt-0.5 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>{playlist.trackCount} 首</p>
        </div>
      ))}
    </div>
  );
}
