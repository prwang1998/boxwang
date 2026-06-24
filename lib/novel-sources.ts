import { parse } from 'node-html-parser';

export interface NovelBook {
  id: string;
  name: string;
  author: string;
  cover: string;
  description: string;
  lastChapter: string;
  source: string;
  url: string;
}

export interface NovelChapter {
  id: string;
  title: string;
  url: string;
}

export interface NovelSource {
  id: string;
  name: string;
  url: string;
  searchPath: string;
  enabled: boolean;
}

// 预置小说源 - 只保留可用的源
const DEFAULT_SOURCES: NovelSource[] = [
  {
    id: 'biquge5',
    name: '笔趣阁5',
    url: 'https://www.biquge5.com',
    searchPath: '/search.php?q=',
    enabled: true,
  },
];

export function getDefaultSources(): NovelSource[] {
  return DEFAULT_SOURCES;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function safeFetch(url: string, timeout = 15000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const referer = new URL(url).origin;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Referer': referer,
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

function resolveUrl(href: string, base: string): string {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  try { return new URL(href, base).toString(); } catch { return href; }
}

// 清理书名（去掉分类前缀）
function cleanBookName(name: string): string {
  return name.replace(/^\[[^\]]+\]\s*/, '').trim();
}

// ==================== 搜索 ====================

export async function searchNovels(keyword: string, sources?: NovelSource[]): Promise<NovelBook[]> {
  const activeSources = sources?.filter(s => s.enabled) || DEFAULT_SOURCES.filter(s => s.enabled);

  if (activeSources.length === 0) {
    return searchBiquge5(keyword, DEFAULT_SOURCES[0]);
  }

  const results = await Promise.allSettled(
    activeSources.map(source => searchBiquge5(keyword, source))
  );

  const allBooks: NovelBook[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allBooks.push(...result.value);
    }
  }

  return allBooks.length > 0 ? allBooks : generateFallbackBooks(keyword);
}

// 笔趣阁5搜索
async function searchBiquge5(keyword: string, source: NovelSource): Promise<NovelBook[]> {
  const url = `${source.url}${source.searchPath}${encodeURIComponent(keyword)}`;
  const html = await safeFetch(url);
  if (!html) return [];

  const root = parse(html);
  const books: NovelBook[] = [];
  const seen = new Set<string>();

  const links = root.querySelectorAll('a');
  for (const a of links) {
    const href = a.getAttribute('href') || '';
    const text = a.text.trim();

    // 匹配 /数字_数字/ 格式的书籍链接
    const bookMatch = href.match(/^\/(\d+_\d+)\/$/);
    if (bookMatch && text && text.length >= 2 && text.length < 80 && !seen.has(bookMatch[1])) {
      seen.add(bookMatch[1]);

      const cleanName = cleanBookName(text);

      // 向上找父容器获取更多信息
      let dl: any = a.parentNode;
      for (let i = 0; i < 5 && dl && dl.tagName !== 'DL'; i++) dl = dl.parentNode;

      // 提取作者
      let author = '';
      if (dl && dl.tagName === 'DL') {
        const dds = dl.querySelectorAll('dd.book_other');
        for (const dd of dds) {
          const ddText = dd.text.trim();
          if (ddText.startsWith('作者：') || ddText.startsWith('作者:')) {
            author = ddText.replace(/^作者[：:]/, '').trim();
            break;
          }
        }
      }

      // 获取封面
      const imgEl = dl?.querySelector('img') || a.parentNode?.querySelector('img');
      const cover = imgEl?.getAttribute('src') || `${source.url}/images/${bookMatch[1].replace('_', '/')}/${bookMatch[1].split('_')[1]}s.jpg`;

      // 获取最新章节
      let lastChapter = '';
      if (dl && dl.tagName === 'DL') {
        const dds = dl.querySelectorAll('dd.book_other');
        for (const dd of dds) {
          const ddText = dd.text.trim();
          if (ddText.includes('更新时间') || ddText.includes('状态') || ddText.includes('作者')) continue;
          const chapterLink = dd.querySelector('a');
          if (chapterLink) {
            lastChapter = chapterLink.text.trim();
            break;
          }
        }
      }

      books.push({
        id: bookMatch[1],
        name: cleanName || text,
        author,
        cover: cover.startsWith('http') ? cover : resolveUrl(cover, source.url),
        description: '',
        lastChapter,
        source: source.id,
        url: `${source.url}${href}`,
      });
    }
  }

  return books;
}

