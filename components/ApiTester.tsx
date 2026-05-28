'use client';

import { useState } from 'react';

export default function ApiTester() {
  const [url, setUrl] = useState('https://music.zkkp.nyc.mn/music/search?page=1&type=song&q=%E8%96%9B%E4%B9%8B%E8%B0%A6&sources=netease&sources=qq&sources=kugou&sources=kuwo&sources=migu');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert('已复制到剪贴板');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">API 测试工具</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">请求 URL</label>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
          placeholder="输入 API 地址"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-blue-600'
        }`}
      >
        {loading ? '请求中...' : '发送请求'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">响应结果</label>
            <button
              onClick={handleCopy}
              className="text-primary hover:text-blue-600 text-sm"
            >
              复制结果
            </button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
