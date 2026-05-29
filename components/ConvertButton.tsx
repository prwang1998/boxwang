'use client';

import { ConvertDirection } from '@/types';

interface ConvertButtonProps {
  direction: ConvertDirection;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ConvertButton({
  direction,
  onClick,
  disabled,
  loading,
}: ConvertButtonProps) {
  const label = direction === 'docx-to-pdf' ? 'DOCX → PDF' : 'PDF → DOCX';
  const icon = direction === 'docx-to-pdf' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative px-7 py-3.5 rounded-xl font-medium text-sm
        flex items-center gap-2.5 overflow-hidden
        transition-all duration-300
        ${disabled || loading
          ? 'bg-white/[0.03] text-obsidian-100/30 cursor-not-allowed border border-white/[0.03]'
          : 'bg-gradient-to-r from-primary via-primary-hover to-primary-light text-obsidian-700 hover:shadow-glow-xl active:scale-[0.98] shadow-lg shadow-primary/20 btn-luxury'
        }
      `}
    >
      {/* Shimmer overlay */}
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      {/* Metallic sheen */}
      {!disabled && !loading && (
        <div className="absolute inset-0 metal-sheen opacity-30 pointer-events-none" />
      )}
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-obsidian-700/30 border-t-obsidian-700"></div>
      ) : (
        icon
      )}
      {loading ? '转换中...' : label}
    </button>
  );
}
