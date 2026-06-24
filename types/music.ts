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
  type?: string;
  level?: string;
}

export type QualityLevel = 'standard' | 'exhigh' | 'lossless' | 'hires' | 'sky' | 'jyeffect' | 'jymaster' | 'dolby';

export interface QualityOption {
  value: QualityLevel;
  label: string;
  description: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  { value: 'standard', label: '标准', description: '128kbps' },
  { value: 'exhigh', label: 'HQ', description: '320kbps' },
  { value: 'lossless', label: 'SQ', description: '无损 FLAC' },
  { value: 'hires', label: 'Hi-Res', description: '高解析度' },
  { value: 'dolby', label: '杜比', description: '杜比全景声' },
  { value: 'jymaster', label: '母带', description: 'Master 原版' },
];

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
