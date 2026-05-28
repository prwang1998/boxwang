import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// API Constants
const AES_KEY = Buffer.from('e82ckenh8dichen8');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154';
const REFERER = 'https://music.163.com/';

const API_URLS = {
  SONG_URL: 'https://interface3.music.163.com/eapi/song/enhance/player/url/v1',
  SONG_DETAIL: 'https://interface3.music.163.com/api/v3/song/detail',
  LYRIC: 'https://interface3.music.163.com/api/song/lyric',
  SEARCH: 'https://music.163.com/api/cloudsearch/pc',
  PLAYLIST_DETAIL: 'https://music.163.com/api/v6/playlist/detail',
};

// Crypto utilities
function hexDigest(data: Buffer): string {
  return data.toString('hex');
}

function hashDigest(text: string): Buffer {
  return crypto.createHash('md5').update(text, 'utf-8').digest();
}

function hashHexDigest(text: string): string {
  return hexDigest(hashDigest(text));
}

function encryptParams(url: string, payload: Record<string, any>): string {
  const urlPath = new URL(url).pathname.replace('/eapi/', '/api/');
  const payloadStr = JSON.stringify(payload);
  const digest = hashHexDigest(`nobody${urlPath}use${payloadStr}md5forencrypt`);
  const params = `${urlPath}-36cd479b6b5-${payloadStr}-36cd479b6b5-${digest}`;

  // AES ECB encryption
  const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(params, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return hexDigest(encrypted);
}

// Search music
async function searchMusic(keywords: string, limit: number = 20, offset: number = 0) {
  const data = {
    s: keywords,
    type: '1',
    limit: String(limit),
    offset: String(offset),
  };

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const formData = new URLSearchParams(data);

  const response = await fetch(API_URLS.SEARCH, {
    method: 'POST',
    headers,
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Search error: ${result.message}`);
  }

  const songs = (result.result?.songs || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    artist: item.ar?.map((a: any) => a.name).join(', ') || '',
    album: item.al?.name || '',
    cover: item.al?.picUrl || '',
    duration: Math.floor((item.dt || 0) / 1000),
  }));

  return songs;
}

// Get song URL
async function getSongUrl(songId: number, quality: string = 'exhigh') {
  const config = {
    os: 'pc',
    appver: '',
    osver: '',
    deviceId: 'pyncm!',
    requestId: String(Math.floor(Math.random() * (30000000 - 20000000) + 20000000)),
  };

  const payload = {
    ids: [songId],
    level: quality,
    encodeType: 'flac',
    header: JSON.stringify(config),
  };

  const params = encryptParams(API_URLS.SONG_URL, payload);

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const response = await fetch(API_URLS.SONG_URL, {
    method: 'POST',
    headers,
    body: `params=${params}`,
  });

  if (!response.ok) {
    throw new Error(`Get URL failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Get URL error: ${result.message}`);
  }

  const songData = result.data?.[0];
  if (!songData || !songData.url) {
    throw new Error('No available URL');
  }

  return {
    url: songData.url,
    br: songData.br || 128000,
    size: songData.size || 0,
    type: songData.type || 'mp3',
  };
}

// Get lyric
async function getLyric(songId: number) {
  const data = {
    id: String(songId),
    cp: 'false',
    tv: '0',
    lv: '0',
    rv: '0',
    kv: '0',
    yv: '0',
    ytv: '0',
    yrv: '0',
  };

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const formData = new URLSearchParams(data);

  const response = await fetch(API_URLS.LYRIC, {
    method: 'POST',
    headers,
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Get lyric failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Get lyric error: ${result.message}`);
  }

  return {
    lyric: result.lrc?.lyric || '',
    tlyric: result.tlyric?.lyric || '',
  };
}

// API Route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const keyword = searchParams.get('keyword') || '';
    const id = searchParams.get('id') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const quality = searchParams.get('quality') || 'exhigh';

    switch (action) {
      case 'search': {
        if (!keyword) {
          return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
        }
        const offset = (page - 1) * limit;
        const songs = await searchMusic(keyword, limit, offset);
        return NextResponse.json({ songs });
      }

      case 'url': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const urlData = await getSongUrl(parseInt(id), quality);
        return NextResponse.json(urlData);
      }

      case 'lyric': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const lyricData = await getLyric(parseInt(id));
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
    const { action, keyword, id, limit, page, quality } = body;

    switch (action) {
      case 'search': {
        if (!keyword) {
          return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 });
        }
        const offset = ((page || 1) - 1) * (limit || 20);
        const songs = await searchMusic(keyword, limit || 20, offset);
        return NextResponse.json({ songs });
      }

      case 'url': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const urlData = await getSongUrl(parseInt(id), quality || 'exhigh');
        return NextResponse.json(urlData);
      }

      case 'lyric': {
        if (!id) {
          return NextResponse.json({ error: '缺少歌曲ID' }, { status: 400 });
        }
        const lyricData = await getLyric(parseInt(id));
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
