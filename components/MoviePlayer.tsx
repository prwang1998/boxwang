'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { VideoSource } from '@/types/movie';
import { useTheme } from '@/app/theme-context';

interface MoviePlayerProps {
  source: VideoSource;
  title: string;
  sources: VideoSource[];
  onClose: () => void;
  onSourceChange: (source: VideoSource) => void;
}

export default function MoviePlayer({ source, title, sources, onClose, onSourceChange }: MoviePlayerProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(
    sources.findIndex(s => s.source === source.source) || 0
  );

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 自动隐藏控制栏
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose, toggleFullscreen]);

  // 切换播放源
  const handleSourceChange = (index: number) => {
    if (index >= 0 && index < sources.length) {
      setCurrentSourceIndex(index);
      onSourceChange(sources[index]);
    }
  };

  // 切换到下一个源
  const handleNextSource = () => {
    const nextIndex = (currentSourceIndex + 1) % sources.length;
    handleSourceChange(nextIndex);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl mx-4 animate-scale-in"
        style={{ maxHeight: isFullscreen ? '100vh' : '90vh' }}
        onMouseMove={() => setShowControls(true)}
      >
        {/* 顶部控制栏 */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              title="关闭 (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-sm font-medium text-white truncate max-w-md">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* 源切换 */}
            {sources.length > 1 && (
              <select
                value={currentSourceIndex}
                onChange={(e) => handleSourceChange(parseInt(e.target.value, 10))}
                className="text-xs px-2 py-1.5 rounded-lg cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                }}
              >
                {sources.map((s, i) => (
                  <option key={s.source} value={i} style={{ color: '#000', background: '#fff' }}>
                    {s.label} ({s.quality})
                  </option>
                ))}
              </select>
            )}

            {/* 下一个源 */}
            {sources.length > 1 && (
              <button
                onClick={handleNextSource}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                title="切换到下一个源"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              title={isFullscreen ? '退出全屏 (F)' : '全屏 (F)'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 播放器主体 */}
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{
            aspectRatio: '16/9',
            background: '#000',
            boxShadow: '0 0 60px rgba(232,168,73,0.15), 0 0 120px rgba(0,0,0,0.5)',
          }}
        >
          {source.type === 'iframe' ? (
            <iframe
              src={source.url}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer"
            />
          ) : source.type === 'hls' ? (
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={source.url}
            />
          ) : (
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={source.url}
            />
          )}

          {/* 加载提示 */}
          <div
            className="absolute bottom-0 left-0 right-0 p-2 text-center transition-opacity duration-300"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
              opacity: showControls ? 1 : 0,
            }}
          >
            <p className="text-[10px] text-white/50">
              当前源: {source.label} | 按 F 全屏 | 按 Esc 关闭
              {sources.length > 1 && ' | 点击右上角切换源'}
            </p>
          </div>
        </div>

        {/* 底部提示 */}
        <div className={`mt-3 text-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[11px] text-white/40">
            如果播放卡顿，请尝试切换其他播放源
          </p>
        </div>
      </div>
    </div>
  );
}
