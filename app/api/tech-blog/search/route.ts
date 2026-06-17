import { NextRequest, NextResponse } from 'next/server';
import { searchTechBlogs, TechCategory } from '@/lib/tech-blog-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const category = (searchParams.get('category') || 'android') as TechCategory;
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const blogs = await searchTechBlogs(keyword, category, page);
    return NextResponse.json({ blogs, total: blogs.length });
  } catch (error) {
    console.error('Tech blog search error:', error);
    return NextResponse.json({ blogs: [], total: 0, error: '搜索失败' });
  }
}
