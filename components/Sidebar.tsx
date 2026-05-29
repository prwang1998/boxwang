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
      { id: 'parse-channel-config', label: '解析通道配置', icon: '⚙' },
      { id: 'api-tester', label: 'API测试', icon: '🔧' },
    ],
  },
  {
    id: 'reading-tools',
    label: '阅读工具',
    icon: '📚',
    children: [
      { id: 'novel-reader', label: '免费看小说', icon: '📖' },
    ],
  },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeItem, onItemClick, isOpen, onClose, collapsed: collapsedProp, onCollapsedChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['doc-tools', 'audio-tools', 'reading-tools']);
  const [collapsed, setCollapsed] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: string) => {
    onItemClick(id);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — mobile: drawer, desktop: fixed */}
      <aside
        className={`
          /* Mobile: fixed drawer */
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
          /* Desktop: collapsible */
          ${collapsed ? 'md:w-[72px]' : 'md:w-64'}
          w-64
          bg-surface/80 md:bg-surface/60 backdrop-blur-xl
          border-r border-white/[0.06]
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'md:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-obsidian-700 font-bold text-sm shadow-glow">
              B
            </div>
            <h1 className="text-base font-display font-semibold tracking-wide text-obsidian-50">
              BoxWang
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-obsidian-100 hover:text-primary hover:bg-white/[0.06] transition-all md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg items-center justify-center text-obsidian-100 hover:text-primary hover:bg-white/[0.06] transition-all duration-200 hidden md:flex"
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
                  ${collapsed ? 'md:justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className={`font-medium text-sm flex-1 text-left ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                <svg
                  className={`w-3.5 h-3.5 text-obsidian-100 transition-transform duration-200 ${collapsed ? 'md:hidden' : ''} ${
                    expandedItems.includes(item.id) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Children */}
              {expandedItems.includes(item.id) && item.children && (
                <div className={`ml-3 mt-1 space-y-0.5 border-l border-white/[0.06] pl-3 ${collapsed ? 'md:hidden' : ''}`}>
                  {item.children.map((child, childIndex) => (
                    <button
                      key={child.id}
                      onClick={() => handleItemClick(child.id)}
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
        <div className={`p-4 border-t border-white/[0.06] ${collapsed ? 'md:hidden' : ''}`}>
          <p className="text-[10px] text-obsidian-100/50 text-center tracking-wider uppercase">
            BoxWang Tools
          </p>
        </div>
      </aside>
    </>
  );
}
