import { NextRequest, NextResponse } from 'next/server';
import { getLyric } from '@/lib/music-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const source = searchParams.get('source') || '';

    if (!id) {
      return NextResponse.json({ error: '缺少歌曲 ID' }, { status: 400 });
    }

    const result = await getLyric(id, source);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get lyric error:', error);
    return NextResponse.json({ error: error.message || '获取歌词失败' }, { status: 500 });
  }
}
