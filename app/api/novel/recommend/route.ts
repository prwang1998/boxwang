import { NextResponse } from 'next/server';
import { getRecommendNovels } from '@/lib/novel-sources';

export async function GET() {
  try {
    const books = await getRecommendNovels();
    return NextResponse.json({ books, total: books.length });
  } catch (error) {
    console.error('Novel recommend error:', error);
    return NextResponse.json({ books: [], total: 0, error: '获取推荐失败' });
  }
}