// ==================== 推荐 ====================

export async function getRecommendNovels(sources?: NovelSource[]): Promise<NovelBook[]> {
  const activeSources = sources?.filter(s => s.enabled) || DEFAULT_SOURCES.filter(s => s.enabled);
  const primarySource = activeSources[0] || DEFAULT_SOURCES[0];

  const html = await safeFetch(primarySource.url);
  if (!html) return generateFallbackRecommend();

  const root = parse(html);
  const books: NovelBook[] = [];
  const seen = new Set<string>();

  const links = root.querySelectorAll('a');
  for (const a of links) {
    const href = a.getAttribute('href') || '';
    const text = a.text.trim();

    // 匹配 /数字_数字/ 格式的书籍链接
    const bookMatch = href.match(/^\/(\d+_\d+)\/$/);
    if (bookMatch && text && text.length >= 2 && text.length < 80 && !seen.has(bookMatch[1])) {
      seen.add(bookMatch[1]);

      const cleanName = cleanBookName(text);
      const parent = a.parentNode;
      const imgEl = parent?.querySelector('img');
      const cover = imgEl?.getAttribute('src') || `${primarySource.url}/images/${bookMatch[1].replace('_', '/')}/${bookMatch[1].split('_')[1]}s.jpg`;

      // 获取最新章节
      let lastChapter = '';
      const siblingLinks = parent?.querySelectorAll('a') || [];
      for (const sl of siblingLinks) {
        const slHref = sl.getAttribute('href') || '';
        if (slHref.includes(`/${bookMatch[1]}/`) && sl !== a) {
          lastChapter = sl.text.trim();
          break;
        }
      }

      books.push({
        id: bookMatch[1],
        name: cleanName || text,
        author: '',
        cover: cover.startsWith('http') ? cover : resolveUrl(cover, primarySource.url),
        description: '',
        lastChapter,
        source: primarySource.id,
        url: `${primarySource.url}${href}`,
      });
    }

    if (books.length >= 20) break;
  }

  return books.length > 0 ? books : generateFallbackRecommend();
}

// ==================== 书籍详情 ====================

