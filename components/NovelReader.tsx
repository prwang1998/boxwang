'use client';

import { useState, useEffect, useRef } from 'react';

interface Book {
  id: string;
  name: string;
  author: string;
  cover: string;
  description: string;
  lastChapter: string;
  source: string;
  url: string;
}

interface Chapter {
  id: string;
  title: string;
  url: string;
}

// 主题配置
const THEMES = {
  light: {
    name: '浅色',
    bg: '#faf7f2',
    bgGradient: 'linear-gradient(180deg, #faf7f2 0%, #f5f0e8 100%)',
    toolbarBg: 'rgba(250,247,242,0.95)',
    text: '#3c3630',
    textSecondary: '#8a7e72',
    textMuted: '#b0a494',
    border: 'rgba(180,160,130,0.2)',
    cardBg: 'linear-gradient(135deg, #2c2218 0%, #3a2a1c 50%, #241a10 100%)',
    cardBorder: 'rgba(80,60,35,0.6)',
    cardText: '#e8ddd0',
    cardTextSecondary: '#a89880',
    cardAccent: '#d4a853',
    drawerBg: 'linear-gradient(180deg, #faf7f2 0%, #f5f0e8 100%)',
    drawerActive: 'rgba(120,80,30,0.1)',
    drawerActiveText: '#8b6914',
    drawerText: '#5c5040',
    chapterBg: 'rgba(42,32,20,0.85)',
    chapterBorder: 'rgba(80,60,35,0.4)',
    chapterText: '#d4c8b8',
    chapterHoverText: '#e8c86a',
    btnPrimary: 'linear-gradient(135deg, #8b6914 0%, #6b4f0e 100%)',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(42,32,20,0.6)',
    btnSecondaryText: '#c8b898',
  },
  dark: {
    name: '深色',
    bg: '#1a1612',
    bgGradient: 'linear-gradient(180deg, #1a1612 0%, #151210 100%)',
    toolbarBg: 'rgba(26,22,18,0.98)',
    text: '#d4c8b8',
    textSecondary: '#8a7e6e',
    textMuted: '#5c5448',
    border: 'rgba(80,70,50,0.3)',
    cardBg: 'linear-gradient(135deg, #242018 0%, #2c2620 50%, #1e1a14 100%)',
    cardBorder: 'rgba(80,70,50,0.4)',
    cardText: '#e0d8c8',
    cardTextSecondary: '#9a8e78',
    cardAccent: '#d4a853',
    drawerBg: 'linear-gradient(180deg, #1e1a14 0%, #181410 100%)',
    drawerActive: 'rgba(180,140,50,0.15)',
    drawerActiveText: '#d4a853',
    drawerText: '#a09480',
    chapterBg: 'rgba(30,26,20,0.9)',
    chapterBorder: 'rgba(80,70,50,0.3)',
    chapterText: '#b0a490',
    chapterHoverText: '#e8c86a',
    btnPrimary: 'linear-gradient(135deg, #8b6914 0%, #6b4f0e 100%)',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(80,70,50,0.3)',
    btnSecondaryText: '#a09480',
  },
  green: {
    name: '护眼',
    bg: '#e8f0e0',
    bgGradient: 'linear-gradient(180deg, #e8f0e0 0%, #dce8d4 100%)',
    toolbarBg: 'rgba(232,240,224,0.95)',
    text: '#2c3828',
    textSecondary: '#5c6e54',
    textMuted: '#8a9c80',
    border: 'rgba(100,130,80,0.2)',
    cardBg: 'linear-gradient(135deg, #1e2a18 0%, #283420 50%, #1a2414 100%)',
    cardBorder: 'rgba(60,90,40,0.5)',
    cardText: '#d0dcc8',
    cardTextSecondary: '#8aaa78',
    cardAccent: '#7ab850',
    drawerBg: 'linear-gradient(180deg, #e8f0e0 0%, #dce8d4 100%)',
    drawerActive: 'rgba(80,140,40,0.12)',
    drawerActiveText: '#4a8a28',
    drawerText: '#4a6040',
    chapterBg: 'rgba(30,42,24,0.85)',
    chapterBorder: 'rgba(60,90,40,0.4)',
    chapterText: '#b8ccac',
    chapterHoverText: '#7ab850',
    btnPrimary: 'linear-gradient(135deg, #4a8a28 0%, #3a6a1e 100%)',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(30,42,24,0.6)',
    btnSecondaryText: '#8aaa78',
  },
};

