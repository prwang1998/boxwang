import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: '请提供网址' }, { status: 400 });
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: '无效的网址' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: '无法访问该网址' }, { status: 400 });
    }

    const html = await response.text();

    const images: { src: string; alt: string }[] = [];
    const seen = new Set<string>();

    // Simple regex to find img tags
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const altRegex = /alt\s*=\s*["']([^"']*)["']/i;

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (!seen.has(src)) {
        seen.add(src);
        // Extract alt text
        const altMatch = match[0].match(altRegex);
        const alt = altMatch ? altMatch[1] : '';

        // Convert relative URLs to absolute
        let absoluteSrc = src;
        try {
          absoluteSrc = new URL(src, validUrl.origin).href;
        } catch {
          // Keep original if conversion fails
        }
        images.push({ src: absoluteSrc, alt });
      }
    }

    // Also check for background images in style attributes
    const bgRegex = /style\s*=\s*["'][^"']*background-image\s*:\s*url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)[^"']*["']/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      const src = match[1];
      if (!seen.has(src)) {
        seen.add(src);
        let absoluteSrc = src;
        try {
          absoluteSrc = new URL(src, validUrl.origin).href;
        } catch {
          // Keep original if conversion fails
        }
        images.push({ src: absoluteSrc, alt: '' });
      }
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: '爬取失败，请检查网址是否正确' }, { status: 500 });
  }
}
