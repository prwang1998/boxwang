'use client';

import { FileStatus } from '@/types';

interface StatusBarProps {
  status: FileStatus;
  errorMessage?: string;
}

const statusMessages: Record<FileStatus, string> = {
  idle: '请选择文件',
  reading: '正在读取文件...',
  previewing: '正在生成预览...',
  converting: '正在转换...',
  success: '转换成功，正在下载...',
  error: '转换失败',
};

const statusColors: Record<FileStatus, string> = {
  idle: 'text-gray-500',
  reading: 'text-primary',
  previewing: 'text-primary',
  converting: 'text-primary',
  success: 'text-success',
  error: 'text-error',
};

export default function StatusBar({ status, errorMessage }: StatusBarProps) {
  const message = status === 'error' && errorMessage ? errorMessage : statusMessages[status];
  const color = statusColors[status];

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
      {status === 'reading' || status === 'previewing' || status === 'converting' ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : null}
      <span className={color}>{message}</span>
    </div>
  );
}
