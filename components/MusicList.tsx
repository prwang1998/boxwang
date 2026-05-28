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
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              currentSong?.id === song.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => toggleExpand(song.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{song.name}</p>
              <p className="text-sm text-gray-500 truncate">{song.artist}</p>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm text-gray-400">{song.album}</span>
              <span className="text-sm text-gray-400">{formatDuration(song.duration)}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                {song.source === 'kuwo' ? '酷我' : song.source === 'netease' ? '网易云' : '自定义'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(song);
                }}
                className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
              >
                播放
              </button>
            </div>
          </div>

          {expandedId === song.id && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-4">
                {song.cover && (
                  <img
                    src={song.cover}
                    alt={song.name}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{song.name}</p>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                  <p className="text-sm text-gray-400">专辑: {song.album}</p>
                  <p className="text-sm text-gray-400">时长: {formatDuration(song.duration)}</p>
                  <button
                    onClick={() => onPlay(song)}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
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
