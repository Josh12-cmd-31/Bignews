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
    <div className="bg-red-600 text-white h-10 shadow-md relative z-50 flex items-center overflow-hidden border-b border-red-700">
      {/* Fixed Label */}
      <div className="flex-shrink-0 bg-red-700 h-full px-4 flex items-center z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)] relative">
        <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider animate-pulse whitespace-nowrap">
          <AlertCircle size={14} />
          Breaking
        </span>
        {/* Slanted edge effect using border */}
        <div className="absolute right-0 top-0 bottom-0 translate-x-full w-4 overflow-hidden">
             <div className="h-full w-full bg-red-700 -skew-x-12 origin-top-left"></div>
        </div>
      </div>
      
      {/* Sliding Content */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-red-600">
         <div className="animate-marquee whitespace-nowrap absolute top-0 bottom-0 flex items-center pl-4">
            <span 
              className="text-sm font-medium cursor-pointer hover:underline flex items-center gap-2"
              onClick={() => onArticleClick(breakingArticle)}
            >
              <span className="font-bold">{breakingArticle.title}</span> 
              <span className="opacity-70 mx-2">—</span> 
              <span>{breakingArticle.summary}</span>
            </span>
         </div>
      </div>

      {/* Fixed Action Button */}
      <button 
        onClick={() => onArticleClick(breakingArticle)}
        className="hidden sm:flex items-center text-xs font-semibold hover:bg-red-700 px-4 h-full transition-colors z-20 bg-red-600 flex-shrink-0 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"
      >
        Read Now <ChevronRight size={14} className="ml-1" />
      </button>
    </div>
  );
};

export default BreakingNewsBanner;