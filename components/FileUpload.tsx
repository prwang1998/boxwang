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
        relative rounded-2xl p-8 md:p-12 text-center
        transition-all duration-500 ease-out cursor-pointer
        group corner-accents
        ${disabled
          ? 'bg-surface/20 cursor-not-allowed opacity-50'
          : isDragging
            ? 'bg-primary/[0.04] scale-[1.01]'
            : 'bg-surface/30 hover:bg-surface/50'
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

      {/* Flowing light border effect */}
      <div className={`
        absolute inset-0 rounded-2xl pointer-events-none border-flow
        transition-opacity duration-500
        ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `} />

      {/* Default border */}
      <div className={`
        absolute inset-0 rounded-2xl pointer-events-none border-2 border-dashed
        transition-all duration-500
        ${isDragging
          ? 'border-transparent'
          : 'border-white/[0.06] group-hover:border-transparent'
        }
      `} />

      {/* Inner glow on hover */}
      <div className={`
        absolute inset-[2px] rounded-[14px] pointer-events-none
        transition-all duration-500
        ${isDragging
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100'
        }
      `}
        style={{
          boxShadow: 'inset 0 0 40px rgba(232, 168, 73, 0.03)'
        }}
      />

      {/* Upload icon with enhanced glow */}
      <div className="relative mb-6">
        <div className={`
          inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl
          transition-all duration-500 relative
          ${isDragging ? 'bg-primary/15 scale-110' : 'bg-white/[0.03] group-hover:bg-primary/10 group-hover:scale-105'}
        `}>
          {/* Glow effect */}
          <div className={`
            absolute inset-0 rounded-2xl transition-opacity duration-500
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `} style={{ boxShadow: '0 0 40px rgba(232, 168, 73, 0.15), 0 0 80px rgba(232, 168, 73, 0.05)' }} />

          {/* Metallic sheen */}
          <div className="absolute inset-0 rounded-2xl metal-sheen opacity-50 pointer-events-none" />

          <svg
            className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-500 ${isDragging ? 'text-primary -translate-y-1' : 'text-obsidian-100 group-hover:text-primary'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      </div>

      <p className="text-lg font-medium text-obsidian-50 mb-2 relative">
        {isDragging ? '释放文件即可上传' : '拖拽文件到这里'}
      </p>
      <p className="text-sm text-obsidian-100 mb-5 relative">
        或 <span className="text-gradient font-medium">点击选择文件</span>
      </p>

      {/* File type badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-xs text-obsidian-100 relative">
        <svg className="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>.docx / .pdf</span>
        <span className="w-px h-3 bg-white/[0.06]" />
        <span>≤ 50MB</span>
      </div>
    </div>
  );
}
