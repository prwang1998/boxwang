'use client';

export interface ExtractedColor {
  r: number;
  g: number;
  b: number;
}

// 从图片 URL 提取主色（通过 Canvas 采样中心区域）
export async function extractDominantColor(imageUrl: string): Promise<ExtractedColor | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 40;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          // 跳过过白或过黑的像素
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 20 && brightness < 235) {
            r += pr; g += pg; b += pb; count++;
          }
        }
        if (count === 0) return resolve(null);
        resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

// 注入环境光 CSS 变量到 document.documentElement
export function applyAmbientColor(color: ExtractedColor | null, transition = true) {
  const root = document.documentElement;
  if (transition) {
    root.style.setProperty('--ambient-transition', '1.5s');
  }
  if (!color) {
    root.style.removeProperty('--ambient-r');
    root.style.removeProperty('--ambient-g');
    root.style.removeProperty('--ambient-b');
    return;
  }
  root.style.setProperty('--ambient-r', String(color.r));
  root.style.setProperty('--ambient-g', String(color.g));
  root.style.setProperty('--ambient-b', String(color.b));
}
