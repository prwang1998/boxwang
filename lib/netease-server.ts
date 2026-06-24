import crypto from 'crypto';

// API Constants
const AES_KEY = Buffer.from('e82ckenh8dichen8');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154';
const REFERER = 'https://music.163.com/';

const API_URLS = {
  SONG_URL: 'https://interface3.music.163.com/eapi/song/enhance/player/url/v1',
  SONG_DETAIL: 'https://interface3.music.163.com/api/v3/song/detail',
  LYRIC: 'https://interface3.music.163.com/api/song/lyric',
  SEARCH: 'https://music.163.com/api/cloudsearch/pc',
  PLAYLIST_DETAIL: 'https://music.163.com/api/v6/playlist/detail',
};

// Default cookies (same as reference project's cookie.txt)
const DEFAULT_COOKIES: Record<string, string> = {
  os: 'pc',
  appver: '8.9.75',
  osver: '',
  deviceId: 'pyncm!',
  MUSIC_U: '1eb9ce22024bb666e99b6743b2222f29ef64a9e88fda0fd5754714b900a5d70d993166e004087dd3b95085f6a85b059f5e9aba41e3f2646e3cebdbec0317df58c119e5',
};

// Quality levels supported by NetEase eapi
const QUALITY_LEVELS = ['standard', 'exhigh', 'lossless', 'hires', 'sky', 'jyeffect', 'jymaster', 'dolby'] as const;
export type QualityLevel = typeof QUALITY_LEVELS[number];

export function isValidQuality(level: string): level is QualityLevel {
  return QUALITY_LEVELS.includes(level as QualityLevel);
}

// Build cookie string: default cookies merged with user cookies
function buildCookieString(userCookies: Record<string, string> = {}): string {
  const merged = { ...DEFAULT_COOKIES, ...userCookies };
  return Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

// Crypto utilities
function hexDigest(data: Buffer): string {
  return data.toString('hex');
}

function hashDigest(text: string): Buffer {
  return crypto.createHash('md5').update(text, 'utf-8').digest();
}

function hashHexDigest(text: string): string {
  return hexDigest(hashDigest(text));
}

function encryptParams(url: string, payload: Record<string, any>): string {
  const urlPath = new URL(url).pathname.replace('/eapi/', '/api/');
  const payloadStr = JSON.stringify(payload);
  const digest = hashHexDigest(`nobody${urlPath}use${payloadStr}md5forencrypt`);
  const params = `${urlPath}-36cd479b6b5-${payloadStr}-36cd479b6b5-${digest}`;

  const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(params, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return hexDigest(encrypted);
}

// Search music
export async function searchMusic(keywords: string, limit: number = 20, offset: number = 0, userCookies: Record<string, string> = {}) {
  const data = {
    s: keywords,
    type: '1',
    limit: String(limit),
    offset: String(offset),
  };

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': buildCookieString(userCookies),
  };

  const formData = new URLSearchParams(data);

  const response = await fetch(API_URLS.SEARCH, {
    method: 'POST',
    headers,
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Search error: ${result.message}`);
  }

  const songs = (result.result?.songs || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    artist: item.ar?.map((a: any) => a.name).join(', ') || '',
    album: item.al?.name || '',
    cover: item.al?.picUrl || '',
    duration: Math.floor((item.dt || 0) / 1000),
  }));

  return songs;
}

// Get song URL
export async function getSongUrl(songId: number, quality: QualityLevel = 'standard', userCookies: Record<string, string> = {}) {
  const config = {
    os: 'pc',
    appver: '8.9.75',
    osver: '',
    deviceId: 'pyncm!',
    requestId: String(Math.floor(Math.random() * (30000000 - 20000000) + 20000000)),
  };

  const payload: Record<string, any> = {
    ids: [songId],
    level: quality,
    encodeType: 'flac',
    header: JSON.stringify(config),
  };

  if (quality === 'sky') {
    payload.immerseType = 'c51';
  }

  const params = encryptParams(API_URLS.SONG_URL, payload);

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': buildCookieString(userCookies),
  };

  const response = await fetch(API_URLS.SONG_URL, {
    method: 'POST',
    headers,
    body: `params=${params}`,
  });

  if (!response.ok) {
    throw new Error(`Get URL failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Get URL error: ${result.message}`);
  }

  const songData = result.data?.[0];
  if (!songData || !songData.url) {
    throw new Error('No available URL');
  }

  return {
    url: songData.url,
    br: songData.br || 128000,
    size: songData.size || 0,
    type: songData.type || 'mp3',
    level: songData.level || quality,
  };
}

// Get lyric
export async function getLyric(songId: number, userCookies: Record<string, string> = {}) {
  const data = {
    id: String(songId),
    cp: 'false',
    tv: '0',
    lv: '0',
    rv: '0',
    kv: '0',
    yv: '0',
    ytv: '0',
    yrv: '0',
  };

  const headers = {
    'User-Agent': USER_AGENT,
    'Referer': REFERER,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': buildCookieString(userCookies),
  };

  const formData = new URLSearchParams(data);

  const response = await fetch(API_URLS.LYRIC, {
    method: 'POST',
    headers,
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Get lyric failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Get lyric error: ${result.message}`);
  }

  return {
    lyric: result.lrc?.lyric || '',
    tlyric: result.tlyric?.lyric || '',
  };
}
