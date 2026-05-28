'use client';

import { useState } from 'react';
import { Song } from '@/types/music';

interface MusicListProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  currentSong: Song | null;
  onPlayNext?: (song: Song) => void;
}

export default function MusicList({ songs, onPlay, currentSong, onPlayNext }: MusicListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePlayNext = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (!onPlayNext) return;
    onPlayNext(song);
    setAddedIds(prev => new Set(prev).add(song.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(song.id); return n; }), 1500);
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

            {/* Right Side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {song.album && (
                <span className="text-sm text-gray-400 hidden md:block max-w-[120px] truncate">{song.album}</span>
              )}
              {formatDuration(song.duration) && (
                <span className="text-sm text-gray-400 hidden sm:block">{formatDuration(song.duration)}</span>
              )}

              {/* Play Next Button */}
              {onPlayNext && (
                <button
                  onClick={(e) => handlePlayNext(e, song)}
                  title="下一首播放"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm ${
                    addedIds.has(song.id) ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-primary hover:bg-blue-50'
                  }`}
                >
                  {addedIds.has(song.id) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  )}
                </button>
              )}

              {/* Play Button */}
              <button
                onClick={(e) => { e.stopPropagation(); onPlay(song); }}
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
                  <img src={song.cover} alt={song.name} className="w-32 h-32 object-cover rounded-lg shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{song.name}</h3>
                  <p className="text-gray-600 mt-1">{song.artist}</p>
                  {song.album && <p className="text-gray-500 text-sm mt-1">专辑: {song.album}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => onPlay(song)} className="px-6 py-2 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors">播放歌曲</button>
                    {onPlayNext && (
                      <button onClick={() => handlePlayNext(new MouseEvent('click') as any, song)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors">下一首播放</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
