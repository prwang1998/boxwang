// 电影/视频类型定义

export interface Movie {
  id: string;           // 唯一标识 (TMDB ID 或其他源ID)
  title: string;        // 电影名称
  originalTitle?: string; // 原始名称
  year?: string;        // 年份
  poster?: string;      // 海报URL
  backdrop?: string;    // 背景图URL
  rating?: number;      // 评分 (0-10)
  overview?: string;    // 简介
  genreIds?: number[];  // 类型ID列表
  genres?: string[];    // 类型名称列表
  releaseDate?: string; // 发布日期
  language?: string;    // 语言
  adult?: boolean;      // 是否成人内容
  popularity?: number;  // 热度
  source: 'tmdb' | 'custom' | 'cms'; // 数据源
}

export interface MovieDetail extends Movie {
  runtime?: number;           // 时长(分钟)
  tagline?: string;           // 标语
  status?: string;            // 状态 (Released, etc.)
  budget?: number;            // 预算
  revenue?: number;           // 票房
  productionCompanies?: string[]; // 制作公司
  cast?: CastMember[];        // 演员列表
  trailers?: Video[];         // 预告片
  similar?: Movie[];          // 相似电影
}

export interface CastMember {
  name: string;
  character?: string;
  profilePath?: string;
  order?: number;
}

export interface Video {
  id: string;
  name: string;
  key: string;          // YouTube key or direct URL
  site: string;         // 'YouTube', 'Vimeo', etc.
  type: string;         // 'Trailer', 'Teaser', 'Clip', etc.
  official?: boolean;
}

export interface VideoSource {
  url: string;          // 播放URL
  quality?: string;     // 清晰度 '1080p', '720p', '480p', '360p'
  type: 'iframe' | 'hls' | 'mp4'; // 类型
  source: string;       // 来源名称
  label?: string;       // 显示标签
}

export interface MovieSearchResult {
  movies: Movie[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing' | 'trending';
