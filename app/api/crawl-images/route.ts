import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
    const $ = cheerio.load(html);

    const images: { src: string; alt: string }[] = [];
    const seen = new Set<string>();

    // Find all img tags
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';

      if (src && !seen.has(src)) {
        seen.add(src);
        // Convert relative URLs to absolute
        let absoluteSrc = src;
        try {
          absoluteSrc = new URL(src, validUrl.origin).href;
        } catch {
          // Keep original if conversion fails
        }
        images.push({ src: absoluteSrc, alt });
      }
    });

    // Also check for background images in style attributes
    $('[style*="background-image"]').each((_, element) => {
      const style = $(element).attr('style') || '';
      const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (match && match[1] && !seen.has(match[1])) {
        seen.add(match[1]);
        let absoluteSrc = match[1];
        try {
          absoluteSrc = new URL(match[1], validUrl.origin).href;
        } catch {
          // Keep original if conversion fails
        }
        images.push({ src: absoluteSrc, alt: '' });
      }
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: '爬取失败，请检查网址是否正确' }, { status: 500 });
  }
}
