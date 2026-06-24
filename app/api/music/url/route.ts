import { NextRequest, NextResponse } from 'next/server';
import { getPlayUrl } from '@/lib/music-api';
import { QualityLevel } from '@/types/music';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const source = searchParams.get('source') || '';
    const musicU = searchParams.get('musicU') || '';
    const quality = (searchParams.get('quality') || 'exhigh') as QualityLevel;

    if (!id) {
      return NextResponse.json({ error: '缺少歌曲 ID' }, { status: 400 });
    }

    const result = await getPlayUrl(id, source, musicU, quality);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get URL error:', error);
    return NextResponse.json({ error: error.message || '获取播放链接失败' }, { status: 500 });
  }
}
