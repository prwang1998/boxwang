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

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
        disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-blue-600'
      }`}
    >
      {loading ? '转换中...' : label}
    </button>
  );
}
