// 索尼资源 - CMS 片源实现
// 注意：此源不支持搜索接口，搜索功能通过分类列表模拟

import { MovieSource } from './base';
import { MovieCategory, MovieSearchResult, MovieDetail } from '@/types/movie';

export class SoniSource extends MovieSource {
  readonly name = 'soni';
  readonly label = '索尼资源';
  readonly icon = '🎬';
  readonly api = 'https://suoniapi.com/api.php/provide/vod/';

  // 索尼资源不支持搜索，使用动作片列表返回
  async search(query: string, page: number = 1): Promise<MovieSearchResult> {
    // 尝试用关键词搜索，如果不支持则返回热门列表
    try {
      const data = await this.cmsFetch({
        ac: 'detail',
        wd: query,
        page: String(page),
      });

      const movies = (data.list || [])
        .map(m => this.transformMovie(m))
        .filter((_, i) => {
          const type = data.list?.[i]?.type_name || '';
          return !type.includes('解说') && !type.includes('短剧');
        });

      return {
        movies,
        page: data.page || 1,
        totalPages: data.pagecount || 1,
        totalResults: data.total || 0,
      };
    } catch {
      // 搜索不支持时，返回热门列表
      return this.getByCategory('popular', page);
    }
  }

  async getByCategory(category: MovieCategory, page: number = 1): Promise<MovieSearchResult> {
    const cat = this.categoryMap[category] || this.categoryMap.popular;

    const data = await this.cmsFetch({
      ac: 'detail',
      t: String(cat.typeId),
      page: String(page),
    });

    return {
      movies: (data.list || []).map(m => this.transformMovie(m)),
      page: data.page || 1,
      totalPages: data.pagecount || 1,
      totalResults: data.total || 0,
    };
  }

  async getDetail(movieId: string): Promise<MovieDetail> {
    const data = await this.cmsFetch({
      ac: 'detail',
      ids: movieId,
    });

    if (!data.list || data.list.length === 0) {
      throw new Error('电影不存在');
    }

    return this.transformDetail(data.list[0]);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const data = await this.cmsFetch({ ac: 'detail', t: '6', page: '1', limit: '1' });
      return data.code === 1 && data.list && data.list.length > 0;
    } catch {
      return false;
    }
  }
}
