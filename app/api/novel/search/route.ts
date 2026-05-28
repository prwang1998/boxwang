import { NextRequest, NextResponse } from 'next/server';

// 小说搜索 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const page = parseInt(searchParams.get('page') || '1');

  if (!keyword) {
    return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
  }

  try {
    // 使用免费的小说搜索 API
    const response = await fetch(
      `https://api.apiopen.top/api/searchBooks?name=${encodeURIComponent(keyword)}&page=${page}&size=20`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error('搜索请求失败');
    }

    const data = await response.json();

    if (data.code !== 200) {
      // 如果 API 失败，返回模拟数据用于测试
      return NextResponse.json({
        books: generateMockBooks(keyword),
        page,
        total: 50,
      });
    }

    const books = (data.result || []).map((book: any) => ({
      id: book.id || String(Math.random()),
      name: book.name || book.title || '未知书名',
      author: book.author || '未知作者',
      cover: book.cover || book.img || '',
      description: book.description || book.intro || '',
      lastChapter: book.lastChapter || book.latestChapter || '',
      source: 'api',
    }));

    return NextResponse.json({ books, page, total: books.length });
  } catch (error) {
    console.error('Novel search error:', error);
    // 返回模拟数据
    return NextResponse.json({
      books: generateMockBooks(keyword),
      page,
      total: 50,
    });
  }
}

// 模拟数据生成
function generateMockBooks(keyword: string) {
  return [
    {
      id: 'mock-1',
      name: `${keyword}传奇`,
      author: '网络作家',
      cover: '',
      description: `一部关于${keyword}的精彩小说...`,
      lastChapter: '第100章 大结局',
      source: 'mock',
    },
    {
      id: 'mock-2',
      name: `${keyword}之剑`,
      author: '武侠大师',
      cover: '',
      description: `${keyword}江湖，剑指苍穹...`,
      lastChapter: '第200章 剑道巅峰',
      source: 'mock',
    },
    {
      id: 'mock-3',
      name: `重生之${keyword}`,
      author: '都市写手',
      cover: '',
      description: `重生回到过去，一切都将改变...`,
      lastChapter: '第150章 新的开始',
      source: 'mock',
    },
  ];
}
