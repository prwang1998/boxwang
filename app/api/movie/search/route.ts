import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/lib/movie-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const source = searchParams.get('source') || undefined;

    if (!keyword.trim()) {
      return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
    }

    const result = await searchMovies(keyword.trim(), page, source);

    return NextResponse.json({
      movies: result.movies,
      page: result.page,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
      source: result._source,
      sourceLabel: result._sourceLabel,
    });
  } catch (error: any) {
    console.error('Movie search error:', error);
    return NextResponse.json(
      { error: error.message || '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}
