import { Song, PlayUrl, Lyric } from '@/types/music';

const MUSICBOX_API = 'https://musicbox-web-api.mu-jie.cc';

export async function searchMusicBox(keyword: string, page: number = 1): Promise<Song[]> {
  try {
    const response = await fetch(`${MUSICBOX_API}/search?key=${encodeURIComponent(keyword)}&page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
      id: `musicbox_${item.rid || item.id || index}`,
      name: item.name || item.title || '',
      artist: item.artist || item.singer || '',
      album: item.album || '',
      duration: parseInt(item.duration || '0'),
      source: 'custom' as const,
      cover: item.pic || item.cover || '',
    }));
  } catch {
    return [];
  }
}

export async function getMusicBoxUrl(musicId: string): Promise<PlayUrl> {
  const id = musicId.replace('musicbox_', '');

  try {
    const response = await fetch(`${MUSICBOX_API}/musicboxmp3?rid=${id}&key=xKb5zT3Rn9D4vQwA&s=123&t=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('获取播放链接失败');
    }

    const data = await response.json();

    // Check for copyright restriction
    if (typeof data === 'string' && data.includes('无酷我版权')) {
      throw new Error('该歌曲无版权');
    }

    const url = typeof data === 'string' ? data : data.url || data.data?.url || '';

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
    const response = await fetch(`${MUSICBOX_API}/lrc?rid=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return { lyric: '' };
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return { lyric: '' };
    }

    const lyricLines = data.map((item: any) => {
      const time = parseFloat(item.time || '0');
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const milliseconds = Math.floor((time % 1) * 100);
      return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}] ${item.lineLyric || ''}`;
    });

    return { lyric: lyricLines.join('\n') };
  } catch {
    return { lyric: '' };
  }
}
