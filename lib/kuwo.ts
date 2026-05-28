import { Song, PlayUrl, Lyric } from '@/types/music';

const KUWO_SEARCH_API = 'https://search.kuwo.cn/r.s';
const KUWO_URL_API = 'https://antiserver.kuwo.cn/anti.s';
const KUWO_LYRIC_API = 'https://m.kuwo.cn/newh5/singles/songinfoandlrc';

export async function searchKuwo(keyword: string, page: number = 1, limit: number = 20): Promise<Song[]> {
  const params = new URLSearchParams({
    all: keyword,
    ft: 'music',
    itemset: 'web_2013',
    client: 'kt',
    pn: (page - 1).toString(),
    rn: limit.toString(),
    rformat: 'json',
    encoding: 'utf8',
  });

  const response = await fetch(`${KUWO_SEARCH_API}?${params.toString()}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.kuwo.cn/',
    },
  });

  if (!response.ok) {
    throw new Error('酷我搜索失败');
  }

  const data = await response.json();

  if (!data.abslist || !Array.isArray(data.abslist)) {
    return [];
  }

  return data.abslist.map((item: any) => ({
    id: `kuwo_${item.MUSICRID?.replace('MUSIC_', '') || ''}`,
    name: item.SONGNAME || '',
    artist: item.ARTIST || '',
    album: item.ALBUM || '',
    duration: parseInt(item.DURATION || '0'),
    source: 'kuwo' as const,
    cover: item.web_artistpic_small || '',
  }));
}

export async function getKuwoUrl(musicId: string): Promise<PlayUrl> {
  const id = musicId.replace('kuwo_', '');

  const params = new URLSearchParams({
    rid: id,
    type: 'convert_url3',
    br: '128kmp3',
    response: 'url',
  });

  const response = await fetch(`${KUWO_URL_API}?${params.toString()}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.kuwo.cn/',
    },
  });

  if (!response.ok) {
    throw new Error('获取酷我播放链接失败');
  }

  const url = await response.text();

  if (!url || url.includes('error')) {
    throw new Error('酷我播放链接无效');
  }

  return {
    url: url.trim(),
    br: 128,
    size: 0,
  };
}

export async function getKuwoLyric(musicId: string): Promise<Lyric> {
  const id = musicId.replace('kuwo_', '');

  const response = await fetch(`${KUWO_LYRIC_API}?musicId=${id}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.kuwo.cn/',
    },
  });

  if (!response.ok) {
    throw new Error('获取酷我歌词失败');
  }

  const data = await response.json();

  if (!data.data?.lrclist) {
    return { lyric: '' };
  }

  const lyricLines = data.data.lrclist.map((item: any) => {
    const time = parseFloat(item.time || '0');
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}] ${item.lineLyric || ''}`;
  });

  return { lyric: lyricLines.join('\n') };
}
