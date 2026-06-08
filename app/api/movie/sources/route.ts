import { NextResponse } from 'next/server';
import { checkSourcesHealth } from '@/lib/movie-api';

export async function GET() {
  try {
    const sources = await checkSourcesHealth();
    return NextResponse.json({ sources });
  } catch (error: any) {
    console.error('Movie sources error:', error);
    return NextResponse.json(
      { error: error.message || '获取片源列表失败' },
      { status: 500 }
    );
  }
}
