'use client';

import { FileStatus } from '@/types';

interface StatusBarProps {
  status: FileStatus;
  errorMessage?: string;
}

const statusConfig: Record<FileStatus, { message: string; color: string; icon: string }> = {
  idle: { message: '请选择文件', color: 'text-obsidian-100', icon: 'idle' },
  reading: { message: '正在读取文件...', color: 'text-primary', icon: 'loading' },
  previewing: { message: '正在生成预览...', color: 'text-primary', icon: 'loading' },
  converting: { message: '正在转换...', color: 'text-primary', icon: 'loading' },
  success: { message: '转换成功，正在下载...', color: 'text-success', icon: 'success' },
  error: { message: '转换失败', color: 'text-error', icon: 'error' },
};

export default function StatusBar({ status, errorMessage }: StatusBarProps) {
  const config = statusConfig[status];
  const message = status === 'error' && errorMessage ? errorMessage : config.message;

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl glass border transition-all duration-300 ${
      status === 'success' ? 'border-success/20' : status === 'error' ? 'border-error/20' : 'border-white/[0.04]'
    }`}>
      {config.icon === 'loading' && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary shadow-glow"></div>
      )}
      {config.icon === 'success' && (
        <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shadow-[0_0_8px_rgba(74,222,128,0.2)]">
          <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {config.icon === 'error' && (
        <div className="w-5 h-5 rounded-full bg-error/15 flex items-center justify-center shadow-[0_0_8px_rgba(248,113,113,0.2)]">
          <svg className="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <span className={`text-sm font-medium ${config.color}`}>{message}</span>
    </div>
  );
}
