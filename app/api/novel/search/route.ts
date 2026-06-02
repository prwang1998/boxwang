import { NextRequest, NextResponse } from 'next/server';
import { searchNovels, getDefaultSources, NovelSource } from '@/lib/novel-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const sourcesParam = searchParams.get('sources');

  if (!keyword) {
    return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
  }

  try {
    let sources: NovelSource[] | undefined;
    if (sourcesParam) {
      try {
        sources = JSON.parse(sourcesParam);
      } catch {}
    }

    const books = await searchNovels(keyword, sources);
    return NextResponse.json({ books, total: books.length });
  } catch (error) {
    console.error('Novel search error:', error);
    return NextResponse.json({ books: [], total: 0, error: '搜索失败' });
  }
}