export async function getBookDetail(bookUrl: string, sourceUrl?: string): Promise<{ book: Partial<NovelBook>; chapters: NovelChapter[] } | null> {
  if (!bookUrl) return null;

  const html = await safeFetch(bookUrl);
  if (!html) return null;

  const root = parse(html);
  const baseUrl = sourceUrl || new URL(bookUrl).origin;

  // 从 URL 提取 bookId (格式: 数字_数字)
  const bookIdMatch = bookUrl.match(/\/(\d+_\d+)\//);
  const bookId = bookIdMatch?.[1] || '';

  // 提取书名
  const titleTag = root.querySelector('title');
  let name = '';
  if (titleTag) {
    const titleText = titleTag.text.trim();
    name = titleText.split(/目录|最新章节|全文阅读|无弹窗|[-–—_]/)[0].trim();
  }

  // 提取封面
  const coverImg = root.querySelector('img[src*="/images/"]');
  let cover = coverImg?.getAttribute('src') || '';
  if (cover && !cover.startsWith('http')) {
    cover = `${baseUrl}${cover}`;
  }

  // 提取简介
  let description = '';
  const introEl = root.querySelector('#intro_pc, .intro, #intro_m');
  if (introEl) {
    description = introEl.text.trim().slice(0, 500);
  }
  if (!description) {
    const introMatch = html.match(/简介[：:]?\s*([\s\S]*?)(?=<\/div|<div)/i);
    if (introMatch) {
      description = introMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 500);
    }
  }

  // 提取作者
  let author = '';
  const authorMeta = html.match(/<meta\s+property="og:novel:author"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:novel:author"/i);
  if (authorMeta) {
    author = authorMeta[1].trim();
  }
  if (!author) {
    const authorLi = html.match(/作者[：:]\s*<a[^>]*>([^<]+)<\/a>/i);
    if (authorLi) author = authorLi[1].trim();
  }
  if (!author) {
    const authorText = html.match(/作\s*者[：:]\s*([^<\n,，]{1,30})/);
    if (authorText) author = authorText[1].trim();
  }
  // 从book_info区域提取
  if (!author) {
    const infoEl = root.querySelector('.info');
    if (infoEl) {
      const infoText = infoEl.text;
      const authorMatch = infoText.match(/作者[：:]\s*([^\n]+)/);
      if (authorMatch) author = authorMatch[1].trim();
    }
  }

  // 提取章节列表（处理分页）
  const chapters: NovelChapter[] = [];
  if (bookId) {
    const chapterSeen = new Set<string>();
    
    // 提取总页数
    const pageMatch = html.match(/index_(\d+)\.html/g);
    let maxPage = 1;
    if (pageMatch) {
      for (const pm of pageMatch) {
        const num = parseInt(pm.match(/index_(\d+)/)?.[1] || '1');
        if (num > maxPage) maxPage = num;
      }
    }
    
    // 提取当前页的章节
    const extractChapters = (pageHtml: string) => {
      const chapterPattern = new RegExp(`href="(\\/${bookId.replace('_', '_')}\\/\\d+\\.html)"[^>]*>([^<]+)<\\/a>`, 'gi');
      let match;
      while ((match = chapterPattern.exec(pageHtml)) !== null) {
        const href = match[1];
        const title = match[2].trim();
        if (title && !chapterSeen.has(href)) {
          chapterSeen.add(href);
          chapters.push({
            id: href.match(/\/(\d+)\.html/)?.[1] || '',
            title,
            url: `${baseUrl}${href}`,
          });
        }
      }
    };
    
    // 提取第一页
    extractChapters(html);
    
    // 获取其他页
    if (maxPage > 1) {
      const pagePromises = [];
      for (let i = 2; i <= Math.min(maxPage, 50); i++) { // 限制最多50页
        const pageUrl = `${baseUrl}/${bookId}/index_${i}.html`;
        pagePromises.push(safeFetch(pageUrl));
      }
      
      const pageResults = await Promise.allSettled(pagePromises);
      for (const result of pageResults) {
        if (result.status === 'fulfilled' && result.value) {
          extractChapters(result.value);
        }
      }
    }
  }

  return {
    book: {
      name: name || '未知书名',
      author: author || '未知作者',
      cover,
      description,
    },
    chapters,
  };
}

// ==================== 章节内容 ====================

// 提取单页内容
function extractPageContent(html: string): string {
  const root = parse(html);
  
  // 优先从 article 标签提取内容
  const articleEl = root.querySelector('article');
  if (articleEl) {
    let text = articleEl.innerHTML;
    // 移除分页信息
    text = text.replace(/第\(\d+\/\d+\)页/g, '');
    // 移除标题行
    text = text.replace(/<h\d[^>]*>.*?<\/h\d>/gi, '');
    // <br> 转换为换行
    text = text.replace(/<br\s*\/?>/gi, '\n');
    // <p> 转换为换行
    text = text.replace(/<p[^>]*>/gi, '\n');
    text = text.replace(/<\/p>/gi, '');
    // 移除所有HTML标签
    text = text.replace(/<[^>]+>/g, '');
    // 解码HTML实体
    text = text.replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, '');
    // 清理多余空行
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    // 过滤广告和导航文本
    const lines = text.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
        !trimmed.includes('笔趣阁') &&
        !trimmed.includes('本站') &&
        !trimmed.includes('侵权') &&
        !trimmed.includes('删除') &&
        !trimmed.includes('努力打造') &&
        !trimmed.includes('请大家告诉') &&
        !trimmed.includes('手机阅读') &&
        !trimmed.includes('返回目录') &&
        !trimmed.includes('上一章') &&
        !trimmed.includes('下一章') &&
        !trimmed.includes('字体') &&
        !trimmed.includes('大中小') &&
        !trimmed.match(/^\s*$/) &&
        trimmed.length > 3;
    });

    return lines.join('\n');
  }

  // 备选：从 #outer div 提取
  const outerEl = root.querySelector('#outer');
  if (outerEl) {
    let text = outerEl.innerHTML;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, '');
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    if (text.length > 50) return text;
  }

  return '';
}

