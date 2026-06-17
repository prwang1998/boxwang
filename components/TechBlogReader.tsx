'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@/app/theme-context';
import { TechBlog, TechBlogContent, TechCategory, CATEGORIES } from '@/lib/tech-blog-types';

export default function TechBlogReader() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartProgress = useRef(0);

  const [category, setCategory] = useState<TechCategory>('all');
  const [keyword, setKeyword] = useState('');
  const [blogs, setBlogs] = useState<TechBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<TechBlog | null>(null);
  const [articleContent, setArticleContent] = useState<TechBlogContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const deltaY = e.clientY - dragStartY.current;
      const { scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;
      const deltaProgress = deltaY / 80;
      const newProgress = Math.max(0, Math.min(1, dragStartProgress.current + deltaProgress));
      el.scrollTop = newProgress * maxScroll;
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartProgress.current = scrollProgress;
    setIsDragging(true);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const progress = clickY / (rect.height - 40);
    const { scrollHeight, clientHeight } = el;
    el.scrollTop = Math.max(0, Math.min(1, progress)) * (scrollHeight - clientHeight);
  };

  const loadBlogs = useCallback(async (cat: TechCategory, kw: string, p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: cat, page: String(p) });
      if (kw) params.set('keyword', kw);
      const resp = await fetch(`/api/tech-blog/search?${params}`);
      const data = await resp.json();
      if (p === 1) {
        setBlogs(data.blogs || []);
      } else {
        setBlogs(prev => [...prev, ...(data.blogs || [])]);
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs(category, keyword);
  }, [category]);

  const handleSearch = () => {
    setPage(1);
    loadBlogs(category, keyword, 1);
  };

  const handleCategoryChange = (cat: TechCategory) => {
    setCategory(cat);
    setKeyword('');
    setPage(1);
    setSelectedBlog(null);
    setArticleContent(null);
  };

  const handleBlogClick = async (blog: TechBlog) => {
    setSelectedBlog(blog);
    setContentLoading(true);
    setArticleContent(null);
    try {
      const params = new URLSearchParams({ url: blog.url, source: blog.source });
      const resp = await fetch(`/api/tech-blog/content?${params}`);
      if (resp.ok) {
        const data = await resp.json();
        setArticleContent(data);
      }
    } catch {
    } finally {
      setContentLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedBlog(null);
    setArticleContent(null);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadBlogs(category, keyword, nextPage);
  };

  const formatViews = (num?: number) => {
    if (!num) return '';
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return String(num);
  };

  // Article reader view
  if (selectedBlog) {
    return (
      <div className="relative">
        <div ref={containerRef} className="animate-fade-in" style={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: isLight ? '#8b6914' : '#e8a849' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(255,255,255,0.06)',
                color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                border: isLight ? '1px solid rgba(139,105,20,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
              title="缩小字体"
            >
              A-
            </button>
            <span className="text-xs" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => Math.min(24, s + 2))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(255,255,255,0.06)',
                color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                border: isLight ? '1px solid rgba(139,105,20,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
              title="放大字体"
            >
              A+
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(20,20,20,0.6)',
            border: isLight ? '1px solid rgba(180,150,100,0.12)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Article Header */}
          <div className="p-6 pb-4" style={{ borderBottom: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
            <h1 className="text-2xl font-display font-bold mb-3 leading-tight" style={{ color: isLight ? '#2c1f14' : '#f0e6d6' }}>
              {selectedBlog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
              {selectedBlog.author && <span>{selectedBlog.author}</span>}
              <span className="px-2 py-0.5 rounded-full" style={{
                background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(232,168,73,0.1)',
                color: isLight ? '#8b6914' : '#e8a849',
              }}>
                {selectedBlog.sourceLabel}
              </span>
              {selectedBlog.views ? <span>{formatViews(selectedBlog.views)} 阅读</span> : null}
              {selectedBlog.likes ? <span>{formatViews(selectedBlog.likes)} 赞</span> : null}
            </div>
            {selectedBlog.tags && selectedBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedBlog.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{
                    background: isLight ? 'rgba(139,105,20,0.06)' : 'rgba(255,255,255,0.04)',
                    color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.5)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-6">
            {contentLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
                <p className="mt-3 text-sm" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                  加载文章中...
                </p>
              </div>
            ) : articleContent ? (
              <div
                className="prose-custom leading-relaxed"
                style={{ fontSize: `${fontSize}px`, color: isLight ? '#3a3020' : '#d2c8b8' }}
                dangerouslySetInnerHTML={{ __html: articleContent.content }}
              />
            ) : (
              <div className="text-center py-16" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                <p className="text-sm">暂无内容，点击下方按钮在原站阅读</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 flex justify-center" style={{ borderTop: isLight ? '1px solid rgba(180,150,100,0.1)' : '1px solid rgba(255,255,255,0.04)' }}>
            <a
              href={selectedBlog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                color: '#0c0907',
                boxShadow: '0 4px 15px rgba(232,168,73,0.25)',
              }}
            >
              在原站阅读
            </a>
          </div>
        </div>

        <style jsx global>{`
          .prose-custom {
            color: ${isLight ? '#3a3020' : '#d2c8b8'};
          }
          .prose-custom h1:first-child, .prose-custom h2:first-child {
            font-size: 1.8em;
            margin-top: 0;
            margin-bottom: 1em;
            padding-bottom: 0.8em;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .prose-custom h1, .prose-custom h2, .prose-custom h3, .prose-custom h4, .prose-custom h5, .prose-custom h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 700;
            color: ${isLight ? '#2c1f14' : '#f0e6d6'};
          }
          .prose-custom h1 { font-size: 1.5em; }
          .prose-custom h2 { font-size: 1.3em; }
          .prose-custom h3 { font-size: 1.1em; }
          .prose-custom p {
            margin-bottom: 1em;
            line-height: 1.8;
            color: ${isLight ? '#3a3020' : '#d2c8b8'};
          }
          .prose-custom span, .prose-custom div, .prose-custom li {
            color: inherit;
          }
          .prose-custom pre {
            background: #1a1a1a !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 8px !important;
            padding: 16px !important;
            overflow-x: auto;
            margin: 1em 0;
            font-size: 0.9em;
            color: #e0e0e0 !important;
          }
          .prose-custom code {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(255,255,255,0.08);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #f0e6d6 !important;
          }
          .prose-custom pre code {
            background: none !important;
            padding: 0 !important;
            color: #e0e0e0 !important;
          }
          .prose-custom blockquote {
            border-left: 3px solid rgba(232,168,73,0.5) !important;
            padding: 12px 16px !important;
            margin: 1em 0 !important;
            background: #1a1a1a !important;
            border-radius: 0 8px 8px 0 !important;
            color: #e0e0e0 !important;
          }
          .prose-custom blockquote p {
            color: #e0e0e0 !important;
          }
          .prose-custom [style*="background"] {
            background: #1a1a1a !important;
          }
          .prose-custom [style*="color"] {
            color: #e0e0e0 !important;
          }
          .prose-custom [style*="border"] {
            border-color: rgba(255,255,255,0.15) !important;
          }
          .prose-custom code, .prose-custom kbd, .prose-custom samp, .prose-custom var {
            background: rgba(255,255,255,0.1) !important;
            color: #f0e6d6 !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            font-family: 'JetBrains Mono', monospace;
          }
          .prose-custom mark {
            background: rgba(232,168,73,0.3) !important;
            color: #f0e6d6 !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
          }
          .prose-custom a {
            color: #e8a849;
            text-decoration: underline;
          }
          .prose-custom ul, .prose-custom ol {
            padding-left: 1.5em;
            margin-bottom: 1em;
          }
          .prose-custom li {
            margin-bottom: 0.3em;
          }
          .prose-custom table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            background: #1a1a1a !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
          }
          .prose-custom th, .prose-custom td {
            border: 1px solid rgba(255,255,255,0.15) !important;
            padding: 10px 14px !important;
            text-align: left;
            color: #e0e0e0 !important;
            background: #1a1a1a !important;
          }
          .prose-custom th {
            background: #252525 !important;
            color: #f0e6d6 !important;
            font-weight: 600;
          }
          .prose-custom tr:nth-child(even) {
            background: #222 !important;
          }
          .prose-custom strong {
            color: ${isLight ? '#2c1f14' : '#f0e6d6'};
          }
          .prose-custom em {
            color: ${isLight ? '#3a3020' : '#d2c8b8'};
          }
          .prose-custom img {
            max-width: 100%;
            border-radius: 8px;
            margin: 1em 0;
          }
        `}</style>
        </div>
        {/* Scroll Slider */}
        <div
          className="fixed right-2 top-1/2 -translate-y-1/2 z-50 hidden md:block"
          style={{ width: 6, height: 120, background: isLight ? 'rgba(180,150,100,0.15)' : 'rgba(255,255,255,0.08)', borderRadius: 3, cursor: 'pointer' }}
          onMouseDown={handleTrackClick}
        >
          <div
            className="absolute left-0 w-full"
            style={{
              height: 40,
              borderRadius: 3,
              background: isLight ? 'linear-gradient(135deg, #e8a849, #c07a2a)' : 'linear-gradient(135deg, #e8a849, #c07a2a)',
              top: `${scrollProgress * 80}px`,
              cursor: 'grab',
              boxShadow: '0 0 8px rgba(232,168,73,0.4)',
              transition: isDragging ? 'none' : 'top 0.1s ease-out',
            }}
            onMouseDown={handleSliderMouseDown}
          />
        </div>
      </div>
    );
  }

  // Blog list view
  return (
    <div className="relative">
      <div ref={containerRef} className="space-y-6 animate-fade-in" style={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Header Card */}
      <div className="relative rounded-2xl header-card-glow-wrapper">
        <div
          className="header-card-glow-before"
          style={{
            background: isLight
              ? 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(139,105,20,0.3) 45deg, rgba(166,124,26,0.5) 90deg, rgba(139,105,20,0.3) 135deg, transparent 180deg, transparent 360deg)'
              : 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(232,168,73,0.3) 45deg, rgba(240,200,120,0.5) 90deg, rgba(232,168,73,0.3) 135deg, transparent 180deg, transparent 360deg)',
          }}
        />
        <div
          className="relative rounded-2xl p-6 z-10"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #ffffff 0%, #f8f6f3 50%, #f0ece6 100%)'
              : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
            border: isLight
              ? '1px solid rgba(180, 150, 100, 0.2)'
              : '1px solid rgba(232, 168, 73, 0.12)',
            boxShadow: isLight
              ? '0 2px 12px rgba(100, 80, 50, 0.06)'
              : '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(232, 168, 73, 0.08)',
          }}
        >

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💡</span>
            <h2 className="text-lg font-bold tracking-wide" style={{ color: isLight ? '#2c2418' : '#f0c878', fontFamily: 'serif' }}>
              免费学技术
            </h2>
          </div>
          <p className="text-sm ml-7" style={{ color: isLight ? '#6b5e4f' : 'rgba(232, 168, 73, 0.5)' }}>
            精选高赞技术文章，在线阅读学习
          </p>
        </div>

        {/* Category Tabs */}
        <div className="relative mt-4 z-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
                style={category === cat.id ? {
                  background: 'linear-gradient(135deg, #e8a849, #d4943a)',
                  color: '#0c0907',
                  boxShadow: '0 4px 15px rgba(232,168,73,0.3)',
                } : {
                  background: isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)',
                  color: isLight ? '#5a4a3a' : 'rgba(210,180,140,0.7)',
                  border: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4 z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isLight ? '#9a8e7f' : 'rgba(232, 168, 73, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索技术文章..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{
                  background: isLight ? '#ffffff' : 'rgba(20,20,20,0.8)',
                  border: isLight ? '1px solid rgba(180,150,100,0.2)' : '1px solid rgba(232,168,73,0.15)',
                  color: isLight ? '#2c2418' : '#f0c878',
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #e8a849, #c07a2a)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(232, 168, 73, 0.2)',
              }}
            >
              搜索
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Loading */}
      {loading && blogs.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
          <p className="mt-3 text-sm" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>加载中...</p>
        </div>
      )}

      {/* Blog List */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-16" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
          <div className="text-4xl mb-3 opacity-30">📝</div>
          <p className="text-sm">暂无文章</p>
          <button
            onClick={() => loadBlogs(category, keyword)}
            className="mt-4 text-sm font-medium transition-colors"
            style={{ color: isLight ? '#8b6914' : '#e8a849' }}
          >
            重新加载
          </button>
        </div>
      )}

      {blogs.length > 0 && (
        <div className="space-y-3">
          {blogs.map((blog, i) => (
            <div
              key={`${blog.source}-${blog.id}-${i}`}
              onClick={() => handleBlogClick(blog)}
              className="group blog-item-border-glow cursor-pointer"
            >
              <div
                className="p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(20,20,20,0.9)',
                }}
              >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-1.5 line-clamp-2 transition-colors" style={{
                    color: isLight ? '#2c1f14' : '#f0e6d6',
                  }}>
                    {blog.title}
                  </h3>
                  {blog.summary && (
                    <p className="text-xs line-clamp-2 mb-2" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.5)' }}>
                      {blog.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: isLight ? '#7a6248' : 'rgba(210,180,140,0.4)' }}>
                    {blog.author && <span>{blog.author}</span>}
                    <span className="px-1.5 py-0.5 rounded-full" style={{
                      background: isLight ? 'rgba(139,105,20,0.06)' : 'rgba(232,168,73,0.08)',
                      color: isLight ? '#8b6914' : '#e8a849',
                    }}>
                      {blog.sourceLabel}
                    </span>
                    {blog.views ? <span>{formatViews(blog.views)} 阅读</span> : null}
                    {blog.likes ? <span>{formatViews(blog.likes)} 赞</span> : null}
                  </div>
                </div>
                <svg className="w-4 h-4 mt-1 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: isLight ? '#7a6248' : '#e8a849' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {blogs.length >= 20 && (
            <div className="text-center pt-4 pb-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isLight ? 'rgba(139,105,20,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isLight ? '1px solid rgba(139,105,20,0.15)' : '1px solid rgba(255,255,255,0.06)',
                  color: isLight ? '#8b6914' : '#e8a849',
                }}
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .header-card-glow-wrapper {
          position: relative;
          padding: 1px;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(232, 168, 73, 0.1);
        }
        .header-card-glow-before {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          animation: rotate-glow 6s linear infinite;
          z-index: 0;
          filter: blur(1px);
        }
        .blog-item-border-glow {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid ${isLight ? 'rgba(180,150,100,0.1)' : 'rgba(255,255,255,0.06)'};
        }
        .blog-item-border-glow:hover {
          border-color: ${isLight ? 'rgba(180,150,100,0.3)' : 'rgba(232,168,73,0.3)'};
          box-shadow: 0 0 20px rgba(232, 168, 73, 0.1), inset 0 0 20px rgba(232, 168, 73, 0.03);
          transform: translateY(-2px);
        }
        .blog-item-border-glow:active {
          transform: scale(0.99);
        }
        @keyframes rotate-glow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
      {/* Scroll Slider */}
      <div
        className="fixed right-2 top-1/2 -translate-y-1/2 z-50 hidden md:block"
        style={{ width: 6, height: 120, background: isLight ? 'rgba(180,150,100,0.15)' : 'rgba(255,255,255,0.08)', borderRadius: 3, cursor: 'pointer' }}
        onMouseDown={handleTrackClick}
      >
        <div
          className="absolute left-0 w-full"
          style={{
            height: 40,
            borderRadius: 3,
            background: isLight ? 'linear-gradient(135deg, #e8a849, #c07a2a)' : 'linear-gradient(135deg, #e8a849, #c07a2a)',
            top: `${scrollProgress * 80}px`,
            cursor: 'grab',
            boxShadow: '0 0 8px rgba(232,168,73,0.4)',
            transition: isDragging ? 'none' : 'top 0.1s ease-out',
          }}
          onMouseDown={handleSliderMouseDown}
        />
      </div>
    </div>
  );
}
