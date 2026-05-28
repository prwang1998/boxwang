import { Song, PlayUrl, Lyric } from '@/types/music';

const MUSICBOX_API = 'https://fy-musicbox-api.mu-jie.cc';

export async function searchMusicBox(keyword: string, page: number = 1): Promise<Song[]> {
  try {
    const response = await fetch(`${MUSICBOX_API}/netease/search/song/?keywords=${encodeURIComponent(keyword)}&pn=${page}&limit=20`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mu-jie.cc/musicBox/',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any, index: number) => ({
      id: `musicbox_${item.id || index}`,
      name: item.name || '',
      artist: item.artist || '',
      album: item.album || '',
      duration: parseInt(item.duration || '0'),
      source: 'custom' as const,
      cover: item.pic || '',
      // Store the original URL and LRC URL for later use
      _musicboxUrl: item.url,
      _musicboxLrc: item.lrc,
    }));
  } catch {
    return [];
  }
}

export async function getMusicBoxUrl(musicId: string): Promise<PlayUrl> {
  const id = musicId.replace('musicbox_', '');

  try {
    const response = await fetch(`${MUSICBOX_API}/meting/?server=netease&type=url&id=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mu-jie.cc/musicBox/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error('获取播放链接失败');
    }

    // The API returns a redirect URL
    const url = response.url;

    if (!url || url.includes('error') || url === '') {
      throw new Error('播放链接无效');
    }

    return {
      url: url.trim(),
      br: 128,
      size: 0,
    };
  } catch (error: any) {
    throw new Error(error.message || '获取播放链接失败');
  }
}

export async function getMusicBoxLyric(musicId: string): Promise<Lyric> {
  const id = musicId.replace('musicbox_', '');

  try {
    const response = await fetch(`${MUSICBOX_API}/meting/?server=netease&type=lrc&id=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mu-jie.cc/musicBox/',
      },
    });

    if (!response.ok) {
      return { lyric: '' };
    }

    const text = await response.text();

    // The LRC format is already in standard LRC format
    return { lyric: text };
  } catch {
    return { lyric: '' };
  }
}
