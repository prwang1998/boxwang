import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetail } from '@/lib/movie-api';

// 此接口从详情中提取播放源，作为备用
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

    return NextResponse.json({ sources: videoSources, movieId: id });
  } catch (error: any) {
    console.error('Movie URL error:', error);
    return NextResponse.json(
      { error: error.message || '获取播放源失败' },
      { status: 500 }
    );
  }
}
