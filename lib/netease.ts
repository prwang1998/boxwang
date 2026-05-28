import { Song, PlayUrl, Lyric } from '@/types/music';

const NETEASE_API = 'https://music.163.com/api';

export async function searchNetease(keyword: string, page: number = 1, limit: number = 20): Promise<Song[]> {
  const params = new URLSearchParams({
    s: keyword,
    type: '1',
    offset: ((page - 1) * limit).toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${NETEASE_API}/cloudsearch/pc?${params.toString()}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/',
    },
  });

  if (!response.ok) {
    throw new Error('网易云搜索失败');
  }

  const data = await response.json();

  if (!data.result?.songs) {
    return [];
  }

  return data.result.songs.map((item: any) => ({
    id: `netease_${item.id}`,
    name: item.name || '',
    artist: item.ar?.map((a: any) => a.name).join(', ') || '',
    album: item.al?.name || '',
    duration: Math.floor((item.dt || 0) / 1000),
    source: 'netease' as const,
    cover: item.al?.picUrl || '',
  }));
}

export async function getNeteaseUrl(musicId: string): Promise<PlayUrl> {
  const id = musicId.replace('netease_', '');

  const response = await fetch(`${NETEASE_API}/song/enhance/player/url?ids=[${id}]&br=320000`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/',
    },
  });

  if (!response.ok) {
    throw new Error('获取网易云播放链接失败');
  }

  const data = await response.json();

  if (!data.data?.[0]?.url) {
    throw new Error('网易云播放链接无效');
  }

  return {
    url: data.data[0].url,
    br: data.data[0].br || 128,
    size: data.data[0].size || 0,
  };
}

export async function getNeteaseLyric(musicId: string): Promise<Lyric> {
  const id = musicId.replace('netease_', '');

  const response = await fetch(`${NETEASE_API}/song/lyric?id=${id}&lv=1&tv=1`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/',
    },
  });

  if (!response.ok) {
    throw new Error('获取网易云歌词失败');
  }

  const data = await response.json();

  return {
    lyric: data.lrc?.lyric || '',
  };
}
