'use client';

import { useTheme } from '@/app/theme-context';

interface MovieSkeletonProps {
  count?: number;
}

export default function MovieSkeleton({ count = 12 }: MovieSkeletonProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
          <div
            className="aspect-[2/3] rounded-2xl"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(180,150,100,0.08), rgba(180,150,100,0.04))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            }}
          />
          <div
            className="mt-2.5 h-3.5 rounded-full w-3/4"
            style={{
              background: isLight
                ? 'linear-gradient(90deg, rgba(180,150,100,0.1), rgba(180,150,100,0.05))'
                : 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            }}
          />
          <div
            className="mt-1.5 h-2.5 rounded-full w-1/2"
            style={{
              background: isLight
                ? 'linear-gradient(90deg, rgba(180,150,100,0.06), rgba(180,150,100,0.03))'
                : 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            }}
          />
        </div>
      ))}
    </div>
  );
}
