// 电影API - 薄封装层
// 实际逻辑由 movie-sources/ 下的各片源类实现

import { MovieCategory, MovieSearchResult, MovieDetail, VideoSource } from '@/types/movie';
import { movieSourceManager, SourceInfo } from './movie-sources';

export type { MovieCategory } from '@/types/movie';

// 搜索电影
export async function searchMovies(
  query: string,
  page: number = 1,
  source?: string
): Promise<MovieSearchResult & { _source: string; _sourceLabel: string }> {
  return movieSourceManager.search(query, page, source);
}

// 获取分类电影列表
export async function getMoviesByCategory(
  category: MovieCategory,
  page: number = 1,
  source?: string
): Promise<MovieSearchResult & { _source: string; _sourceLabel: string }> {
  return movieSourceManager.getByCategory(category, page, source);
}

// 获取电影详情
export async function getMovieDetail(
  movieId: string,
  source?: string
): Promise<MovieDetail & { _source: string; _sourceLabel: string; _videoSources: VideoSource[] }> {
  return movieSourceManager.getDetail(movieId, source) as any;
}

// 获取所有片源列表
export function getAllSources(): SourceInfo[] {
  return movieSourceManager.getAllSources();
}

// 检查所有片源健康状态
export async function checkSourcesHealth(): Promise<SourceInfo[]> {
  return movieSourceManager.checkAllSources();
}

// 获取推荐电影
export async function getRecommendMovies(
  category: MovieCategory = 'popular',
  page: number = 1,
  source?: string
): Promise<MovieSearchResult & { _source: string; _sourceLabel: string }> {
  return getMoviesByCategory(category, page, source);
}
