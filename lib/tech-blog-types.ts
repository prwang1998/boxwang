export interface TechBlog {
  id: string;
  title: string;
  summary: string;
  author: string;
  source: string;
  sourceLabel: string;
  url: string;
  cover?: string;
  views?: number;
  likes?: number;
  comments?: number;
  tags?: string[];
  publishTime?: string;
  category: TechCategory;
}

export interface TechBlogContent {
  title: string;
  content: string;
  author: string;
  source: string;
  url: string;
  publishTime?: string;
  tags?: string[];
}

export type TechCategory = 'all' | 'android' | 'algorithm' | 'ai-coding';

export interface CategoryInfo {
  id: TechCategory;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: '全部', icon: '🔥', description: '所有技术文章' },
  { id: 'android', label: 'Android', icon: '🤖', description: 'Android 开发技术' },
  { id: 'algorithm', label: '数据结构与算法', icon: '🧮', description: '算法与数据结构' },
  { id: 'ai-coding', label: 'AI Coding', icon: '🧠', description: 'AI 辅助编程' },
];
