'use client';

import { useEffect, useRef } from 'react';

interface CharRevealProps {
  text: string;
  className?: string;
  delay?: number; // 起始延迟 ms
  stagger?: number; // 每字间隔 ms
  tag?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export default function CharReveal({
  text,
  className = '',
  delay = 0,
  stagger = 40,
  tag: Tag = 'span',
}: CharRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLSpanElement>('.char-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          spans.forEach((span, i) => {
            span.style.animationDelay = `${delay + i * stagger}ms`;
            span.style.animationPlayState = 'running';
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, stagger]);

  const chars = text.split('').map((char, i) => (
    <span
      key={i}
      className="char-reveal"
      style={{ animationPlayState: 'paused' }}
      aria-hidden="true"
    >
      {char === ' ' ? ' ' : char}
    </span>
  ));

  return (
    <Tag
      ref={ref as React.RefObject<any>}
      className={`char-reveal-wrapper ${className}`}
      aria-label={text}
    >
      {chars}
    </Tag>
  );
}
