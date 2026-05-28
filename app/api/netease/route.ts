import { NextRequest, NextResponse } from 'next/server';
import { searchMusic, getSongUrl, getLyric, isValidQuality, QualityLevel } from '@/lib/netease-server';

// API Route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const keyword = searchParams.get('keyword') || '';
    const id = searchParams.get('id') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const qualityRaw = searchParams.get('quality') || 'standard';
    const quality = isValidQuality(qualityRaw) ? qualityRaw : 'standard';
    const musicU = searchParams.get('musicU') || '';

    const userCookies: Record<string, string> = {};
    if (musicU) {
      userCookies.MUSIC_U = musicU;
    }

    switch (action) {
      case 'search': {
        if (!keyword) {
          return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
        }
        const offset = (page - 1) * limit;
        const songs = await searchMusic(keyword, limit, offset, userCookies);
        return NextResponse.json({ songs });
      }

      case 'url': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const urlData = await getSongUrl(parseInt(id), quality, userCookies);
        return NextResponse.json(urlData);
      }

      case 'lyric': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const lyricData = await getLyric(parseInt(id), userCookies);
        return NextResponse.json(lyricData);
      }

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Netease API error:', error);
    return NextResponse.json({ error: error.message || '请求失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, keyword, id, limit, page, quality, musicU } = body;

    const userCookies: Record<string, string> = {};
    if (musicU) {
      userCookies.MUSIC_U = musicU;
    }

    switch (action) {
      case 'search': {
        if (!keyword) {
          return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
        }
        const offset = ((page || 1) - 1) * (limit || 20);
        const songs = await searchMusic(keyword, limit || 20, offset, userCookies);
        return NextResponse.json({ songs });
      }

      case 'url': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const qualityRaw = quality || 'standard';
        const validQuality = isValidQuality(qualityRaw) ? qualityRaw : 'standard';
        const urlData = await getSongUrl(parseInt(id), validQuality, userCookies);
        return NextResponse.json(urlData);
      }

      case 'lyric': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const lyricData = await getLyric(parseInt(id), userCookies);
        return NextResponse.json(lyricData);
      }

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Netease API error:', error);
    return NextResponse.json({ error: error.message || '请求失败' }, { status: 500 });
  }
}
