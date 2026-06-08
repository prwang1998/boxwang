import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByCategory } from '@/lib/movie-api';
import { MovieCategory } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'popular') as MovieCategory;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const source = searchParams.get('source') || undefined;

    const validCategories: MovieCategory[] = ['popular', 'top_rated', 'upcoming', 'now_playing', 'trending'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: '无效的分类' }, { status: 400 });
    }

    const result = await getMoviesByCategory(category, page, source);

    return NextResponse.json({
      movies: result.movies,
      page: result.page,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
      category,
      source: result._source,
      sourceLabel: result._sourceLabel,
    });
  } catch (error: any) {
    console.error('Movie recommend error:', error);
    return NextResponse.json(
      { error: error.message || '获取推荐电影失败' },
      { status: 500 }
    );
  }
}
