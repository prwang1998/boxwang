'use client';

import { useState } from 'react';

interface ImageInfo {
  src: string;
  alt: string;
  selected: boolean;
}

export default function ImageDownload() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('请输入网址');
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);

    try {
      const response = await fetch('/api/crawl-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '爬取失败');
      }

      if (data.images.length === 0) {
        setError('未找到任何图片');
        return;
      }

      setImages(data.images.map((img: any) => ({ ...img, selected: false })));
    } catch (err: any) {
      setError(err.message || '爬取失败，请检查网址是否正确');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, selected: !img.selected } : img))
    );
  };

  const selectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: true })));
  };

  const deselectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: false })));
  };

  const getSelectedCount = () => images.filter((img) => img.selected).length;

  const handleDownload = async () => {
    const selectedImages = images.filter((img) => img.selected);
    if (selectedImages.length === 0) {
      setError('请至少选择一张图片');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      for (const image of selectedImages) {
        try {
          const response = await fetch(image.src);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const filename = image.src.split('/').pop()?.split('?')[0] || 'image.jpg';
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Download failed for:', image.src, err);
        }
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-obsidian-50 mb-1">图片下载</h2>
        <p className="text-sm text-obsidian-100">输入网址，爬取该页面下的所有图片并下载</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="请输入网址，例如: https://example.com"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleCrawl}
          disabled={loading || !url.trim()}
          className={`
            px-6 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2
            transition-all duration-200
            ${loading || !url.trim()
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
          {loading ? '爬取中...' : '开始爬取'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-obsidian-100">
                找到 <span className="text-obsidian-50 font-medium">{images.length}</span> 张图片，已选择 <span className="text-primary font-medium">{getSelectedCount()}</span> 张
              </span>
              <button
                onClick={selectAll}
                className="text-primary hover:text-primary-hover text-xs font-medium transition-colors"
              >
                全选
              </button>
              <button
                onClick={deselectAll}
                className="text-obsidian-100 hover:text-obsidian-50 text-xs font-medium transition-colors"
              >
                取消全选
              </button>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading || getSelectedCount() === 0}
              className={`
                px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2
                transition-all duration-200
                ${downloading || getSelectedCount() === 0
                  ? 'bg-white/[0.04] text-obsidian-100/40 cursor-not-allowed border border-white/[0.04]'
                  : 'bg-success/15 text-success border border-success/20 hover:bg-success/25 active:scale-[0.98]'
                }
              `}
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-success/30 border-t-success"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {downloading ? '下载中...' : `下载选中 (${getSelectedCount()})`}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={`
                  rounded-xl overflow-hidden cursor-pointer
                  transition-all duration-200
                  border
                  ${image.selected
                    ? 'border-primary shadow-glow ring-1 ring-primary/20'
                    : 'border-white/[0.06] hover:border-white/[0.12] bg-surface'
                  }
                `}
                onClick={() => toggleSelect(index)}
              >
                <div className="relative aspect-square bg-obsidian">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  {image.selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-glow animate-scale-in">
                      <svg className="w-3.5 h-3.5 text-obsidian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-obsidian-100 truncate" title={image.alt || image.src}>
                    {image.alt || '无描述'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
