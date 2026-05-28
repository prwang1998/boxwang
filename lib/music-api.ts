import { Song, PlayUrl, Lyric, SearchParams, SearchResult, UserChannel } from '@/types/music';
import { searchKuwo, getKuwoUrl, getKuwoLyric } from './kuwo';
import { searchNetease, getNeteaseUrl, getNeteaseLyric } from './netease';
import { searchMusicBox, getMusicBoxUrl, getMusicBoxLyric } from './musicbox';
import { searchNeteaseMusic, getNeteasePlayUrl, getNeteaseLyric as getNeteaseLyricNew } from './netease-api';
import { getUserChannels } from './parse-channels';

const NETEASE_MUSIC_U_KEY = 'netease_music_u';

function getNeteaseMusicU(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem(NETEASE_MUSIC_U_KEY) || undefined;
  } catch {
    return undefined;
  }
}

async function searchFromChannel(channel: UserChannel, keyword: string, page: number): Promise<Song[]> {
  if (!channel.searchUrl || !channel.enabled) {
    return [];
  }

  try {
    const url = channel.searchUrl
      .replace('{keyword}', encodeURIComponent(keyword))
      .replace('{page}', page.toString());

    const response = await fetch(url, {
      headers: channel.headers || {},
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Try to extract songs from response
    // Support common response formats
    const songs = data.songs || data.data || data.result || [];
    if (!Array.isArray(songs)) {
      return [];
    }

    return songs.map((item: any, index: number) => ({
      id: `custom_${item.id || index}`,
      name: item.name || item.title || '',
      artist: item.artist || item.singer || item.author || '',
      album: item.album || '',
      duration: parseInt(item.duration || '0'),
      source: 'custom' as const,
      cover: item.cover || item.pic || '',
    }));
  } catch {
    return [];
  }
}

async function getUrlFromChannel(channel: UserChannel, musicId: string): Promise<PlayUrl | null> {
  if (!channel.urlUrl || !channel.enabled) {
    return null;
  }

  try {
    const url = channel.urlUrl.replace('{id}', musicId);

    const response = await fetch(url, {
      headers: channel.headers || {},
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const playUrl = data.url || data.data?.url || '';
    if (!playUrl) {
      return null;
    }

    return {
      url: playUrl,
      br: data.br || data.bitrate || 128,
      size: data.size || 0,
    };
  } catch {
    return null;
  }
}

async function getLyricFromChannel(channel: UserChannel, musicId: string): Promise<Lyric | null> {
  if (!channel.lyricUrl || !channel.enabled) {
    return null;
  }

  try {
    const url = channel.lyricUrl.replace('{id}', musicId);

    const response = await fetch(url, {
      headers: channel.headers || {},
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      lyric: data.lyric || data.data?.lyric || '',
    };
  } catch {
    return null;
  }
}

// Validate if a URL is accessible
async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function searchMusic(params: SearchParams): Promise<SearchResult> {
  const { keyword, page, limit, source } = params;

  // Priority 1: User custom channels
  const userChannels = getUserChannels().filter(ch => ch.enabled);
  if (userChannels.length > 0) {
    for (const channel of userChannels) {
      try {
        const songs = await searchFromChannel(channel, keyword, page);
        if (songs.length > 0) {
          return { songs, total: songs.length, page };
        }
      } catch {
        continue;
      }
    }
  }

  // Priority 2: Netease API (new, more reliable)
  if (source === 'all' || source === 'netease') {
    try {
      const musicU = getNeteaseMusicU();
      const songs = await searchNeteaseMusic(keyword, page, limit, musicU);
      if (songs.length > 0) {
        return { songs, total: songs.length, page };
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 3: MusicBox API
  if (source === 'all' || source === 'kuwo' || source === 'netease') {
    try {
      const songs = await searchMusicBox(keyword, page);
      if (songs.length > 0) {
        return { songs, total: songs.length, page };
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 4: Kuwo
  if (source === 'all' || source === 'kuwo') {
    try {
      const songs = await searchKuwo(keyword, page, limit);
      if (songs.length > 0) {
        return { songs, total: songs.length, page };
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 5: Old Netease
  if (source === 'all' || source === 'netease') {
    try {
      const songs = await searchNetease(keyword, page, limit);
      if (songs.length > 0) {
        return { songs, total: songs.length, page };
      }
    } catch {
      // Continue to next source
    }
  }

  return { songs: [], total: 0, page };
}

export async function getPlayUrl(musicId: string, source: string): Promise<PlayUrl> {
  // Priority 1: User custom channels
  const userChannels = getUserChannels().filter(ch => ch.enabled);
  if (userChannels.length > 0) {
    for (const channel of userChannels) {
      try {
        const result = await getUrlFromChannel(channel, musicId);
        if (result && result.url) {
          const isValid = await validateUrl(result.url);
          if (isValid) {
            return result;
          }
        }
      } catch {
        continue;
      }
    }
  }

  // Priority 2: Netease API (new)
  if (musicId.startsWith('netease_')) {
    try {
      const musicU = getNeteaseMusicU();
      const result = await getNeteasePlayUrl(musicId, 'standard', musicU);
      if (result && result.url) {
        const isValid = await validateUrl(result.url);
        if (isValid) {
          return result;
        }
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 3: MusicBox API
  try {
    const result = await getMusicBoxUrl(musicId);
    if (result && result.url) {
      const isValid = await validateUrl(result.url);
      if (isValid) {
        return result;
      }
    }
  } catch {
    // Continue to next source
  }

  // Priority 4: Kuwo
  if (source === 'kuwo' || source === 'all') {
    try {
      const result = await getKuwoUrl(musicId);
      if (result && result.url) {
        const isValid = await validateUrl(result.url);
        if (isValid) {
          return result;
        }
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 5: Old Netease
  if (source === 'netease' || source === 'all') {
    try {
      const result = await getNeteaseUrl(musicId);
      if (result && result.url) {
        const isValid = await validateUrl(result.url);
        if (isValid) {
          return result;
        }
      }
    } catch {
      // Continue to next source
    }
  }

  throw new Error('暂无可用播放资源');
}

export async function getLyric(musicId: string, source: string): Promise<Lyric> {
  // Priority 1: User custom channels
  const userChannels = getUserChannels().filter(ch => ch.enabled);
  if (userChannels.length > 0) {
    for (const channel of userChannels) {
      try {
        const result = await getLyricFromChannel(channel, musicId);
        if (result && result.lyric) {
          return result;
        }
      } catch {
        continue;
      }
    }
  }

  // Priority 2: Netease API (new)
  if (musicId.startsWith('netease_')) {
    try {
      const musicU = getNeteaseMusicU();
      const result = await getNeteaseLyricNew(musicId, musicU);
      if (result && result.lyric) {
        return result;
      }
    } catch {
      // Continue to next source
    }
  }

  // Priority 3: MusicBox API
  try {
    const result = await getMusicBoxLyric(musicId);
    if (result && result.lyric) {
      return result;
    }
  } catch {
    // Continue to next source
  }

  // Priority 4: Kuwo
  if (source === 'kuwo' || source === 'all') {
    try {
      return await getKuwoLyric(musicId);
    } catch {
      // Continue to next source
    }
  }

  // Priority 5: Old Netease
  if (source === 'netease' || source === 'all') {
    try {
      return await getNeteaseLyric(musicId);
    } catch {
      // Continue to next source
    }
  }

  return { lyric: '' };
}
