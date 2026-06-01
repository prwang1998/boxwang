'use client';

import { useCallback, useState } from 'react';
import { validateFile } from '@/lib/file-utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFile = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      className={`
        relative rounded-2xl p-6 md:p-10 text-center
        transition-all duration-300 ease-out cursor-pointer
        border-2 border-dashed
        ${disabled
          ? 'border-white/[0.06] bg-surface/30 cursor-not-allowed opacity-50'
          : isDragging
            ? 'border-primary bg-primary/[0.06] shadow-glow scale-[1.01]'
            : 'border-white/[0.08] bg-surface/40 hover:border-primary/40 hover:bg-surface/60'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".docx,.pdf"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload icon */}
      <div className="mb-5">
        <div className={`
          inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl
          ${isDragging ? 'bg-primary/20' : 'bg-white/[0.04]'}
          transition-all duration-300
        `}>
          <svg className={`w-7 h-7 ${isDragging ? 'text-primary' : 'text-obsidian-100'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      </div>

      <p className="text-base font-medium text-obsidian-50 mb-1.5">
        拖拽文件到这里
      </p>
      <p className="text-sm text-obsidian-100 mb-4">或 <span className="text-primary font-medium">点击选择文件</span></p>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-obsidian-100">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        .docx / .pdf · ≤50MB
      </div>
    </div>
  );
}
