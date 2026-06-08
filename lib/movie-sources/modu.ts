// 魔都资源 - CMS 片源实现

import { MovieSource } from './base';
import { MovieCategory, MovieSearchResult, MovieDetail } from '@/types/movie';

export class ModuSource extends MovieSource {
  readonly name = 'modu';
  readonly label = '魔都资源';
  readonly icon = '🏙️';
  readonly api = 'https://www.mdzyapi.com/api.php/provide/vod/';

  async search(query: string, page: number = 1): Promise<MovieSearchResult> {
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
