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
      { id: 'music-listen', label: '免费听歌', icon: '🎧' },
      { id: 'music-backup', label: '备用听歌', icon: '🎤' },
      { id: 'novel-reader', label: '免费看小说', icon: '📖' },
      { id: 'parse-channel-config', label: '解析通道配置', icon: '⚙' },
      { id: 'api-tester', label: 'API测试', icon: '🔧' },
    ],
  },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['doc-tools', 'audio-tools']);
  const [collapsed, setCollapsed] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <aside
      className={`
        ${collapsed ? 'w-[72px]' : 'w-64'}
        transition-all duration-300 ease-out
        bg-surface/60 backdrop-blur-xl
        border-r border-white/[0.06]
        min-h-screen flex flex-col
        relative z-10
      `}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-obsidian-700 font-bold text-sm shadow-glow">
              B
            </div>
            <h1 className="text-base font-display font-semibold tracking-wide text-obsidian-50">
              BoxWang
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-obsidian-100 hover:text-primary hover:bg-white/[0.06] transition-all duration-200"
          title={collapsed ? '展开侧栏' : '收起侧栏'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, itemIndex) => (
          <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${itemIndex * 0.05}s` }}>
            <button
              onClick={() => toggleExpand(item.id)}
              className={`
                w-full flex items-center gap-3 p-2.5 rounded-xl
                transition-all duration-200
                ${expandedItems.includes(item.id)
                  ? 'bg-white/[0.06] text-obsidian-50'
                  : 'text-obsidian-100 hover:bg-white/[0.04] hover:text-obsidian-50'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-obsidian-100 transition-transform duration-200 ${
                      expandedItems.includes(item.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Children */}
            {expandedItems.includes(item.id) && item.children && !collapsed && (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                {item.children.map((child, childIndex) => (
                  <button
                    key={child.id}
                    onClick={() => onItemClick(child.id)}
                    className={`
                      w-full flex items-center gap-2.5 p-2 rounded-lg
                      text-sm transition-all duration-200 animate-slide-in-left
                      ${activeItem === child.id
                        ? 'bg-primary/15 text-primary font-medium shadow-[inset_0_0_0_1px_rgba(232,168,73,0.15)]'
                        : 'text-obsidian-100 hover:text-obsidian-50 hover:bg-white/[0.04]'
                      }
                    `}
                    style={{ animationDelay: `${childIndex * 0.03}s` }}
                  >
                    <span className="text-xs opacity-70">{child.icon}</span>
                    <span>{child.label}</span>
                    {activeItem === child.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-obsidian-100/50 text-center tracking-wider uppercase">
            BoxWang Tools
          </p>
        </div>
      )}
    </aside>
  );
}
