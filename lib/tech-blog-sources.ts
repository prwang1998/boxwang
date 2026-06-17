import * as cheerio from 'cheerio';
import { TechBlog, TechBlogContent, TechCategory, CategoryInfo, CATEGORIES } from './tech-blog-types';

export type { TechBlog, TechBlogContent, TechCategory } from './tech-blog-types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function fixImages(html: string, baseUrl: string): string {
  const $ = cheerio.load(html, null, false);
  $('img').each((_, el) => {
    const $el = $(el);
    let src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-original') || '';
    if (!src) return;
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch {}
    }
    $el.attr('src', src);
    $el.attr('referrerpolicy', 'no-referrer');
    $el.attr('loading', 'lazy');
    $el.removeAttr('data-src');
    $el.removeAttr('data-original');
  });
  $('script, style, noscript').remove();
  return $.html();
}

const CATEGORY_KEYWORDS: Record<TechCategory, string[]> = {
  'all': [],
  'android': ['android', '安卓', 'kotlin', 'gradle', 'apk', 'flutter', '移动端', 'mobile'],
  'algorithm': ['算法', '数据结构', 'leetcode', 'algorithm', '排序', '搜索', '图论', '动态规划', '贪心'],
  'ai-coding': ['ai', '人工智能', 'chatgpt', 'copilot', 'cursor', '大模型', 'llm', '机器学习', '深度学习', 'gpt', 'prompt'],
};

function matchCategory(text: string, category: TechCategory): boolean {
  if (category === 'all') return true;
  const lower = text.toLowerCase();
  return CATEGORY_KEYWORDS[category].some(kw => lower.includes(kw));
}

function matchKeyword(text: string, keyword: string): boolean {
  if (!keyword) return true;
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function filterArticles(articles: TechBlog[], category: TechCategory, keyword: string): TechBlog[] {
  return articles.filter(a => {
    const text = `${a.title} ${a.summary} ${(a.tags || []).join(' ')}`;
    return matchCategory(text, category) && matchKeyword(text, keyword);
  });
}

// ==================== 掘金 (Juejin) ====================

const JUEJIN_SEARCH_KEYWORD: Record<TechCategory, string> = {
  'all': '技术 前端 后端',
  'android': 'Android 开发',
  'algorithm': '算法 数据结构 LeetCode',
  'ai-coding': 'AI编程 Copilot Cursor ChatGPT',
};

async function fetchJuejinArticles(category: TechCategory, page: number = 1): Promise<TechBlog[]> {
  if (category === 'all') {
    const keywords = ['前端开发', '后端架构', 'Android', '算法', 'AI编程'];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    return searchJuejinArticles(keyword, category, page);
  }
  const keyword = JUEJIN_SEARCH_KEYWORD[category];
  return searchJuejinArticles(keyword, category, page);
}

async function searchJuejinArticles(keyword: string, category: TechCategory, page: number = 1): Promise<TechBlog[]> {
  try {
    const resp = await fetchWithTimeout('https://api.juejin.cn/search_api/v1/search', {
      method: 'POST',
      headers: {
        'User-Agent': randomUA(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        search_type: 0,
        key_word: keyword,
        id_type: 0,
        sort_type: 2,
        cursor: String((page - 1) * 20),
        limit: 20,
      }),
    }, 10000);
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.err_no !== 0) return [];

    return (data.data || [])
      .filter((item: any) => item.result_type === 2 && item.result_model?.article_info)
      .map((item: any) => {
        const info = item.result_model.article_info || {};
        const author = item.result_model.author_user_info || {};
        const tags = (item.result_model.tags || []).slice(0, 3).map((t: any) => t.tag_name || '');
        return {
          id: info.article_id || '',
          title: info.title || '',
          summary: info.brief_content || '',
          author: author.user_name || '',
          source: 'juejin',
          sourceLabel: '掘金',
          url: `https://juejin.cn/post/${info.article_id || ''}`,
          cover: info.cover_image || '',
          views: info.view_count || 0,
          likes: info.digg_count || 0,
          comments: info.comment_count || 0,
          tags,
          publishTime: info.ctime ? new Date(parseInt(info.ctime) * 1000).toISOString() : '',
          category,
        };
      });
  } catch {
    return [];
  }
}

