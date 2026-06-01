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
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ activeItem, onItemClick, isOpen, onClose, collapsed: collapsedProp, onCollapsedChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [collapsedState, setCollapsedState] = useState(false);
  const collapsed = collapsedProp !== undefined ? collapsedProp : collapsedState;
  const setCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof val === 'function' ? val(collapsed) : val;
    setCollapsedState(next);
    onCollapsedChange?.(next);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: string) => {
    // 如果侧边栏收起，先展开
    if (collapsed) {
      setCollapsed(false);
    }
    onItemClick(id);
    onClose?.();
  };

  // 点击父菜单时，如果收起则展开
  const handleMenuClick = (id: string) => {
    if (collapsed) {
      setCollapsed(false);
      // 展开对应的子菜单
      if (!expandedItems.includes(id)) {
        setExpandedItems(prev => [...prev, id]);
      }
    } else {
      toggleExpand(id);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar — 黑金风格，固定定位 */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:w-[72px]' : 'md:w-64'}
          w-64
          flex flex-col
          overflow-hidden
        `}
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
          borderRight: '1px solid rgba(232, 168, 73, 0.15)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5), inset -1px 0 0 rgba(232, 168, 73, 0.1)',
        }}
      >
        {/* 金色顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
          background: 'linear-gradient(90deg, transparent, #e8a849, #f0c878, #e8a849, transparent)',
        }} />

        {/* 金色左侧装饰线 */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px]" style={{
          background: 'linear-gradient(180deg, transparent, rgba(232, 168, 73, 0.2), rgba(232, 168, 73, 0.1), transparent)',
        }} />

        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(232, 168, 73, 0.1)' }}>
          <div className={`flex items-center gap-2.5 ${collapsed ? 'md:hidden' : ''}`}>
            {/* Logo — 黑金风格 */}
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-glow animate-glow-breathe" style={{
              background: 'linear-gradient(135deg, #e8a849, #c07a2a, #f0c878)',
            }}>
              <span className="relative z-10 flex items-center justify-center w-full h-full text-black font-bold text-sm">B</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 metal-sheen pointer-events-none opacity-40" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold tracking-wide" style={{ color: '#f0c878' }}>
                BoxWang
              </h1>
              <p className="text-[9px] tracking-widest uppercase font-medium" style={{ color: 'rgba(232, 168, 73, 0.4)' }}>
                Tools Suite
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all md:hidden"
            style={{ color: 'rgba(232, 168, 73, 0.6)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg items-center justify-center transition-all duration-200 hidden md:flex"
            style={{ color: 'rgba(232, 168, 73, 0.6)' }}
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
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-lg
                  transition-all duration-200 group relative
                  ${expandedItems.includes(item.id)
                    ? 'text-obsidian-50'
                    : 'hover:text-obsidian-50'
                  }
                  ${collapsed ? 'md:justify-center' : ''}
                `}
                style={{
                  color: expandedItems.includes(item.id) ? '#f0c878' : 'rgba(232, 168, 73, 0.6)',
                  background: expandedItems.includes(item.id) ? 'rgba(232, 168, 73, 0.08)' : 'transparent',
                  border: expandedItems.includes(item.id) ? '1px solid rgba(232, 168, 73, 0.12)' : '1px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                <span className={`font-medium text-sm flex-1 text-left ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? 'md:hidden' : ''} ${
                    expandedItems.includes(item.id) ? 'rotate-90' : ''
                  }`}
                  style={{ color: 'rgba(232, 168, 73, 0.4)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Children */}
              {expandedItems.includes(item.id) && item.children && (
                <div className={`ml-3 mt-1 space-y-0.5 pl-3 ${collapsed ? 'md:hidden' : ''}`} style={{ borderLeft: '1px solid rgba(232, 168, 73, 0.1)' }}>
                  {item.children.map((child, childIndex) => (
                    <button
                      key={child.id}
                      onClick={() => handleItemClick(child.id)}
                      className={`
                        w-full flex items-center gap-2.5 p-2 rounded-lg
                        text-sm transition-all duration-200 animate-slide-in-left group relative
                      `}
                      style={{
                        animationDelay: `${childIndex * 0.03}s`,
                        color: activeItem === child.id ? '#f0c878' : 'rgba(232, 168, 73, 0.5)',
                        background: activeItem === child.id ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                        border: activeItem === child.id ? '1px solid rgba(232, 168, 73, 0.15)' : '1px solid transparent',
                      }}
                    >
                      {/* Active indicator */}
                      {activeItem === child.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[13px] w-[2px] h-4 rounded-full shadow-glow" style={{ background: '#e8a849' }} />
                      )}
                      <span className="text-xs opacity-60 group-hover:opacity-80 transition-opacity">{child.icon}</span>
                      <span className="flex-1 text-left">{child.label}</span>
                      {activeItem === child.id && (
                        <div className="w-1.5 h-1.5 rounded-full shadow-glow animate-pulse-soft" style={{ background: '#e8a849' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 ${collapsed ? 'md:hidden' : ''}`} style={{ borderTop: '1px solid rgba(232, 168, 73, 0.1)' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232, 168, 73, 0.3))' }} />
            <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: 'rgba(232, 168, 73, 0.3)' }}>
              BoxWang Tools
            </p>
            <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(232, 168, 73, 0.3), transparent)' }} />
          </div>
        </div>

        {/* 底部金色装饰线 */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
          background: 'linear-gradient(90deg, transparent, rgba(232, 168, 73, 0.2), transparent)',
        }} />
      </aside>
    </>
  );
}
