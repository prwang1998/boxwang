import { NextRequest, NextResponse } from 'next/server';

const MUSICBOX_API = 'https://fy-musicbox-api.mu-jie.cc';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recommend';
    const keyword = searchParams.get('keyword') || '';
    const limit = parseInt(searchParams.get('limit') || '30');
    const id = searchParams.get('id') || '';

    let url = '';

    switch (type) {
      case 'recommend':
        url = `${MUSICBOX_API}/netease/playlist/recommend?limit=${limit}`;
        break;
      case 'search':
        url = `${MUSICBOX_API}/netease/search/playlist/?keywords=${encodeURIComponent(keyword)}&limit=${limit}`;
        break;
      case 'detail':
        url = `${MUSICBOX_API}/netease/playlist/detail?id=${id}`;
        break;
      default:
        return NextResponse.json({ error: '无效的请求类型' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mu-jie.cc/musicBox/',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: '获取歌单失败' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Playlist error:', error);
    return NextResponse.json({ error: error.message || '获取歌单失败' }, { status: 500 });
  }
}