async function fetchJuejinArticleContent(articleId: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(`https://juejin.cn/post/${articleId}`, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.7',
      },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);

    const title = $('title').text().replace(/\s*-\s*掘金\s*$/, '').trim();
    let $content = $('article');
    if (!$content.length) $content = $('.markdown-body');
    if (!$content.length) $content = $('#article-root');
    if (!$content.length) $content = $('.article-content');
    if (!$content.length) return null;

    $content.find('.author-info-block, .article-end, .follow-button, .article-suspended-panel').remove();

    const baseUrl = 'https://juejin.cn';
    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || $el.attr('data-src') || '';
      if (!src) return;
      if (src.startsWith('//')) src = 'https:' + src;
      else if (src.startsWith('/')) src = baseUrl + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.attr('loading', 'lazy');
      $el.css({ 'max-width': '100%', height: 'auto' });
      $el.removeAttr('data-src');
    });

    return {
      title,
      content: $content.html() || '',
      author: '',
      source: 'juejin',
      url: `https://juejin.cn/post/${articleId}`,
    };
  } catch {
    return null;
  }
}

// ==================== CSDN ====================

const CSDN_SEARCH_KEYWORD: Record<TechCategory, string> = {
  'all': '技术 前端 后端',
  'android': 'Android',
  'algorithm': '算法 数据结构',
  'ai-coding': 'AI编程 Copilot',
};

async function fetchCsdnArticles(category: TechCategory, page: number = 1): Promise<TechBlog[]> {
  if (category === 'all') {
    const keywords = ['前端开发', '后端架构', 'Android', '算法', 'AI编程'];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    return searchCsdnArticles(keyword, category, page);
  }
  const keyword = CSDN_SEARCH_KEYWORD[category];
  return searchCsdnArticles(keyword, category, page);
}

async function searchCsdnArticles(keyword: string, category: TechCategory, page: number = 1): Promise<TechBlog[]> {
  try {
    const size = 20;
    const resp = await fetchWithTimeout(
      `https://so.csdn.net/api/v3/search?q=${encodeURIComponent(keyword)}&t=blog&p=${page}&s=new&tm=0&lv=-1&ft=0&l=&u=&ct=-1&pnt=-1&ry=-1&ssm=-1&dct=-1&vco=-1&cc=-1&sc=-1&ait=-1&ait=-1&ait=-1&ait=-1&ait=-1&ait=-1&ait=-1&ait=-1`,
      {
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://so.csdn.net/',
        },
      },
      10000,
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    const list = data?.result_vos || [];

    return list.map((item: any) => ({
      id: String(item.id || ''),
      title: (item.title || '').replace(/<[^>]+>/g, ''),
      summary: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 200),
      author: item.nickname || item.username || '',
      source: 'csdn',
      sourceLabel: 'CSDN',
      url: item.url || '',
      views: item.view_num || 0,
      likes: item.like_num || 0,
      comments: item.comment_num || 0,
      tags: [],
      publishTime: item.created_at || '',
      category,
    }));
  } catch {
    return [];
  }
}

async function fetchCsdnArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.7',
        'Referer': 'https://www.csdn.net/',
      },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);

    const title = $('h1.title-article').text().trim() || $('title').text().replace(/\s*-\s*CSDN博客\s*$/, '').trim();
    let $content = $('#article_content');
    if (!$content.length) $content = $('.article_content');
    if (!$content.length) $content = $('.markdown_views');
    if (!$content.length) $content = $('#content_views');
    if (!$content.length) return null;

    $content.find('.hide-article-box, .toolbox-left, .recommend-box, .more-toolbox, link[rel="stylesheet"]').remove();

    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || $el.attr('data-src') || '';
      if (!src) return;
      if (src.startsWith('//')) src = 'https:' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.attr('loading', 'lazy');
      $el.css({ 'max-width': '100%', height: 'auto' });
      $el.removeAttr('data-src');
    });

    // Remove wrapper divs that just contain the content_views div
    const innerContent = $content.find('#content_views');
    let resultHtml = '';
    if (innerContent.length) {
      resultHtml = innerContent.html() || '';
    } else {
      resultHtml = $content.html() || '';
    }

    return {
      title,
      content: resultHtml,
      author: '',
      source: 'csdn',
      url,
    };
  } catch {
    return null;
  }
}

