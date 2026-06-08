// 片源管理器 - 统一管理所有片源，提供备用回退逻辑

import { MovieSource, SourceInfo } from './base';
import { MovieCategory, MovieSearchResult, MovieDetail } from '@/types/movie';
import { WujinSource } from './wujin';
import { GuangsuSource } from './guangsu';
import { ModuSource } from './modu';
import { SoniSource } from './soni';

class MovieSourceManager {
  private sources: Map<string, MovieSource> = new Map();
  private defaultSourceName = 'wujin';

  constructor() {
    // 注册所有片源
    this.register(new WujinSource());
    this.register(new GuangsuSource());
    this.register(new ModuSource());
    this.register(new SoniSource());
  }

  // 注册新片源
  register(source: MovieSource): void {
    this.sources.set(source.name, source);
  }

  // 获取指定片源
  getSource(name: string): MovieSource | undefined {
    return this.sources.get(name);
  }

  // 获取默认片源
  getDefaultSource(): MovieSource {
    return this.sources.get(this.defaultSourceName) || this.sources.values().next().value!;
  }

  // 获取所有片源信息
  getAllSources(): SourceInfo[] {
    return Array.from(this.sources.values()).map(s => s.getInfo());
  }

  // 获取所有片源名称
  getSourceNames(): string[] {
    return Array.from(this.sources.keys());
  }

  // 带备用的搜索
  async search(query: string, page: number = 1, preferredSource?: string): Promise<MovieSearchResult & { _source: string; _sourceLabel: string }> {
    const source = this.resolveSource(preferredSource);
    const fallbackSources = this.getFallbackSources(preferredSource);

    try {
      const result = await source.search(query, page);
      return { ...result, _source: source.name, _sourceLabel: source.label };
    } catch (error) {
      // 尝试备用源
      for (const fallback of fallbackSources) {
        try {
          const result = await fallback.search(query, page);
          return { ...result, _source: fallback.name, _sourceLabel: fallback.label };
        } catch {
          continue;
        }
      }
      throw error;
    }
  }

  // 带备用的分类获取
  async getByCategory(category: MovieCategory, page: number = 1, preferredSource?: string): Promise<MovieSearchResult & { _source: string; _sourceLabel: string }> {
    const source = this.resolveSource(preferredSource);
    const fallbackSources = this.getFallbackSources(preferredSource);

    try {
      const result = await source.getByCategory(category, page);
      return { ...result, _source: source.name, _sourceLabel: source.label };
    } catch (error) {
      for (const fallback of fallbackSources) {
        try {
          const result = await fallback.getByCategory(category, page);
          return { ...result, _source: fallback.name, _sourceLabel: fallback.label };
        } catch {
          continue;
        }
      }
      throw error;
    }
  }

  // 带备用的详情获取
  async getDetail(movieId: string, preferredSource?: string): Promise<MovieDetail & { _source: string; _sourceLabel: string }> {
    const source = this.resolveSource(preferredSource);
    const fallbackSources = this.getFallbackSources(preferredSource);

    try {
      const result = await source.getDetail(movieId);
      return { ...result, _source: source.name, _sourceLabel: source.label } as any;
    } catch (error) {
      for (const fallback of fallbackSources) {
        try {
          const result = await fallback.getDetail(movieId);
          return { ...result, _source: fallback.name, _sourceLabel: fallback.label } as any;
        } catch {
          continue;
        }
      }
      throw error;
    }
  }

  // 检查所有源的健康状态
  async checkAllSources(): Promise<SourceInfo[]> {
    const results: SourceInfo[] = [];
    const allSources = Array.from(this.sources.values());

    for (const source of allSources) {
      const available = await source.healthCheck();
      results.push({ ...source.getInfo(), available });
    }

    return results;
  }

  // ============ 内部方法 ============

  private resolveSource(name?: string): MovieSource {
    if (name && this.sources.has(name)) {
      return this.sources.get(name)!;
    }
    return this.getDefaultSource();
  }

  private getFallbackSources(excludeName?: string): MovieSource[] {
    return Array.from(this.sources.values()).filter(s => s.name !== excludeName);
  }
}

// 单例导出
export const movieSourceManager = new MovieSourceManager();
