'use client';

import { useState } from 'react';

interface Book {
  id: string;
  name: string;
  author: string;
  cover: string;
  description: string;
  lastChapter: string;
  source: string;
}

interface Chapter {
  id: string;
  title: string;
}

export default function NovelReader() {
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterContent, setChapterContent] = useState('');
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);

  // 搜索小说
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedBook(null);
    setChapters([]);
    setChapterContent('');

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
      const response = await fetch(`/api/novel/chapter?bookId=${book.id}`);
      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('获取章节失败:', error);
      alert('获取章节失败');
    } finally {
      setLoading(false);
    }
  };

  // 阅读章节
  const handleReadChapter = async (chapterId: string) => {
    if (!selectedBook) return;
    setLoading(true);
    setCurrentChapter(chapterId);

    try {
      const response = await fetch(
        `/api/novel/chapter?bookId=${selectedBook.id}&chapterId=${chapterId}`
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
                第{currentChapter}章
              </span>
            </>
          )}
        </div>
      )}

      {/* 书籍列表 */}
      {!selectedBook && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="font-semibold text-lg mb-1">{book.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{book.author}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
              {book.lastChapter && (
                <p className="text-xs text-primary mt-2">最新: {book.lastChapter}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 章节列表 */}
      {selectedBook && !chapterContent && chapters.length > 0 && (
        <div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">{selectedBook.name}</h3>
            <p className="text-sm text-gray-500">作者: {selectedBook.author}</p>
            {selectedBook.description && (
              <p className="text-sm text-gray-600 mt-2">{selectedBook.description}</p>
            )}
          </div>
          <h3 className="font-semibold mb-3">章节列表</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleReadChapter(chapter.id)}
                className="p-2 text-sm text-left border border-gray-200 rounded hover:border-primary hover:text-primary transition-colors"
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
          <div
            className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapterContent}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => {
                const prevId = String(Number(currentChapter) - 1);
                if (Number(prevId) > 0) handleReadChapter(prevId);
              }}
              disabled={Number(currentChapter) <= 1}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              上一章
            </button>
            <button
              onClick={() => {
                const nextId = String(Number(currentChapter) + 1);
                if (Number(nextId) <= chapters.length) handleReadChapter(nextId);
              }}
              disabled={Number(currentChapter) >= chapters.length}
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
      {!loading && !selectedBook && books.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p>搜索你想看的小说</p>
        </div>
      )}
    </div>
  );
}