// ==================== 开源中国 (OSCHINA) ====================

const OSCHINA_CATALOG: Record<TechCategory, string> = {
  'all': '1',
  'android': '1',
  'algorithm': '1',
  'ai-coding': '1',
};

async function fetchOschinaArticles(category: TechCategory, page: number = 1): Promise<TechBlog[]> {
  try {
    const catalog = OSCHINA_CATALOG[category] || '1';
    const resp = await fetchWithTimeout(
      `https://www.oschina.net/action/api/news_list?catalog=${catalog}&page=${page}`,
      { headers: { 'User-Agent': randomUA(), 'Accept': 'application/xml, text/xml' } },
      10000,
    );
    if (!resp.ok) return [];
    const xml = await resp.text();
    const items = xml.match(/<news>[\s\S]*?<\/news>/g) || [];
    return items.map(item => {
      const id = item.match(/<id>(\d+)<\/id>/)?.[1] || '';
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '').trim();
      const author = (item.match(/<author><!\[CDATA\[(.*?)\]\]><\/author>/)?.[1] || '').trim();
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      return {
        id,
        title,
        summary: '',
        author: author || '开源中国',
        source: 'oschina',
        sourceLabel: '开源中国',
        url: `https://www.oschina.net/news/${id}`,
        tags: [],
        publishTime: pubDate,
        category,
      };
    }).filter(i => i.title);
  } catch {
    return [];
  }
}

async function fetchOschinaArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const id = url.match(/\/news\/(\d+)/)?.[1];
    if (!id) return null;
    const resp = await fetchWithTimeout(
      `https://www.oschina.net/action/api/news_detail?id=${id}`,
      { headers: { 'User-Agent': randomUA(), 'Accept': 'application/xml, text/xml' } },
      15000,
    );
    if (!resp.ok) return null;
    const xml = await resp.text();
    const title = (xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '').trim();
    const blogUrl = (xml.match(/<url><!\[CDATA\[(.*?)\]\]><\/url>/)?.[1] || '').trim();
    // If there's a blog URL, fetch from there for full content
    if (blogUrl) {
      const blogResp = await fetchWithTimeout(blogUrl, {
        headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
        redirect: 'follow',
      }, 15000);
      if (blogResp.ok) {
        const html = await blogResp.text();
        const $ = cheerio.load(html);
        const $content = $('#blog_content, .blog-content, .content, article, .post-content').first();
        if ($content.length) {
          $content.find('script, style, nav, header, footer').remove();
          $content.find('img').each((_, el) => {
            const $el = $(el);
            let src = $el.attr('src') || '';
            if (src.startsWith('//')) src = 'https:' + src;
            $el.attr('src', src);
            $el.attr('referrerpolicy', 'no-referrer');
            $el.css({ 'max-width': '100%', height: 'auto' });
          });
          return { title, content: $content.html() || '', author: '', source: 'oschina', url };
        }
      }
    }
    // Fallback to API body
    const body = xml.match(/<body><!\[CDATA\[([\s\S]*?)\]\]><\/body>/)?.[1] || '';
    if (!body) return null;
    const $ = cheerio.load(body);
    $('script, style').remove();
    $('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.css({ 'max-width': '100%', height: 'auto' });
    });
    return { title, content: $.html() || '', author: '', source: 'oschina', url };
  } catch {
    return null;
  }
}

// ==================== 阮一峰网络日志 ====================

async function fetchRuanyifengArticles(category: TechCategory, _page: number = 1): Promise<TechBlog[]> {
  try {
    const resp = await fetchWithTimeout('https://www.ruanyifeng.com/blog/atom.xml', {
      headers: { 'User-Agent': randomUA() },
    }, 10000);
    if (!resp.ok) return [];
    const xml = await resp.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const articles = entries.map(entry => {
      const title = (entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '').trim();
      const link = entry.match(/<link[^>]*href="([^"]*)"/)?.[1] || '';
      const author = (entry.match(/<name>(.*?)<\/name>/)?.[1] || '').trim();
      const updated = entry.match(/<updated>(.*?)<\/updated>/)?.[1] || '';
      return {
        id: link,
        title,
        summary: '',
        author: author || '阮一峰',
        source: 'ruanyifeng',
        sourceLabel: '阮一峰',
        url: link,
        tags: [],
        publishTime: updated,
        category,
      };
    }).filter(i => i.title);
    return filterArticles(articles, category, '');
  } catch {
    return [];
  }
}

