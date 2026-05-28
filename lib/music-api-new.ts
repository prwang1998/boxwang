import { Song, PlayUrl, Lyric, SearchParams, SearchResult, UserChannel, Playlist, PlaylistDetail } from '@/types/music';

const NEW_API = 'https://music.zkkp.nyc.mn';

// Search songs using new API
export async function searchSongsNew(keyword: string, page: number = 1): Promise<Song[]> {
  try {
    const sources = ['netease', 'qq', 'kugou', 'kuwo', 'migu', 'fivesing', 'jamendo', 'joox', 'qianqian', 'soda', 'bilibili'];
    const sourcesParam = sources.map(s => `sources=${s}`).join('&');
    const url = `${NEW_API}/music/search?page=${page}&type=song&q=${encodeURIComponent(keyword)}&${sourcesParam}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Parse response - need to check actual format
    // Expected format: array of songs or { data: [...] }
    const songs = Array.isArray(data) ? data : data.data || data.songs || [];

    return songs.map((item: any, index: number) => ({
      id: `new_${item.id || item.songid || index}`,
      name: item.name || item.songname || item.title || '',
      artist: item.artist || item.singer || item.author || '',
      album: item.album || item.albumname || '',
      duration: parseInt(item.duration || item.interval || '0'),
      source: 'custom' as const,
      cover: item.pic || item.cover || item.img || item.album_pic || '',
      // Store original data for URL fetching
      _original: item,
    }));
  } catch (error) {
    console.error('Search songs error:', error);
    return [];
  }
}

// Search playlists using new API
export async function searchPlaylistsNew(keyword: string, page: number = 1): Promise<Playlist[]> {
  try {
    const sources = ['netease', 'qq', 'kugou', 'kuwo', 'fivesing', 'soda', 'bilibili'];
    const sourcesParam = sources.map(s => `sources=${s}`).join('&');
    const url = `${NEW_API}/music/search?page=${page}&type=playlist&q=${encodeURIComponent(keyword)}&${sourcesParam}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const playlists = Array.isArray(data) ? data : data.data || data.playlists || [];

    return playlists.map((item: any) => ({
      id: `new_${item.id || item.playlistid}`,
      name: item.name || item.title || '',
      cover: item.cover || item.pic || item.img || '',
      trackCount: item.trackCount || item.song_count || item.size || 0,
      playCount: item.playCount || item.play_count || 0,
      server: item.source || item.server || 'netease',
    }));
  } catch (error) {
    console.error('Search playlists error:', error);
    return [];
  }
}

// Get recommend playlists using new API
export async function getRecommendPlaylistsNew(): Promise<Playlist[]> {
  try {
    const sources = ['netease', 'qq', 'kugou', 'kuwo'];
    const sourcesParam = sources.map(s => `sources=${s}`).join('&');
    const url = `${NEW_API}/music/recommend?${sourcesParam}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const playlists = Array.isArray(data) ? data : data.data || data.playlists || [];

    return playlists.map((item: any) => ({
      id: `new_${item.id || item.playlistid}`,
      name: item.name || item.title || '',
      cover: item.cover || item.pic || item.img || '',
      trackCount: item.trackCount || item.song_count || item.size || 0,
      playCount: item.playCount || item.play_count || 0,
      server: item.source || item.server || 'netease',
    }));
  } catch (error) {
    console.error('Get recommend playlists error:', error);
    return [];
  }
}
