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
      {/* Cover background — 大模糊颜色渗透 */}
      <div className="absolute inset-0 z-0">
        {cover ? (
          <>
            {/* 底层：大范围颜色扩散 */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${cover})`,
                filter: isLight
                  ? 'blur(120px) brightness(0.75) saturate(2)'
                  : 'blur(120px) brightness(0.15) saturate(2.5)',
                transform: 'scale(1.5)',
              }}
            />
            {/* 中层：锐化一层增强颜色感 */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${cover})`,
                filter: isLight
                  ? 'blur(40px) brightness(0.8) saturate(1.5)'
                  : 'blur(40px) brightness(0.2) saturate(2)',
                transform: 'scale(1.2)',
              }}
            />
            {/* 顶层：渐变遮罩让内容可读 */}
            <div
              className="absolute inset-0"
              style={{
                background: isLight
                  ? 'linear-gradient(to bottom, rgba(250,248,245,0.55) 0%, rgba(250,248,245,0.75) 60%, rgba(250,248,245,0.9) 100%)'
                  : 'linear-gradient(to bottom, rgba(12,9,7,0.2) 0%, rgba(12,9,7,0.5) 50%, rgba(12,9,7,0.8) 100%)',
              }}
            />
          </>
        ) : (
          <div className="w-full h-full" style={{
            background: isLight
              ? 'linear-gradient(135deg, #f5f0e8, #e8e0d4)'
              : 'linear-gradient(to bottom, #1c1510, #0c0907)',
          }} />
        )}
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
              className="group mt-5 px-5 py-2.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2 w-fit font-semibold text-sm active:scale-[0.97] tracking-[-0.01em]"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, #8b6914, #a67c1a)'
                  : 'linear-gradient(135deg, #e8a849, #d4943a)',
                color: isLight ? '#fff' : '#0f0f0f',
                boxShadow: isLight
                  ? '0 4px 20px rgba(139,105,20,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 20px rgba(232,168,73,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              播放全部
              {/* Button-in-Button trailing icon */}
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.12)' }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </span>
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
