'use client';

import { useState, useEffect } from 'react';
import { UserChannel } from '@/types/music';
import { getUserChannels, addUserChannel, removeUserChannel, toggleUserChannel, importChannelsFromJson } from '@/lib/parse-channels';

export default function ParseChannelConfig() {
  const [channels, setChannels] = useState<UserChannel[]>([]);
  const [newChannel, setNewChannel] = useState<Partial<UserChannel>>({
    name: '',
    searchUrl: '',
    urlUrl: '',
    lyricUrl: '',
    enabled: true,
  });
  const [importJson, setImportJson] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setChannels(getUserChannels());
  }, []);

  const handleAdd = () => {
    if (!newChannel.name || !newChannel.searchUrl) {
      setError('请填写名称和搜索 URL');
      return;
    }

    const channel: UserChannel = {
      name: newChannel.name || '',
      searchUrl: newChannel.searchUrl || '',
      urlUrl: newChannel.urlUrl || '',
      lyricUrl: newChannel.lyricUrl || '',
      enabled: true,
    };

    const updated = addUserChannel(channel);
    setChannels(updated);
    setNewChannel({ name: '', searchUrl: '', urlUrl: '', lyricUrl: '', enabled: true });
    setError('');
  };

  const handleRemove = (index: number) => {
    const updated = removeUserChannel(index);
    setChannels(updated);
  };

  const handleToggle = (index: number) => {
    const updated = toggleUserChannel(index);
    setChannels(updated);
  };

  const handleImport = () => {
    try {
      const updated = importChannelsFromJson(importJson);
      setChannels(updated);
      setImportJson('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Channels */}
      <div>
        <h4 className="text-sm font-semibold text-obsidian-50 mb-3">当前通道</h4>
        {channels.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-surface/40 border border-white/[0.04]">
            <p className="text-obsidian-100 text-sm">暂无自定义通道</p>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 rounded-xl bg-surface/60 border border-white/[0.06] hover:border-white/[0.1] transition-all">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channel.enabled}
                      onChange={() => handleToggle(index)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <div>
                    <p className="font-medium text-obsidian-50 text-sm">{channel.name}</p>
                    <p className="text-xs text-obsidian-100 truncate max-w-[300px]">{channel.searchUrl}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-error/60 hover:text-error text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-error/10 transition-all"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Channel */}
      <div>
        <h4 className="text-sm font-semibold text-obsidian-50 mb-3">添加新通道</h4>
        <div className="space-y-2.5">
          <input
            type="text"
            value={newChannel.name || ''}
            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
            placeholder="通道名称"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <input
            type="text"
            value={newChannel.searchUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, searchUrl: e.target.value })}
            placeholder="搜索 URL (支持 {keyword} 和 {page} 占位符)"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <input
            type="text"
            value={newChannel.urlUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, urlUrl: e.target.value })}
            placeholder="播放链接 URL (支持 {id} 占位符)"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <input
            type="text"
            value={newChannel.lyricUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, lyricUrl: e.target.value })}
            placeholder="歌词 URL (支持 {id} 占位符)"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-primary text-obsidian-700 rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            添加通道
          </button>
        </div>
      </div>

      {/* Import JSON */}
      <div>
        <h4 className="text-sm font-semibold text-obsidian-50 mb-3">导入配置</h4>
        <textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='粘贴 JSON 配置，例如: [{"name": "源1", "searchUrl": "...", "urlUrl": "...", "lyricUrl": "..."}]'
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm font-mono placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
        />
        <button
          onClick={handleImport}
          className="mt-2.5 px-5 py-2.5 bg-primary text-obsidian-700 rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          导入
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
