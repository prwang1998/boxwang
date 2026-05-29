'use client';

import { useState, useRef, useEffect } from 'react';
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
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

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
    const timeoutId = setTimeout(() => {
      setAddedIds(prev => { const n = new Set(prev); n.delete(song.id); return n; });
      timeoutsRef.current.delete(timeoutId);
    }, 1500);
    timeoutsRef.current.add(timeoutId);
  };

  if (songs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3 opacity-15 animate-float">♪</div>
        <p className="text-obsidian-100 text-sm">暂无搜索结果</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {songs.map((song, index) => (
        <div
          key={song.id}
          className="rounded-xl overflow-hidden border border-white/[0.03] bg-surface/30 hover:bg-surface/50 transition-all duration-300 animate-slide-up group/card light-sweep"
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          <div
            className={`flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3.5 cursor-pointer transition-all duration-200 ${
              currentSong?.id === song.id ? 'bg-primary/[0.06]' : ''
            }`}
            onClick={() => toggleExpand(song.id)}
          >
            {/* Cover Image */}
            <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04]">
              {song.cover ? (
                <img
                  src={song.cover}
                  alt={song.name}
                  className="w-11 h-11 object-cover group-hover/card:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMWExYTI5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzU1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9LjNlbSI+TzwvdGV4dD48L3N2Zz4=';
                  }}
                />
              ) : (
                <div className="w-11 h-11 flex items-center justify-center">
                  <span className="text-obsidian-100 text-lg opacity-20">♪</span>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate transition-colors duration-200 ${currentSong?.id === song.id ? 'text-primary' : 'text-obsidian-50'}`}>{song.name}</p>
              <p className="text-xs text-obsidian-100/60 truncate">{song.artist}</p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {song.album && (
                <span className="text-xs text-obsidian-100/40 hidden md:block max-w-[120px] truncate">{song.album}</span>
              )}
              {formatDuration(song.duration) && (
                <span className="text-xs text-obsidian-100/40 hidden sm:block font-mono">{formatDuration(song.duration)}</span>
              )}

              {/* Play Next Button — hidden on mobile */}
              {onPlayNext && (
                <button
                  onClick={(e) => handlePlayNext(e, song)}
                  title="下一首播放"
                  className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center transition-all duration-200 text-sm ${
                    addedIds.has(song.id)
                      ? 'bg-success/10 text-success'
                      : 'text-obsidian-100/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover/card:opacity-100'
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
                className="px-3 sm:px-4 py-1.5 bg-primary/10 text-primary border border-primary/15 rounded-lg hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 text-xs font-medium hover:shadow-glow"
              >
                播放
              </button>
            </div>
          </div>

          {expandedId === song.id && (
            <div className="p-4 bg-white/[0.015] border-t border-white/[0.03] animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                {song.cover && (
                  <div className="relative">
                    <img src={song.cover} alt={song.name} className="w-28 h-28 object-cover rounded-xl shadow-lg ring-1 ring-white/[0.06]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="absolute -inset-3 rounded-2xl bg-primary/[0.04] blur-xl -z-10" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-obsidian-50">{song.name}</h3>
                  <p className="text-obsidian-100 text-sm mt-1">{song.artist}</p>
                  {song.album && <p className="text-obsidian-100/50 text-xs mt-1">专辑: {song.album}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => onPlay(song)} className="px-5 py-2 bg-gradient-to-r from-primary via-primary-hover to-primary-light text-obsidian-700 rounded-lg hover:shadow-glow-xl transition-all duration-300 text-sm font-medium flex items-center gap-1.5 shadow-primary/20 btn-luxury">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      播放歌曲
                    </button>
                    {onPlayNext && (
                      <button onClick={() => handlePlayNext(new MouseEvent('click') as any, song)} className="px-4 py-2 border border-white/[0.06] text-obsidian-100 rounded-lg hover:bg-white/[0.04] hover:text-obsidian-50 transition-all text-sm">
                        下一首播放
                      </button>
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
