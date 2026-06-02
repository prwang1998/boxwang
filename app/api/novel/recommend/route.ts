import { NextRequest, NextResponse } from 'next/server';
import { getRecommendNovels, getDefaultSources, NovelSource } from '@/lib/novel-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get('sources');

  try {
    let sources: NovelSource[] | undefined;
    if (sourcesParam) {
      try {
        sources = JSON.parse(sourcesParam);
      } catch {}
    }

    const books = await getRecommendNovels(sources);
    return NextResponse.json({ books, total: books.length });
  } catch (error) {
    console.error('Novel recommend error:', error);
    return NextResponse.json({ books: [], total: 0, error: '获取推荐失败' });
  }
}
