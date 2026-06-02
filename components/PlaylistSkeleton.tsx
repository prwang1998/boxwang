'use client';

interface PlaylistSkeletonProps {
  count?: number;
}

export default function PlaylistSkeleton({ count = 10 }: PlaylistSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 30}ms` }}>
          {/* Outer shell */}
          <div
            className="aspect-square rounded-2xl p-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Inner cover skeleton */}
            <div
              className="skeleton w-full h-full rounded-[calc(1rem-0.25rem)]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          </div>
          {/* Title skeleton */}
          <div className="mt-2.5 space-y-1.5">
            <div
              className="skeleton h-3 rounded-full"
              style={{ width: `${60 + (i % 4) * 10}%`, background: 'rgba(255,255,255,0.05)' }}
            />
            <div
              className="skeleton h-2.5 rounded-full w-1/3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
