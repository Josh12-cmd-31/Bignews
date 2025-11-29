
import React from 'react';
import { Article, UserPreferences } from '../types';
import { ArrowRight, Clock, Hash, Eye, Heart, MessageSquare } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
  preferences: UserPreferences;
  onUpdateArticle: (article: Article) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick, preferences, onUpdateArticle }) => {
  const isDark = preferences.theme === 'dark';

  // Helper to strip HTML and get a preview snippet
  const getPreviewText = (html: string) => {
    // Basic strip tags regex for safety
    const text = html.replace(/<[^>]*>?/gm, '');
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const previewText = getPreviewText(article.content);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateArticle({
      ...article,
      likes: (article.likes || 0) + 1
    });
  };

  return (
    <article 
      className={`group rounded-xl shadow-sm hover:shadow-xl border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] ${
        isDark 
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
          : 'bg-white border-slate-200'
      }`}
      onClick={() => onClick(article)}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Content Preview Overlay - Hidden on touch devices by default behavior, visible on hover for mouse */}
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-6 text-white hidden sm:flex pointer-events-none">
           <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
             <Eye size={14} />
             Quick Preview
           </div>
           <p className="text-sm font-serif leading-relaxed line-clamp-5 text-slate-200 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 ease-out">
             {previewText}
           </p>
        </div>
        
        {/* Watermark - Consistently visible, unobtrusive */}
        <div className="absolute bottom-3 right-3 opacity-25 z-20 pointer-events-none">
           <span className="text-[10px] font-black text-white font-serif tracking-widest drop-shadow-md border-b border-white/30 pb-0.5">BIG NEWS</span>
        </div>

        {/* Category Badge - Hide on hover only on larger screens */}
        <div className="absolute top-4 left-4 sm:group-hover:opacity-0 transition-opacity duration-300">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className={`flex flex-wrap items-center text-xs mb-3 gap-y-1 gap-x-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>
                {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
        </div>

        <h3 className={`text-lg sm:text-xl font-bold mb-2 font-serif leading-snug transition-colors line-clamp-2 ${
            isDark 
              ? 'text-slate-100 group-hover:text-blue-400' 
              : 'text-slate-900 group-hover:text-blue-700'
        }`}>
          {article.title}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-3 flex-1 transition-colors ${
            isDark 
              ? 'text-slate-400 group-hover:text-slate-300' 
              : 'text-slate-600 group-hover:text-slate-500'
        }`}>
          {article.summary}
        </p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 hidden xs:flex">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={`flex items-center text-[10px] uppercase tracking-wide px-2 py-1 rounded-md ${
                  isDark ? 'text-slate-400 bg-slate-700' : 'text-slate-500 bg-slate-100'
              }`}>
                <Hash size={10} className="mr-0.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className={`mt-auto pt-4 border-t flex items-center justify-between font-semibold text-sm ${
            isDark ? 'border-slate-700' : 'border-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <button 
               onClick={handleLikeClick}
               className={`flex items-center gap-1.5 transition-colors p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800 ${isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`}
               title="Like"
            >
              <Heart size={16} />
              <span className="text-xs">{article.likes}</span>
            </button>
            <div className={`flex items-center gap-1.5 p-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title="Comments">
              <MessageSquare size={16} />
              <span className="text-xs">{article.comments || article.userComments?.length || 0}</span>
            </div>
          </div>

          <div className={`flex items-center ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}`}>
            <span className="relative text-xs sm:text-sm font-bold uppercase tracking-wide sm:normal-case sm:font-semibold sm:tracking-normal">
              Read
              <span className="hidden sm:inline"> Story</span>
              <span className={`absolute left-0 bottom-0 w-full h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${isDark ? 'bg-blue-300' : 'bg-blue-700'}`}></span>
            </span>
            <ArrowRight size={16} className="ml-1 sm:ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
