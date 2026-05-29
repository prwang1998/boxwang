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
      {/* Cover background — blurred with enhanced effects */}
      <div className="absolute inset-0 z-0">
        {cover ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${cover})`,
              filter: 'blur(80px) brightness(0.15) saturate(1.8)',
              transform: 'scale(1.5)',
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-obsidian-400 to-obsidian-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        {/* Aurora overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-rose-gold/[0.02]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:bg-white/[0.06] px-3 py-1.5 rounded-lg light-sweep"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 mb-8">
          {cover && (
            <div className="relative flex-shrink-0">
              <img
                src={cover}
                alt={name}
                className="w-36 h-36 sm:w-48 sm:h-48 object-cover rounded-2xl shadow-2xl ring-1 ring-white/[0.08]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Cover glow */}
              <div className="absolute -inset-6 rounded-3xl bg-primary/[0.06] blur-3xl -z-10" />
              <div className="absolute -inset-3 rounded-3xl bg-rose-gold/[0.04] blur-2xl -z-10" />
              {/* Metallic sheen */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.03] pointer-events-none" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">歌单</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3 leading-tight">{name}</h2>
            <p className="text-white/40 text-sm mb-6">{tracks.length} 首歌曲</p>
            <button
              onClick={onPlayAll}
              className="px-7 py-3 bg-gradient-to-r from-primary via-primary-hover to-primary-light text-obsidian-700 rounded-xl hover:shadow-glow-xl transition-all duration-300 flex items-center gap-2.5 w-fit font-medium text-sm shadow-lg shadow-primary/25 active:scale-[0.98] btn-luxury"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              播放全部
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="glass rounded-2xl overflow-hidden border-breathe">
          {/* Table header */}
          <div className={`grid gap-2 sm:gap-4 px-3 sm:px-5 py-3 text-white/25 text-[11px] font-medium uppercase tracking-widest border-b border-white/[0.04] ${onPlayNext ? 'grid-cols-[32px_1fr_80px_32px] sm:grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[32px_1fr_80px] sm:grid-cols-[40px_1fr_1fr_80px]'}`}>
            <span className="text-center">#</span>
            <span>歌曲</span>
            <span className="hidden md:block">专辑</span>
            <span className="text-right">时长</span>
            {onPlayNext && <span className="hidden sm:block"></span>}
          </div>

          {/* Tracks */}
          {tracks.map((song, index) => (
            <div
              key={song.id}
              className={`grid gap-2 sm:gap-4 px-3 sm:px-5 py-3 items-center cursor-pointer transition-all duration-200 group ${onPlayNext ? 'grid-cols-[32px_1fr_80px_32px] sm:grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[32px_1fr_80px] sm:grid-cols-[40px_1fr_1fr_80px]'} ${
                currentSong?.id === song.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-white/60 hover:bg-white/[0.04]'
              } ${index !== tracks.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
              onClick={() => onPlay(song)}
            >
              {/* Index / Playing indicator */}
              <span className="text-sm text-center">
                {currentSong?.id === song.id ? (
                  <div className="w-4 h-4 mx-auto rounded-full bg-primary/20 flex items-center justify-center shadow-glow">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                  </div>
                ) : (
                  <span className="text-white/25 group-hover:hidden">{index + 1}</span>
                )}
                {currentSong?.id !== song.id && (
                  <svg className="w-4 h-4 text-white/60 hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </span>

              {/* Song name & artist */}
              <div className="min-w-0">
                <p className={`truncate font-medium text-sm ${currentSong?.id === song.id ? 'text-primary' : 'text-white/80'}`}>{song.name}</p>
                <p className="truncate text-xs text-white/30">{song.artist}</p>
              </div>

              {/* Album */}
              <span className="truncate text-xs text-white/25 hidden md:block">{song.album}</span>

              {/* Duration */}
              <span className="text-xs text-white/25 text-right font-mono">{formatDuration(song.duration)}</span>

              {/* Play Next — hidden on mobile */}
              {onPlayNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayNext(song); }}
                  title="下一首播放"
                  className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
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
