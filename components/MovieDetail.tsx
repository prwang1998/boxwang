'use client';

import { useState } from 'react';
import { Movie, MovieDetail as MovieDetailType, VideoSource } from '@/types/movie';
import { useTheme } from '@/app/theme-context';
import MoviePlayer from './MoviePlayer';

interface MovieDetailProps {
  movie: MovieDetailType;
  videoSources: VideoSource[];
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
  sourceLabel?: string;
}

export default function MovieDetail({ movie, videoSources, onBack, onMovieClick, sourceLabel }: MovieDetailProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(
    videoSources.length > 0 ? videoSources[0] : null
  );

  const handlePlay = () => {
    if (selectedSource) {
      setShowPlayer(true);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  return (
    <div className="animate-fade-in">
      {/* 返回按钮 + 数据来源 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: isLight ? '#8b6914' : '#e8a849' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        {/* 数据来源标签 */}
        {sourceLabel && (
          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{
            background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(74,222,128,0.08)',
            color: isLight ? '#16a34a' : '#4ade80',
            border: isLight ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(74,222,128,0.15)',
          }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: '#4ade80' }} />
            {sourceLabel}
          </span>
        )}
      </div>

      {/* 电影详情头部 */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        {/* 背景图 */}
        {movie.backdrop && (
          <div className="absolute inset-0 z-0">
            <img
              src={movie.backdrop}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(2px) brightness(0.3)' }}
            />
            <div className="absolute inset-0" style={{
              background: isLight
                ? 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.95) 100%)'
                : 'linear-gradient(180deg, rgba(12,9,7,0.6) 0%, rgba(12,9,7,0.95) 100%)',
            }} />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row gap-6 p-6">
          {/* 海报 */}
          <div className="flex-shrink-0 w-48 md:w-56 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.05)' }}>
                  <span className="text-5xl opacity-30">🎬</span>
                </div>
              )}
            </div>
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm mt-1" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                {movie.originalTitle}
              </p>
            )}

            {/* 标签行 */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {movie.year && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: isLight ? 'rgba(139,105,20,0.1)' : 'rgba(232,168,73,0.12)',
                  color: isLight ? '#8b6914' : '#e8a849',
                }}>
                  {movie.year}
                </span>
              )}
              {movie.runtime && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: isLight ? 'rgba(139,105,20,0.1)' : 'rgba(232,168,73,0.12)',
                  color: isLight ? '#8b6914' : '#e8a849',
                }}>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.rating !== undefined && movie.rating > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{
                  background: movie.rating >= 7
                    ? 'rgba(232,168,73,0.9)'
                    : movie.rating >= 5
                      ? 'rgba(100,100,100,0.8)'
                      : 'rgba(200,50,50,0.8)',
                  color: '#fff',
                }}>
                  ⭐ {movie.rating}
                </span>
              )}
              {movie.language && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: isLight ? 'rgba(139,105,20,0.1)' : 'rgba(232,168,73,0.12)',
                  color: isLight ? '#8b6914' : '#e8a849',
                }}>
                  {movie.language.toUpperCase()}
                </span>
              )}
            </div>

            {/* 类型 */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {movie.genres.map((genre, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{
                    background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.06)',
                    color: isLight ? '#7a6248' : 'rgba(210,180,140,0.6)',
                  }}>
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* 简介 */}
            {movie.overview && (
              <p className="mt-4 text-sm leading-relaxed max-w-2xl" style={{ color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)' }}>
                {movie.overview}
              </p>
            )}

            {/* 标语 */}
            {movie.tagline && (
              <p className="mt-2 text-sm italic" style={{ color: isLight ? '#8b6914' : 'rgba(232,168,73,0.6)' }}>
                "{movie.tagline}"
              </p>
            )}

            {/* 播放按钮 */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={handlePlay}
                disabled={!selectedSource}
                className="px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 active:scale-[0.97]"
                style={!selectedSource ? {
                  background: isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)',
                  color: isLight ? 'rgba(122,98,72,0.4)' : 'rgba(210,180,140,0.3)',
                  cursor: 'not-allowed',
                } : {
                  background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                  color: '#0c0907',
                  boxShadow: '0 4px 20px rgba(232,168,73,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                立即播放
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 播放源列表 */}
      {videoSources.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-display font-semibold mb-4" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
            播放源
            <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{
              background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(74,222,128,0.08)',
              color: isLight ? '#16a34a' : '#4ade80',
            }}>
              {videoSources.length} 条线路
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {videoSources.map((source, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSource(source);
                  setShowPlayer(true);
                }}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={
                  selectedSource?.url === source.url
                    ? {
                        background: isLight ? 'rgba(139,105,20,0.12)' : 'rgba(232,168,73,0.12)',
                        border: isLight ? '1px solid rgba(139,105,20,0.25)' : '1px solid rgba(232,168,73,0.2)',
                        color: isLight ? '#8b6914' : '#e8a849',
                      }
                    : {
                        background: isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)',
                        border: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.06)',
                        color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                      }
                }
              >
                {/* 播放图标 */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: selectedSource?.url === source.url
                      ? 'linear-gradient(135deg, #e8a849, #d4943a)'
                      : isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)',
                    color: selectedSource?.url === source.url ? '#0c0907' : isLight ? '#7a6248' : 'rgba(210,180,140,0.5)',
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                {/* 源信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{source.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: isLight ? 'rgba(90,74,58,0.6)' : 'rgba(210,180,140,0.4)' }}>
                    {source.type === 'hls' ? 'HLS 流' : source.type === 'mp4' ? 'MP4 直链' : 'iframe'} · {source.quality}
                  </p>
                </div>
                {/* 质量标签 */}
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{
                  background: source.quality === '1080p'
                    ? 'rgba(232,168,73,0.15)'
                    : source.quality === '720p'
                      ? 'rgba(74,222,128,0.1)'
                      : 'rgba(100,100,100,0.1)',
                  color: source.quality === '1080p'
                    ? '#e8a849'
                    : source.quality === '720p'
                      ? '#4ade80'
                      : isLight ? '#7a6248' : 'rgba(210,180,140,0.5)',
                }}>
                  {source.quality}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px]" style={{ color: isLight ? 'rgba(90,74,58,0.4)' : 'rgba(210,180,140,0.3)' }}>
            💡 如果播放卡顿，请尝试切换其他播放源
          </p>
        </div>
      )}

      {/* 演员 */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-display font-semibold mb-4" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
            演员阵容
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {movie.cast.map((member, i) => (
              <div key={i} className="flex-shrink-0 w-20 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-1.5" style={{
                  background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)',
                }}>
                  {member.profilePath ? (
                    <img src={member.profilePath} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-30">👤</div>
                  )}
                </div>
                <p className="text-[11px] font-medium truncate" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
                  {member.name}
                </p>
                {member.character && (
                  <p className="text-[10px] truncate" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                    {member.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 预告片 */}
      {movie.trailers && movie.trailers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-display font-semibold mb-4" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
            预告片
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movie.trailers.slice(0, 3).map((trailer) => (
              <div key={trailer.id} className="aspect-video rounded-xl overflow-hidden" style={{
                background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)',
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相似电影 */}
      {movie.similar && movie.similar.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-display font-semibold mb-4" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
            相似推荐
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {movie.similar.map((m) => (
              <div
                key={m.id}
                className="cursor-pointer group"
                onClick={() => onMovieClick(m)}
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03]" style={{
                  boxShadow: isLight ? '0 2px 10px rgba(100,80,50,0.06)' : '0 2px 10px rgba(0,0,0,0.3)',
                }}>
                  {m.poster ? (
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)' }}>
                      <span className="text-2xl opacity-30">🎬</span>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
                  {m.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 播放器 */}
      {showPlayer && selectedSource && (
        <MoviePlayer
          source={selectedSource}
          title={movie.title}
          sources={videoSources}
          onClose={handleClosePlayer}
          onSourceChange={(source) => {
            setSelectedSource(source);
          }}
        />
      )}
    </div>
  );
}
