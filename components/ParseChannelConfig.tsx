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
      <h3 className="text-lg font-bold text-gray-800">解析通道配置</h3>

      {/* Current Channels */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">当前通道</h4>
        {channels.length === 0 ? (
          <p className="text-gray-500">暂无自定义通道</p>
        ) : (
          <div className="space-y-2">
            {channels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={channel.enabled}
                    onChange={() => handleToggle(index)}
                    className="text-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{channel.name}</p>
                    <p className="text-sm text-gray-500 truncate">{channel.searchUrl}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700"
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
        <h4 className="font-medium text-gray-700 mb-2">添加新通道</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={newChannel.name || ''}
            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
            placeholder="通道名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            value={newChannel.searchUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, searchUrl: e.target.value })}
            placeholder="搜索 URL (支持 {keyword} 和 {page} 占位符)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            value={newChannel.urlUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, urlUrl: e.target.value })}
            placeholder="播放链接 URL (支持 {id} 占位符)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            value={newChannel.lyricUrl || ''}
            onChange={(e) => setNewChannel({ ...newChannel, lyricUrl: e.target.value })}
            placeholder="歌词 URL (支持 {id} 占位符)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* Import JSON */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">导入配置</h4>
        <textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='粘贴 JSON 配置，例如: [{"name": "源1", "searchUrl": "...", "urlUrl": "...", "lyricUrl": "..."}]'
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        <button
          onClick={handleImport}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          导入
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
