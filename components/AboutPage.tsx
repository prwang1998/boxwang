'use client';

import { useTheme } from '@/app/theme-context';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  { icon: '📄', title: '文档格式转换', desc: '支持 DOCX ↔ PDF 互转，在线预览文档内容' },
  { icon: '🖼', title: '图片下载', desc: '从网页链接批量提取并下载图片资源' },
  { icon: '🎬', title: '视频工具', desc: '视频格式转换、压缩等处理工具' },
  { icon: '🎵', title: '免费听歌', desc: '多源聚合搜索，支持歌单导入、歌词同步、多种播放模式' },
  { icon: '🎤', title: '备用听歌', desc: '第三方音乐盒嵌入，作为备用播放方案' },
  { icon: '📚', title: '免费看小说', desc: '在线搜索阅读小说，支持多源切换、字体自定义、多种主题' },
  { icon: '⚙', title: '解析通道配置', desc: '自定义音乐 API 解析通道，灵活扩展数据源' },
  { icon: '🔧', title: 'API 测试工具', desc: '调试和测试音乐 API 端点，方便开发者使用' },
];

interface ArchLayer {
  label: string;
  tech: string;
  color: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  { label: '前端框架', tech: 'Next.js 14 (App Router) + React 18 + TypeScript', color: '#e8a849' },
  { label: '样式系统', tech: 'Tailwind CSS 3.4 + 自定义 CSS 动画系统', color: '#f0c878' },
  { label: '状态管理', tech: 'React Hooks (useState / useCallback / useRef)', color: '#b76e79' },
  { label: '音乐服务', tech: '自建 API 聚合层 · 多源解析 · 歌词同步', color: '#e8a849' },
  { label: '小说服务', tech: '自建搜索 API · 多源爬取 · 章节缓存', color: '#f0c878' },
  { label: '文档处理', tech: 'mammoth.js (DOCX) · pdf-lib (PDF) · 浏览器端转换', color: '#b76e79' },
  { label: '视觉设计', tech: '黑金奢华主题 · 玻璃拟态 · 动态光效系统', color: '#e8a849' },
];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 标题区域 */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f6f3 50%, #f0ece6 100%)',
        border: theme === 'dark' ? '1px solid rgba(232, 168, 73, 0.12)' : '1px solid rgba(180, 150, 100, 0.2)',
      }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)',
        }} />
        <div className="relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            <span className={theme === 'dark' ? 'text-gradient-silk' : ''} style={theme === 'light' ? { color: '#8b6914' } : {}}>
              关于 BoxWang 工具箱
            </span>
          </h1>
          <p className={`text-sm max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-obsidian-100/70' : 'text-gray-500'}`}>
            一个集文档转换、图片处理、免费音乐、在线阅读于一体的多功能在线工具箱。
            追求极致的视觉体验与流畅的交互感受。
          </p>
          <div className="separator-gradient mt-6 max-w-xs mx-auto" />
        </div>
      </div>

      {/* 功能介绍 */}
      <section>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <span className={theme === 'dark' ? 'text-gradient-silk' : ''} style={theme === 'light' ? { color: '#8b6914' } : {}}>
            功能一览
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] group"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                  : 'linear-gradient(135deg, #ffffff, #faf8f5)',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(180,150,100,0.15)',
                boxShadow: theme === 'dark' ? 'none' : '0 2px 12px rgba(100,80,50,0.06)',
              }}
            >
              <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className={`font-semibold text-sm mb-1.5 ${theme === 'dark' ? 'text-obsidian-50' : 'text-gray-800'}`}>{f.title}</h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-obsidian-100/60' : 'text-gray-500'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 架构设计 */}
      <section>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
          <span className="text-2xl">🏗</span>
          <span className={theme === 'dark' ? 'text-gradient-silk' : ''} style={theme === 'light' ? { color: '#8b6914' } : {}}>
            架构设计
          </span>
        </h2>
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))'
            : 'linear-gradient(135deg, #ffffff, #faf8f5)',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(180,150,100,0.15)',
          boxShadow: theme === 'dark' ? 'none' : '0 2px 16px rgba(100,80,50,0.06)',
        }}>
          <div className="space-y-4">
            {ARCH_LAYERS.map((layer, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* 连接线 */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: layer.color, boxShadow: `0 0 8px ${layer.color}40` }} />
                  {i < ARCH_LAYERS.length - 1 && (
                    <div className="w-px h-8 mt-1" style={{ background: `linear-gradient(180deg, ${layer.color}40, transparent)` }} />
                  )}
                </div>
                {/* 内容 */}
                <div className="flex-1 pb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-obsidian-100/50' : 'text-gray-400'}`}>{layer.label}</span>
                  <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-obsidian-50' : 'text-gray-700'}`}>{layer.tech}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 技术栈总览 */}
          <div className="mt-8 pt-6" style={{ borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(180,150,100,0.1)' }}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-obsidian-100/50' : 'text-gray-400'}`}>核心技术栈</p>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'mammoth.js', 'pdf-lib', 'Node.js'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: theme === 'dark' ? 'rgba(232, 168, 73, 0.08)' : 'rgba(139, 105, 20, 0.08)',
                    color: theme === 'dark' ? '#f0c878' : '#8b6914',
                    border: theme === 'dark' ? '1px solid rgba(232, 168, 73, 0.15)' : '1px solid rgba(139, 105, 20, 0.15)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 底部信息 */}
      <div className="text-center pb-8">
        <p className={`text-xs ${theme === 'dark' ? 'text-obsidian-100/30' : 'text-gray-400'}`}>
          BoxWang Tools Suite · Built with Next.js &amp; ❤
        </p>
      </div>
    </div>
  );
}
