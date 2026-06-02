'use client';

import { useState } from 'react';
import { useToast } from '@/app/toast-context';

export default function ApiTester() {
  const [url, setUrl] = useState('https://music.zkkp.nyc.mn/music/search?page=1&type=song&q=%E8%96%9B%E4%B9%8B%E8%B0%A6&sources=netease&sources=qq&sources=kugou&sources=kuwo&sources=migu');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

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
    toast('已复制到剪贴板', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-obsidian-50">请求 URL</label>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-white/[0.06] text-obsidian-50 text-sm font-mono placeholder:text-obsidian-100/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          placeholder="输入 API 地址"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className={`
          px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2
          transition-all duration-200
          ${loading
            ? 'bg-white/[0.04] text-obsidian-100/40 cursor-not-allowed border border-white/[0.04]'
            : 'bg-primary text-obsidian-700 hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-glow active:scale-[0.98]'
          }
        `}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-obsidian-700/30 border-t-obsidian-700"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
        {loading ? '请求中...' : '发送请求'}
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-slide-up">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-obsidian-50">响应结果</label>
            <button
              onClick={handleCopy}
              className="text-primary hover:text-primary-hover text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </button>
          </div>
          <pre className="p-5 bg-obsidian-600 border border-white/[0.06] text-emerald-400 rounded-xl overflow-auto max-h-[500px] text-xs font-mono leading-relaxed">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
