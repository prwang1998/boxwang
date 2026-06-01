import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './theme-context';

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
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased relative" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
        {/* === Multi-layer Ambient Light System === */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Layer 1: Primary warm glow — top left */}
          <div className="absolute -top-[25%] -left-[15%] w-[70%] h-[70%] bg-primary/[0.04] rounded-full blur-[150px] animate-float-slow" />

          {/* Layer 2: Rose gold accent — bottom right */}
          <div className="absolute -bottom-[20%] -right-[15%] w-[60%] h-[60%] bg-rose-gold/[0.03] rounded-full blur-[120px] animate-float" />

          {/* Layer 3: Champagne highlight — center */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-champagne/[0.02] rounded-full blur-[180px] animate-pulse-slow" />

          {/* Layer 4: Secondary glow — delayed float */}
          <div className="absolute top-[60%] left-[20%] w-[40%] h-[40%] bg-primary/[0.025] rounded-full blur-[100px] animate-float-delayed" />

          {/* Layer 5: Aurora rotation */}
          <div className="absolute inset-0">
            <div className="absolute top-[10%] left-[30%] w-[30%] h-[30%] bg-gradient-to-br from-primary/[0.03] via-transparent to-rose-gold/[0.02] rounded-full blur-[80px] animate-aurora-slow" />
          </div>
        </div>

        {/* === Starfield Particles === */}
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {/* Static star particles */}
          <div className="star-particle absolute top-[10%] left-[15%] animate-star-twinkle" style={{ animationDelay: '0s' }} />
          <div className="star-particle absolute top-[25%] left-[45%] animate-star-twinkle" style={{ animationDelay: '1s' }} />
          <div className="star-particle absolute top-[15%] left-[75%] animate-star-twinkle" style={{ animationDelay: '2s' }} />
          <div className="star-particle absolute top-[40%] left-[25%] animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
          <div className="star-particle absolute top-[55%] left-[65%] animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
          <div className="star-particle absolute top-[70%] left-[35%] animate-star-twinkle" style={{ animationDelay: '2.5s' }} />
          <div className="star-particle absolute top-[80%] left-[80%] animate-star-twinkle" style={{ animationDelay: '0.8s' }} />
          <div className="star-particle absolute top-[35%] left-[90%] animate-star-twinkle" style={{ animationDelay: '1.8s' }} />
          <div className="star-particle absolute top-[65%] left-[10%] animate-star-twinkle" style={{ animationDelay: '2.2s' }} />
          <div className="star-particle absolute top-[90%] left-[55%] animate-star-twinkle" style={{ animationDelay: '0.3s' }} />

          {/* Floating particles */}
          <div className="particle absolute top-[20%] left-[30%] animate-particle-float" style={{ animationDelay: '0s' }} />
          <div className="particle absolute top-[60%] left-[70%] animate-particle-float" style={{ animationDelay: '3s' }} />
          <div className="particle particle-lg absolute top-[40%] left-[50%] animate-particle-drift" style={{ animationDelay: '2s' }} />
          <div className="particle absolute top-[80%] left-[20%] animate-particle-float" style={{ animationDelay: '5s' }} />
          <div className="particle particle-lg absolute top-[30%] left-[85%] animate-particle-drift" style={{ animationDelay: '4s' }} />
        </div>

        {/* === Fine Grain Texture === */}
        <div className="fixed inset-0 pointer-events-none z-[2] opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* === Main Content === */}
        <div className="relative z-10">
          {children}
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
