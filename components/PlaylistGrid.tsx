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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {playlists.map((playlist, index) => (
        <div
          key={playlist.id}
          className="cursor-pointer group animate-slide-up"
          style={{ animationDelay: `${index * 0.03}s` }}
          onClick={() => onPlaylistClick(playlist)}
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-white/[0.06] group-hover:border-primary/20 group-hover:shadow-glow transition-all duration-300">
            {playlist.cover ? (
              <img
                src={playlist.cover}
                alt={playlist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PS4zZW0iPvCfkpE8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                <span className="text-obsidian-100 text-4xl opacity-30">♪</span>
              </div>
            )}
            {/* Play count overlay */}
            {playlist.playCount > 0 && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {formatPlayCount(playlist.playCount)}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-glow">
                <svg className="w-4 h-4 text-obsidian-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-sm text-obsidian-50 line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-snug">
            {playlist.name}
          </p>
          <p className="text-[11px] text-obsidian-100 mt-0.5">{playlist.trackCount}首</p>
        </div>
      ))}
    </div>
  );
}
