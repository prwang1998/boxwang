'use client';

export default function MusicBoxEmbed() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-lg font-display font-bold text-obsidian-50 title-decoration">
            <span className="text-gradient-rose">备用听歌通道</span>
          </h3>
          <p className="text-xs text-obsidian-100/60 mt-3 spacing-breath">
            如果搜索功能无法找到可用资源，可以使用备用通道
          </p>
        </div>
        <a
          href="https://mu-jie.cc/musicBox/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-light text-sm font-medium flex items-center gap-1.5 transition-colors btn-premium px-3 py-1.5 rounded-lg border border-primary/15 hover:border-primary/30"
        >
          新窗口打开
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="rounded-2xl overflow-hidden glass border border-white/[0.04] border-breathe" style={{ height: 'min(600px, 70vh)' }}>
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
