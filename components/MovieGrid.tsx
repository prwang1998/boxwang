'use client';

import { useState, useEffect, useRef } from 'react';
import { Movie } from '@/types/movie';
import { useTheme } from '@/app/theme-context';

interface MovieGridProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  title?: string;
}

export default function MovieGrid({ movies, onMovieClick, title }: MovieGridProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.movie-card-reveal');
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [movies]);

  if (movies.length === 0) return null;

  return (
    <div>
      {title && (
        <h3 className="text-lg font-display font-semibold mb-4" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
          {title}
        </h3>
      )}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="cursor-pointer group movie-card-reveal"
            style={{ '--reveal-delay': `${index * 40}ms` } as React.CSSProperties}
            onClick={() => onMovieClick(movie)}
          >
            {/* 卡片外壳 */}
            <div
              className="spotlight-border relative aspect-[2/3] rounded-2xl p-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
              style={{
                background: isLight ? 'rgba(180,150,100,0.06)' : 'rgba(255,255,255,0.04)',
                border: '1px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: isLight
                  ? '0 2px 20px rgba(100,80,50,0.06)'
                  : '0 2px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.5s cubic-bezier(0.32,0.72,0,1)',
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                e.currentTarget.style.setProperty('--spotlight-x', `${x}%`);
                e.currentTarget.style.setProperty('--spotlight-y', `${y}%`);
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = isLight
                  ? '0 20px 60px rgba(180,120,50,0.18), 0 4px 20px rgba(180,120,50,0.1)'
                  : '0 20px 60px rgba(232,168,73,0.18), 0 4px 20px rgba(232,168,73,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = isLight
                  ? 'rgba(139,105,20,0.3)'
                  : 'rgba(232,168,73,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = isLight
                  ? '0 2px 20px rgba(100,80,50,0.06)'
                  : '0 2px 20px rgba(0,0,0,0.3)';
                (e.currentTarget as HTMLElement).style.borderColor = isLight
                  ? 'rgba(180,150,100,0.12)'
                  : 'rgba(255,255,255,0.06)';
              }}
            >
              {/* 内部核心 */}
              <div
                className="relative w-full h-full rounded-[calc(1rem-0.25rem)] overflow-hidden"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)' }}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PS4zZW0iPvCfkpE8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)' }}>
                    <span className="text-4xl opacity-30">🎬</span>
                  </div>
                )}

                {/* 评分标签 */}
                {movie.rating !== undefined && movie.rating > 0 && (
                  <div
                    className="absolute top-2 right-2 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                    style={{
                      background: movie.rating >= 7
                        ? 'rgba(232,168,73,0.9)'
                        : movie.rating >= 5
                          ? 'rgba(100,100,100,0.8)'
                          : 'rgba(200,50,50,0.8)',
                      color: '#fff',
                    }}
                  >
                    ⭐ {movie.rating}
                  </div>
                )}

                {/* 年份标签 */}
                {movie.year && (
                  <div
                    className="absolute bottom-2 left-2 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.65)',
                      color: isLight ? '#6b5e4f' : 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {movie.year}
                  </div>
                )}

                {/* 悬停遮罩 + 播放按钮 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                >
                  <div
                    className="w-1 h-1 p-0 rounded-full flex items-center justify-center scale-50 group-hover:scale-100 group-hover:w-14 group-hover:h-14 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{
                      background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                      boxShadow: '0 0 30px rgba(232,168,73,0.5)',
                    }}
                  >
                    <svg className="w-6 h-6 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" style={{ color: '#0c0907' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 电影标题 */}
            <p
              className="mt-2.5 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] leading-snug tracking-[-0.01em]"
              style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}
            >
              {movie.title}
            </p>

            {/* 类型标签 */}
            {movie.genres && movie.genres.length > 0 && (
              <p className="text-[11px] mt-0.5 font-medium truncate" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                {movie.genres.slice(0, 2).join(' / ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
