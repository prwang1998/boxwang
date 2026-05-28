import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // This endpoint is for documentation purposes
  // Actual channel management is done client-side via localStorage
  return NextResponse.json({
    message: '用户解析通道配置在客户端 localStorage 中管理',
    storageKey: 'music_parse_channels',
    format: {
      name: 'string',
      searchUrl: 'string (支持 {keyword} 和 {page} 占位符)',
      urlUrl: 'string (支持 {id} 占位符)',
      lyricUrl: 'string (支持 {id} 占位符)',
      headers: 'object (可选)',
      enabled: 'boolean',
    },
  });
}
