import { NextRequest, NextResponse } from 'next/server';
import { getTechBlogContent } from '@/lib/tech-blog-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const source = searchParams.get('source') || 'juejin';

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  try {
    const content = await getTechBlogContent(url, source);
    if (!content) {
      return NextResponse.json({ error: '获取文章内容失败' }, { status: 404 });
    }
    return NextResponse.json(content);
  } catch (error) {
    console.error('Tech blog content error:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}
