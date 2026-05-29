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

const BASE = 'https://www.biquge5.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function safeFetch(url: string, timeout = 15000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const resp = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Referer': BASE,
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

// ==================== 搜索 ====================

export async function searchNovels(keyword: string): Promise<NovelBook[]> {
  const url = `${BASE}/search.php?q=${encodeURIComponent(keyword)}`;
  const html = await safeFetch(url);
  if (!html) return generateFallbackBooks(keyword);

  const root = parse(html);
  const books: NovelBook[] = [];
  const seen = new Set<string>();

  const links = root.querySelectorAll('a');
  for (const a of links) {
    const href = a.getAttribute('href') || '';
    const text = a.text.trim();

    // 匹配 /{id}/ 格式的书籍链接（如 /0_143/、/77_77406/）
    const bookMatch = href.match(/^\/(\d+_\d+)\/$/);
    if (bookMatch && text && text.length >= 2 && text.length < 50 && !seen.has(bookMatch[1])) {
      seen.add(bookMatch[1]);

      const cleanName = text.replace(/^\[[^\]]+\]/, '').trim();

      // 向上找到 <dl> 容器，从中提取作者和其他信息
      let dl: any = a.parentNode;
      for (let i = 0; i < 5 && dl && dl.tagName !== 'DL'; i++) dl = dl.parentNode;

      // 从 <dd class="book_other">作者：<span>xxx</span></dd> 提取作者
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
      const cover = imgEl?.getAttribute('src') || `${BASE}/images/${bookMatch[1].replace('_', '/')}/${bookMatch[1].split('_')[1]}s.jpg`;

      // 获取最新章节
      let lastChapter = '';
      if (dl && dl.tagName === 'DL') {
        const dds = dl.querySelectorAll('dd.book_other');
        for (const dd of dds) {
          const ddText = dd.text.trim();
          if (ddText.includes('更新时间')) continue;
          if (ddText.includes('状态')) continue;
          if (ddText.includes('作者')) continue;
          // 剩余的可能是最新章节
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
        cover: cover.startsWith('http') ? cover : resolveUrl(cover, BASE),
        description: '',
        lastChapter,
        source: 'biquge5',
        url: `${BASE}${href}`,
      });
    }
  }

  return books.length > 0 ? books : generateFallbackBooks(keyword);
}

// ==================== 推荐 ====================

export async function getRecommendNovels(): Promise<NovelBook[]> {
  const html = await safeFetch(BASE);
  if (!html) return generateFallbackRecommend();

  const root = parse(html);
  const books: NovelBook[] = [];
  const seen = new Set<string>();

  const links = root.querySelectorAll('a');
  for (const a of links) {
    const href = a.getAttribute('href') || '';
    const text = a.text.trim();

    const bookMatch = href.match(/^\/(\d+_\d+)\/$/);
    if (bookMatch && text && text.length >= 2 && text.length < 50 && !seen.has(bookMatch[1])) {
      seen.add(bookMatch[1]);

      const cleanName = text.replace(/^\[[^\]]+\]/, '').trim();
      const parent = a.parentNode;
      const imgEl = parent?.querySelector('img');
      const cover = imgEl?.getAttribute('src') || `${BASE}/images/${bookMatch[1].replace('_', '/')}/${bookMatch[1].split('_')[1]}s.jpg`;

      // 获取最新章节
      const siblingLinks = parent?.querySelectorAll('a') || [];
      let lastChapter = '';
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
        cover: cover.startsWith('http') ? cover : resolveUrl(cover, BASE),
        description: '',
        lastChapter,
        source: 'biquge5',
        url: `${BASE}${href}`,
      });
    }

    if (books.length >= 20) break;
  }

  return books.length > 0 ? books : generateFallbackRecommend();
}

// ==================== 书籍详情 ====================

export async function getBookDetail(bookUrl: string): Promise<{ book: Partial<NovelBook>; chapters: NovelChapter[] } | null> {
  if (!bookUrl) return null;

  const html = await safeFetch(bookUrl);
  if (!html) return null;

  const root = parse(html);

  // 从 URL 提取 bookId
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
    cover = `${BASE}${cover}`;
  }

  // 提取简介 - 从页面文本中找
  let description = '';
  const introMatch = html.match(/简介[：:]?\s*([\s\S]*?)(?=<\/div|<div)/i);
  if (introMatch) {
    description = introMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 500);
  }
  // 备选：找包含"简介"的文本块
  if (!description) {
    const textBlocks = html.match(/简介[：:]?[^<]{10,500}/);
    if (textBlocks) {
      description = textBlocks[0].replace(/^简介[：:]?/, '').trim();
    }
  }

  // 提取作者 - 优先从 meta 标签获取
  let author = '';
  const authorMeta = html.match(/<meta\s+property="og:novel:author"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:novel:author"/i);
  if (authorMeta) {
    author = authorMeta[1].trim();
  }
  // 备选：从 <li>作者：<a> 获取
  if (!author) {
    const authorLi = html.match(/作者[：:]\s*<a[^>]*>([^<]+)<\/a>/i);
    if (authorLi) author = authorLi[1].trim();
  }
  // 备选：纯文本
  if (!author) {
    const authorText = html.match(/作\s*者[：:]\s*([^<\n,，]{1,30})/);
    if (authorText) author = authorText[1].trim();
  }

  // 提取章节列表
  const chapters: NovelChapter[] = [];
  if (bookId) {
    const chapterPattern = new RegExp(`href="(\\/${bookId.replace('_', '_')}\\/\\d+\\.html)"[^>]*>([^<]+)<\\/a>`, 'gi');
    let match;
    const chapterSeen = new Set<string>();
    while ((match = chapterPattern.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].trim();
      if (title && !chapterSeen.has(href)) {
        chapterSeen.add(href);
        chapters.push({
          id: href.match(/\/(\d+)\.html/)?.[1] || '',
          title,
          url: `${BASE}${href}`,
        });
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

export async function getChapterContent(chapterUrl: string): Promise<string | null> {
  if (!chapterUrl) return null;

  const html = await safeFetch(chapterUrl);
  if (!html) return null;

  // 内容在 #outer div 中（display: none），但文本仍在 HTML 中
  // 直接用正则提取中文文本块
  const root = parse(html);

  // 尝试从 outer div 提取
  const outerEl = root.querySelector('#outer');
  if (outerEl) {
    let text = outerEl.innerHTML;
    // 移除标题行
    text = text.replace(/<p>[^<]*<\/p>/gi, '');
    // <br> 转换为换行
    text = text.replace(/<br\s*\/?>/gi, '\n');
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

    if (text.length > 50) return text;
  }

  // 备选：直接从页面提取中文文本块
  const chineseBlocks = html.match(/[一-鿿，。！？：；""''（）【】、\n\r ]{20,}/g) || [];
  // 过滤掉导航和广告文本
  const contentBlocks = chineseBlocks.filter(block =>
    !block.includes('笔趣阁') &&
    !block.includes('本站') &&
    !block.includes('侵权') &&
    !block.includes('删除') &&
    !block.includes('努力打造') &&
    !block.includes('请大家告诉') &&
    !block.includes('手机阅读') &&
    !block.includes('返回目录') &&
    block.length > 30
  );

  if (contentBlocks.length > 0) {
    return contentBlocks.join('\n\n').trim();
  }

  return null;
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
