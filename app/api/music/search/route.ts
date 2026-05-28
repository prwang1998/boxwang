import { NextRequest, NextResponse } from 'next/server';
import { searchMusic } from '@/lib/music-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const source = (searchParams.get('source') || 'all') as 'all' | 'kuwo' | 'netease';

    if (!keyword) {
      return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
    }

    const result = await searchMusic({ keyword, page, limit, source });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message || '搜索失败' }, { status: 500 });
  }
}
