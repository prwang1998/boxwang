import { NextRequest, NextResponse } from 'next/server';

// 章节列表和内容获取 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  const chapterId = searchParams.get('chapterId');

  if (!bookId) {
    return NextResponse.json({ error: '缺少 bookId 参数' }, { status: 400 });
  }

  try {
    // 如果请求特定章节内容
    if (chapterId) {
      return NextResponse.json({
        chapterId,
        title: `第${chapterId}章`,
        content: generateMockContent(chapterId),
      });
    }

    // 返回章节列表
    const chapters = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      title: `第${i + 1}章 ${getChapterTitle(i + 1)}`,
    }));

    return NextResponse.json({ bookId, chapters });
  } catch (error) {
    console.error('Novel chapter error:', error);
    return NextResponse.json({ error: '获取章节失败' }, { status: 500 });
  }
}

function getChapterTitle(num: number): string {
  const titles = [
    '初入江湖', '风云初起', '暗流涌动', '危机四伏', '绝处逢生',
    '柳暗花明', '龙争虎斗', '群雄逐鹿', '惊天秘密', '命运转折',
    '浴火重生', '王者归来', '巅峰对决', '终极之战', '新的征程',
    '风云再起', '天下大势', '英雄本色', '绝代风华', '大结局',
  ];
  return titles[num - 1] || `继续前行`;
}

function generateMockContent(chapterId: string): string {
  return `这是第${chapterId}章的内容。

少年站在山巅，望着远方的云海，心中涌起无限感慨。

"这条路，终究还是要走下去。"他喃喃自语。

身后传来脚步声，一位白衣女子缓缓走来。

"师兄，师父让我们下山历练，你准备好了吗？"

少年转身，露出一抹微笑："走吧，江湖路远，你我同行。"

两人纵身一跃，消失在云海之中。

......

这一日，江湖上多了一对少年侠客的身影。他们行侠仗义，快意恩仇，留下了一段段传奇故事。

而这一切，才刚刚开始。

（本章完）`;
}
