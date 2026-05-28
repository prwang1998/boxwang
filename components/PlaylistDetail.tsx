'use client';

import { Song } from '@/types/music';

interface PlaylistDetailProps {
  name: string;
  cover: string;
  tracks: Song[];
  onPlay: (song: Song) => void;
  onPlayAll: () => void;
  onPlayNext?: (song: Song) => void;
  currentSong: Song | null;
  onBack: () => void;
}

export default function PlaylistDetail({ name, cover, tracks, onPlay, onPlayAll, onPlayNext, currentSong, onBack }: PlaylistDetailProps) {
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[600px] rounded-xl overflow-hidden">
      {/* Cover background */}
      <div className="absolute inset-0 z-0">
        {cover ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${cover})`,
              filter: 'blur(40px) brightness(0.4)',
              transform: 'scale(1.2)',
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white flex items-center gap-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
        </div>

        {/* Playlist Info */}
        <div className="flex gap-6 mb-8">
          {cover && (
            <img
              src={cover}
              alt={name}
              className="w-48 h-48 object-cover rounded-lg shadow-2xl flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-2">{name}</h2>
            <p className="text-white/60">{tracks.length} 首歌曲</p>
            <button
              onClick={onPlayAll}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2 w-fit"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              播放全部
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden">
          {/* Table header */}
          <div className={`grid gap-4 px-4 py-3 text-white/40 text-sm border-b border-white/10 ${onPlayNext ? 'grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[40px_1fr_1fr_80px]'}`}>
            <span>#</span>
            <span>歌曲</span>
            <span className="hidden md:block">专辑</span>
            <span className="text-right">时长</span>
            {onPlayNext && <span></span>}
          </div>

          {/* Tracks */}
          {tracks.map((song, index) => (
            <div
              key={song.id}
              className={`grid gap-4 px-4 py-3 items-center cursor-pointer transition-colors group ${onPlayNext ? 'grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[40px_1fr_1fr_80px]'} ${
                currentSong?.id === song.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              onClick={() => onPlay(song)}
            >
              {/* Index / Playing indicator */}
              <span className="text-sm text-center">
                {currentSong?.id === song.id ? (
                  <svg className="w-4 h-4 text-primary mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                {currentSong?.id !== song.id && (
                  <svg className="w-4 h-4 text-white hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </span>

              {/* Song name & artist */}
              <div className="min-w-0">
                <p className="truncate font-medium">{song.name}</p>
                <p className="truncate text-sm text-white/50">{song.artist}</p>
              </div>

              {/* Album */}
              <span className="truncate text-sm text-white/50 hidden md:block">{song.album}</span>

              {/* Duration */}
              <span className="text-sm text-white/50 text-right">{formatDuration(song.duration)}</span>

              {/* Play Next */}
              {onPlayNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayNext(song); }}
                  title="下一首播放"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
