'use client';

export default function MusicBoxEmbed() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-obsidian-50">备用听歌通道</h3>
          <p className="text-xs text-obsidian-100 mt-1">
            如果搜索功能无法找到可用资源，可以使用备用通道
          </p>
        </div>
        <a
          href="https://mu-jie.cc/musicBox/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1 transition-colors"
        >
          新窗口打开
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-surface" style={{ height: '600px' }}>
        <iframe
          src="https://mu-jie.cc/musicBox/"
          title="MusicBox 备用听歌通道"
          className="w-full h-full border-0"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
