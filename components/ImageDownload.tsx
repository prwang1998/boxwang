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
          // Extract filename from URL or use default
          const filename = image.src.split('/').pop()?.split('?')[0] || 'image.jpg';
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          // Small delay between downloads
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">图片下载</h2>
        <p className="text-gray-600 mb-4">输入网址，爬取该页面下的所有图片并下载</p>
      </div>

      <div className="flex gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="请输入网址，例如: https://example.com"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          disabled={loading}
        />
        <button
          onClick={handleCrawl}
          disabled={loading || !url.trim()}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            loading || !url.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-blue-600'
          }`}
        >
          {loading ? '爬取中...' : '开始爬取'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                找到 {images.length} 张图片，已选择 {getSelectedCount()} 张
              </span>
              <button
                onClick={selectAll}
                className="text-primary hover:text-blue-600 text-sm"
              >
                全选
              </button>
              <button
                onClick={deselectAll}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                取消全选
              </button>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading || getSelectedCount() === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                downloading || getSelectedCount() === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-success text-white hover:bg-green-600'
              }`}
            >
              {downloading ? '下载中...' : `下载选中图片 (${getSelectedCount()})`}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  image.selected ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSelect(index)}
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  {image.selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-500 truncate" title={image.alt || image.src}>
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
