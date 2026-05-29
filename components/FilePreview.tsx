'use client';

import { FileInfo } from '@/types';
import { formatFileSize } from '@/lib/file-utils';

interface FilePreviewProps {
  file: FileInfo;
  previewHtml: string;
}

export default function FilePreview({ file, previewHtml }: FilePreviewProps) {
  return (
    <div className="rounded-2xl overflow-hidden glass border border-white/[0.04] corner-accents">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 icon-glow">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-obsidian-50 text-sm">{file.name}</p>
            <p className="text-xs text-obsidian-100/60">
              {formatFileSize(file.size)} · {file.type.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-xs text-obsidian-100/50">
          {file.type.toUpperCase()}
        </div>
      </div>
      <div className="p-5 max-h-96 overflow-auto">
        {previewHtml ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary shadow-glow"></div>
            <p className="mt-4 text-obsidian-100/60 text-sm animate-pulse-soft">正在加载预览...</p>
          </div>
        )}
      </div>
    </div>
  );
}
