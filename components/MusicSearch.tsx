'use client';

import { useState } from 'react';

interface MusicSearchProps {
  onSearch: (keyword: string, source: string) => void;
  loading: boolean;
}

export default function MusicSearch({ onSearch, loading }: MusicSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [source, setSource] = useState('all');

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim(), source);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入搜索关键词..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !keyword.trim()}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            loading || !keyword.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-blue-600'
          }`}
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="source"
            value="all"
            checked={source === 'all'}
            onChange={(e) => setSource(e.target.value)}
            className="text-primary"
          />
          <span>全部</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="source"
            value="kuwo"
            checked={source === 'kuwo'}
            onChange={(e) => setSource(e.target.value)}
            className="text-primary"
          />
          <span>酷我</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="source"
            value="netease"
            checked={source === 'netease'}
            onChange={(e) => setSource(e.target.value)}
            className="text-primary"
          />
          <span>网易云</span>
        </label>
      </div>
    </div>
  );
}
