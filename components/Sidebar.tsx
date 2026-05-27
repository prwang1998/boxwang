'use client';

import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'doc-tools',
    label: '文档工具',
    icon: '📄',
    children: [
      { id: 'format-convert', label: '格式转换', icon: '🔄' },
      { id: 'doc-preview', label: '文档预览', icon: '👁' },
      { id: 'doc-compress', label: '文档压缩', icon: '📦' },
    ],
  },
  {
    id: 'image-tools',
    label: '图片工具',
    icon: '🖼',
    children: [
      { id: 'image-download', label: '图片下载', icon: '⬇' },
    ],
  },
  {
    id: 'video-tools',
    label: '视频工具',
    icon: '🎬',
    children: [
      { id: 'video-convert', label: '格式转换', icon: '🔄' },
      { id: 'video-compress', label: '视频压缩', icon: '📦' },
    ],
  },
  {
    id: 'audio-tools',
    label: '音频工具',
    icon: '🎵',
    children: [
      { id: 'audio-convert', label: '格式转换', icon: '🔄' },
      { id: 'audio-extract', label: '音频提取', icon: '📤' },
    ],
  },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['doc-tools']);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">工具箱</h2>
      </div>
      <nav>
        {menuItems.map((item) => (
          <div key={item.id} className="mb-2">
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </span>
              <span
                className={`transform transition-transform ${
                  expandedItems.includes(item.id) ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
            </button>
            {expandedItems.includes(item.id) && item.children && (
              <div className="ml-4 mt-1">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onItemClick(child.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      activeItem === child.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <span>{child.icon}</span>
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
