import { Song, PlayUrl, Lyric } from '@/types/music';

const NETEASE_API = '/api/netease';

export async function searchNeteaseMusic(keyword: string, page: number = 1, limit: number = 20): Promise<Song[]> {
  try {
    const response = await fetch(`${NETEASE_API}?action=search&keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
    const data = await response.json();

    if (!response.ok || !data.songs) {
      return [];
    }

    return data.songs.map((item: any) => ({
      id: `netease_${item.id}`,
      name: item.name || '',
      artist: item.artist || '',
      album: item.album || '',
      duration: item.duration || 0,
      source: 'netease' as const,
      cover: item.cover || '',
    }));
  } catch {
    return [];
  }
}

export async function getNeteasePlayUrl(songId: string, quality: string = 'standard'): Promise<PlayUrl> {
  const id = songId.replace('netease_', '');

  try {
    const response = await fetch(`${NETEASE_API}?action=url&id=${id}&quality=${quality}`);
    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || '获取播放链接失败');
    }

    return {
      url: data.url,
      br: data.br || 128000,
      size: data.size || 0,
    };
  } catch (error: any) {
    throw new Error(error.message || '获取播放链接失败');
  }
}

export async function getNeteaseLyric(songId: string): Promise<Lyric> {
  const id = songId.replace('netease_', '');

  try {
    const response = await fetch(`${NETEASE_API}?action=lyric&id=${id}`);
    const data = await response.json();

    if (!response.ok) {
      return { lyric: '' };
    }

    return {
      lyric: data.lyric || '',
    };
  } catch {
    return { lyric: '' };
  }
}
