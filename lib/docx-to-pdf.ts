import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';

export async function previewDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function convertDocxToPdf(file: File): Promise<Blob> {
  const html = await previewDocx(file);

  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([canvas.width, canvas.height]);

    const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });

    const pdfBytes = await pdfDoc.save();
    const arrayBuffer = new Uint8Array(pdfBytes).buffer;
    return new Blob([arrayBuffer], { type: 'application/pdf' });
  } finally {
    document.body.removeChild(container);
  }
}
