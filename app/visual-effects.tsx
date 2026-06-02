'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from './theme-context';

// ── 自定义光标 ──────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    document.body.classList.add('custom-cursor-active');

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    const onDown = () => {
      dotRef.current?.classList.add('clicking');
      ringRef.current?.classList.add('clicking');
    };
    const onUp = () => {
      dotRef.current?.classList.remove('clicking');
      ringRef.current?.classList.remove('clicking');
    };

    const onEnterInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a,button,input,textarea,[role="button"],[data-interactive]')) {
        dotRef.current?.classList.add('hovering');
        ringRef.current?.classList.add('hovering');
      }
    };
    const onLeaveInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a,button,input,textarea,[role="button"],[data-interactive]')) {
        dotRef.current?.classList.remove('hovering');
        ringRef.current?.classList.remove('hovering');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onEnterInteractive);
    document.addEventListener('mouseout', onLeaveInteractive);

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${posRef.current.x}px`;
        dotRef.current.style.top = `${posRef.current.y}px`;
      }
      // ring follows with lerp for elastic lag
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.18;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPosRef.current.x}px`;
        ringRef.current.style.top = `${ringPosRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onEnterInteractive);
      document.removeEventListener('mouseout', onLeaveInteractive);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

// ── 鼠标 Spotlight 光晕 ──────────────────────────────────
function MouseSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!spotRef.current) return;
      spotRef.current.style.left = `${e.clientX}px`;
      spotRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={spotRef}
      className="spotlight-cursor"
      style={{
        width: 500,
        height: 500,
        background: isLight
          ? 'radial-gradient(circle, rgba(139,105,20,0.04) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(232,168,73,0.05) 0%, transparent 70%)',
      }}
    />
  );
}

// ── 环境光背景 ───────────────────────────────────────────
function AmbientBackground() {
  return <div id="ambient-bg" className="ambient-bg" />;
}

// ── 主 Provider ─────────────────────────────────────────
export default function VisualEffects() {
  // 只在桌面启用自定义光标（移动端没有鼠标）
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  return (
    <>
      <AmbientBackground />
      <MouseSpotlight />
      {!isMobile && <CustomCursor />}
    </>
  );
}
