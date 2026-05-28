import { UserChannel } from '@/types/music';

const STORAGE_KEY = 'music_parse_channels';

export function getUserChannels(): UserChannel[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveUserChannels(channels: UserChannel[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  } catch (error) {
    console.error('Failed to save user channels:', error);
  }
}

export function addUserChannel(channel: UserChannel): UserChannel[] {
  const channels = getUserChannels();
  channels.push(channel);
  saveUserChannels(channels);
  return channels;
}

export function removeUserChannel(index: number): UserChannel[] {
  const channels = getUserChannels();
  channels.splice(index, 1);
  saveUserChannels(channels);
  return channels;
}

export function toggleUserChannel(index: number): UserChannel[] {
  const channels = getUserChannels();
  if (channels[index]) {
    channels[index].enabled = !channels[index].enabled;
    saveUserChannels(channels);
  }
  return channels;
}

export function importChannelsFromJson(json: string): UserChannel[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format');
    }

    const channels: UserChannel[] = parsed.map((item: any) => ({
      name: item.name || '未命名',
      searchUrl: item.searchUrl || '',
      urlUrl: item.urlUrl || '',
      lyricUrl: item.lyricUrl || '',
      headers: item.headers || {},
      enabled: item.enabled !== false,
    }));

    saveUserChannels(channels);
    return channels;
  } catch (error) {
    throw new Error('JSON 格式错误');
  }
}