async function fetchRuanyifengArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(url, {
      headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const $content = $('#alpha-inner, .entry-content, article').first();
    if (!$content.length) return null;
    $content.find('script, style, nav, .entry-meta, .entry-utility').remove();
    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || '';
      if (src.startsWith('/')) src = 'https://www.ruanyifeng.com' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.css({ 'max-width': '100%', height: 'auto' });
    });
    return { title, content: $content.html() || '', author: '阮一峰', source: 'ruanyifeng', url };
  } catch {
    return null;
  }
}

// ==================== 美团技术 ====================

async function fetchMeituanArticles(category: TechCategory, _page: number = 1): Promise<TechBlog[]> {
  try {
    const resp = await fetchWithTimeout('https://tech.meituan.com/feed/', {
      headers: { 'User-Agent': randomUA() },
    }, 10000);
    if (!resp.ok) return [];
    const xml = await resp.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const articles = items.map(item => {
      const title = (item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '').trim();
      const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] || '').trim();
      const author = (item.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/)?.[1] || '').trim();
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const desc = (item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] || '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
      return {
        id: link,
        title,
        summary: desc,
        author: author || '美团技术',
        source: 'meituan',
        sourceLabel: '美团技术',
        url: link,
        tags: [],
        publishTime: pubDate,
        category,
      };
    }).filter(i => i.title);
    return filterArticles(articles, category, '');
  } catch {
    return [];
  }
}

async function fetchMeituanArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(url, {
      headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const $content = $('main .vp-page-content-wrapper, main, article, .post-content').first();
    if (!$content.length) return null;
    $content.find('script, style, nav, header, footer').remove();
    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.css({ 'max-width': '100%', height: 'auto' });
    });
    return { title, content: $content.html() || '', author: '美团技术', source: 'meituan', url };
  } catch {
    return null;
  }
}

// ==================== 博客园 ====================

async function fetchCnblogsArticles(category: TechCategory, _page: number = 1): Promise<TechBlog[]> {
  try {
    const resp = await fetchWithTimeout('https://www.cnblogs.com/rss/', {
      headers: { 'User-Agent': randomUA() },
    }, 10000);
    if (!resp.ok) return [];
    const xml = await resp.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const articles = entries.slice(0, 20).map(entry => {
      const title = (entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '').trim();
      const link = (entry.match(/<id>(.*?)<\/id>/)?.[1] || '').trim();
      const author = (entry.match(/<name>(.*?)<\/name>/)?.[1] || '').trim();
      const updated = entry.match(/<updated>(.*?)<\/updated>/)?.[1] || '';
      const summary = (entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] || '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
      return {
        id: link,
        title,
        summary,
        author: author || '博客园',
        source: 'cnblogs',
        sourceLabel: '博客园',
        url: link,
        tags: [],
        publishTime: updated,
        category,
      };
    }).filter(i => i.title);
    return filterArticles(articles, category, '');
  } catch {
    return [];
  }
}

async function fetchCnblogsArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(url, {
      headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const $content = $('#cnblogs_post_body, .post-body, article').first();
    if (!$content.length) return null;
    $content.find('script, style, .post-nav, .post-desc').remove();
    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.css({ 'max-width': '100%', height: 'auto' });
    });
    return { title, content: $content.html() || '', author: '', source: 'cnblogs', url };
  } catch {
    return null;
  }
}

// ==================== 腾讯云开发者 ====================

async function fetchTencentArticles(category: TechCategory, _page: number = 1): Promise<TechBlog[]> {
  try {
    const resp = await fetchWithTimeout('https://cloud.tencent.com/developer/column/1283', {
      headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
    }, 10000);
    if (!resp.ok) return [];
    const html = await resp.text();
    const $ = cheerio.load(html);
    const items: TechBlog[] = [];
    $('a[href*="/developer/article/"]').each((_, el) => {
      const $a = $(el);
      const title = $a.text().trim();
      const href = $a.attr('href') || '';
      if (!title || !href || title.length < 5) return;
      if (items.find(i => i.url === href)) return;
      const fullUrl = href.startsWith('http') ? href : `https://cloud.tencent.com${href}`;
      items.push({
        id: href,
        title: title.slice(0, 100),
        summary: '',
        author: '腾讯云',
        source: 'tencent',
        sourceLabel: '腾讯云',
        url: fullUrl,
        tags: [],
        category,
      });
    });
    return filterArticles(items.slice(0, 20), category, '');
  } catch {
    return [];
  }
}

