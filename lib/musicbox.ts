import { Song, PlayUrl, Lyric, Playlist, PlaylistDetail } from '@/types/music';

const MUSICBOX_API = 'https://fy-musicbox-api.mu-jie.cc';

export async function searchMusicBox(keyword: string, page: number = 1): Promise<Song[]> {
  try {
    const url = `${MUSICBOX_API}/netease/search/song/?keywords=${encodeURIComponent(keyword)}&pn=${page}&limit=20`;

    const response = await fetch(url, {
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
    return { lyric: text };
  } catch {
    return { lyric: '' };
  }
}

export async function getRecommendPlaylists(limit: number = 30): Promise<Playlist[]> {
  try {
    const response = await fetch(`/api/music/playlists?type=recommend&limit=${limit}`);
    const data = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: `${item.server || 'netease'}_${item.id}`,
      name: item.name || '',
      cover: item.coverImgUrl || '',
      trackCount: item.trackCount || 0,
      playCount: item.playCount || 0,
      server: item.server || 'netease',
    }));
  } catch {
    return [];
  }
}

export async function getPlaylistDetail(playlistId: string): Promise<PlaylistDetail | null> {
  const parts = playlistId.split('_');
  const server = parts[0] || 'netease';
  const id = parts[1] || playlistId;

  try {
    const response = await fetch(`/api/music/playlists?type=detail&id=${id}`);
    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return {
      id: playlistId,
      name: data.name || '',
      cover: data.coverImgUrl || data.cover || '',
      tracks: (data.tracks || []).map((track: any) => ({
        id: `musicbox_${track.id}`,
        name: track.name || '',
        artist: track.ar?.map((a: any) => a.name).join(', ') || track.artist || '',
        album: track.al?.name || track.album || '',
        duration: Math.floor((track.dt || track.duration || 0) / 1000),
        source: 'custom' as const,
        cover: track.al?.picUrl || track.pic || '',
      })),
    };
  } catch {
    return null;
  }
}

export async function searchPlaylists(keyword: string): Promise<Playlist[]> {
  try {
    const response = await fetch(`/api/music/playlists?type=search&keyword=${encodeURIComponent(keyword)}`);
    const data = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: `${item.server || 'netease'}_${item.id}`,
      name: item.name || '',
      cover: item.coverImgUrl || item.cover || '',
      trackCount: item.trackCount || 0,
      playCount: item.playCount || 0,
      server: item.server || 'netease',
    }));
  } catch {
    return [];
  }
}
