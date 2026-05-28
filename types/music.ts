export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  source: 'kuwo' | 'netease' | 'custom';
  cover?: string;
}

export interface PlayUrl {
  url: string;
  br: number;
  size: number;
}

export interface Lyric {
  lyric: string;
}

export interface UserChannel {
  name: string;
  searchUrl: string;
  urlUrl: string;
  lyricUrl: string;
  headers?: Record<string, string>;
  enabled: boolean;
}

export interface SearchParams {
  keyword: string;
  page: number;
  limit: number;
  source: 'all' | 'kuwo' | 'netease';
}

export interface SearchResult {
  songs: Song[];
  total: number;
  page: number;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  trackCount: number;
  playCount: number;
  server: string;
}

export interface PlaylistDetail {
  id: string;
  name: string;
  cover: string;
  tracks: Song[];
}
