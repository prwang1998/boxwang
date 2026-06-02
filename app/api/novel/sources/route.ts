import { NextRequest, NextResponse } from 'next/server';
import { getDefaultSources, NovelSource } from '@/lib/novel-sources';

// 内存中的小说源配置（实际项目中应该持久化到数据库）
let customSources: NovelSource[] = [];

export async function GET() {
  const defaultSources = getDefaultSources();
  const allSources = [...defaultSources, ...customSources];
  return NextResponse.json({ sources: allSources });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source } = body;

    if (action === 'add' && source) {
      // 添加自定义源
      const newSource: NovelSource = {
        id: `custom-${Date.now()}`,
        name: source.name || '自定义源',
        url: source.url,
        searchPath: source.searchPath || '/search.php?q=',
        enabled: source.enabled !== false,
      };
      customSources.push(newSource);
      return NextResponse.json({ success: true, source: newSource });
    }

    if (action === 'update' && source) {
      // 更新源
      const index = customSources.findIndex(s => s.id === source.id);
      if (index >= 0) {
        customSources[index] = { ...customSources[index], ...source };
        return NextResponse.json({ success: true, source: customSources[index] });
      }
      return NextResponse.json({ error: '源不存在' }, { status: 404 });
    }

    if (action === 'delete' && source?.id) {
      // 删除源
      customSources = customSources.filter(s => s.id !== source.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle' && source?.id) {
      // 切换源启用状态
      const index = customSources.findIndex(s => s.id === source.id);
      if (index >= 0) {
        customSources[index].enabled = !customSources[index].enabled;
        return NextResponse.json({ success: true, source: customSources[index] });
      }
      return NextResponse.json({ error: '源不存在' }, { status: 404 });
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('Novel sources API error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
