'use client';

import { useState } from 'react';
import { Song } from '@/types/music';

interface MusicListProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  currentSong: Song | null;
}

export default function MusicList({ songs, onPlay, currentSong }: MusicListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (songs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>暂无搜索结果</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <div key={song.id} className="border rounded-lg overflow-hidden">
          <div
            className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              currentSong?.id === song.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => toggleExpand(song.id)}
          >
            {/* Cover Image */}
            <div className="w-12 h-12 flex-shrink-0">
              {song.cover ? (
                <img
                  src={song.cover}
                  alt={song.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9LjNlbSI+Tw90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-lg">♪</span>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{song.name}</p>
              <p className="text-sm text-gray-500 truncate">{song.artist}</p>
            </div>

            {/* Right Side Info */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {song.album && (
                <span className="text-sm text-gray-400 hidden md:block max-w-[120px] truncate">{song.album}</span>
              )}
              {formatDuration(song.duration) && (
                <span className="text-sm text-gray-400 hidden sm:block">{formatDuration(song.duration)}</span>
              )}
              <span className="text-xs px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                {song.source === 'kuwo' ? '酷我' : song.source === 'netease' ? '网易云' : 'MusicBox'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(song);
                }}
                className="px-4 py-1.5 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
              >
                播放
              </button>
            </div>
          </div>

          {expandedId === song.id && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-6">
                {song.cover && (
                  <img
                    src={song.cover}
                    alt={song.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{song.name}</h3>
                  <p className="text-gray-600 mt-1">{song.artist}</p>
                  {song.album && (
                    <p className="text-gray-500 text-sm mt-1">专辑: {song.album}</p>
                  )}
                  <button
                    onClick={() => onPlay(song)}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    播放歌曲
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
