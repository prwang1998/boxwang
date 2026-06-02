'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number; // ms
  format?: (n: number) => string;
  className?: string;
}

export default function CountUp({
  value,
  duration = 900,
  format,
  className = '',
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRunRef.current) {
          hasRunRef.current = true;
          startRef.current = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplay(Math.round(eased * value));
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate);
            }
          };
          rafRef.current = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = format ? format(display) : String(display);

  return (
    <span ref={containerRef} className={className}>
      {formatted}
    </span>
  );
}
