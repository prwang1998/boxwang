import { NextRequest, NextResponse } from 'next/server';
import { getBookDetail, getChapterContent } from '@/lib/novel-sources';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookUrl = searchParams.get('bookUrl') || searchParams.get('bookId');
  const chapterUrl = searchParams.get('chapterUrl') || searchParams.get('chapterId');

  if (!bookUrl) {
    return NextResponse.json({ error: '缺少 bookUrl 参数' }, { status: 400 });
  }

  try {
    // 请求特定章节内容
    if (chapterUrl) {
      const content = await getChapterContent(chapterUrl);
      return NextResponse.json({
        content: content || '暂无内容',
        chapterUrl,
      });
    }

    // 获取书籍详情和章节列表
    const detail = await getBookDetail(bookUrl);
    if (!detail) {
      return NextResponse.json({ error: '获取书籍信息失败' }, { status: 404 });
    }

    return NextResponse.json({
      book: detail.book,
      chapters: detail.chapters,
    });
  } catch (error) {
    console.error('Novel chapter error:', error);
    return NextResponse.json({ error: '获取章节失败' }, { status: 500 });
  }
}
