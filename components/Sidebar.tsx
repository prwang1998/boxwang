'use client';

import { useState } from 'react';
import { useTheme } from '@/app/theme-context';

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
      { id: 'movie-watch', label: '免费看片', icon: '🎥' },
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
  {
    id: 'about',
    label: '关于',
    icon: 'ℹ️',
  },
  {
    id: 'settings',
    label: '设置',
    icon: '⚙️',
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
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
          ${collapsed ? 'md:w-[72px]' : 'md:w-64'}
          w-64
          backdrop-blur-xl
          flex flex-col
        `}
        style={isLight ? {
          background: 'rgba(255,255,255,0.85)',
          borderRight: '1px solid rgba(180,150,100,0.12)',
          boxShadow: '1px 0 8px rgba(100,80,50,0.04)',
        } : {
          background: 'linear-gradient(180deg, rgba(14,10,7,0.96) 0%, rgba(10,7,4,0.98) 100%)',
          borderRight: '1px solid rgba(232,168,73,0.08)',
          boxShadow: '1px 0 30px rgba(0,0,0,0.4), inset -1px 0 0 rgba(232,168,73,0.04)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            borderBottom: isLight ? '1px solid rgba(180,150,100,0.12)' : '1px solid rgba(232,168,73,0.08)',
          }}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? 'md:hidden' : ''}`}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={isLight ? {
                background: 'linear-gradient(135deg, #8b6914, #a67c1a)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(139,105,20,0.3)',
              } : {
                background: 'linear-gradient(135deg, #e8a849, #c8842a)',
                color: '#0c0907',
                boxShadow: '0 0 12px rgba(232,168,73,0.4), 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              B
            </div>
            <h1
              className="text-base font-display font-semibold tracking-wide"
              style={isLight ? {
                color: '#2c1f14',
              } : {
                background: 'linear-gradient(135deg, #f0c878, #e8a849)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(232,168,73,0.3))',
              }}
            >
              BoxWang
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 md:hidden"
            style={{ color: isLight ? '#7a6248' : 'rgba(232,168,73,0.5)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg items-center justify-center transition-all duration-300 hidden md:flex"
            style={{ color: isLight ? '#7a6248' : 'rgba(232,168,73,0.4)' }}
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
                onClick={() => item.children ? toggleExpand(item.id) : handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-xl
                  transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                  ${collapsed ? 'md:justify-center' : ''}
                `}
                style={
                  activeItem === item.id || expandedItems.includes(item.id)
                    ? {
                        background: isLight
                          ? 'rgba(139,105,20,0.08)'
                          : 'linear-gradient(90deg, rgba(232,168,73,0.12) 0%, rgba(232,168,73,0.03) 100%)',
                        color: isLight ? '#8b6914' : '#f0c878',
                        borderLeft: isLight ? '3px solid #8b6914' : '3px solid #e8a849',
                        paddingLeft: '9px',
                        textShadow: isLight ? 'none' : '0 0 12px rgba(232,168,73,0.5)',
                        boxShadow: isLight ? 'none' : 'inset 0 0 20px rgba(232,168,73,0.04)',
                      }
                    : {
                        color: isLight ? '#7a6248' : 'rgba(210,180,140,0.55)',
                      }
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className={`font-semibold text-sm flex-1 text-left tracking-[-0.01em] ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                {item.children && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${collapsed ? 'md:hidden' : ''} ${
                      expandedItems.includes(item.id) ? 'rotate-90' : ''
                    }`}
                    style={{ color: isLight ? 'rgba(139,105,20,0.4)' : 'rgba(255,255,255,0.25)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {activeItem === item.id && !item.children && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shadow-glow" style={{ background: isLight ? '#8b6914' : '#e8a849' }} />
                )}
              </button>

              {/* Children */}
              {expandedItems.includes(item.id) && item.children && (
                <div
                  className={`ml-3 mt-1 space-y-0.5 pl-3 ${collapsed ? 'md:hidden' : ''}`}
                  style={{ borderLeft: isLight ? '1px solid rgba(180,150,100,0.15)' : '1px solid rgba(232,168,73,0.08)' }}
                >
                  {item.children.map((child, childIndex) => (
                    <button
                      key={child.id}
                      onClick={() => handleItemClick(child.id)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg text-sm transition-all duration-500 sidebar-child-item is-visible"
                      style={
                        activeItem === child.id
                          ? {
                              background: isLight
                                ? 'rgba(139,105,20,0.08)'
                                : 'linear-gradient(90deg, rgba(232,168,73,0.1) 0%, rgba(232,168,73,0.03) 100%)',
                              color: isLight ? '#8b6914' : '#f0c878',
                              fontWeight: 600,
                              borderLeft: isLight ? '2px solid #8b6914' : '2px solid #e8a849',
                              paddingLeft: '7px',
                              textShadow: isLight ? 'none' : '0 0 10px rgba(232,168,73,0.4)',
                              boxShadow: isLight ? 'inset 0 0 0 1px rgba(139,105,20,0.12)' : 'inset 0 0 0 1px rgba(232,168,73,0.1)',
                              ['--stagger-delay' as string]: `${childIndex * 40}ms`,
                            }
                          : {
                              color: isLight ? '#7a6248' : 'rgba(210,180,140,0.45)',
                              ['--stagger-delay' as string]: `${childIndex * 40}ms`,
                            }
                      }
                    >
                      <span className="text-xs opacity-70">{child.icon}</span>
                      <span className="tracking-[-0.01em]">{child.label}</span>
                      {activeItem === child.id && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full shadow-glow" style={{ background: isLight ? '#8b6914' : '#e8a849' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`p-4 ${collapsed ? 'md:hidden' : ''}`}
          style={{ borderTop: isLight ? '1px solid rgba(180,150,100,0.12)' : '1px solid rgba(232,168,73,0.06)' }}
        >
          <p
            className="text-[10px] text-center tracking-wider uppercase"
            style={isLight ? {
              color: 'rgba(107,94,79,0.4)',
            } : {
              background: 'linear-gradient(135deg, rgba(232,168,73,0.5), rgba(240,200,120,0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BoxWang Tools
          </p>
        </div>
      </aside>
    </>
  );
}
