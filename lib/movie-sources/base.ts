// 影视源抽象基类
// 所有片源实现此类，即可被源管理器自动识别和调用

import { Movie, MovieDetail, MovieSearchResult, VideoSource, CastMember, MovieCategory } from '@/types/movie';

// 源信息
export interface SourceInfo {
  name: string;       // 唯一标识 'wujin'
  label: string;      // 显示名称 '无尽资源'
  icon: string;       // 图标 '🔥'
  available: boolean; // 是否可用
}

// 分类映射配置
export interface CategoryConfig {
  typeId: number;
  label: string;
}

// CMS 响应格式
interface CmsResponse {
  code: number;
  msg: string;
  list: any[];
  page: number;
  pagecount: number;
  total: number;
  limit: string;
}

export abstract class MovieSource {
  abstract readonly name: string;
  abstract readonly label: string;
  abstract readonly icon: string;
  abstract readonly api: string;

  // 分类映射子类可覆盖
  readonly categoryMap: Record<MovieCategory, CategoryConfig> = {
    popular: { typeId: 6, label: '热门动作片' },
    top_rated: { typeId: 11, label: '高分剧情片' },
    now_playing: { typeId: 7, label: '喜剧片' },
    upcoming: { typeId: 9, label: '科幻片' },
    trending: { typeId: 8, label: '爱情片' },
  };

  // ============ 抽象方法 ============

  abstract search(query: string, page?: number): Promise<MovieSearchResult>;
  abstract getByCategory(category: MovieCategory, page?: number): Promise<MovieSearchResult>;
  abstract getDetail(movieId: string): Promise<MovieDetail>;
  abstract healthCheck(): Promise<boolean>;

  // ============ 通用工具方法 ============

  // CMS API 请求
  protected async cmsFetch(params: Record<string, string>): Promise<CmsResponse> {
    const url = new URL(this.api);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`${this.label} 请求失败 (${response.status})`);
    }

    const data = await response.json();
    if (data.code !== 1) {
      throw new Error(`${this.label} 返回错误: ${data.msg}`);
    }

    return data;
  }

  // 清理 HTML 标签
  protected stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // 转换 CMS 电影数据为通用格式
  protected transformMovie(cmsMovie: any): Movie {
    return {
      id: String(cmsMovie.vod_id),
      title: cmsMovie.vod_name || '未知',
      originalTitle: cmsMovie.vod_sub || undefined,
      year: cmsMovie.vod_year || undefined,
      poster: cmsMovie.vod_pic || undefined,
      backdrop: undefined,
      rating: cmsMovie.vod_score ? parseFloat(cmsMovie.vod_score) : undefined,
      overview: this.stripHtml(cmsMovie.vod_content) || '暂无简介',
      genres: cmsMovie.type_name ? [cmsMovie.type_name] : undefined,
      releaseDate: cmsMovie.vod_time || undefined,
      language: cmsMovie.vod_area || undefined,
      adult: false,
      popularity: 0,
      source: 'cms',
    };
  }

  // 解析播放 URL
  // 格式: "源名1$url1#源名2$url2$$$源名3$url3#源名4$url4"
  protected parsePlaySources(vodPlayFrom: string, vodPlayUrl: string): VideoSource[] {
    if (!vodPlayUrl) return [];

    const sources: VideoSource[] = [];
    const fromNames = vodPlayFrom ? vodPlayFrom.split('$$$') : [];
    const urlGroups = vodPlayUrl.split('$$$');

    urlGroups.forEach((group, groupIndex) => {
      const sourceName = fromNames[groupIndex] || `源${groupIndex + 1}`;
      const episodes = group.split('#');

      episodes.forEach((episode) => {
        const [name, url] = episode.split('$');
        if (url && url.startsWith('http')) {
          const isM3u8 = url.includes('.m3u8');
          const isMp4 = url.includes('.mp4');
          sources.push({
            url,
            type: isM3u8 ? 'hls' : isMp4 ? 'mp4' : 'hls',
            source: sourceName,
            label: `${sourceName} - ${name || '播放'}`,
            quality: url.includes('1080') ? '1080p' : url.includes('720') ? '720p' : 'HD',
          });
        }
      });
    });

    return sources;
  }

  // 转换详情数据
  protected transformDetail(vod: any): MovieDetail {
    const movie = this.transformMovie(vod);
    const videoSources = this.parsePlaySources(vod.vod_play_from || '', vod.vod_play_url || '');

    const cast: CastMember[] = (vod.vod_actor || '')
      .split(',')
      .filter(Boolean)
      .slice(0, 20)
      .map((name: string, i: number) => ({
        name: name.trim(),
        order: i,
      }));

    return {
      ...movie,
      runtime: undefined,
      tagline: undefined,
      status: undefined,
      budget: undefined,
      revenue: undefined,
      productionCompanies: vod.vod_director ? [vod.vod_director] : undefined,
      genres: vod.type_name ? [vod.type_name] : undefined,
      cast,
      trailers: [],
      similar: [],
      _source: this.name,
      _sourceLabel: this.label,
      _videoSources: videoSources,
    } as MovieDetail & { _source: string; _sourceLabel: string; _videoSources: VideoSource[] };
  }

  // 获取源信息
  getInfo(): SourceInfo {
    return {
      name: this.name,
      label: this.label,
      icon: this.icon,
      available: true,
    };
  }
}
