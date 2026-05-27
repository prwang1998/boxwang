export const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
];

export const ALLOWED_EXTENSIONS = ['.docx', '.pdf'];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: '请上传 .docx 或 .pdf 文件' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小不能超过 50MB' };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isDocxFile(file: File): boolean {
  return getFileExtension(file.name) === 'docx';
}

export function isPdfFile(file: File): boolean {
  return getFileExtension(file.name) === 'pdf';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
