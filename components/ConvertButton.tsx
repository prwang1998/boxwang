'use client';

import { ConvertDirection } from '@/types';

interface ConvertButtonProps {
  direction: ConvertDirection;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ConvertButton({ direction, onClick, disabled, loading }: ConvertButtonProps) {
  const label = direction === 'docx-to-pdf' ? 'DOCX → PDF' : 'PDF → DOCX';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative px-5 py-3 rounded-full font-semibold text-sm
        flex items-center gap-2.5 tracking-[-0.01em]
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${disabled || loading
          ? 'opacity-40 cursor-not-allowed'
          : 'active:scale-[0.97] hover:shadow-glow'
        }
      `}
      style={!(disabled || loading) ? {
        background: 'linear-gradient(135deg, #e8a849, #d4943a)',
        boxShadow: '0 2px 20px rgba(232,168,73,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
      } : {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.3)',
      }}
    >
      {loading ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10">
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-obsidian-700/30 border-t-obsidian-700" />
        </div>
      ) : !(disabled || loading) ? (
        <>
          <span className="text-obsidian-700">{label}</span>
          {/* Button-in-Button trailing icon */}
          <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110 flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-obsidian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </>
      ) : (
        <span>{label}</span>
      )}
      {loading && <span className="text-obsidian-100/40">转换中...</span>}
    </button>
  );
}
