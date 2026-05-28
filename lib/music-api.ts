import { Song, PlayUrl, Lyric, SearchParams, SearchResult, UserChannel } from '@/types/music';
import { searchKuwo, getKuwoUrl, getKuwoLyric } from './kuwo';
import { searchNetease, getNeteaseUrl, getNeteaseLyric } from './netease';
import { getUserChannels } from './parse-channels';

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

    return {
      url: data.url || data.data?.url || '',
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

export async function searchMusic(params: SearchParams): Promise<SearchResult> {
  const { keyword, page, limit, source } = params;

  const userChannels = getUserChannels().filter(ch => ch.enabled);

  // Try user channels first
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

  // Try Kuwo
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

  // Try Netease
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
  const userChannels = getUserChannels().filter(ch => ch.enabled);

  // Try user channels first
  if (userChannels.length > 0) {
    for (const channel of userChannels) {
      try {
        const result = await getUrlFromChannel(channel, musicId);
        if (result && result.url) {
          return result;
        }
      } catch {
        continue;
      }
    }
  }

  // Try Kuwo
  if (source === 'kuwo') {
    return await getKuwoUrl(musicId);
  }

  // Try Netease
  if (source === 'netease') {
    return await getNeteaseUrl(musicId);
  }

  throw new Error('暂无可用播放资源');
}

export async function getLyric(musicId: string, source: string): Promise<Lyric> {
  const userChannels = getUserChannels().filter(ch => ch.enabled);

  // Try user channels first
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

  // Try Kuwo
  if (source === 'kuwo') {
    return await getKuwoLyric(musicId);
  }

  // Try Netease
  if (source === 'netease') {
    return await getNeteaseLyric(musicId);
  }

  return { lyric: '' };
}
