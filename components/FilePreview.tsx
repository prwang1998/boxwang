'use client';

import { FileInfo } from '@/types';
import { formatFileSize } from '@/lib/file-utils';

interface FilePreviewProps {
  file: FileInfo;
  previewHtml: string;
}

export default function FilePreview({ file, previewHtml }: FilePreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500">
              大小: {formatFileSize(file.size)} | 类型: {file.type.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 max-h-96 overflow-auto">
        {previewHtml ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>正在加载预览...</p>
          </div>
        )}
      </div>
    </div>
  );
}
