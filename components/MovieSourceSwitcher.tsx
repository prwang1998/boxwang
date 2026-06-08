'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/theme-context';

export interface SourceInfo {
  name: string;
  label: string;
  icon: string;
  available: boolean;
}

interface MovieSourceSwitcherProps {
  sources: SourceInfo[];
  currentSource: string;
  onSourceChange: (sourceName: string) => void;
  loading?: boolean;
}

export default function MovieSourceSwitcher({ sources, currentSource, onSourceChange, loading }: MovieSourceSwitcherProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = sources.find(s => s.name === currentSource) || sources[0];

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)',
          border: isLight ? '1px solid rgba(180,150,100,0.2)' : '1px solid rgba(255,255,255,0.08)',
          color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.8)',
        }}
      >
        <span className="text-base">{current?.icon || '📦'}</span>
        <span>{current?.label || '选择片源'}</span>
        {loading ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : (
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-56 rounded-xl overflow-hidden z-50 animate-scale-in"
          style={{
            background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,15,10,0.98)',
            border: isLight ? '1px solid rgba(180,150,100,0.2)' : '1px solid rgba(232,168,73,0.15)',
            boxShadow: isLight
              ? '0 10px 40px rgba(100,80,50,0.15)'
              : '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(232,168,73,0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="p-1.5">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: isLight ? 'rgba(107,94,79,0.5)' : 'rgba(210,180,140,0.4)' }}>
              切换片源
            </div>
            {sources.map(source => (
              <button
                key={source.name}
                onClick={() => {
                  if (source.available) {
                    onSourceChange(source.name);
                    setOpen(false);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={
                  source.name === currentSource
                    ? {
                        background: isLight ? 'rgba(139,105,20,0.1)' : 'rgba(232,168,73,0.12)',
                        color: isLight ? '#8b6914' : '#e8a849',
                      }
                    : source.available
                      ? {
                          color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                        }
                      : {
                          color: isLight ? 'rgba(107,94,79,0.3)' : 'rgba(210,180,140,0.25)',
                          cursor: 'not-allowed',
                        }
                }
                onMouseEnter={e => {
                  if (source.name !== currentSource && source.available) {
                    e.currentTarget.style.background = isLight ? 'rgba(180,150,100,0.08)' : 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (source.name !== currentSource) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span className="text-lg">{source.icon}</span>
                <span className="flex-1 text-left font-medium">{source.label}</span>
                {/* 状态指示 */}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: source.available
                      ? '#4ade80'
                      : '#ef4444',
                    boxShadow: source.available
                      ? '0 0 6px rgba(74,222,128,0.4)'
                      : '0 0 6px rgba(239,68,68,0.4)',
                  }}
                />
                {/* 选中标记 */}
                {source.name === currentSource && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {/* 底部提示 */}
          <div
            className="px-4 py-2 text-[10px]"
            style={{
              borderTop: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.05)',
              color: isLight ? 'rgba(107,94,79,0.4)' : 'rgba(210,180,140,0.3)',
            }}
          >
            绿色=可用 · 红色=不可用
          </div>
        </div>
      )}
    </div>
  );
}
