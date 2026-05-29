import { NextRequest, NextResponse } from 'next/server';
import { searchNovels } from '@/lib/novel-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
  }

  try {
    const books = await searchNovels(keyword);
    return NextResponse.json({ books, total: books.length });
  } catch (error) {
    console.error('Novel search error:', error);
    return NextResponse.json({ books: [], total: 0, error: '搜索失败' });
  }
}
