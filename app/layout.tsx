import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '文档转换工具',
  description: '在线文档格式转换工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
