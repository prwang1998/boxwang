import * as pdfjsLib from 'pdfjs-dist';
import { Document, Paragraph, TextRun, Packer } from 'docx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function previewPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return `<img src="${canvas.toDataURL()}" style="max-width: 100%; height: auto;" />`;
}

export async function convertPdfToDocx(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const paragraphs: Paragraph[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const lines: string[] = [];
    let currentLine = '';

    textContent.items.forEach((item: any) => {
      if (item.str) {
        currentLine += item.str;
        if (item.hasEOL) {
          lines.push(currentLine);
          currentLine = '';
        }
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    lines.forEach((line) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
        })
      );
    });

    if (i < pdf.numPages) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ break: 1 })],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return new Blob([blob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