type ThemeKey = keyof typeof THEMES;

const FONTS = [
  { key: 'serif', name: '宋体', family: '"Noto Serif SC", "Source Han Serif CN", "STSong", "SimSun", serif' },
  { key: 'sans', name: '黑体', family: '"Noto Sans SC", "Source Han Sans CN", "Microsoft YaHei", "PingFang SC", sans-serif' },
  { key: 'kai', name: '楷体', family: '"KaiTi", "STKaiti", "AR PL UKai CN", "楷体", serif' },
];

export default function NovelReader() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendBooks, setRecommendBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterContent, setChapterContent] = useState('');
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [hasSearched, setHasSearched] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>('light');
  const [fontKey, setFontKey] = useState('serif');
  const [columnMode, setColumnMode] = useState<'single' | 'double'>('double');
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('asc');
  const contentRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[themeKey];
  const font = FONTS.find(f => f.key === fontKey) || FONTS[0];

  useEffect(() => { loadRecommend(); }, []);

  const loadRecommend = async () => {
    setRecommendLoading(true);
    try {
      const res = await fetch('/api/novel/recommend');
      const data = await res.json();
      setRecommendBooks(data.books || []);
    } catch (e) {
      console.error('获取推荐失败:', e);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setHasSearched(true);
    try {
      const res = await fetch(`/api/novel/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      console.error('搜索失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (book: Book) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const url = book.url || book.id;
      const res = await fetch(`/api/novel/chapter?bookUrl=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) return;
      setChapters(data.chapters || []);
      if (data.book) {
        setSelectedBook({ ...book, ...data.book, url: book.url, id: book.id, source: book.source });
      }
    } catch (e) {
      console.error('获取章节失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadChapter = async (chapter: Chapter) => {
    if (!selectedBook) return;
    setLoading(true);
    setCurrentChapter(chapter);
    setShowChapters(false);
    setShowSettings(false);
    try {
      const res = await fetch(
        `/api/novel/chapter?bookUrl=${encodeURIComponent(selectedBook.url || selectedBook.id)}&chapterUrl=${encodeURIComponent(chapter.url)}`
      );
      const data = await res.json();
      setChapterContent(data.content || '暂无内容');
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('获取章节内容失败:', e);
      setChapterContent('获取内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setCurrentChapter(null);
    setShowChapters(false);
    setShowSettings(false);
  };

  const handleBackToChapters = () => {
    setChapterContent('');
    setCurrentChapter(null);
    setShowChapters(false);
    setShowSettings(false);
  };

  const navChapter = (dir: -1 | 1) => {
    if (!currentChapter) return;
    const idx = chapters.findIndex(c => c.url === currentChapter.url);
    const next = idx + dir;
    if (next >= 0 && next < chapters.length) handleReadChapter(chapters[next]);
  };

  // ==================== 封面占位 ====================
  const CoverPlaceholder = ({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) => {
    const colors = [
      'from-amber-700 to-red-900',
      'from-emerald-800 to-teal-950',
      'from-slate-700 to-slate-950',
      'from-rose-700 to-pink-950',
      'from-violet-700 to-purple-950',
      'from-orange-700 to-amber-950',
    ];
    const colorIdx = name.charCodeAt(0) % colors.length;
    const sizeClass = size === 'lg' ? 'w-28 h-40 text-3xl' : 'w-16 h-[88px] text-lg';
    return (
      <div className={`${sizeClass} bg-gradient-to-br ${colors[colorIdx]} rounded flex-shrink-0 flex items-center justify-center font-bold text-white/80 shadow-lg relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 4px)' }}></div>
        <span className="relative z-10 drop-shadow-md">{name.charAt(0)}</span>
      </div>
    );
  };

  // ==================== 书籍卡片（深色底板）====================
  const BookCard = ({ book, onClick, index = 0, mode = 'double' }: { book: Book; onClick: () => void; index?: number; mode?: 'single' | 'double' }) => {
    if (mode === 'single') {
      // 单列模式：大封面 + 标题在下方
      return (
        <div
          onClick={onClick}
          className="group relative rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
        >
          <div className="relative">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.name}
                className="w-full h-56 object-cover"
                style={{ borderBottom: `2px solid ${theme.cardBorder}` }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3d2b1f, #2d1f14)' }}>
                <span className="text-5xl font-bold text-white/20">{book.name.charAt(0)}</span>
              </div>
            )}
            {/* 渐变遮罩 */}
            <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }}></div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate group-hover:text-amber-300 transition-colors" style={{ color: theme.cardText }}>{book.name}</h3>
            {book.author && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.cardTextSecondary }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {book.author}
              </p>
            )}
            {book.lastChapter && (
              <p className="text-xs mt-1.5 truncate flex items-center gap-1" style={{ color: theme.cardAccent }}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {book.lastChapter}
              </p>
            )}
          </div>
        </div>
      );
    }

    // 双列模式：横向卡片
    return (
      <div
        onClick={onClick}
        className="group relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
      >
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {book.cover ? (
          <img
            src={book.cover}
            alt={book.name}
            className="w-16 h-[88px] object-cover rounded flex-shrink-0 shadow-md"
            style={{ border: '2px solid rgba(255,255,255,0.1)' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <CoverPlaceholder name={book.name} />
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-semibold text-[15px] truncate group-hover:text-amber-300 transition-colors" style={{ color: theme.cardText }}>{book.name}</h3>
            {book.author && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.cardTextSecondary }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {book.author}
              </p>
            )}
          </div>
          {book.lastChapter && (
            <p className="text-xs mt-1.5 truncate flex items-center gap-1" style={{ color: theme.cardAccent }}>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {book.lastChapter}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ==================== 加载骨架 ====================
  const Skeleton = () => (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div className="w-16 h-[88px] rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
            <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}></div>
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== 设置面板 ====================
  const SettingsPanel = () => (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}></div>
      <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl shadow-2xl overflow-hidden" style={{
        background: theme.toolbarBg,
        border: `1px solid ${theme.border}`,
        backdropFilter: 'blur(12px)',
      }}>
        {/* 主题切换 */}
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>主题</p>
          <div className="flex gap-1.5">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeKey(key as ThemeKey)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${key === themeKey ? 'ring-2 ring-amber-500/50' : ''}`}
                style={{
                  background: t.bg,
                  color: t.text,
                  border: `1px solid ${t.border}`,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 字体切换 */}
        <div className="p-3 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>字体</p>
          <div className="flex flex-col gap-1">
            {FONTS.map(f => (
              <button
                key={f.key}
                onClick={() => setFontKey(f.key)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${f.key === fontKey ? 'font-medium' : ''}`}
                style={{
                  background: f.key === fontKey ? theme.drawerActive : 'transparent',
                  color: f.key === fontKey ? theme.drawerActiveText : theme.textSecondary,
                  fontFamily: f.family,
                }}
              >
                {f.name} — 示例文字
              </button>
            ))}
          </div>
        </div>

        {/* 字号 */}
        <div className="p-3">
          <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>字号</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="w-8 h-8 rounded-lg text-sm font-medium transition-colors" style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}>A-</button>
            <span className="text-sm font-medium" style={{ color: theme.text }}>{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(26, s + 2))} className="w-8 h-8 rounded-lg text-base font-medium transition-colors" style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}>A+</button>
          </div>
        </div>
      </div>
    </>
  );

  // ==================== 阅读视图 ====================
  if (chapterContent && currentChapter) {
    const currentIdx = chapters.findIndex(c => c.url === currentChapter.url);
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]" style={{ background: theme.bgGradient }}>
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border, background: theme.toolbarBg }}>
          <button onClick={handleBackToChapters} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: theme.textSecondary }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            目录
          </button>

          <button onClick={() => setShowChapters(!showChapters)} className="text-sm transition-colors truncate max-w-[200px]" style={{ color: theme.textSecondary }}>
            {currentChapter.title}
          </button>

          <div className="relative flex items-center gap-1.5">
            <button onClick={() => setShowSettings(!showSettings)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: theme.textSecondary, background: showSettings ? theme.drawerActive : 'transparent' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            {showSettings && <SettingsPanel />}
          </div>
        </div>

        {/* 侧边章节抽屉 */}
        {showChapters && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowChapters(false)}></div>
            <div className="fixed left-0 top-0 bottom-0 z-50 w-72 overflow-y-auto shadow-2xl" style={{ background: theme.drawerBg }}>
              <div className="p-4 border-b" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold" style={{ color: theme.text }}>目录</h3>
                  <button onClick={() => setShowChapters(false)} style={{ color: theme.textMuted }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>共 {chapters.length} 章</p>
              </div>
              <div className="p-2">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => handleReadChapter(ch)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: ch.url === currentChapter.url ? theme.drawerActive : 'transparent',
                      color: ch.url === currentChapter.url ? theme.drawerActiveText : theme.drawerText,
                      fontWeight: ch.url === currentChapter.url ? 600 : 400,
                    }}
                  >
                    <span className="text-xs mr-2" style={{ color: theme.textMuted }}>{i + 1}</span>
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 正文内容 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <h1 className="text-xl font-bold mb-8 text-center" style={{ color: theme.text, fontFamily: font.family }}>
              {currentChapter.title}
            </h1>
            <div
              className="leading-[2] whitespace-pre-wrap"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: font.family,
                color: theme.text,
                textIndent: '2em',
              }}
            >
              {chapterContent}
            </div>

            {/* 章节导航 */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t" style={{ borderColor: theme.border }}>
              <button
                onClick={() => navChapter(-1)}
                disabled={currentIdx <= 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-30"
                style={{ color: theme.textSecondary }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                上一章
              </button>
              <span className="text-xs" style={{ color: theme.textMuted }}>{currentIdx + 1} / {chapters.length}</span>
              <button
                onClick={() => navChapter(1)}
                disabled={currentIdx >= chapters.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-30 shadow-sm"
                style={{ background: theme.btnPrimary, color: theme.btnPrimaryText }}
              >
                下一章
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 主视图 ====================
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{
        background: 'linear-gradient(135deg, #3d2b1f 0%, #5c3a21 50%, #2d1f14 100%)',
        boxShadow: '0 4px 20px rgba(60,40,20,0.15)',
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-amber-300/80" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM4 18V6h7v12H4zm9 0V6h7v12h-7z"/></svg>
            <h2 className="text-lg font-bold text-amber-100 tracking-wide" style={{ fontFamily: 'serif' }}>免费看小说</h2>
          </div>
          <p className="text-xs text-amber-200/50 ml-7">海量小说，随心阅读</p>
        </div>
        <div className="relative mt-4 z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索小说名或作者..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-shadow"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-amber-900 transition-all disabled:opacity-50 hover:brightness-95"
              style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>
      </div>

      {/* 推荐小说 */}
      {!hasSearched && !selectedBook && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
              <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>推荐阅读</h3>
            </div>
            {/* 列模式切换 */}
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
              <button
                onClick={() => setColumnMode('single')}
                className="px-2.5 py-1.5 text-xs transition-colors"
                style={{
                  background: columnMode === 'single' ? theme.btnPrimary : 'transparent',
                  color: columnMode === 'single' ? theme.btnPrimaryText : theme.textMuted,
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => setColumnMode('double')}
                className="px-2.5 py-1.5 text-xs transition-colors"
                style={{
                  background: columnMode === 'double' ? theme.btnPrimary : 'transparent',
                  color: columnMode === 'double' ? theme.btnPrimaryText : theme.textMuted,
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              </button>
            </div>
          </div>
          {recommendLoading ? (
            <Skeleton />
          ) : recommendBooks.length > 0 ? (
            <div className={columnMode === 'single' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
              {recommendBooks.map((book, i) => (
                <BookCard key={book.id} book={book} onClick={() => handleSelectBook(book)} index={i} mode={columnMode} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-sm" style={{ color: theme.textMuted }}>暂无推荐</p>
          )}
        </div>
      )}

      {/* 面包屑导航 */}
      {(selectedBook || chapterContent) && (
        <div className="flex items-center gap-1.5 text-sm">
          <button onClick={handleBackToBooks} className="transition-colors hover:text-amber-700" style={{ color: theme.textMuted }}>书架</button>
          {selectedBook && (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <button onClick={handleBackToChapters} className="transition-colors font-medium" style={{ color: !chapterContent ? theme.text : theme.textMuted }}>
                {selectedBook.name}
              </button>
            </>
          )}
          {chapterContent && currentChapter && (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.textMuted }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="font-medium truncate max-w-[200px]" style={{ color: theme.text }}>{currentChapter.title}</span>
            </>
          )}
        </div>
      )}

      {/* 搜索结果 */}
      {!selectedBook && hasSearched && books.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
            <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>搜索结果</h3>
            <span className="text-xs ml-1" style={{ color: theme.textMuted }}>({books.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {books.map((book, i) => (
              <BookCard key={book.id} book={book} onClick={() => handleSelectBook(book)} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* 书籍详情 + 章节列表 */}
      {selectedBook && !chapterContent && (
        <div>
          {/* 书籍信息（深色背景） */}
          <div className="rounded-2xl p-5 mb-6 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #2c2218 0%, #3a2a1c 50%, #241a10 100%)',
            border: '1px solid rgba(80,60,35,0.5)',
            boxShadow: '0 4px 20px rgba(30,20,10,0.2)',
          }}>
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)',
            }}></div>
            <div className="relative z-10 flex gap-4">
              {selectedBook.cover ? (
                <img
                  src={selectedBook.cover}
                  alt={selectedBook.name}
                  className="w-28 h-40 object-cover rounded-lg shadow-xl flex-shrink-0"
                  style={{ border: '3px solid rgba(255,255,255,0.1)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <CoverPlaceholder name={selectedBook.name} size="lg" />
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-amber-100" style={{ fontFamily: 'serif' }}>{selectedBook.name}</h3>
                  {selectedBook.author && (
                    <p className="text-sm text-amber-200/60 mt-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {selectedBook.author}
                    </p>
                  )}
                  {selectedBook.description && (
                    <p className="text-xs text-amber-200/40 mt-2 line-clamp-2 leading-relaxed">{selectedBook.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium text-amber-300/80" style={{ background: 'rgba(180,140,50,0.15)' }}>
                    {chapters.length} 章
                  </span>
                  {selectedBook.source && (
                    <span className="px-2.5 py-1 rounded-md text-xs text-amber-200/40" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {selectedBook.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 章节列表 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-700 to-red-800"></div>
              <h3 className="font-bold tracking-wide" style={{ color: theme.text, fontFamily: 'serif' }}>章节列表</h3>
              <span className="text-xs ml-1" style={{ color: theme.textMuted }}>({chapters.length})</span>
            </div>
            {/* 排序切换 */}
            <button
              onClick={() => setChapterOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: theme.btnSecondary, color: theme.btnSecondaryText }}
            >
              {chapterOrder === 'asc' ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                  正序
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m8-4v12m0 0l-4-4m4 4l4-4" /></svg>
                  倒序
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(chapterOrder === 'desc' ? [...chapters].reverse() : chapters).map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleReadChapter(chapter)}
                className="group px-3 py-2.5 text-sm text-left rounded-lg transition-all truncate"
                style={{
                  background: theme.chapterBg,
                  border: `1px solid ${theme.chapterBorder}`,
                  color: theme.chapterText,
                }}
              >
                <span className="group-hover:transition-colors" style={{ '--hover-color': theme.chapterHoverText } as React.CSSProperties}>
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2" style={{ color: theme.textMuted }}>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: theme.textMuted, borderTopColor: theme.cardAccent }}></div>
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !selectedBook && hasSearched && books.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">📚</div>
          <p className="text-sm" style={{ color: theme.textSecondary }}>未找到相关小说</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>换个关键词试试</p>
          <button
            onClick={() => { setHasSearched(false); setBooks([]); }}
            className="mt-4 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ color: theme.cardAccent, border: `1px solid ${theme.border}` }}
          >
            查看推荐
          </button>
        </div>
      )}
    </div>
  );
}
