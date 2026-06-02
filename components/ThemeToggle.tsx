'use client';

import { useTheme } from '@/app/theme-context';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 展开的设置面板 */}
      {expanded && (
        <div className="glass-heavy rounded-2xl p-4 animate-scale-in min-w-[180px]">
          <div className="text-xs font-medium text-obsidian-100/60 mb-3 uppercase tracking-wider">外观设置</div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group"
          >
            <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="text-sm text-obsidian-50 flex-1 text-left">
              {theme === 'dark' ? '深色模式' : '浅色模式'}
            </span>
            <div className={`w-9 h-5 rounded-full transition-all duration-300 ${
              theme === 'dark' ? 'bg-primary' : 'bg-obsidian-100/30'
            } relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                theme === 'dark' ? 'left-[18px]' : 'left-0.5'
              }`} />
            </div>
          </button>
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <p className="text-[10px] text-obsidian-100/40 text-center">
              {theme === 'dark' ? '当前：深色模式' : '当前：浅色模式'}
            </p>
          </div>
        </div>
      )}

      {/* 浮动按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          expanded
            ? 'bg-primary text-obsidian-700 shadow-glow-xl rotate-90'
            : 'glass hover:bg-white/[0.08] text-obsidian-100 hover:text-primary'
        }`}
        title="设置"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
