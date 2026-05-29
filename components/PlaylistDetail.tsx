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
    <div className="relative min-h-[600px] rounded-2xl overflow-hidden animate-fade-in">
      {/* Cover background */}
      <div className="absolute inset-0 z-0">
        {cover ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${cover})`,
              filter: 'blur(60px) brightness(0.2) saturate(1.5)',
              transform: 'scale(1.3)',
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-obsidian-400 to-obsidian-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-44 h-44 object-cover rounded-2xl shadow-2xl flex-shrink-0 ring-1 ring-white/[0.08]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-display font-bold text-white mb-2">{name}</h2>
            <p className="text-white/50 text-sm">{tracks.length} 首歌曲</p>
            <button
              onClick={onPlayAll}
              className="mt-5 px-6 py-2.5 bg-primary text-obsidian-700 rounded-xl hover:bg-primary-hover transition-all duration-200 flex items-center gap-2 w-fit font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-glow active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              播放全部
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Table header */}
          <div className={`grid gap-4 px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider border-b border-white/[0.06] ${onPlayNext ? 'grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[40px_1fr_1fr_80px]'}`}>
            <span className="text-center">#</span>
            <span>歌曲</span>
            <span className="hidden md:block">专辑</span>
            <span className="text-right">时长</span>
            {onPlayNext && <span></span>}
          </div>

          {/* Tracks */}
          {tracks.map((song, index) => (
            <div
              key={song.id}
              className={`grid gap-4 px-5 py-3 items-center cursor-pointer transition-all duration-150 group ${onPlayNext ? 'grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[40px_1fr_1fr_80px]'} ${
                currentSong?.id === song.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-white/70 hover:bg-white/[0.06]'
              } ${index !== tracks.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
              onClick={() => onPlay(song)}
            >
              {/* Index / Playing indicator */}
              <span className="text-sm text-center">
                {currentSong?.id === song.id ? (
                  <div className="w-4 h-4 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                  </div>
                ) : (
                  <span className="text-white/30 group-hover:hidden">{index + 1}</span>
                )}
                {currentSong?.id !== song.id && (
                  <svg className="w-4 h-4 text-white/70 hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </span>

              {/* Song name & artist */}
              <div className="min-w-0">
                <p className={`truncate font-medium text-sm ${currentSong?.id === song.id ? 'text-primary' : 'text-white/90'}`}>{song.name}</p>
                <p className="truncate text-xs text-white/40">{song.artist}</p>
              </div>

              {/* Album */}
              <span className="truncate text-xs text-white/30 hidden md:block">{song.album}</span>

              {/* Duration */}
              <span className="text-xs text-white/30 text-right font-mono">{formatDuration(song.duration)}</span>

              {/* Play Next */}
              {onPlayNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayNext(song); }}
                  title="下一首播放"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
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
