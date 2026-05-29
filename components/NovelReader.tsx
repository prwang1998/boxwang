'use client';

import { useState, useEffect } from 'react';

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
  const [fontSize, setFontSize] = useState(16);
  const [hasSearched, setHasSearched] = useState(false);

  // 加载推荐小说
  useEffect(() => {
    loadRecommend();
  }, []);

  const loadRecommend = async () => {
    setRecommendLoading(true);
    try {
      const response = await fetch('/api/novel/recommend');
      const data = await response.json();
      setRecommendBooks(data.books || []);
    } catch (error) {
      console.error('获取推荐失败:', error);
    } finally {
      setRecommendLoading(false);
    }
  };

  // 搜索小说
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setHasSearched(true);

    try {
      const response = await fetch(`/api/novel/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 选择书籍，获取章节列表
  const handleSelectBook = async (book: Book) => {
    setSelectedBook(book);
    setLoading(true);

    try {
      const url = book.url || book.id;
      const response = await fetch(`/api/novel/chapter?bookUrl=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setChapters(data.chapters || []);
      // 更新书籍信息
      if (data.book) {
        setSelectedBook({ ...book, ...data.book, url: book.url, id: book.id, source: book.source });
      }
    } catch (error) {
      console.error('获取章节失败:', error);
      alert('获取章节失败');
    } finally {
      setLoading(false);
    }
  };

  // 阅读章节
  const handleReadChapter = async (chapter: Chapter) => {
    if (!selectedBook) return;
    setLoading(true);
    setCurrentChapter(chapter);

    try {
      const response = await fetch(
        `/api/novel/chapter?bookUrl=${encodeURIComponent(selectedBook.url || selectedBook.id)}&chapterUrl=${encodeURIComponent(chapter.url)}`
      );
      const data = await response.json();
      setChapterContent(data.content || '暂无内容');
    } catch (error) {
      console.error('获取章节内容失败:', error);
      setChapterContent('获取内容失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 返回书籍列表
  const handleBackToBooks = () => {
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');
    setCurrentChapter(null);
  };

  // 返回章节列表
  const handleBackToChapters = () => {
    setChapterContent('');
    setCurrentChapter(null);
  };

  // 小说卡片组件
  const BookCard = ({ book, onClick }: { book: Book; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer"
    >
      {book.cover ? (
        <img
          src={book.cover}
          alt={book.name}
          className="w-16 h-20 object-cover rounded flex-shrink-0 bg-gray-100"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex-shrink-0 flex items-center justify-center text-lg font-bold text-primary/60">
          {book.name.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate">{book.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
        {book.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{book.description}</p>
        )}
        {book.lastChapter && (
          <p className="text-xs text-primary mt-1 truncate">最新: {book.lastChapter}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">免费看小说</h2>

      {/* 搜索框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="输入小说名或作者名搜索"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 推荐小说 - 仅在未搜索时显示 */}
      {!hasSearched && !selectedBook && (
        <div>
          <h3 className="font-semibold text-lg mb-3">推荐阅读</h3>
          {recommendLoading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-400">加载推荐...</p>
            </div>
          ) : recommendBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => handleSelectBook(book)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">暂无推荐</p>
          )}
        </div>
      )}

      {/* 面包屑导航 */}
      {(selectedBook || chapterContent) && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={handleBackToBooks} className="hover:text-primary">
            书架
          </button>
          {selectedBook && (
            <>
              <span>/</span>
              <button
                onClick={handleBackToChapters}
                className={`hover:text-primary ${!chapterContent ? 'text-gray-800 font-medium' : ''}`}
              >
                {selectedBook.name}
              </button>
            </>
          )}
          {chapterContent && currentChapter && (
            <>
              <span>/</span>
              <span className="text-gray-800 font-medium">
                {currentChapter.title}
              </span>
            </>
          )}
        </div>
      )}

      {/* 书籍列表（搜索结果） */}
      {!selectedBook && hasSearched && books.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">搜索结果</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => handleSelectBook(book)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 章节列表 */}
      {selectedBook && !chapterContent && chapters.length > 0 && (
        <div>
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            {selectedBook.cover ? (
              <img
                src={selectedBook.cover}
                alt={selectedBook.name}
                className="w-24 h-32 object-cover rounded flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary/60">
                {selectedBook.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{selectedBook.name}</h3>
              <p className="text-sm text-gray-500">作者: {selectedBook.author}</p>
              {selectedBook.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{selectedBook.description}</p>
              )}
            </div>
          </div>
          <h3 className="font-semibold mb-3">章节列表（共{chapters.length}章）</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleReadChapter(chapter)}
                className="p-2 text-sm text-left border border-gray-200 rounded hover:border-primary hover:text-primary transition-colors truncate"
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 阅读内容 */}
      {chapterContent && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToChapters}
              className="text-primary hover:text-blue-600 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回目录
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">字号:</span>
              <button
                onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                A-
              </button>
              <span className="text-sm w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                A+
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-3">{currentChapter?.title}</h3>
          <div
            className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapterContent}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => {
                if (!currentChapter) return;
                const idx = chapters.findIndex(c => c.url === currentChapter.url);
                if (idx > 0) handleReadChapter(chapters[idx - 1]);
              }}
              disabled={!currentChapter || chapters.findIndex(c => c.url === currentChapter?.url) <= 0}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              上一章
            </button>
            <button
              onClick={() => {
                if (!currentChapter) return;
                const idx = chapters.findIndex(c => c.url === currentChapter.url);
                if (idx < chapters.length - 1) handleReadChapter(chapters[idx + 1]);
              }}
              disabled={!currentChapter || chapters.findIndex(c => c.url === currentChapter?.url) >= chapters.length - 1}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              下一章
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !selectedBook && hasSearched && books.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-3">📭</p>
          <p>未找到相关小说，换个关键词试试</p>
          <button
            onClick={() => { setHasSearched(false); setBooks([]); }}
            className="mt-3 text-primary hover:underline"
          >
            查看推荐
          </button>
        </div>
      )}
    </div>
  );
}
