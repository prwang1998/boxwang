export type FileStatus = 'idle' | 'reading' | 'previewing' | 'converting' | 'success' | 'error';

export type ConvertDirection = 'docx-to-pdf' | 'pdf-to-docx';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface ConvertState {
  file: FileInfo | null;
  status: FileStatus;
  errorMessage: string;
  previewHtml: string;
}
