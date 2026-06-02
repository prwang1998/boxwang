'use client';

import { useState } from 'react';
import { useTheme } from '@/app/theme-context';

interface MusicSearchProps {
  onSearch: (keyword: string, source: string) => void;
  loading: boolean;
}

export default function MusicSearch({ onSearch, loading }: MusicSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim(), 'kuwo');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入歌曲名、歌手..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all relative z-10"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={loading || !keyword.trim()}
        className={`
          px-6 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2
          transition-all duration-200
          ${loading || !keyword.trim()
            ? 'bg-white/[0.04] text-obsidian-100/40 cursor-not-allowed border border-white/[0.04]'
            : 'bg-primary text-obsidian-700 hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-glow active:scale-[0.98]'
          }
        `}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-obsidian-700/30 border-t-obsidian-700"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        {loading ? '搜索中...' : '搜索'}
      </button>
    </div>
  );
}
