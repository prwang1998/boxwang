import { NextRequest, NextResponse } from 'next/server';

const MUSICBOX_API = 'https://fy-musicbox-api.mu-jie.cc';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const id = searchParams.get('id') || '';

    if (!keyword && !id) {
      return NextResponse.json({ error: '请输入搜索关键词或歌曲ID' }, { status: 400 });
    }

    // Search songs
    const url = `${MUSICBOX_API}/netease/search/song/?keywords=${encodeURIComponent(keyword)}&pn=${page}&limit=20`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mu-jie.cc/musicBox/',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: '搜索失败' }, { status: 500 });
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ songs: [] });
    }

    const songs = data.map((item: any, index: number) => ({
      id: `musicbox_${item.id || index}`,
      name: item.name || '',
      artist: item.artist || '',
      album: item.album || '',
      duration: parseInt(item.duration || '0'),
      source: 'custom' as const,
      cover: item.pic || '',
    }));

    return NextResponse.json({ songs });
  } catch (error: any) {
    console.error('MusicBox search error:', error);
    return NextResponse.json({ error: error.message || '搜索失败' }, { status: 500 });
  }
}
