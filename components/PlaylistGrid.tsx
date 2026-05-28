'use client';

import { Playlist } from '@/types/music';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
}

export default function PlaylistGrid({ playlists, onPlaylistClick }: PlaylistGridProps) {
  const formatPlayCount = (count: number): string => {
    if (count >= 100000000) {
      return `${(count / 100000000).toFixed(1)}亿`;
    }
    if (count >= 10000) {
      return `${Math.floor(count / 10000)}万`;
    }
    return count.toString();
  };

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="cursor-pointer group"
          onClick={() => onPlaylistClick(playlist)}
        >
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
            {playlist.cover ? (
              <img
                src={playlist.cover}
                alt={playlist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PS4zZW0iPvCfkpE8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">♪</span>
              </div>
            )}
            {/* Play count overlay */}
            {playlist.playCount > 0 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {formatPlayCount(playlist.playCount)}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
            {playlist.name}
          </p>
          <p className="text-xs text-gray-500">{playlist.trackCount}首</p>
        </div>
      ))}
    </div>
  );
}
