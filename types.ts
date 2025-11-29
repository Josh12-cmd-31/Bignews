
export type Category = 'For You' | 'Technology' | 'Sports' | 'Food' | 'Business' | 'Science' | 'Entertainment' | 'Videos';

export interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
}

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
  userComments?: Comment[];
  isBreaking?: boolean;
  linkedVideoId?: string;
  sourceUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  type: 'youtube' | 'upload';
  url: string; // YouTube ID or Direct URL
  thumbnail?: string;
  views: number;
  likes: number;
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

export interface MonetizationConfig {
  adsenseId: string;
  monetagId: string;
  adsenseEnabled: boolean;
  monetagEnabled: boolean;
}
