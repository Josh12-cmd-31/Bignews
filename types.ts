export type Category = 'For You' | 'Technology' | 'Sports' | 'Food' | 'Business' | 'Science' | 'Entertainment';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML or markdown string
  category: Category;
  author: string;
  imageUrl: string;
  publishedAt: string;
  isAiGenerated?: boolean;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  isBreaking?: boolean;
}

export interface GeneratedArticleContent {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
}

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserPreferences {
  theme: Theme;
  fontSize: FontSize;
}