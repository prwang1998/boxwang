import { Song, PlayUrl, Lyric, QualityLevel } from '@/types/music';

const isServer = typeof window === 'undefined';

export async function searchNeteaseMusic(keyword: string, page: number = 1, limit: number = 20, musicU?: string): Promise<Song[]> {
  try {
    if (isServer) {
      // Server-side: call directly
      const { searchMusic } = await import('./netease-server');
      const offset = (page - 1) * limit;
      const userCookies: Record<string, string> = {};
      if (musicU) userCookies.MUSIC_U = musicU;
      const songs = await searchMusic(keyword, limit, offset, userCookies);
      return songs.map((item: any) => ({
        id: `netease_${item.id}`,
        name: item.name || '',
        artist: item.artist || '',
        album: item.album || '',
        duration: item.duration || 0,
        source: 'netease' as const,
        cover: item.cover || '',
      }));
    }

    // Client-side: use API route
    let url = `/api/netease?action=search&keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`;
    if (musicU) {
      url += `&musicU=${encodeURIComponent(musicU)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    return (data.songs || []).map((item: any) => ({
      id: `netease_${item.id}`,
      name: item.name || '',
      artist: item.artist || '',
      album: item.album || '',
      duration: item.duration || 0,
      source: 'netease' as const,
      cover: item.cover || '',
    }));
  } catch (error) {
    console.error('Netease search error:', error);
    return [];
  }
}

export async function getNeteasePlayUrl(songId: string, quality: QualityLevel = 'standard', musicU?: string): Promise<PlayUrl> {
  const id = songId.replace('netease_', '');

  try {
    if (isServer) {
      // Server-side: call directly
      const { getSongUrl, isValidQuality } = await import('./netease-server');
      const validQuality = isValidQuality(quality) ? quality : 'standard';
      const userCookies: Record<string, string> = {};
      if (musicU) userCookies.MUSIC_U = musicU;
      const result = await getSongUrl(parseInt(id), validQuality, userCookies);
      return {
        url: result.url,
        br: result.br || 128000,
        size: result.size || 0,
        type: result.type || 'mp3',
        level: result.level || validQuality,
      };
    }

    // Client-side: use API route
    let url = `/api/netease?action=url&id=${id}&quality=${quality}`;
    if (musicU) {
      url += `&musicU=${encodeURIComponent(musicU)}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || '获取播放链接失败');
    }

    return {
      url: data.url,
      br: data.br || 128000,
      size: data.size || 0,
      type: data.type || 'mp3',
      level: data.level || quality,
    };
  } catch (error: any) {
    throw new Error(error.message || '获取播放链接失败');
  }
}

export async function getNeteaseLyric(songId: string, musicU?: string): Promise<Lyric> {
  const id = songId.replace('netease_', '');

  try {
    if (isServer) {
      // Server-side: call directly
      const { getLyric } = await import('./netease-server');
      const userCookies: Record<string, string> = {};
      if (musicU) userCookies.MUSIC_U = musicU;
      const result = await getLyric(parseInt(id), userCookies);
      return {
        lyric: result.lyric || '',
      };
    }

    // Client-side: use API route
    let url = `/api/netease?action=lyric&id=${id}`;
    if (musicU) {
      url += `&musicU=${encodeURIComponent(musicU)}`;
    }

    const response = await fetch(url);
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
