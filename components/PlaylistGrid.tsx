'use client';

import { useState, useCallback } from 'react';
import { Playlist } from '@/types/music';

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

  const formatPlayCount = (count: number): string => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`;
    if (count >= 10000) return `${Math.floor(count / 10000)}万`;
    return count.toString();
  };

  if (playlists.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Layout switcher */}
      <div className="flex items-center gap-1 p-1 bg-surface/40 rounded-xl border border-white/[0.04] w-fit">
        {LAYOUT_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => setLayoutMode(option.key)}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${layoutMode === option.key
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-glow'
                : 'text-obsidian-100/60 hover:text-obsidian-50 hover:bg-white/[0.04] border border-transparent'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Grid layout */}
      <div className={`grid gap-3 sm:gap-4 md:gap-5 ${
        layoutMode === '5' ? 'grid-cols-5' : 'grid-cols-3'
      }`}>
        {playlists.map((playlist, index) => (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            index={index}
            onClick={() => onPlaylistClick(playlist)}
            formatPlayCount={formatPlayCount}
          />
        ))}
      </div>
    </div>
  );
}

interface PlaylistItemProps {
  playlist: Playlist;
  index: number;
  onClick: () => void;
  formatPlayCount: (count: number) => string;
}

function PlaylistItem({ playlist, index, onClick, formatPlayCount }: PlaylistItemProps) {
  return (
    <div
      className="cursor-pointer group animate-slide-up"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-xl overflow-visible">
        {/* === 动态光晕边框（悬浮显示） === */}
        <div className="absolute -inset-[4px] rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {/* 外层大光晕 */}
          <div className="absolute -inset-3 rounded-2xl blur-xl" style={{
            background: 'radial-gradient(ellipse, rgba(232, 168, 73, 0.3), rgba(183, 110, 121, 0.2), transparent)',
            animation: 'glowPulse 2s ease-in-out infinite',
          }} />
          {/* 中层光晕 */}
          <div className="absolute -inset-1 rounded-xl blur-md" style={{
            background: 'radial-gradient(ellipse, rgba(240, 200, 120, 0.4), rgba(232, 168, 73, 0.2), transparent)',
            animation: 'glowPulse 2s ease-in-out infinite 0.5s',
          }} />
          {/* 内层高光边框 */}
          <div className="absolute inset-0 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(232, 168, 73, 0.6), rgba(240, 200, 120, 0.4), rgba(183, 110, 121, 0.5), rgba(232, 168, 73, 0.6))',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 3s ease infinite',
            padding: '2px',
            borderRadius: 'inherit',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }} />
        </div>

        {/* 封面容器 */}
        <div className="relative z-10 aspect-square rounded-xl overflow-hidden bg-surface group-hover:shadow-glow-xl transition-all duration-500">
          {/* Cover image — 悬浮放大 */}
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PS4zZW0iPvCfkpE8L3RleHQ+PC9zdmc+';
              }}
            />
          ) : (
            <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
              <span className="text-obsidian-100 text-4xl opacity-20">♪</span>
            </div>
          )}

          {/* Play count badge */}
          {playlist.playCount > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 border border-white/[0.06]">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {formatPlayCount(playlist.playCount)}
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Info below card */}
      <p className="mt-2 text-sm text-obsidian-50 line-clamp-2 leading-snug font-medium">
        {playlist.name}
      </p>
      <p className="text-[11px] text-obsidian-100/50 mt-0.5">{playlist.trackCount}首</p>
    </div>
  );
}
