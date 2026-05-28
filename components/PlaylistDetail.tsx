'use client';

import { Song } from '@/types/music';
import MusicList from './MusicList';

interface PlaylistDetailProps {
  name: string;
  cover: string;
  tracks: Song[];
  onPlay: (song: Song) => void;
  currentSong: Song | null;
  onBack: () => void;
}

export default function PlaylistDetail({ name, cover, tracks, onPlay, currentSong, onBack }: PlaylistDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-primary hover:text-blue-600 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>

      <div className="flex gap-6">
        {cover && (
          <img
            src={cover}
            alt={name}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <p className="text-gray-500 mt-2">{tracks.length}首歌曲</p>
        </div>
      </div>

      <MusicList songs={tracks} onPlay={onPlay} currentSong={currentSong} />
    </div>
  );
}
