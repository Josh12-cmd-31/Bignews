import React from 'react';
import { Article } from '../types';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BreakingNewsBannerProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const BreakingNewsBanner: React.FC<BreakingNewsBannerProps> = ({ articles, onArticleClick }) => {
  // Find the most recent breaking news article
  const breakingArticle = articles.find(a => a.isBreaking);

  if (!breakingArticle) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 shadow-md relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded animate-pulse whitespace-nowrap">
            <AlertCircle size={12} />
            Breaking News
          </span>
          <span 
            className="text-sm font-medium truncate cursor-pointer hover:underline"
            onClick={() => onArticleClick(breakingArticle)}
          >
            {breakingArticle.title} — {breakingArticle.summary}
          </span>
        </div>
        <button 
          onClick={() => onArticleClick(breakingArticle)}
          className="hidden sm:flex items-center text-xs font-semibold hover:bg-white/10 px-2 py-1 rounded transition-colors"
        >
          Read Now <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default BreakingNewsBanner;