'use client';

import { useCallback, useState } from 'react';
import { validateFile } from '@/lib/file-utils';
import { useToast } from '@/app/toast-context';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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
      toast(validation.error || '文件不支持', 'error');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      className={`
        relative rounded-3xl p-1.5 cursor-pointer
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragging ? 'scale-[1.01]' : 'hover:scale-[1.005]'}
      `}
      style={{
        background: isDragging ? 'rgba(232,168,73,0.06)' : 'rgba(255,255,255,0.03)',
        border: isDragging ? '1px solid rgba(232,168,73,0.3)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isDragging
          ? '0 0 40px rgba(232,168,73,0.1), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      {/* Inner core */}
      <div
        className={`
          relative rounded-[calc(1.5rem-0.375rem)] p-6 md:p-10 text-center
          border-2 border-dashed transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isDragging
            ? 'border-primary/50 bg-primary/[0.04]'
            : 'border-white/[0.06] bg-surface/30 hover:border-primary/20 hover:bg-surface/50'
          }
        `}
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}
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
          <div
            className={`
              inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl p-1
              transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            `}
            style={{
              background: isDragging ? 'rgba(232,168,73,0.08)' : 'rgba(255,255,255,0.04)',
              border: isDragging ? '1px solid rgba(232,168,73,0.2)' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <svg className={`w-7 h-7 ${isDragging ? 'text-primary' : 'text-obsidian-100'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        <p className="text-base font-semibold text-obsidian-50 mb-1.5 tracking-[-0.01em]">
          拖拽文件到这里
        </p>
        <p className="text-sm text-obsidian-100 mb-5">或 <span className="text-primary font-semibold">点击选择文件</span></p>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-obsidian-100 font-medium"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          .docx / .pdf · ≤50MB
        </div>
      </div>
    </div>
  );
}
