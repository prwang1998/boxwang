'use client';

import { Song } from '@/types/music';
import { useTheme } from '@/app/theme-context';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
              filter: isLight ? 'blur(60px) brightness(0.7) saturate(1.2)' : 'blur(60px) brightness(0.2) saturate(1.5)',
              transform: 'scale(1.3)',
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: isLight ? 'linear-gradient(135deg, #f5f0e8, #e8e0d4)' : 'linear-gradient(to bottom, #242424, #0f0f0f)' }} />
        )}
        <div className="absolute inset-0" style={{ background: isLight ? 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.85))' : 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5), rgba(0,0,0,0.7))' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: isLight ? '#6b5e4f' : 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          {cover && (
            <img
              src={cover}
              alt={name}
              className="w-32 h-32 sm:w-44 sm:h-44 object-cover rounded-2xl shadow-2xl flex-shrink-0"
              style={{ outline: isLight ? '1px solid rgba(180,150,100,0.2)' : '1px solid rgba(255,255,255,0.08)' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-xl sm:text-3xl font-display font-bold mb-2" style={{ color: isLight ? '#2c2418' : '#fff' }}>{name}</h2>
            <p className="text-sm" style={{ color: isLight ? '#6b5e4f' : 'rgba(255,255,255,0.5)' }}>{tracks.length} 首歌曲</p>
            <button
              onClick={onPlayAll}
              className="mt-5 px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 w-fit font-medium text-sm shadow-lg active:scale-[0.98]"
              style={{
                background: isLight ? 'linear-gradient(135deg, #8b6914, #a67c1a)' : undefined,
                color: '#fff',
                boxShadow: isLight ? '0 4px 12px rgba(139,105,20,0.25)' : undefined,
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              播放全部
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="rounded-2xl overflow-hidden backdrop-blur-md" style={{
          background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.2)',
          border: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Table header */}
          <div className={`grid gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 text-xs font-medium uppercase tracking-wider ${onPlayNext ? 'grid-cols-[32px_1fr_80px_32px] sm:grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[32px_1fr_80px] sm:grid-cols-[40px_1fr_1fr_80px]'}`}
            style={{
              color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.3)',
              borderBottom: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.06)',
            }}>
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
              className={`grid gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 items-center cursor-pointer transition-all duration-150 group ${onPlayNext ? 'grid-cols-[32px_1fr_80px_32px] sm:grid-cols-[40px_1fr_1fr_80px_40px]' : 'grid-cols-[32px_1fr_80px] sm:grid-cols-[40px_1fr_1fr_80px]'}`}
              style={{
                color: currentSong?.id === song.id ? (isLight ? '#8b6914' : undefined) : (isLight ? '#6b5e4f' : 'rgba(255,255,255,0.7)'),
                background: currentSong?.id === song.id ? (isLight ? 'rgba(139,105,20,0.08)' : undefined) : 'transparent',
                borderBottom: index !== tracks.length - 1 ? (isLight ? '1px solid rgba(180,150,100,0.08)' : '1px solid rgba(255,255,255,0.03)') : 'none',
              }}
              onClick={() => onPlay(song)}
            >
              {/* Index / Playing indicator */}
              <span className="text-sm text-center">
                {currentSong?.id === song.id ? (
                  <div className="w-4 h-4 mx-auto rounded-full flex items-center justify-center" style={{ background: isLight ? 'rgba(139,105,20,0.15)' : 'rgba(232,168,73,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: isLight ? '#8b6914' : '#e8a849' }} />
                  </div>
                ) : (
                  <span className="group-hover:hidden" style={{ color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.3)' }}>{index + 1}</span>
                )}
                {currentSong?.id !== song.id && (
                  <svg className="w-4 h-4 hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 20 20" style={{ color: isLight ? '#6b5e4f' : 'rgba(255,255,255,0.7)' }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </span>

              {/* Song name & artist */}
              <div className="min-w-0">
                <p className="truncate font-medium text-sm" style={{ color: currentSong?.id === song.id ? (isLight ? '#8b6914' : '#e8a849') : (isLight ? '#2c2418' : 'rgba(255,255,255,0.9)') }}>{song.name}</p>
                <p className="truncate text-xs" style={{ color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.4)' }}>{song.artist}</p>
              </div>

              {/* Album */}
              <span className="truncate text-xs hidden md:block" style={{ color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.3)' }}>{song.album}</span>

              {/* Duration */}
              <span className="text-xs text-right font-mono" style={{ color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.3)' }}>{formatDuration(song.duration)}</span>

              {/* Play Next — hidden on mobile */}
              {onPlayNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayNext(song); }}
                  title="下一首播放"
                  className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: isLight ? '#9a8e7f' : 'rgba(255,255,255,0.3)' }}
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
