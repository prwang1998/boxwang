import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BoxWang · 工具箱',
  description: '在线多功能工具箱 — 文档转换、图片下载、免费音乐',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="bg-obsidian text-obsidian-50 font-body antialiased">
        {children}
      </body>
    </html>
  );
}
