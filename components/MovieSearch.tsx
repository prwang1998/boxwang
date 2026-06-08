'use client';

import { useState } from 'react';
import { useTheme } from '@/app/theme-context';

interface MovieSearchProps {
  onSearch: (keyword: string) => void;
  loading: boolean;
}

export default function MovieSearch({ onSearch, loading }: MovieSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim());
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
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.45)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入电影名、演员名..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all relative z-10"
          style={{
            background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
            border: isLight
              ? '1px solid rgba(180,150,100,0.2)'
              : '1px solid rgba(255,255,255,0.06)',
            color: isLight ? '#2c1f14' : '#f0e6d6',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
        {focused && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
            style={{
              boxShadow: isLight
                ? '0 0 0 2px rgba(139,105,20,0.15)'
                : '0 0 0 2px rgba(232,168,73,0.15)',
            }}
          />
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={loading || !keyword.trim()}
        className="px-6 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200"
        style={loading || !keyword.trim() ? {
          background: isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)',
          color: isLight ? 'rgba(122,98,72,0.4)' : 'rgba(210,180,140,0.3)',
          cursor: 'not-allowed',
          border: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.04)',
        } : {
          background: 'linear-gradient(135deg, #e8a849, #d4943a)',
          color: '#0c0907',
          boxShadow: '0 4px 20px rgba(232,168,73,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current/30 border-t-current"></div>
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
