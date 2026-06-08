import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetail } from '@/lib/movie-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const source = searchParams.get('source') || undefined;

    if (!id) {
      return NextResponse.json({ error: '缺少电影ID' }, { status: 400 });
    }

    const detail = await getMovieDetail(id, source);

    const videoSources = (detail as any)._videoSources || [];

    return NextResponse.json({
      ...detail,
      _videoSources: undefined,
      _source: undefined,
      _sourceLabel: undefined,
      videoSources,
      source: (detail as any)._source,
      sourceLabel: (detail as any)._sourceLabel,
    });
  } catch (error: any) {
    console.error('Movie detail error:', error);
    return NextResponse.json(
      { error: error.message || '获取电影详情失败' },
      { status: 500 }
    );
  }
}