async function fetchTencentArticleContent(url: string): Promise<TechBlogContent | null> {
  try {
    const resp = await fetchWithTimeout(url, {
      headers: { 'User-Agent': randomUA(), 'Accept': 'text/html' },
      redirect: 'follow',
    }, 15000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const $content = $('.mod-content__markdown, .mod-article-content, .cdc-article__body').first();
    if (!$content.length) return null;
    $content.find('script, style, nav, .article-meta, .article-info').remove();
    $content.find('img').each((_, el) => {
      const $el = $(el);
      let src = $el.attr('src') || '';
      if (src.startsWith('//')) src = 'https:' + src;
      $el.attr('src', src);
      $el.attr('referrerpolicy', 'no-referrer');
      $el.css({ 'max-width': '100%', height: 'auto' });
    });
    return { title, content: $content.html() || '', author: '腾讯云', source: 'tencent', url };
  } catch {
    return null;
  }
}

// ==================== 统一接口 ====================

export async function searchTechBlogs(
  keyword: string,
  category: TechCategory,
  page: number = 1
): Promise<TechBlog[]> {
  if (keyword) {
    const [juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent] = await Promise.all([
      searchJuejinArticles(keyword, category, page),
      searchCsdnArticles(keyword, category, page),
      fetchOschinaArticles(category, page),
      fetchRuanyifengArticles(category, page),
      fetchMeituanArticles(category, page),
      fetchCnblogsArticles(category, page),
      fetchTencentArticles(category, page),
    ]);
    const all = mergeResults(juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent);
    return filterArticles(all, 'all', keyword);
  }

  if (category === 'all') {
    const [juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent] = await Promise.all([
      fetchJuejinArticles('all', page),
      fetchCsdnArticles('all', page),
      fetchOschinaArticles('all', page),
      fetchRuanyifengArticles('all', page),
      fetchMeituanArticles('all', page),
      fetchCnblogsArticles('all', page),
      fetchTencentArticles('all', page),
    ]);
    return mergeResults(juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent);
  }

  const [juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent] = await Promise.all([
    fetchJuejinArticles(category, page),
    fetchCsdnArticles(category, page),
    fetchOschinaArticles(category, page),
    fetchRuanyifengArticles(category, page),
    fetchMeituanArticles(category, page),
    fetchCnblogsArticles(category, page),
    fetchTencentArticles(category, page),
  ]);
  return mergeResults(juejin, csdn, oschina, ruanyifeng, meituan, cnblogs, tencent);
}

function mergeResults(...arrays: TechBlog[][]): TechBlog[] {
  const merged: TechBlog[] = [];
  const maxLen = Math.max(...arrays.map(a => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of arrays) {
      if (arr[i]) merged.push(arr[i]);
    }
  }
  return merged;
}

export async function getTechBlogContent(url: string, source: string): Promise<TechBlogContent | null> {
  if (source === 'juejin') {
    const match = url.match(/\/post\/(\w+)/);
    if (match) return fetchJuejinArticleContent(match[1]);
  }
  if (source === 'csdn') {
    return fetchCsdnArticleContent(url);
  }
  if (source === 'oschina') {
    return fetchOschinaArticleContent(url);
  }
  if (source === 'ruanyifeng') {
    return fetchRuanyifengArticleContent(url);
  }
  if (source === 'meituan') {
    return fetchMeituanArticleContent(url);
  }
  if (source === 'cnblogs') {
    return fetchCnblogsArticleContent(url);
  }
  if (source === 'tencent') {
    return fetchTencentArticleContent(url);
  }
  return null;
}

export function getCategoryInfo(category: TechCategory): CategoryInfo | undefined {
  return CATEGORIES.find(c => c.id === category);
}
