'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import ConvertButton from '@/components/ConvertButton';
import StatusBar from '@/components/StatusBar';
import { previewDocx, convertDocxToPdf } from '@/lib/docx-to-pdf';
import { previewPdf, convertPdfToDocx } from '@/lib/pdf-to-docx';
import { isDocxFile, isPdfFile, downloadBlob } from '@/lib/file-utils';
import { FileInfo, FileStatus, ConvertState } from '@/types';

export default function Home() {
  const [activeItem, setActiveItem] = useState('format-convert');
  const [state, setState] = useState<ConvertState>({
    file: null,
    status: 'idle',
    errorMessage: '',
    previewHtml: '',
  });

  const handleFileSelect = async (file: File) => {
    const fileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type: isDocxFile(file) ? 'docx' : 'pdf',
      file,
    };

    setState({
      file: fileInfo,
      status: 'reading',
      errorMessage: '',
      previewHtml: '',
    });

    try {
      setState((prev) => ({ ...prev, status: 'previewing' }));
      let preview = '';

      if (isDocxFile(file)) {
        preview = await previewDocx(file);
      } else if (isPdfFile(file)) {
        preview = await previewPdf(file);
      }

      setState((prev) => ({
        ...prev,
        status: 'idle',
        previewHtml: preview,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: '预览失败，请检查文件格式',
      }));
    }
  };

  const handleConvert = async (direction: 'docx-to-pdf' | 'pdf-to-docx') => {
    if (!state.file) return;

    setState((prev) => ({ ...prev, status: 'converting', errorMessage: '' }));

    try {
      let blob: Blob;
      let filename: string;

      if (direction === 'docx-to-pdf') {
        blob = await convertDocxToPdf(state.file.file);
        filename = state.file.name.replace('.docx', '.pdf');
      } else {
        blob = await convertPdfToDocx(state.file.file);
        filename = state.file.name.replace('.pdf', '.docx');
      }

      downloadBlob(blob, filename);

      setState((prev) => ({ ...prev, status: 'success' }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: '转换失败，请检查文件是否损坏',
      }));
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">文档格式转换</h1>

        <div className="max-w-4xl mx-auto space-y-6">
          <FileUpload onFileSelect={handleFileSelect} disabled={state.status === 'converting'} />

          {state.file && (
            <FilePreview file={state.file} previewHtml={state.previewHtml} />
          )}

          {state.file && (
            <div className="flex gap-4 justify-center">
              <ConvertButton
                direction="docx-to-pdf"
                onClick={() => handleConvert('docx-to-pdf')}
                disabled={!state.file || state.status !== 'idle'}
                loading={state.status === 'converting'}
              />
              <ConvertButton
                direction="pdf-to-docx"
                onClick={() => handleConvert('pdf-to-docx')}
                disabled={!state.file || state.status !== 'idle'}
                loading={state.status === 'converting'}
              />
            </div>
          )}

          <StatusBar status={state.status} errorMessage={state.errorMessage} />
        </div>
      </main>
    </div>
  );
}