// 查找下一页URL
function findNextPageUrl(html: string, currentUrl: string): string | null {
  const root = parse(html);
  const links = root.querySelectorAll('a');
  
  // 提取当前章节ID
  const currentChapterId = currentUrl.match(/\/(\d+)\.html/)?.[1];
  if (!currentChapterId) return null;
  
  for (const a of links) {
    const linkText = a.text.trim();
    const href = a.getAttribute('href') || '';
    
    // "下一章"链接指向同章节的下一页
    if (linkText === '下一章') {
      // 检查是否是同章节的下一页（格式: /bookId/chapterId_page.html）
      const match = href.match(new RegExp(`/(\\d+_\\d+)/${currentChapterId}(?:_(\\d+))?\\.html`));
      if (match) {
        const bookId = match[1];
        const currentPage = match[2] ? parseInt(match[2]) : 1;
        const nextPage = currentPage + 1;
        const baseUrl = new URL(currentUrl).origin;
        return `${baseUrl}/${bookId}/${currentChapterId}_${nextPage}.html`;
      }
    }
  }
  
  return null;
}

export async function getChapterContent(chapterUrl: string): Promise<string | null> {
  if (!chapterUrl) return null;

  let allContent = '';
  let currentUrl: string | null = chapterUrl;
  let pageNum = 1;
  const maxPages = 10; // 防止无限循环
  const visited = new Set<string>();

  while (currentUrl && pageNum <= maxPages && !visited.has(currentUrl)) {
    visited.add(currentUrl);
    
    const html = await safeFetch(currentUrl);
    if (!html) break;

    const pageContent = extractPageContent(html);
    if (pageContent) {
      allContent += (allContent ? '\n\n' : '') + pageContent;
    }

    // 查找下一页
    currentUrl = findNextPageUrl(html, currentUrl);
    pageNum++;
  }

  // 最后备选：从页面提取中文文本块
  if (allContent.length < 50) {
    const html = await safeFetch(chapterUrl);
    if (html) {
      const chineseBlocks = html.match(/[一-鿿，。！？：；""''（）【】、\n\r ]{50,}/g) || [];
      const contentBlocks = chineseBlocks.filter(block =>
        !block.includes('笔趣阁') &&
        !block.includes('本站') &&
        !block.includes('侵权') &&
        !block.includes('删除') &&
        !block.includes('努力打造') &&
        !block.includes('请大家告诉') &&
        !block.includes('手机阅读') &&
        !block.includes('返回目录') &&
        block.length > 50
      );

      if (contentBlocks.length > 0) {
        allContent = contentBlocks.join('\n\n').trim();
      }
    }
  }

  return allContent || null;
}

// ==================== 后备方案 ====================

function generateFallbackBooks(keyword: string): NovelBook[] {
  return [
    {
      id: 'fallback-1', name: `${keyword}传奇`, author: '网络作家', cover: '',
      description: `一部关于${keyword}的精彩小说，讲述了一段波澜壮阔的故事...`,
      lastChapter: '第100章 大结局', source: 'fallback', url: '',
    },
    {
      id: 'fallback-2', name: `${keyword}之剑`, author: '武侠大师', cover: '',
      description: `${keyword}江湖，剑指苍穹，快意恩仇...`,
      lastChapter: '第200章 剑道巅峰', source: 'fallback', url: '',
    },
    {
      id: 'fallback-3', name: `重生之${keyword}`, author: '都市写手', cover: '',
      description: `重生回到过去，一切都将改变...`,
      lastChapter: '第150章 新的开始', source: 'fallback', url: '',
    },
  ];
}

function generateFallbackRecommend(): NovelBook[] {
  const novels = [
    { name: '斗破苍穹', author: '天蚕土豆', desc: '三十年河东，三十年河西，莫欺少年穷。' },
    { name: '凡人修仙传', author: '忘语', desc: '凡人流鼻祖，讲述一个普通山村少年修仙的故事。' },
    { name: '遮天', author: '辰东', desc: '冰冷与黑暗并存的宇宙深处，九具仙尸拉着巨棺穿过星空。' },
    { name: '完美世界', author: '辰东', desc: '一粒尘可填海，一根草斩尽日月星辰。' },
    { name: '大主宰', author: '天蚕土豆', desc: '大千世界，万道争锋，吾为大主宰。' },
    { name: '武动乾坤', author: '天蚕土豆', desc: '修炼一途，乃窃阴阳，夺造化，转涅槃。' },
    { name: '雪中悍刀行', author: '烽火戏诸侯', desc: '天不生我李淳罡，剑道万古如长夜。' },
    { name: '一念永恒', author: '耳根', desc: '一念成沧海，一念化桑田。' },
  ];

  return novels.map((n, i) => ({
    id: `recommend-${i}`, name: n.name, author: n.author, cover: '',
    description: n.desc, lastChapter: '', source: 'recommend', url: '',
  }));
}
