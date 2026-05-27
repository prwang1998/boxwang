'use client';

import { useCallback } from 'react';
import { validateFile } from '@/lib/file-utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        disabled
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
          : 'border-gray-300 hover:border-primary cursor-pointer'
      }`}
      onDragOver={handleDragOver}
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
      <div className="text-4xl mb-4">📁</div>
      <p className="text-lg font-medium text-gray-700 mb-2">
        拖拽文件到这里
      </p>
      <p className="text-sm text-gray-500">或 点击选择文件</p>
      <p className="text-xs text-gray-400 mt-2">支持 .docx .pdf (≤50MB)</p>
    </div>
  );
}
