'use client';

export default function MusicBoxEmbed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">备用听歌通道</h3>
        <a
          href="https://mu-jie.cc/musicBox/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-blue-600 text-sm"
        >
          在新窗口打开 ↗
        </a>
      </div>
      <p className="text-sm text-gray-500">
        如果上方搜索功能无法找到可用资源，可以使用下方的备用通道
      </p>
      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
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
