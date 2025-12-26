
export type Category = 'For You' | 'Trending' | 'Technology' | 'Politics' | 'Health' | 'Lifestyle' | 'Sports' | 'Food' | 'Business' | 'Science' | 'Education' | 'Entertainment' | 'Videos' | 'Bookmarks';

export interface Comment {
  id: string;
  userId: string;
  user: string;
  userAvatarUrl?: string;
  text: string;
  date: string;
  replies?: Comment[];
}

export interface UserProfile {
  name: string;
  avatarColor: string;
  joinedAt: string;
}

export interface Article {
  id: string;
  title: string;
  subject?: string;
  summary: string;
  content: string;
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
  url: string;
  thumbnail?: string;
  views: number;
  likes: number;
}

export interface GeneratedArticleContent {
  title: string;
  subject?: string;
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

export interface AutomationConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt?: string;
  autoCategories: Category[];
  isCurrentlyRunning?: boolean;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error';
  articleTitle?: string;
  message: string;
}

export interface Transaction {
  id: string;
  amount: number;
  method: 'PayPal';
  email: string;
  timestamp: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
}

export interface WalletState {
  balance: number;
  lifetimeEarnings: number;
  history: Transaction[];
}
